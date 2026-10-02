// Runs in the headless JS environment of @capacitor/background-runner, outside the web view. Only a few web APIs are
// available (fetch without response headers, no DOM), so the app hands over everything required via syncSession.
/* global CapacitorKV, CapacitorNotifications */

const KEYS = ['apiBase', 'token', 'userId', 'cursor', 'templates', 'expenseTypes'];
// Stored by older app versions.
const LEGACY_KEYS = ['titleTaskDone', 'bodyTaskDone'];

// Used until the app hands over the translated templates.
const DEFAULT_TEMPLATES = {
  task_done: { title: 'Task done', body: '{user}: {subject}' },
  purchase_made: { title: 'Purchase made', body: '{user}: {subject}' },
  expense_created: { title: 'New expense', body: '{user}: {subject}' }
};

function get(key) {
  return CapacitorKV.get(key)?.value || null;
}

// Android requires a 32-bit integer as notification ID.
function toNotificationId(uuid) {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = (hash * 31 + uuid.charCodeAt(i)) | 0;
  }

  return hash;
}

function getJson(key) {
  const value = get(key);

  return value ? JSON.parse(value) : {};
}

function subjectOf(notification, expenseTypes) {
  if (notification.type === 'expense_created') {
    return expenseTypes[notification.subject] || notification.subject;
  }

  return notification.subject;
}

function fillTemplate(template, user, subject) {
  return template.replaceAll('{user}', user).replaceAll('{subject}', subject);
}

async function checkNotifications() {
  const apiBase = get('apiBase');
  const token = get('token');
  if (!apiBase || !token) {
    return;
  }

  const cursor = get('cursor');
  const query = cursor ? `?since=${encodeURIComponent(cursor)}` : '';
  // The runner's fetch has no default method.
  const response = await fetch(`${apiBase}api/notifications${query}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (response.status === 401) {
    // The session is gone. The app hands over a new one on the next login.
    CapacitorKV.remove('token');
    return;
  }

  if (!response.ok) {
    throw new Error(`Polling notifications failed with status ${response.status}`);
  }

  const data = await response.json();
  if (data.refreshedToken) {
    CapacitorKV.set('token', data.refreshedToken);
  }

  const templates = { ...DEFAULT_TEMPLATES, ...getJson('templates') };
  const expenseTypes = getJson('expenseTypes');
  const notifications = data.notifications
    // Skips types introduced by a newer server.
    .filter((notification) => templates[notification.type])
    .map((notification) => {
      const template = templates[notification.type];
      const subject = subjectOf(notification, expenseTypes);

      return {
        id: toNotificationId(notification.id),
        title: fillTemplate(template.title, notification.actor, subject),
        body: fillTemplate(template.body, notification.actor, subject),
        // Drawable in android/app/src/main/res/drawable. Without it, Android shows a generic info icon.
        smallIcon: 'ic_stat_notification',
        autoCancel: true
      };
    });

  if (notifications.length > 0) {
    CapacitorNotifications.schedule(notifications);
  }

  CapacitorKV.set('cursor', data.cursor);
}

addEventListener('checkNotifications', (resolve, reject) => {
  checkNotifications().then(() => resolve(), (error) => reject(error));
});

// Dispatched by the app after each authenticated page load.
addEventListener('syncSession', (resolve, reject, details) => {
  try {
    // Another server or user must not continue with the previous cursor.
    if (details.apiBase !== get('apiBase') || details.userId !== get('userId')) {
      CapacitorKV.remove('cursor');
    }

    CapacitorKV.set('apiBase', details.apiBase);
    CapacitorKV.set('token', details.token);
    CapacitorKV.set('userId', details.userId);
    // The key-value store only holds strings.
    CapacitorKV.set('templates', JSON.stringify(details.templates));
    CapacitorKV.set('expenseTypes', JSON.stringify(details.expenseTypes));
    LEGACY_KEYS.forEach((key) => CapacitorKV.remove(key));
    resolve();
  } catch (error) {
    reject(error);
  }
});

// Dispatched by the app on logout or when leaving the instance.
addEventListener('clearSession', (resolve, reject) => {
  try {
    [...KEYS, ...LEGACY_KEYS].forEach((key) => CapacitorKV.remove(key));
    resolve();
  } catch (error) {
    reject(error);
  }
});
