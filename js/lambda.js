/**
 * Lambda API module for CTERA AWS Marketplace fulfillment page
 * Handles AWS Lambda function calls for customer status check and portal provisioning
 */

window.Lambda = {
  
  /**
   * Check customer status via GET request
   */
  async checkCustomerStatus(options) {
    const { customerId, productCode, awsToken } = options;
    
    console.log('Lambda: Checking customer status...', { customerId, productCode });
    
    try {
      // Build URL with query parameters
      const url = new URL(CteraApp.config.apiEndpoint);
      url.searchParams.set('customer', customerId);
      url.searchParams.set('product', productCode);
      url.searchParams.set('token', awsToken);
      
      console.log('Lambda: Sending status check request:', url.toString());
      
      // Make GET request to check customer status
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Lambda: Received status response:', response.status);
      
      // Parse response
      const data = await response.json();
      console.log('Lambda: Status response data:', data);
      
      return {
        success: true,
        status: data.status,
        data: data
      };
      
    } catch (error) {
      console.error('Lambda: Status check error:', error);
      return {
        success: false,
        message: this.getErrorMessage(error),
        error: error
      };
    }
  },
  
  /**
   * Provision a new tenant via AWS Lambda
   */
  async provisionTenant(options) {
    const { dnsName, customerEmail, customerId, productCode, awsToken } = options;
    
    console.log('Lambda: Starting tenant provisioning...', { dnsName, customerEmail });
    
    // Update UI to show loading state
    UI.updateProvisionButton('loading', 'Creating Portal...');
    UI.showFormMessage('Provisioning your CTERA Portal...', 'loading');
    
    try {
      // Prepare request payload according to Lambda specs
      const payload = {
        action: 'provision',
        customer: customerId,
        product: productCode,
        dnsName: dnsName,
        email: customerEmail,
        token: awsToken  // Include the marketplace token for proper fulfillment
      };
      
      console.log('Lambda: Sending provision request:', payload);
      
      // Make API call to Lambda function
      const response = await fetch(CteraApp.config.apiEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.log('Lambda: Received response status:', response.status);
      
      // Parse response
      const data = await response.json();
      console.log('Lambda: Response data:', data);
      
      if (data.success) {
        // Success - show success message and redirect
        UI.showFormMessage('Portal created successfully! Redirecting...', 'success');
        UI.redirectToCompletion(dnsName, data.portalUrl);
      } else {
        // Error from Lambda function - handle specific error types
        const errorInfo = this.handleLambdaError(data, response);
        throw new Error(errorInfo.message);
      }
      
    } catch (error) {
      console.error('Lambda: Provisioning error:', error);
      
      // Show error message
      const errorMessage = this.getErrorMessage(error);
      UI.showFormMessage('Error creating portal: ' + errorMessage, 'error');
      
      // Reset button state
      UI.updateProvisionButton('enabled', 'Create My Portal');
    }
  },
  
  /**
   * Register a subscription (if needed for other flows)
   */
  async registerSubscription(options) {
    const { customerId, productCode, awsToken } = options;
    
    console.log('Lambda: Starting subscription registration...', { customerId, productCode });
    
    try {
      const payload = {
        action: 'register',
        customer: customerId,
        product: productCode,
        token: awsToken
      };
      
      console.log('Lambda: Sending registration request:', payload);
      
      const response = await fetch(CteraApp.config.apiEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('Lambda: Registration response:', data);
      
      return {
        success: data.success,
        message: data.message,
        data: data
      };
      
    } catch (error) {
      console.error('Lambda: Registration error:', error);
      return {
        success: false,
        message: this.getErrorMessage(error),
        error: error
      };
    }
  },
  
  /**
   * Get user-friendly error message from error object
   * Handles Lambda-specific error responses
   */
  getErrorMessage(error) {
    if (error.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Timeout errors
    if (error.name === 'AbortError') {
      return 'Request timed out. Please try again.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  },
  
  /**
   * Handle Lambda-specific error responses
   */
  handleLambdaError(data, response) {
    const errorTypes = {
      'Missing required provisioning parameters': 'MISSING_PARAMETERS',
      'Invalid email format': 'INVALID_EMAIL',
      'DNS name': 'INVALID_DNS_NAME',
      'already taken': 'DNS_NAME_TAKEN',
      'Invalid credentials': 'INVALID_CREDENTIALS',
      'already has an active portal': 'PORTAL_EXISTS',
      'reserved name': 'RESERVED_NAME'
    };
    
    let errorType = 'UNKNOWN_ERROR';
    const message = data.message || 'Unknown error occurred';
    
    // Determine error type from message
    for (const [keyword, type] of Object.entries(errorTypes)) {
      if (message.includes(keyword)) {
        errorType = type;
        break;
      }
    }
    
    return {
      type: errorType,
      message: message,
      httpStatus: response.status,
      isRetryable: ['NETWORK_ERROR', 'TIMEOUT', 'UNKNOWN_ERROR'].includes(errorType)
    };
  },
  
  /**
   * Check if API endpoint is reachable (health check)
   */
  async checkApiHealth() {
    try {
      const response = await fetch(CteraApp.config.apiEndpoint, {
        method: 'OPTIONS',
        headers: { 'Accept': 'application/json' }
      });
      
      return {
        isHealthy: response.ok,
        status: response.status
      };
    } catch (error) {
      console.warn('Lambda: API health check failed:', error);
      return {
        isHealthy: false,
        error: error.message
      };
    }
  },
  
  /**
   * Validate required parameters for provisioning
   */
  validateProvisioningParams(options) {
    const { dnsName, customerEmail, customerId, productCode, awsToken } = options;
    
    const errors = [];
    
    if (!dnsName) errors.push('DNS name is required');
    if (!customerEmail) errors.push('Customer email is required');
    if (!customerId) errors.push('Customer ID is required');
    if (!productCode) errors.push('Product code is required');
    if (!awsToken) errors.push('AWS marketplace token is required');
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}; 