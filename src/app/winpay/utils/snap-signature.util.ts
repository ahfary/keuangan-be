import * as crypto from 'crypto';

/** Membuat hash SHA256 body minified JSON */
function bodyHashHexLower(body: unknown): string {
  const minified = JSON.stringify(JSON.parse(JSON.stringify(body)));
  return crypto.createHash('sha256').update(minified).digest('hex').toLowerCase();
}

/** Generate X-SIGNATURE (RSA-SHA256 → base64) */
export function createSnapSignature(
  method: string,
  endpointPath: string,
  body: unknown,
  timestamp: string,
  privateKeyPem: string,
): string {
  const hash = bodyHashHexLower(body);
  const stringToSign = `${method}:${endpointPath}:${hash}:${timestamp}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(stringToSign);
  return signer.sign(privateKeyPem, 'base64');
}

/** Format timestamp ke ISO 8601 WIB */
export function nowJakartaISO(): string {   
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}+07:00`;
}
