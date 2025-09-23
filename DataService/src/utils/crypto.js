'use strict';

const CryptoJS = require('crypto-js');

const SECRET = process.env.DATA_ENCRYPTION_KEY || 'dev_encryption_key';

// PUBLIC_INTERFACE
function encrypt(value) {
  /** Encrypt a string using AES. */
  if (value == null) return value;
  return CryptoJS.AES.encrypt(String(value), SECRET).toString();
}

// PUBLIC_INTERFACE
function decrypt(cipher) {
  /** Decrypt a string using AES. */
  if (!cipher) return cipher;
  const bytes = CryptoJS.AES.decrypt(cipher, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = { encrypt, decrypt };
