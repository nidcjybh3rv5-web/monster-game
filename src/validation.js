/**
 * 🔒 Input Validation & Sanitization Module
 * Provides secure input handling to prevent XSS and injection attacks
 */

const VALIDATION = {
  /**
   * Sanitize user input - remove potentially dangerous characters
   * @param {string} input - User input to sanitize
   * @param {number} maxLength - Maximum allowed length (default: 50)
   * @returns {string} Sanitized input
   */
  sanitizeText(input, maxLength = 50) {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>"/\\`]/g, '') // Remove dangerous HTML/JS chars
      .slice(0, maxLength)
      .replace(/\s+/g, ' '); // Normalize whitespace
  },

  /**
   * Validate guild name
   * @param {string} name - Guild name to validate
   * @returns {object} { valid: boolean, error: string }
   */
  validateGuildName(name) {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: '公會名稱不能為空' };
    }

    const sanitized = this.sanitizeText(name, 30);
    
    if (sanitized.length < 2) {
      return { valid: false, error: '公會名稱最少2個字符' };
    }

    if (sanitized.length > 30) {
      return { valid: false, error: '公會名稱最多30個字符' };
    }

    // Only allow alphanumeric, Chinese, and basic punctuation
    if (!/^[a-zA-Z0-9_\u4e00-\u9fff\-]+$/.test(sanitized)) {
      return { valid: false, error: '公會名稱包含非法字符' };
    }

    return { valid: true, error: null, value: sanitized };
  },

  /**
   * Validate player name
   * @param {string} name - Player name to validate
   * @returns {object} { valid: boolean, error: string }
   */
  validatePlayerName(name) {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: '玩家名稱不能為空' };
    }

    const sanitized = this.sanitizeText(name, 25);

    if (sanitized.length < 1) {
      return { valid: false, error: '玩家名稱不能為空' };
    }

    if (sanitized.length > 25) {
      return { valid: false, error: '玩家名稱最多25個字符' };
    }

    return { valid: true, error: null, value: sanitized };
  },

  /**
   * Validate gold amount
   * @param {number} amount - Gold amount to validate
   * @returns {object} { valid: boolean, error: string }
   */
  validateGoldAmount(amount) {
    if (typeof amount !== 'number' || amount < 0) {
      return { valid: false, error: '無效的金額' };
    }

    if (!Number.isInteger(amount)) {
      return { valid: false, error: '金額必須為整數' };
    }

    if (amount > 999999999) {
      return { valid: false, error: '金額超過最大限制' };
    }

    return { valid: true, error: null, value: amount };
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text safe for HTML
   */
  escapeHTML(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  },

  /**
   * Validate report content
   * @param {string} content - Report content
   * @returns {object} { valid: boolean, error: string }
   */
  validateReportContent(content) {
    if (!content || typeof content !== 'string') {
      return { valid: false, error: '回報內容不能為空' };
    }

    const sanitized = content.trim();

    if (sanitized.length < 10) {
      return { valid: false, error: '回報內容至少10個字符' };
    }

    if (sanitized.length > 1000) {
      return { valid: false, error: '回報內容最多1000個字符' };
    }

    return { valid: true, error: null, value: sanitized };
  }
};

export default VALIDATION;
