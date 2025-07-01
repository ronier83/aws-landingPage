/**
 * Email functionality module for CTERA AWS Marketplace fulfillment page
 * Handles email validation and form validation
 */

window.Email = {
  
  /**
   * Validate email address format
   */
  validateEmail(email) {
    if (!email || email.trim() === '') {
      return {
        isValid: false,
        message: 'Email address is required'
      };
    }
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        message: 'Please enter a valid email address'
      };
    }
    
    return {
      isValid: true,
      message: 'Email address is valid'
    };
  },
  
  /**
   * Validate DNS name format
   */
  validateDnsName(dnsName) {
    if (!dnsName || dnsName.trim() === '') {
      return {
        isValid: false,
        message: 'Portal name is required'
      };
    }
    
    const cleanDnsName = dnsName.trim();
    
    // Check length requirements
    if (cleanDnsName.length < 3 || cleanDnsName.length > 20) {
      return {
        isValid: false,
        message: 'Portal name must be 3-20 characters'
      };
    }
    
    // Check valid characters (letters, numbers, hyphens only)
    const dnsRegex = /^[a-zA-Z0-9-]+$/;
    if (!dnsRegex.test(cleanDnsName)) {
      return {
        isValid: false,
        message: 'Portal name can only contain letters, numbers, and hyphens'
      };
    }
    
    // Check that it doesn't start or end with hyphen
    if (cleanDnsName.startsWith('-') || cleanDnsName.endsWith('-')) {
      return {
        isValid: false,
        message: 'Portal name cannot start or end with a hyphen'
      };
    }
    
    return {
      isValid: true,
      message: 'Portal name is valid'
    };
  },
  
  /**
   * Validate the complete form (email + DNS name)
   */
  validateForm(email, dnsName) {
    // Validate email first
    const emailValidation = this.validateEmail(email);
    if (!emailValidation.isValid) {
      return emailValidation;
    }
    
    // Then validate DNS name
    const dnsValidation = this.validateDnsName(dnsName);
    if (!dnsValidation.isValid) {
      return dnsValidation;
    }
    
    return {
      isValid: true,
      message: 'Form validation passed'
    };
  },
  
  /**
   * Sanitize email input
   */
  sanitizeEmail(email) {
    if (!email) return '';
    return email.trim().toLowerCase();
  },
  
  /**
   * Sanitize DNS name input
   */
  sanitizeDnsName(dnsName) {
    if (!dnsName) return '';
    return dnsName.trim().toLowerCase();
  },
  
  /**
   * Generate preview URL for DNS name
   */
  generatePreviewUrl(dnsName) {
    const sanitizedName = this.sanitizeDnsName(dnsName) || 'yourname';
    return `${sanitizedName}.use.azure.cterafs.com`;
  },
  
  /**
   * Validate email domain (optional enhanced validation)
   */
  validateEmailDomain(email) {
    if (!email) return { isValid: false, message: 'Email is required' };
    
    const domain = email.split('@')[1];
    if (!domain) return { isValid: false, message: 'Invalid email format' };
    
    // Check for common issues
    const commonIssues = [
      { pattern: /\.\.|^\.|\.$/, message: 'Invalid domain format' },
      { pattern: /[^a-zA-Z0-9.-]/, message: 'Domain contains invalid characters' }
    ];
    
    for (const issue of commonIssues) {
      if (issue.pattern.test(domain)) {
        return { isValid: false, message: issue.message };
      }
    }
    
    return { isValid: true, message: 'Domain is valid' };
  }
}; 