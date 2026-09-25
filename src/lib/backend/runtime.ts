// The offline app runs this backend on the device for a single person. Only the offline runtime enables this, a server
// instance never does.
let offlineRuntime = false;

export function enableOfflineRuntime() {
  offlineRuntime = true;
}

export function isOfflineRuntime() {
  return offlineRuntime;
}
