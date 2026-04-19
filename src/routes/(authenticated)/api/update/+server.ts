import { json } from '@sveltejs/kit';

export async function GET() {
  try {
    const res = await fetch('https://api.github.com/repos/hildebro/laneh/releases/latest');

    if (!res.ok) {
      return json({ error: 'Failed to fetch release' }, { status: 500 });
    }

    const data = await res.json();
    const latestVersion = data.tag_name.replace('v', '');
    const currentVersion = __APP_VERSION__;

    const hasUpdate = latestVersion !== currentVersion;

    return json({ hasUpdate, latestVersion, currentVersion });
  } catch {
    return json({ error: 'Could not check for updates' }, { status: 500 });
  }
}
