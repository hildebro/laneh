import { BackgroundRunner } from '@capacitor/background-runner';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { resolve } from '$app/paths';
import type { User } from '$lib/backend/db/schema';
import { getBaseUrl } from '$lib/config';
import { isLocalMode } from '$lib/local';
import * as m from '$lib/paraglide/messages.js';

// Must match the BackgroundRunner label in capacitor.config.ts.
const RUNNER_LABEL = 'dev.laneh.app.notifications';

// Notifications are only polled by the mobile app, and pointless in the single person local mode.
function isSupported() {
  return Capacitor.isNativePlatform() && !isLocalMode();
}

// Hands the current session to the background runner, which polls the server for notifications. The runner can't
// access the app's storage, so this runs after every authenticated load to keep token and texts up to date.
export async function syncNotificationSession(user: Pick<User, 'id'>) {
  if (!isSupported()) {
    return;
  }

  const { value: token } = await Preferences.get({ key: 'session_token' });
  if (!token) {
    return;
  }

  try {
    await BackgroundRunner.dispatchEvent({
      label: RUNNER_LABEL,
      event: 'syncSession',
      details: {
        apiBase: getBaseUrl() + resolve('/'),
        token,
        userId: user.id,
        // The runner has no access to the translations, so it gets templates with placeholders.
        titleTaskDone: m.notification_task_done_title(),
        bodyTaskDone: m.notification_task_done_body({ user: '{user}', task: '{task}' })
      }
    });
  } catch (error) {
    console.error('❌ Syncing the notification session failed:', error);

    return;
  }

  // The periodic run can take up to 15 minutes, so opening the app checks right away.
  await checkNotificationsNow();
}

// Runs the same check as the periodic background run, in addition to it. Duplicates from overlapping runs are harmless,
// since a notification ID derived from the same event replaces the shown notification.
export async function checkNotificationsNow() {
  if (!isSupported()) {
    return;
  }

  try {
    await BackgroundRunner.dispatchEvent({ label: RUNNER_LABEL, event: 'checkNotifications', details: {} });
  } catch (error) {
    console.error('❌ Checking notifications failed:', error);
  }
}

export async function clearNotificationSession() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await BackgroundRunner.dispatchEvent({ label: RUNNER_LABEL, event: 'clearSession', details: {} });
  } catch (error) {
    console.error('❌ Clearing the notification session failed:', error);
  }
}

// Android 13+ requires a runtime permission. Only prompts, if the user hasn't decided yet.
export async function requestNotificationPermission() {
  if (!isSupported()) {
    return;
  }

  try {
    const { notifications } = await BackgroundRunner.checkPermissions();
    if (notifications === 'prompt' || notifications === 'prompt-with-rationale') {
      await BackgroundRunner.requestPermissions({ apis: ['notifications'] });
    }
  } catch (error) {
    console.error('❌ Requesting the notification permission failed:', error);
  }
}
