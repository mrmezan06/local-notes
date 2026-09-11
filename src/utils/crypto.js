const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

// Derives a cryptographic key using PBKDF2 with salt parameters
async function deriveKey(password, salt) {
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    ENCODER.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

// Generates a SHA-256 fingerprint hash string to verify master logins
export async function hashPassword(password) {
  const msgUint8 = ENCODER.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Encrypts plaintext strings using authenticated AES-GCM 256-bit encryption
export async function encryptData(text, password) {
  try {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ENCODER.encode(text),
    );

    return JSON.stringify({
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      salt: btoa(String.fromCharCode(...salt)),
      iv: btoa(String.fromCharCode(...iv)),
    });
  } catch (e) {
    console.error('Encryption Failure', e);
  }
}

// Decrypts ciphertext strings back into readable text fields
export async function decryptData(cipherJson, password) {
  try {
    const { ciphertext, salt, iv } = JSON.parse(cipherJson);
    const saltUint8 = new Uint8Array(
      atob(salt)
        .split('')
        .map((c) => c.charCodeAt(0)),
    );
    const ivUint8 = new Uint8Array(
      atob(iv)
        .split('')
        .map((c) => c.charCodeAt(0)),
    );
    const cipherUint8 = new Uint8Array(
      atob(ciphertext)
        .split('')
        .map((c) => c.charCodeAt(0)),
    );

    const key = await deriveKey(password, saltUint8);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivUint8 },
      key,
      cipherUint8,
    );
    return DECODER.decode(decrypted);
  } catch (e) {
    console.error('Decryption Failure', e);
  }
}
