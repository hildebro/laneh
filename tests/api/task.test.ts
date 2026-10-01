import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addHousehold, addUser, call, initiate, request, startTestBackend } from '../helpers/backend';
import type { Task } from '$lib/backend/db/schema';

const backend = await startTestBackend();

beforeEach(async () => {
  await backend.reset();
  // Only the clock is faked. Faking timers as well would stall the database driver.
  vi.useFakeTimers({ toFake: ['Date'] });
  // Wednesday
  vi.setSystemTime(new Date('2026-10-07T10:00:00'));
});
afterEach(() => vi.useRealTimers());
afterAll(backend.close);

type TaskList = { dueTasks: Task[]; upcomingTasks: Task[]; completedTasks: Task[] };

const singleTask = (name: string, dueDate = '') => ({
  name,
  description: '',
  dueUserId: '',
  dueDate,
  type: 'single',
  weekday: null,
  interval: null,
  assignment: null,
  endDate: ''
});

const repeatingTask = (name: string, overrides: Record<string, unknown> = {}) => ({
  name,
  description: '',
  dueUserId: '',
  dueDate: '2026-10-05',
  type: 'repeating',
  weekday: 'mon',
  interval: 1,
  assignment: 'noone',
  endDate: '',
  ...overrides
});

async function createTask(token: string, task: Record<string, unknown>) {
  await call('/tasks', { method: 'POST', token, body: task });
  const tasks = await call<TaskList>('/tasks', { token });

  return [...tasks.dueTasks, ...tasks.upcomingTasks].find((t) => t.name === task.name)!;
}

async function completeTask(token: string, taskId: string, userId: string | null = null) {
  return call<{ success: boolean }>('/tasks/done', { method: 'POST', token, body: { taskId, userId } });
}

describe('task lists', () => {
  it('sorts tasks into due and upcoming by due date', async () => {
    const token = await initiate();

    await createTask(token, singleTask('Without date'));
    await createTask(token, singleTask('Today', '2026-10-07'));
    await createTask(token, singleTask('Tomorrow', '2026-10-08'));

    const tasks = await call<TaskList>('/tasks', { token });

    expect(tasks.dueTasks.map((t) => t.name).sort()).toEqual(['Today', 'Without date']);
    expect(tasks.upcomingTasks.map((t) => t.name)).toEqual(['Tomorrow']);
  });

  it('moves a completed single task to the completed list', async () => {
    const token = await initiate();
    const task = await createTask(token, singleTask('Clean windows'));

    await completeTask(token, task.id);

    const tasks = await call<TaskList>('/tasks', { token });
    expect(tasks.dueTasks).toHaveLength(0);
    expect(tasks.completedTasks.map((t) => t.name)).toEqual(['Clean windows']);
  });
});

describe('repeating tasks', () => {
  it('requires a schedule', async () => {
    const token = await initiate();

    const response = await request('/tasks', {
      method: 'POST',
      token,
      body: repeatingTask('Broken', { weekday: null })
    });

    expect(response.status).toBe(400);
  });

  it('is scheduled for the next matching weekday after completion', async () => {
    const token = await initiate();
    const task = await createTask(token, repeatingTask('Take out trash'));

    await completeTask(token, task.id);

    const updated = await call<Task>(`/tasks/${task.id}`, { token });
    expect(updated.dueDate).toBe('2026-10-12');
    expect(updated.done).toBe(false);
  });

  it('respects the interval in weeks', async () => {
    const token = await initiate();
    const task = await createTask(token, repeatingTask('Mop floors', { interval: 2 }));

    await completeTask(token, task.id);

    const updated = await call<Task>(`/tasks/${task.id}`, { token });
    expect(updated.dueDate).toBe('2026-10-19');
  });

  it('is scheduled a full interval ahead when completed on its weekday', async () => {
    // Monday
    vi.setSystemTime(new Date('2026-10-12T08:00:00'));
    const token = await initiate();
    const task = await createTask(token, repeatingTask('Take out trash', { dueDate: '2026-10-12' }));

    await completeTask(token, task.id);

    const updated = await call<Task>(`/tasks/${task.id}`, { token });
    expect(updated.dueDate).toBe('2026-10-19');
  });

  it('keeps the local date across the switch to winter time', async () => {
    // Late on the Saturday before the DST change in Europe (2026-10-25)
    vi.setSystemTime(new Date('2026-10-24T23:30:00'));
    const token = await initiate();
    const task = await createTask(token, repeatingTask('Water plants', { weekday: 'sun', dueDate: '2026-10-18' }));

    await completeTask(token, task.id);

    const updated = await call<Task>(`/tasks/${task.id}`, { token });
    expect(updated.dueDate).toBe('2026-10-25');
  });

  it('finishes once the next due date passes the end date', async () => {
    const token = await initiate();
    const task = await createTask(token, repeatingTask('Pay rent', { endDate: '2026-10-10' }));

    await completeTask(token, task.id);

    const updated = await call<Task>(`/tasks/${task.id}`, { token });
    expect(updated.done).toBe(true);
  });

  it('needs the completing user when someone is assigned', async () => {
    const token = await initiate();
    const [admin] = await call<{ id: string }[]>('/users', { token });
    const task = await createTask(token, repeatingTask('Cook', { assignment: 'someone', dueUserId: admin.id }));

    const response = await request('/tasks/done', { method: 'POST', token, body: { taskId: task.id, userId: null } });

    expect(response.status).toBe(400);
  });
});

describe('rotation', () => {
  it('assigns the household member with the fewest completions next', async () => {
    const token = await initiate('Home', 'alice');
    const [alice] = await call<{ id: string }[]>('/users', { token });
    const bob = await addUser(token, 'Home', 'bob');
    const task = await createTask(token, repeatingTask('Dishes', { assignment: 'everyone', dueUserId: alice.id }));

    await completeTask(token, task.id, alice.id);

    const updated = await call<Task>(`/tasks/${task.id}`, { token });
    expect(updated.dueUserId).toBe(bob.id);
  });

  it('only rotates between members of the same household', async () => {
    const token = await initiate('Home', 'alice');
    const [alice] = await call<{ id: string }[]>('/users', { token });
    const other = await addHousehold(token, 'Other', 'mallory');
    const task = await createTask(token, repeatingTask('Dishes', { assignment: 'everyone', dueUserId: alice.id }));

    await completeTask(token, task.id, alice.id);

    const updated = await call<Task>(`/tasks/${task.id}`, { token });
    expect(updated.dueUserId).not.toBe(other.id);
    expect(updated.dueUserId).toBe(alice.id);
  });
});
