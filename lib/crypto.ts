import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 16;


// Get encryption key from environment
function getEncryptionKey(): string {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('TOKEN_ENCRYPTION_KEY environment variable is required');
  }
  if (key.length !== 64) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be exactly 64 hexadecimal characters (32 bytes)');
  }
  return key;
}

/**
 * Encrypt sensitive text data (like tokens)
 * Returns format: salt:iv:authTag:encrypted
 */
export async function encrypt(text: string): Promise<string> {
  try {
    const salt = randomBytes(SALT_LENGTH);
    const iv = randomBytes(IV_LENGTH);
    
    // Derive key from the master key and salt
    const key = await scryptAsync(getEncryptionKey(), salt, 32) as Buffer;
    
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    // Return as colon-separated hex strings
    return [
      salt.toString('hex'),
      iv.toString('hex'), 
      authTag.toString('hex'),
      encrypted.toString('hex')
    ].join(':');
    
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt encrypted text data
 * Expects format: salt:iv:authTag:encrypted
 */
export async function decrypt(encryptedData: string): Promise<string> {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [saltHex, ivHex, authTagHex, encryptedHex] = parts;
    
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    
    // Derive the same key using the stored salt
    const key = await scryptAsync(getEncryptionKey(), salt, 32) as Buffer;
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
    
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a secure random encryption key (for initial setup)
 * Run this once and store the result in your TOKEN_ENCRYPTION_KEY env var
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Validate that the encryption key is properly formatted
 */
export function validateEncryptionKey(key?: string): boolean {
  if (!key) return false;
  if (key.length !== 64) return false;
  return /^[0-9a-fA-F]{64}$/.test(key);
} 