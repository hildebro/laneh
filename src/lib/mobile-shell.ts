export function disconnectFromWrapper(returnUrl: string|undefined) {
  // Bounce back to the wrapper, appending a query parameter
  window.location.replace(`${returnUrl}?action=disconnect`);
}
