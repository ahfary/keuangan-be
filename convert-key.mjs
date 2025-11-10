

const fs = require('fs');
const crypto = require('crypto');

// Path ke key lama kamu
const oldKeyPath = './src/app/winpay/winpay-private.pem';
const newKeyPath = './src/app/winpay/winpay-private-pkcs8.pem';

try {
  const oldKey = fs.readFileSync(oldKeyPath, 'utf8');

  // Buat object PrivateKey dari PKCS#1 lama
  const privateKeyObj = crypto.createPrivateKey({
    key: oldKey,
    format: 'pem',
    type: 'pkcs1', // <- tambahkan ini agar bisa baca RSA lama
  });

  // Export ke format baru PKCS#8
  const pkcs8Key = privateKeyObj.export({
    format: 'pem',
    type: 'pkcs8',
  });

  fs.writeFileSync(newKeyPath, pkcs8Key);
  console.log('✅ Key berhasil dikonversi ke PKCS#8!');
  console.log(`File baru: ${newKeyPath}`);
} catch (err) {
  console.error('❌ Gagal convert:', err.message);
}
