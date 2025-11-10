import * as crypto from 'crypto';
import * as fs from 'fs';

/**
 * Load private key dari file atau environment
 * - Deteksi otomatis format (PKCS#1 / PKCS#8)
 * - Convert ke PKCS#8 kalau perlu (runtime)
 */
export function loadPrivateKey(source?: string): string {
  let keyPem = '';

  // 1️⃣ Baca dari argumen, file, atau env
  if (source && fs.existsSync(source)) {
    keyPem = fs.readFileSync(source, 'utf8');
  } else if (process.env.SNAP_PRIVATE_KEY_PEM) {
    keyPem = process.env.SNAP_PRIVATE_KEY_PEM;
  } else {
    throw new Error('Private key tidak ditemukan. Pastikan ada di .env atau file.');
  }

  // 2️⃣ Hapus tanda kutip triple dari env (kalau pakai """...""")
  keyPem = keyPem.trim().replace(/^"+|"+$/g, '');

  // 3️⃣ Cek format
  if (keyPem.includes('BEGIN RSA PRIVATE KEY')) {
    // Format lama → convert ke PKCS#8
    console.warn('[Winpay] Private key PKCS#1 terdeteksi, mengonversi ke PKCS#8...');
    try {
      const privateKeyObj = crypto.createPrivateKey({
        key: keyPem,
        format: 'pem',
      });
      return privateKeyObj.export({ format: 'pem', type: 'pkcs8' }).toString();
    } catch (err) {
      throw new Error(
        `[Winpay] Gagal convert private key ke PKCS#8: ${(err as Error).message}`,
      );
    }
  }

  // 4️⃣ Sudah format PKCS#8
  if (!keyPem.includes('BEGIN PRIVATE KEY')) {
    throw new Error('[Winpay] Format private key tidak dikenali.');
  }

  return keyPem;
}
