/* Only accept the exact user-approved GitHub PNG; no substitute or regeneration.
   Checking the browser-fetched bytes provides auditable asset identity. */
export const APPROVED_SHA256 = 'd97df2553d5819ad71c17befd0bc483268527ed2fcb2afc4b61a7e584029c6b6';
export const APPROVED_BYTES = 369537;
export const APPROVED_RELATIVE_PATH = 'assets/semillero/nodes/node_base_v01.png';
export async function verifyNodeAsset(baseUrl = import.meta.env.BASE_URL) {
  if (!globalThis.crypto?.subtle) throw Error('G4_ASSET_SHA_UNAVAILABLE_REQUIRES_HTTPS_OR_LOCALHOST');
  const url = `${baseUrl}${APPROVED_RELATIVE_PATH}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw Error(`G4_APPROVED_NODE_ASSET_HTTP_${response.status}`);
  const body = await response.arrayBuffer();
  if (body.byteLength !== APPROVED_BYTES) throw Error(`G4_APPROVED_NODE_ASSET_LENGTH_${body.byteLength}`);
  const sha = [...new Uint8Array(await crypto.subtle.digest('SHA-256', body))]
    .map(n=>n.toString(16).padStart(2,'0')).join('');
  if (sha !== APPROVED_SHA256) throw Error('G4_APPROVED_NODE_ASSET_SHA_MISMATCH');
  return {url,sha256:sha,bytes:body.byteLength,verified:true};
}
