/**
 * COMPREHENSIVE INPUT VALIDATION AND SANITIZATION SERVICE
 * ======================================================
 * 
 * Enterprise-grade input validation and sanitization for Delegate AI
 * 
 * Features:
 * - XSS Prevention
 * - SQL Injection Protection
 * - Content Security Policy Compliance
 * - Unicode Normalization
 * - Length and Format Validation
 * - Threat Detection and Logging
 * - Real-time Input Filtering
 */

// Input validation configuration
interface ValidationConfig {
  maxLength?: number;
  minLength?: number;
  allowHTML?: boolean;
  allowSpecialChars?: boolean;
  allowUnicode?: boolean;
  allowURLs?: boolean;
  allowEmails?: boolean;
  customPattern?: RegExp;
  required?: boolean;
  trim?: boolean;
  normalize?: boolean;
}

// Validation result interface
interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
  warnings: string[];
  originalValue: string;
  threatLevel: 'none' | 'low' | 'medium' | 'high';
  blockedContent: string[];
}

// Threat detection patterns
const THREAT_PATTERNS = {
  // XSS patterns
  xss: [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
    /<embed[\s\S]*?>/gi,
    /<link[\s\S]*?>/gi,
    /<meta[\s\S]*?>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /onfocus\s*=/gi,
    /onblur\s*=/gi,
    /onsubmit\s*=/gi,
    /onchange\s*=/gi,
    /<svg[\s\S]*?onload[\s\S]*?>/gi,
    /<img[\s\S]*?onerror[\s\S]*?>/gi,
    /data:text\/html/gi,
    /data:application\/javascript/gi,
  ],
  
  // SQL injection patterns
  sql: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(\b(UNION|JOIN|WHERE|HAVING|GROUP BY|ORDER BY)\b)/gi,
    /(--|\/\*|\*\/)/g,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(\b(OR|AND)\s+['"]\w+['"]?\s*=\s*['"]\w+['"]?)/gi,
    /(\bCONCAT\s*\()/gi,
    /(\bCHAR\s*\()/gi,
    /(\bCAST\s*\()/gi,
    /(\bCONVERT\s*\()/gi,
  ],
  
  // Command injection patterns
  command: [
    /(\||&&|;|\$\(|\`)/g,
    /(\b(rm|del|format|fdisk|kill|sudo|su|chmod|chown)\b)/gi,
    /(\.\.\/|\.\.\\)/g,
    /(\$\{[\w\s]*\})/g,
    /(\beval\s*\()/gi,
    /(\bexec\s*\()/gi,
  ],
  
  // Path traversal patterns
  path: [
    /(\.\.\/|\.\.\\)/g,
    /(\.\.[\/\\])/g,
    /(\/etc\/passwd|\/etc\/shadow)/gi,
    /(C:\\Windows\\System32)/gi,
    /(%2e%2e%2f|%2e%2e%5c)/gi,
    /(%252e%252e%252f)/gi,
  ],
  
  // LDAP injection patterns
  ldap: [
    /(\*|\(|\)|\\|\/|\||&)/g,
    /(\b(cn|ou|dc|uid|mail)=)/gi,
  ],
  
  // NoSQL injection patterns
  nosql: [
    /(\$where|\$regex|\$ne|\$in|\$nin|\$gt|\$lt|\$gte|\$lte)/gi,
    /(\$or|\$and|\$not|\$nor)/gi,
    /(\$exists|\$type|\$mod|\$size)/gi,
  ],
};

// Content filtering patterns
const CONTENT_PATTERNS = {
  // Profanity and inappropriate content (basic patterns)
  profanity: [
    // Add patterns as needed - keeping minimal for professional use
    /\b(spam|scam|phishing)\b/gi,
  ],
  
  // Suspicious URLs
  suspiciousUrls: [
    /https?:\/\/(?:www\.)?(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|short\.link)/gi,
    /https?:\/\/[^\s]*(?:\.tk|\.ml|\.ga|\.cf)/gi,
    /https?:\/\/[^\s]*(?:phishing|malware|virus|trojan)/gi,
  ],
  
  // Email patterns
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // URL patterns
  url: /^https?:\/\/(?:[-\w.])+(?::\d+)?(?:\/(?:[\w/_.])*)?(?:\?(?:[\w&=%.])*)?(?:#(?:\w)*)?$/,
  
  // Phone number patterns
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  
  // Credit card patterns (to block accidentally entered sensitive data)
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  
  // Social Security Number patterns (US format)
  ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
};

// Unicode normalization and character filtering
const ALLOWED_UNICODE_RANGES = [
  [0x0020, 0x007E], // Basic Latin
  [0x00A0, 0x00FF], // Latin-1 Supplement
  [0x0100, 0x017F], // Latin Extended-A
  [0x0180, 0x024F], // Latin Extended-B
  [0x1E00, 0x1EFF], // Latin Extended Additional
  [0x2000, 0x206F], // General Punctuation
  [0x20A0, 0x20CF], // Currency Symbols
  [0x2100, 0x214F], // Letterlike Symbols
  [0x2190, 0x21FF], // Arrows
  [0x2200, 0x22FF], // Mathematical Operators
];

/**
 * Core Input Validation and Sanitization Class
 */
class InputValidator {
  private auditLog: Array<{
    timestamp: string;
    input: string;
    threatLevel: string;
    threats: string[];
    action: string;
  }> = [];

  /**
   * Main validation and sanitization method
   */
  validate(input: string, config: ValidationConfig = {}): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      sanitizedValue: input,
      errors: [],
      warnings: [],
      originalValue: input,
      threatLevel: 'none',
      blockedContent: [],
    };

    try {
      // Handle null/undefined input
      if (input === null || input === undefined) {
        if (config.required) {
          result.isValid = false;
          result.errors.push('Input is required');
        }
        result.sanitizedValue = '';
        return result;
      }

      // Convert to string and handle primitives
      let workingValue = String(input);

      // Trim whitespace if configured
      if (config.trim !== false) {
        workingValue = workingValue.trim();
      }

      // Check required field
      if (config.required && workingValue === '') {
        result.isValid = false;
        result.errors.push('Input is required');
        return result;
      }

      // Skip further validation for empty non-required fields
      if (workingValue === '' && !config.required) {
        result.sanitizedValue = '';
        return result;
      }

      // Length validation
      if (config.maxLength && workingValue.length > config.maxLength) {
        result.isValid = false;
        result.errors.push(`Input exceeds maximum length of ${config.maxLength} characters`);
      }

      if (config.minLength && workingValue.length < config.minLength) {
        result.isValid = false;
        result.errors.push(`Input must be at least ${config.minLength} characters`);
      }

      // Threat detection
      const threatResult = this.detectThreats(workingValue);
      result.threatLevel = threatResult.level;
      result.blockedContent = threatResult.blocked;

      if (threatResult.level === 'high') {
        result.isValid = false;
        result.errors.push('Input contains potentially dangerous content');
        this.logThreat(input, threatResult.level, threatResult.threats);
      } else if (threatResult.level === 'medium') {
        result.warnings.push('Input contains suspicious content');
        this.logThreat(input, threatResult.level, threatResult.threats);
      }

      // Content sanitization
      workingValue = this.sanitizeContent(workingValue, config);

      // Unicode normalization
      if (config.normalize !== false) {
        workingValue = this.normalizeUnicode(workingValue);
      }

      // Character filtering
      if (!config.allowUnicode) {
        workingValue = this.filterUnsafeCharacters(workingValue);
      }

      // Custom pattern validation
      if (config.customPattern && !config.customPattern.test(workingValue)) {
        result.isValid = false;
        result.errors.push('Input does not match required format');
      }

      // Final sanitized value
      result.sanitizedValue = workingValue;

      return result;

    } catch (error) {
      console.error('Input validation error:', error);
      result.isValid = false;
      result.errors.push('Validation failed due to internal error');
      result.sanitizedValue = '';
      return result;
    }
  }

  /**
   * Detect security threats in input
   */
  private detectThreats(input: string): {
    level: 'none' | 'low' | 'medium' | 'high';
    threats: string[];
    blocked: string[];
  } {
    const threats: string[] = [];
    const blocked: string[] = [];
    let maxThreatLevel: 'none' | 'low' | 'medium' | 'high' = 'none';

    // Check for XSS patterns
    for (const pattern of THREAT_PATTERNS.xss) {
      const matches = input.match(pattern);
      if (matches) {
        threats.push('XSS');
        blocked.push(...matches);
        maxThreatLevel = 'high';
      }
    }

    // Check for SQL injection patterns
    for (const pattern of THREAT_PATTERNS.sql) {
      const matches = input.match(pattern);
      if (matches) {
        threats.push('SQL Injection');
        blocked.push(...matches);
        maxThreatLevel = maxThreatLevel === 'high' ? 'high' : 'medium';
      }
    }

    // Check for command injection patterns
    for (const pattern of THREAT_PATTERNS.command) {
      const matches = input.match(pattern);
      if (matches) {
        threats.push('Command Injection');
        blocked.push(...matches);
        maxThreatLevel = 'high';
      }
    }

    // Check for path traversal patterns
    for (const pattern of THREAT_PATTERNS.path) {
      const matches = input.match(pattern);
      if (matches) {
        threats.push('Path Traversal');
        blocked.push(...matches);
        maxThreatLevel = maxThreatLevel === 'high' ? 'high' : 'medium';
      }
    }

    // Check for LDAP injection patterns
    for (const pattern of THREAT_PATTERNS.ldap) {
      const matches = input.match(pattern);
      if (matches) {
        threats.push('LDAP Injection');
        blocked.push(...matches);
        maxThreatLevel = maxThreatLevel === 'high' ? 'high' : 'medium';
      }
    }

    // Check for NoSQL injection patterns
    for (const pattern of THREAT_PATTERNS.nosql) {
      const matches = input.match(pattern);
      if (matches) {
        threats.push('NoSQL Injection');
        blocked.push(...matches);
        maxThreatLevel = maxThreatLevel === 'high' ? 'high' : 'medium';
      }
    }

    // Check for suspicious URLs
    for (const pattern of CONTENT_PATTERNS.suspiciousUrls) {
      const matches = input.match(pattern);
      if (matches) {
        threats.push('Suspicious URL');
        blocked.push(...matches);
        maxThreatLevel = maxThreatLevel === 'high' ? 'high' : 'low';
      }
    }

    // Check for sensitive data patterns
    const creditCardMatches = input.match(CONTENT_PATTERNS.creditCard);
    if (creditCardMatches) {
      threats.push('Potential Credit Card');
      blocked.push(...creditCardMatches);
      maxThreatLevel = maxThreatLevel === 'high' ? 'high' : 'medium';
    }

    const ssnMatches = input.match(CONTENT_PATTERNS.ssn);
    if (ssnMatches) {
      threats.push('Potential SSN');
      blocked.push(...ssnMatches);
      maxThreatLevel = maxThreatLevel === 'high' ? 'high' : 'medium';
    }

    return {
      level: maxThreatLevel,
      threats: Array.from(new Set(threats)),
      blocked: Array.from(new Set(blocked)),
    };
  }

  /**
   * Sanitize content based on configuration
   */
  private sanitizeContent(input: string, config: ValidationConfig): string {
    let sanitized = input;

    // HTML sanitization
    if (!config.allowHTML) {
      sanitized = this.sanitizeHTML(sanitized);
    }

    // Special character filtering
    if (!config.allowSpecialChars) {
      sanitized = this.filterSpecialCharacters(sanitized);
    }

    // URL filtering
    if (!config.allowURLs) {
      sanitized = this.filterURLs(sanitized);
    }

    // Email filtering
    if (!config.allowEmails) {
      sanitized = this.filterEmails(sanitized);
    }

    return sanitized;
  }

  /**
   * Sanitize HTML content
   */
  private sanitizeHTML(input: string): string {
    return input
      // Remove script tags and content
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      // Remove iframe tags and content
      .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
      // Remove object tags and content
      .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
      // Remove embed tags
      .replace(/<embed[\s\S]*?>/gi, '')
      // Remove link tags
      .replace(/<link[\s\S]*?>/gi, '')
      // Remove meta tags
      .replace(/<meta[\s\S]*?>/gi, '')
      // Remove style tags and content
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
      // Remove event handlers
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '')
      // Remove javascript: and vbscript: protocols
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      // Remove data: URLs that could contain executable content
      .replace(/data:(?!image\/)[^;]*;[^,]*,/gi, '')
      // Encode remaining HTML entities
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Filter special characters
   */
  private filterSpecialCharacters(input: string): string {
    // Allow basic punctuation but remove potentially dangerous characters
    return input.replace(/[<>{}[\]\\|`~!@#$%^&*()+=]/g, '');
  }

  /**
   * Filter URLs
   */
  private filterURLs(input: string): string {
    return input.replace(/https?:\/\/[^\s]+/gi, '[URL_REMOVED]');
  }

  /**
   * Filter email addresses
   */
  private filterEmails(input: string): string {
    return input.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/gi, '[EMAIL_REMOVED]');
  }

  /**
   * Normalize Unicode characters
   */
  private normalizeUnicode(input: string): string {
    try {
      // Normalize to NFC (Canonical Decomposition, followed by Canonical Composition)
      return input.normalize('NFC');
    } catch (error) {
      console.warn('Unicode normalization failed:', error);
      return input;
    }
  }

  /**
   * Filter unsafe Unicode characters
   */
  private filterUnsafeCharacters(input: string): string {
    return input.replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Control characters
      .replace(/[\uFEFF]/g, '') // Byte order mark
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width characters
      .replace(/[\u2028\u2029]/g, ''); // Line/paragraph separators
  }

  /**
   * Log security threats for audit purposes
   */
  private logThreat(input: string, level: string, threats: string[]): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      input: input.substring(0, 100), // Log first 100 chars only
      threatLevel: level,
      threats,
      action: level === 'high' ? 'BLOCKED' : 'FLAGGED',
    };

    this.auditLog.push(logEntry);

    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔒 Input Security Alert:', logEntry);
    }
  }

  /**
   * Get audit log for security monitoring
   */
  getAuditLog(): typeof this.auditLog {
    return [...this.auditLog];
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }
}

// Create singleton instance
const inputValidator = new InputValidator();

/**
 * Convenience validation functions
 */

// Chat message validation
export const validateChatMessage = (message: string): ValidationResult => {
  return inputValidator.validate(message, {
    maxLength: 4000,
    minLength: 1,
    required: true,
    allowHTML: false,
    allowSpecialChars: true,
    allowUnicode: true,
    allowURLs: true,
    allowEmails: false,
    trim: true,
    normalize: true,
  });
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  return inputValidator.validate(email, {
    maxLength: 254,
    required: true,
    allowHTML: false,
    allowSpecialChars: false,
    allowUnicode: false,
    allowURLs: false,
    allowEmails: true,
    customPattern: CONTENT_PATTERNS.email,
    trim: true,
    normalize: false,
  });
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  return inputValidator.validate(password, {
    maxLength: 128,
    minLength: 8,
    required: true,
    allowHTML: false,
    allowSpecialChars: true,
    allowUnicode: false,
    allowURLs: false,
    allowEmails: false,
    trim: false,
    normalize: false,
  });
};

// Username validation
export const validateUsername = (username: string): ValidationResult => {
  return inputValidator.validate(username, {
    maxLength: 50,
    minLength: 3,
    required: true,
    allowHTML: false,
    allowSpecialChars: false,
    allowUnicode: false,
    allowURLs: false,
    allowEmails: false,
    customPattern: /^[a-zA-Z0-9_-]+$/,
    trim: true,
    normalize: false,
  });
};

// Search query validation
export const validateSearchQuery = (query: string): ValidationResult => {
  return inputValidator.validate(query, {
    maxLength: 200,
    required: false,
    allowHTML: false,
    allowSpecialChars: true,
    allowUnicode: true,
    allowURLs: false,
    allowEmails: false,
    trim: true,
    normalize: true,
  });
};

// Settings value validation
export const validateSettingsValue = (value: string): ValidationResult => {
  return inputValidator.validate(value, {
    maxLength: 1000,
    required: false,
    allowHTML: false,
    allowSpecialChars: true,
    allowUnicode: true,
    allowURLs: true,
    allowEmails: true,
    trim: true,
    normalize: true,
  });
};

// Admin input validation (stricter)
export const validateAdminInput = (input: string): ValidationResult => {
  return inputValidator.validate(input, {
    maxLength: 500,
    required: true,
    allowHTML: false,
    allowSpecialChars: false,
    allowUnicode: false,
    allowURLs: false,
    allowEmails: false,
    trim: true,
    normalize: false,
  });
};

// Voice transcription validation
export const validateVoiceTranscription = (transcription: string): ValidationResult => {
  return inputValidator.validate(transcription, {
    maxLength: 8000,
    required: false,
    allowHTML: false,
    allowSpecialChars: true,
    allowUnicode: true,
    allowURLs: false,
    allowEmails: false,
    trim: true,
    normalize: true,
  });
};

// Generic validation with custom config
export const validateInput = (input: string, config?: ValidationConfig): ValidationResult => {
  return inputValidator.validate(input, config);
};

// Get security audit log
export const getSecurityAuditLog = () => {
  return inputValidator.getAuditLog();
};

// Clear security audit log
export const clearSecurityAuditLog = () => {
  inputValidator.clearAuditLog();
};

/**
 * Real-time input sanitization for forms
 */
export const sanitizeForDisplay = (input: string): string => {
  const result = inputValidator.validate(input, {
    allowHTML: false,
    allowSpecialChars: true,
    allowUnicode: true,
    trim: true,
    normalize: true,
  });
  return result.sanitizedValue;
};

/**
 * CSP-compliant input validation hook for React components
 */
export const useInputValidation = () => {
  return {
    validateChatMessage,
    validateEmail,
    validatePassword,
    validateUsername,
    validateSearchQuery,
    validateSettingsValue,
    validateAdminInput,
    validateVoiceTranscription,
    validateInput,
    sanitizeForDisplay,
    getSecurityAuditLog,
    clearSecurityAuditLog,
  };
};

export default inputValidator;