import CryptoJS from 'crypto-js';

const AES_SECRET = process.env.AES_SECRET;

if (!AES_SECRET) {
  throw new Error('Please define the AES_SECRET environment variable inside .env.local');
}

/**
 * Encrypt sensitive data using AES-256
 * @param {object|string} data - Data to encrypt
 * @returns {string} Encrypted ciphertext
 */
export function encryptPayload(data) {
  const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(plaintext, AES_SECRET).toString();
}

/**
 * Decrypt AES-encrypted data
 * @param {string} ciphertext - Encrypted data
 * @returns {object|string} Decrypted data
 */
export function decryptPayload(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, AES_SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    throw new Error('Failed to decrypt payload');
  }
}
