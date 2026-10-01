// Runs in the headless JS environment of @capacitor/background-runner, outside the web view. Only a few web APIs are
// available (fetch without response headers, no DOM), so the app hands over everything required via syncSession.
/* global CapacitorKV, CapacitorNotifications */

const KEYS = ['apiBase', 'token', 'userId', 'cursor', 'titleTaskDone', 'bodyTaskDone'];

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

function fillTemplate(template, notification) {
  return template.replaceAll('{user}', notification.actor).replaceAll('{task}', notification.subject);
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

  const notifications = data.notifications
    .filter((notification) => notification.type === 'task_done')
    .map((notification) => ({
      id: toNotificationId(notification.id),
      title: fillTemplate(get('titleTaskDone') || 'Task done', notification),
      body: fillTemplate(get('bodyTaskDone') || '{user}: {task}', notification),
      // Drawable in android/app/src/main/res/drawable. Without it, Android shows a generic info icon.
      smallIcon: 'ic_stat_notification',
      autoCancel: true
    }));

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
    CapacitorKV.set('titleTaskDone', details.titleTaskDone);
    CapacitorKV.set('bodyTaskDone', details.bodyTaskDone);
    resolve();
  } catch (error) {
    reject(error);
  }
});

// Dispatched by the app on logout or when leaving the instance.
addEventListener('clearSession', (resolve, reject) => {
  try {
    KEYS.forEach((key) => CapacitorKV.remove(key));
    resolve();
  } catch (error) {
    reject(error);
  }
});
