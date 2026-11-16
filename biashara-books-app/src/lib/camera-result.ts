export let pendingCapturedUri: string | null = null;

export function setPendingCapturedUri(uri: string | null): void {
  pendingCapturedUri = uri;
}
