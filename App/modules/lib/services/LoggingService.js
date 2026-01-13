/**
 * LoggingService - Centralized Logging
 *
 * Provides consistent logging across the application with support for
 * different log levels, structured logging, and log persistence.
 *
 * Benefits:
 * - Single source of truth for logging
 * - Consistent log format
 * - Easy to configure and filter
 * - Supports multiple transports
 * - Structured logging for better analysis
 */

const fs = require('fs');
const path = require('path');
const { LOG_LEVELS } = require('../../../config/constants');

class LoggingService {
    constructor(options = {}) {
        this.level = options.level || process.env.LOG_LEVEL || LOG_LEVELS.INFO;
        this.enableConsole = options.enableConsole !== false;
        this.enableFile = options.enableFile || false;
        this.logFilePath = options.logFilePath || path.join(process.cwd(), 'logs', 'app.log');
        this.maxLogSize = options.maxLogSize || 10 * 1024 * 1024; // 10MB
        this.enableColors = options.enableColors !== false && process.stdout.isTTY;

        this.levels = {
            [LOG_LEVELS.ERROR]: 0,
            [LOG_LEVELS.WARN]: 1,
            [LOG_LEVELS.INFO]: 2,
            [LOG_LEVELS.DEBUG]: 3,
            [LOG_LEVELS.TRACE]: 4
        };

        this.colors = {
            [LOG_LEVELS.ERROR]: '\x1b[31m', // Red
            [LOG_LEVELS.WARN]: '\x1b[33m',  // Yellow
            [LOG_LEVELS.INFO]: '\x1b[36m',  // Cyan
            [LOG_LEVELS.DEBUG]: '\x1b[35m', // Magenta
            [LOG_LEVELS.TRACE]: '\x1b[90m'  // Gray
        };

        this.resetColor = '\x1b[0m';

        // Ensure log directory exists if file logging is enabled
        if (this.enableFile) {
            const logDir = path.dirname(this.logFilePath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
        }
    }

    /**
     * Log an error message
     * @param {string} message - Log message
     * @param {*} meta - Additional metadata
     */
    error(message, meta = {}) {
        this.log(LOG_LEVELS.ERROR, message, meta);
    }

    /**
     * Log a warning message
     * @param {string} message - Log message
     * @param {*} meta - Additional metadata
     */
    warn(message, meta = {}) {
        this.log(LOG_LEVELS.WARN, message, meta);
    }

    /**
     * Log an info message
     * @param {string} message - Log message
     * @param {*} meta - Additional metadata
     */
    info(message, meta = {}) {
        this.log(LOG_LEVELS.INFO, message, meta);
    }

    /**
     * Log a debug message
     * @param {string} message - Log message
     * @param {*} meta - Additional metadata
     */
    debug(message, meta = {}) {
        this.log(LOG_LEVELS.DEBUG, message, meta);
    }

    /**
     * Log a trace message
     * @param {string} message - Log message
     * @param {*} meta - Additional metadata
     */
    trace(message, meta = {}) {
        this.log(LOG_LEVELS.TRACE, message, meta);
    }

    /**
     * Core logging method
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {*} meta - Additional metadata
     */
    log(level, message, meta = {}) {
        // Check if this level should be logged
        if (!this.shouldLog(level)) {
            return;
        }

        const logEntry = this.formatLogEntry(level, message, meta);

        // Console output
        if (this.enableConsole) {
            this.writeToConsole(level, logEntry);
        }

        // File output
        if (this.enableFile) {
            this.writeToFile(logEntry);
        }
    }

    /**
     * Check if a log level should be logged
     * @param {string} level - Log level to check
     * @returns {boolean} Should log
     */
    shouldLog(level) {
        const currentLevelValue = this.levels[this.level];
        const logLevelValue = this.levels[level];
        return logLevelValue <= currentLevelValue;
    }

    /**
     * Format a log entry
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {*} meta - Additional metadata
     * @returns {Object} Formatted log entry
     */
    formatLogEntry(level, message, meta) {
        return {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            message,
            ...meta
        };
    }

    /**
     * Write log entry to console
     * @param {string} level - Log level
     * @param {Object} logEntry - Log entry
     */
    writeToConsole(level, logEntry) {
        const color = this.enableColors ? this.colors[level] : '';
        const reset = this.enableColors ? this.resetColor : '';

        const { timestamp, level: logLevel, message, ...meta } = logEntry;
        const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';

        console.log(`${color}[${timestamp}] [${logLevel}] ${message}${metaStr}${reset}`);
    }

    /**
     * Write log entry to file
     * @param {Object} logEntry - Log entry
     */
    writeToFile(logEntry) {
        try {
            // Check file size and rotate if needed
            if (fs.existsSync(this.logFilePath)) {
                const stats = fs.statSync(this.logFilePath);
                if (stats.size > this.maxLogSize) {
                    this.rotateLogFile();
                }
            }

            const logLine = JSON.stringify(logEntry) + '\n';
            fs.appendFileSync(this.logFilePath, logLine, 'utf8');
        } catch (error) {
            // Fail silently to avoid infinite loops
            console.error('Failed to write to log file:', error.message);
        }
    }

    /**
     * Rotate log file when it exceeds max size
     */
    rotateLogFile() {
        try {
            const ext = path.extname(this.logFilePath);
            const base = this.logFilePath.slice(0, -ext.length);
            const rotatedPath = `${base}.${Date.now()}${ext}`;

            fs.renameSync(this.logFilePath, rotatedPath);
        } catch (error) {
            console.error('Failed to rotate log file:', error.message);
        }
    }

    /**
     * Set the log level
     * @param {string} level - New log level
     */
    setLevel(level) {
        if (!this.levels.hasOwnProperty(level)) {
            throw new Error(`Invalid log level: ${level}`);
        }
        this.level = level;
    }

    /**
     * Get current log level
     * @returns {string} Current log level
     */
    getLevel() {
        return this.level;
    }

    /**
     * Enable or disable console logging
     * @param {boolean} enabled - Enable console logging
     */
    setConsoleLogging(enabled) {
        this.enableConsole = enabled;
    }

    /**
     * Enable or disable file logging
     * @param {boolean} enabled - Enable file logging
     */
    setFileLogging(enabled) {
        this.enableFile = enabled;
        if (enabled) {
            const logDir = path.dirname(this.logFilePath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
        }
    }

    /**
     * Create a child logger with additional context
     * @param {Object} context - Context to add to all logs
     * @returns {Object} Child logger
     */
    child(context) {
        return {
            error: (message, meta = {}) => this.error(message, { ...context, ...meta }),
            warn: (message, meta = {}) => this.warn(message, { ...context, ...meta }),
            info: (message, meta = {}) => this.info(message, { ...context, ...meta }),
            debug: (message, meta = {}) => this.debug(message, { ...context, ...meta }),
            trace: (message, meta = {}) => this.trace(message, { ...context, ...meta }),
        };
    }
}

// Singleton instance
let instance = null;

function getInstance(options = {}) {
    if (!instance) {
        instance = new LoggingService(options);
    }
    return instance;
}

function resetInstance() {
    instance = null;
}

module.exports = {
    LoggingService,
    getInstance,
    resetInstance
};
