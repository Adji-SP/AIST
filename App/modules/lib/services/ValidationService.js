/**
 * ValidationService - Centralized Data Validation
 *
 * Provides consistent validation across the application. Supports both
 * simple rule-based validation and schema-based validation.
 *
 * Benefits:
 * - Single source of truth for validation logic
 * - Reusable validation rules
 * - Consistent error messages
 * - Easy to test
 * - Extensible with custom validators
 */

const { VALIDATION, TABLE_NAMES, ERROR_MESSAGES } = require('../../../config/constants');

class ValidationService {
    constructor() {
        this.customValidators = new Map();
        this.tableSchemas = new Map();
        this.initializeDefaultSchemas();
    }

    /**
     * Initialize default validation schemas for common tables
     */
    initializeDefaultSchemas() {
        // Users table schema
        this.tableSchemas.set(TABLE_NAMES.USERS, {
            username: { required: true, minLength: 3, maxLength: 50, alphanumeric: true },
            email: { required: true, email: true },
            password: { required: true, minLength: 8 },
        });

        // Sensor data schemas
        this.tableSchemas.set(TABLE_NAMES.TEMPERATURE_DATA, {
            temperature: { required: true, numeric: true },
            timestamp: { required: false },
        });

        this.tableSchemas.set(TABLE_NAMES.PRESSURE_DATA, {
            pressure: { required: true, numeric: true },
            timestamp: { required: false },
        });

        this.tableSchemas.set(TABLE_NAMES.SENSOR_DATA, {
            value: { required: true, numeric: true },
            sensor_id: { required: true },
            timestamp: { required: false },
        });
    }

    /**
     * Validate data against a table schema
     * @param {string} tableName - Table name
     * @param {Object} data - Data to validate
     * @returns {Object} Validation result { valid, errors }
     */
    validateTableData(tableName, data) {
        const schema = this.tableSchemas.get(tableName);

        if (!schema) {
            // No schema defined, skip validation
            return { valid: true, errors: [] };
        }

        return this.validate(data, schema);
    }

    /**
     * Validate data against a schema
     * @param {Object} data - Data to validate
     * @param {Object} schema - Validation schema
     * @returns {Object} Validation result { valid, errors }
     */
    validate(data, schema) {
        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            // Required validation
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }

            // Skip other validations if field is not required and not provided
            if (!rules.required && (value === undefined || value === null || value === '')) {
                continue;
            }

            // Email validation
            if (rules.email && !this.isValidEmail(value)) {
                errors.push(`${field} must be a valid email address`);
            }

            // Numeric validation
            if (rules.numeric && !this.isNumeric(value)) {
                errors.push(`${field} must be numeric`);
            }

            // Min length validation
            if (rules.minLength && String(value).length < rules.minLength) {
                errors.push(`${field} must be at least ${rules.minLength} characters`);
            }

            // Max length validation
            if (rules.maxLength && String(value).length > rules.maxLength) {
                errors.push(`${field} must not exceed ${rules.maxLength} characters`);
            }

            // Alphanumeric validation
            if (rules.alphanumeric && !this.isAlphanumeric(value)) {
                errors.push(`${field} must contain only letters and numbers`);
            }

            // Alpha validation
            if (rules.alpha && !this.isAlpha(value)) {
                errors.push(`${field} must contain only letters`);
            }

            // Min value validation
            if (rules.min !== undefined && Number(value) < rules.min) {
                errors.push(`${field} must be at least ${rules.min}`);
            }

            // Max value validation
            if (rules.max !== undefined && Number(value) > rules.max) {
                errors.push(`${field} must not exceed ${rules.max}`);
            }

            // Pattern validation (regex)
            if (rules.pattern && !rules.pattern.test(String(value))) {
                errors.push(`${field} has invalid format`);
            }

            // Custom validator
            if (rules.custom && this.customValidators.has(rules.custom)) {
                const validator = this.customValidators.get(rules.custom);
                const result = validator(value, data);
                if (result !== true) {
                    errors.push(result || `${field} validation failed`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate a single field
     * @param {*} value - Value to validate
     * @param {Object} rules - Validation rules
     * @param {string} fieldName - Field name (for error messages)
     * @returns {Object} Validation result { valid, error }
     */
    validateField(value, rules, fieldName = 'field') {
        const result = this.validate({ [fieldName]: value }, { [fieldName]: rules });
        return {
            valid: result.valid,
            error: result.errors[0] || null
        };
    }

    /**
     * Check if value is a valid email
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid
     */
    isValidEmail(email) {
        return VALIDATION.PATTERNS.EMAIL.test(String(email));
    }

    /**
     * Check if value is numeric
     * @param {*} value - Value to check
     * @returns {boolean} Is numeric
     */
    isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    /**
     * Check if value is alphanumeric
     * @param {string} value - Value to check
     * @returns {boolean} Is alphanumeric
     */
    isAlphanumeric(value) {
        return /^[a-zA-Z0-9]+$/.test(String(value));
    }

    /**
     * Check if value is alphabetic
     * @param {string} value - Value to check
     * @returns {boolean} Is alphabetic
     */
    isAlpha(value) {
        return /^[a-zA-Z]+$/.test(String(value));
    }

    /**
     * Register a table validation schema
     * @param {string} tableName - Table name
     * @param {Object} schema - Validation schema
     */
    registerTableSchema(tableName, schema) {
        this.tableSchemas.set(tableName, schema);
    }

    /**
     * Register a custom validator
     * @param {string} name - Validator name
     * @param {Function} validator - Validator function
     */
    registerCustomValidator(name, validator) {
        if (typeof validator !== 'function') {
            throw new Error('Validator must be a function');
        }
        this.customValidators.set(name, validator);
    }

    /**
     * Get all registered table schemas
     * @returns {Map} Table schemas
     */
    getTableSchemas() {
        return new Map(this.tableSchemas);
    }

    /**
     * Clear all custom validators
     */
    clearCustomValidators() {
        this.customValidators.clear();
    }

    /**
     * Validate required fields exist
     * @param {Object} data - Data to validate
     * @param {Array<string>} requiredFields - Required field names
     * @returns {Object} Validation result
     */
    validateRequiredFields(data, requiredFields) {
        const errors = [];

        for (const field of requiredFields) {
            if (data[field] === undefined || data[field] === null || data[field] === '') {
                errors.push(ERROR_MESSAGES.REQUIRED_FIELD_MISSING + `: ${field}`);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

// Singleton instance
let instance = null;

function getInstance() {
    if (!instance) {
        instance = new ValidationService();
    }
    return instance;
}

function resetInstance() {
    instance = null;
}

module.exports = {
    ValidationService,
    getInstance,
    resetInstance
};
