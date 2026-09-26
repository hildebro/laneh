// The local app runs this backend on the device for a single person. Only the local runtime enables this, a server
// instance never does.
let localRuntime = false;

export function enableLocalRuntime() {
  localRuntime = true;
}

export function isLocalRuntime() {
  return localRuntime;
}
