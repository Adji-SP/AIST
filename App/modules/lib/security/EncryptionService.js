// App/modules/lib/security/EncryptionService.js
const crypto = require('crypto');

class EncryptionService {
    constructor(encryptionKey) {
        // CRITICAL: Validate encryption key exists (fix the || '' fallback)
        if (!encryptionKey || encryptionKey.length === 0) {
            throw new Error('Encryption key must be provided. Set DB_ENCRYPTION_KEY environment variable.');
        }

        this.algorithm = 'aes-256-cbc';
        this.secretKey = crypto.createHash('sha256').update(encryptionKey).digest();
        this.ivLength = 16;

        // Define sensitive field patterns (extracted from database implementations)
        this.sensitiveFields = ['password', 'email', 'phone', 'address', 'name'];
    }

    /**
     * Encrypt a single text value
     * @param {string} text - The text to encrypt
     * @returns {string} Encrypted text in format "iv:encryptedData"
     */
    encrypt(text) {
        if (text === null || typeof text === 'undefined') return text;

        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.secretKey), iv);
        let encrypted = cipher.update(String(text), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }

    /**
     * Decrypt a single encrypted value
     * @param {string} encryptedText - The encrypted text in format "iv:encryptedData"
     * @returns {string} Decrypted text
     */
    decrypt(encryptedText) {
        if (typeof encryptedText !== 'string' || !encryptedText.includes(':')) {
            return encryptedText;
        }

        try {
            const textParts = encryptedText.split(':');
            const iv = Buffer.from(textParts.shift(), 'hex');
            const encryptedData = textParts.join(':');
            const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.secretKey), iv);
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            return encryptedText;
        }
    }

    /**
     * Encrypt sensitive fields in an object
     * @param {object} data - Object containing fields to encrypt
     * @returns {object} Object with sensitive fields encrypted
     */
    encryptFields(data) {
        const encryptedData = {};
        for (const [key, value] of Object.entries(data)) {
            // Check if field name matches sensitive patterns
            if (this.sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                encryptedData[key] = this.encrypt(value);
            } else {
                encryptedData[key] = value;
            }
        }
        return encryptedData;
    }

    /**
     * Decrypt all encrypted fields in a row object
     * @param {object} row - Object containing potentially encrypted fields
     * @returns {object} Object with all encrypted fields decrypted
     */
    decryptFields(row) {
        if (!row || typeof row !== 'object') return row;

        const decryptedRow = { ...row };
        for (const key in decryptedRow) {
            if (typeof decryptedRow[key] === 'string' && decryptedRow[key].includes(':')) {
                const originalValue = decryptedRow[key];
                decryptedRow[key] = this.decrypt(originalValue);

                // Convert numeric strings back to numbers
                if (decryptedRow[key] !== originalValue && !isNaN(Number(decryptedRow[key]))) {
                    decryptedRow[key] = Number(decryptedRow[key]);
                }
            }
        }
        return decryptedRow;
    }
}

module.exports = EncryptionService;
