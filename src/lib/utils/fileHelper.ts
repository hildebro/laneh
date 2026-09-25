import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    // The result is a data URL, so the prefix up to the comma has to be removed.
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Downloads the file in browsers. The app's WebView can't download files, so it opens the share dialog instead,
// which also allows saving the file on the device.
export async function saveFile(blob: Blob, filename: string) {
  if (Capacitor.isNativePlatform()) {
    const { uri } = await Filesystem.writeFile({
      path: filename,
      data: await toBase64(blob),
      directory: Directory.Cache
    });

    try {
      await Share.share({ title: filename, files: [uri] });
    } catch (error) {
      // Closing the share dialog is not an error.
      if (!String(error).includes('canceled')) {
        throw error;
      }
    }

    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  // Clean up the object URL to prevent memory leaks
  URL.revokeObjectURL(url);
}
