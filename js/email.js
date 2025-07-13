/**
 * Email functionality module for CTERA AWS Marketplace fulfillment page
 * Handles email validation and form validation
 */

window.Email = {
  
  /**
   * Validate email address format (matches Lambda function validation)
   */
  validateEmail(email) {
    if (!email || email.trim() === '') {
      return {
        isValid: false,
        message: 'Email address is required'
      };
    }
    
    // Lambda function email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
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
   * Validate DNS name format (matches Lambda function validation exactly)
   */
  validateDnsName(dnsName) {
    if (!dnsName || dnsName.trim() === '') {
      return {
        isValid: false,
        message: 'Portal name is required'
      };
    }
    
    const cleanDnsName = dnsName.trim();
    
    // Must be 3-50 characters (Lambda requirement)
    if (cleanDnsName.length < 3 || cleanDnsName.length > 50) {
      return {
        isValid: false,
        message: 'DNS name must be between 3 and 50 characters'
      };
    }
    
    // Must start and end with alphanumeric (Lambda requirement)
    if (!cleanDnsName[0].match(/[a-zA-Z0-9]/) || !cleanDnsName[cleanDnsName.length - 1].match(/[a-zA-Z0-9]/)) {
      return {
        isValid: false,
        message: 'DNS name must start and end with a letter or number'
      };
    }
    
    // Only lowercase letters, numbers, and hyphens (Lambda requirement)
    if (!cleanDnsName.match(/^[a-z0-9-]+$/)) {
      return {
        isValid: false,
        message: 'DNS name can only contain lowercase letters, numbers, and hyphens'
      };
    }
    
    // No consecutive hyphens (Lambda requirement)
    if (cleanDnsName.includes('--')) {
      return {
        isValid: false,
        message: 'DNS name cannot contain consecutive hyphens'
      };
    }
    
    // Reserved names check (Lambda requirement)
    const reservedNames = ['admin', 'api', 'www', 'mail', 'ftp', 'test', 'staging', 'prod', 'production', 'dev', 'development'];
    if (reservedNames.includes(cleanDnsName.toLowerCase())) {
      return {
        isValid: false,
        message: `'${cleanDnsName}' is a reserved name and cannot be used`
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