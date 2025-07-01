/**
 * UI Management module for CTERA AWS Marketplace fulfillment page
 * Handles section visibility, content population, and UI state
 */

window.UI = {
  
  /**
   * Initialize sections based on URL parameters
   */
  initializeSections(params) {
    console.log('UI: Initializing sections with params:', params);
    
    // Get all sections
    const sections = {
      registrationComplete: document.getElementById('registration-complete-section'),
      error: document.getElementById('error-section'),
      dnsSelection: document.getElementById('dns-selection-section'),
      completion: document.getElementById('completion-section')
    };
    
    // Hide all sections initially
    Object.values(sections).forEach(section => {
      if (section) section.style.display = 'none';
    });
    
    // Show appropriate section based on parameters
    if (params.error) {
      this.showErrorSection(params, sections.error);
    } else if (params.step === 'registration-complete') {
      this.showRegistrationCompleteSection(params, sections.registrationComplete);
    } else if (params.step === 'dns-selection') {
      this.showDnsSelectionSection(params, sections.dnsSelection);
    } else {
      this.showCompletionSection(params, sections.completion);
    }
  },
  
  /**
   * Show and configure error section
   */
  showErrorSection(params, section) {
    if (!section) return;
    
    console.log('UI: Showing error section');
    section.style.display = 'block';
    CteraApp.state.currentSection = 'error';
    
    // Set error message
    const errorMessageEl = document.getElementById('error-message');
    if (errorMessageEl && params.errorMessage) {
      errorMessageEl.textContent = decodeURIComponent(params.errorMessage);
    }
    
    // Set error details
    const errorDetailsEl = document.getElementById('error-details');
    if (errorDetailsEl) {
      errorDetailsEl.textContent = `Error: ${params.error}\nMessage: ${params.errorMessage || 'No additional details'}`;
    }
  },
  
  /**
   * Show and configure registration complete section
   */
  showRegistrationCompleteSection(params, section) {
    if (!section) return;
    
    console.log('UI: Showing registration complete section');
    section.style.display = 'block';
    CteraApp.state.currentSection = 'registration-complete';
    
    // Populate customer info if available
    if (params.customerId || params.productCode) {
      const customerInfoEl = document.getElementById('reg-customer-info');
      if (customerInfoEl) {
        customerInfoEl.style.display = 'block';
        populateCustomerInfo('reg', params);
      }
    }
    
    // Set AWS token
    setAwsToken('reg-aws-token', params.awsToken);
  },
  
  /**
   * Show and configure DNS selection section
   */
  showDnsSelectionSection(params, section) {
    if (!section) return;
    
    console.log('UI: Showing DNS selection section');
    section.style.display = 'block';
    CteraApp.state.currentSection = 'dns-selection';
    
    // Populate customer info if available
    if (params.customerId || params.productCode) {
      const customerInfoEl = document.getElementById('dns-customer-info');
      if (customerInfoEl) {
        customerInfoEl.style.display = 'block';
        populateCustomerInfo('dns', params);
      }
    }
    
    // Set AWS token
    setAwsToken('dns-aws-token', params.awsToken);
    
    // Initialize DNS form functionality
    this.initializeDnsForm(params);
  },
  
  /**
   * Show and configure completion section
   */
  showCompletionSection(params, section) {
    if (!section) return;
    
    console.log('UI: Showing completion section');
    section.style.display = 'block';
    CteraApp.state.currentSection = 'completion';
    
    // Set AWS token
    setAwsToken('aws-token', params.awsToken);
    
    // Show customer info if available
    if (params.customerId || params.productCode || params.tenantName) {
      const customerInfoEl = document.getElementById('customer-info');
      if (customerInfoEl) {
        customerInfoEl.style.display = 'block';
        
        // Populate customer info
        populateCustomerInfo('', params);
        
        // Set tenant name if available
        const tenantNameEl = document.getElementById('tenant-name');
        if (tenantNameEl && params.tenantName) {
          tenantNameEl.textContent = params.tenantName + '.use.azure.cterafs.com';
        }
      }
    }
  },
  
  /**
   * Initialize DNS form functionality
   */
  initializeDnsForm(params) {
    const dnsForm = document.getElementById('dns-form');
    const dnsNameInput = document.getElementById('dns-name');
    const previewUrl = document.getElementById('preview-url');
    
    if (!dnsForm || !dnsNameInput || !previewUrl) return;
    
    // Update preview URL as user types
    dnsNameInput.addEventListener('input', function() {
      const value = this.value || 'yourname';
      previewUrl.textContent = value + '.use.azure.cterafs.com';
    });
    
    // Handle form submission
    dnsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const dnsName = dnsNameInput.value.trim();
      const customerEmail = document.getElementById('customer-email').value.trim();
      
      // Validate using Email module
      const emailValidation = Email.validateForm(customerEmail, dnsName);
      
      if (!emailValidation.isValid) {
        UI.showFormMessage(emailValidation.message, 'error');
        return;
      }
      
      // Call provisioning via Lambda module
      Lambda.provisionTenant({
        dnsName: dnsName,
        customerEmail: customerEmail,
        customerId: params.customerId,
        productCode: params.productCode,
        awsToken: params.awsToken
      });
    });
  },
  
  /**
   * Show form message with appropriate styling
   */
  showFormMessage(message, type = 'info') {
    const formMessage = document.getElementById('dns-form-message');
    if (!formMessage) return;
    
    // Set color based on message type
    const colors = {
      error: '#ff6b6b',
      success: '#00CDAF',
      info: '#00B4E5',
      loading: '#00B4E5'
    };
    
    formMessage.style.color = colors[type] || colors.info;
    formMessage.textContent = message;
  },
  
  /**
   * Update provision button state
   */
  updateProvisionButton(state, text) {
    const provisionBtn = document.getElementById('provision-btn');
    if (!provisionBtn) return;
    
    if (state === 'loading') {
      provisionBtn.disabled = true;
      provisionBtn.textContent = text || 'Creating Portal...';
    } else if (state === 'enabled') {
      provisionBtn.disabled = false;
      provisionBtn.textContent = text || 'Create My Portal';
    } else if (state === 'disabled') {
      provisionBtn.disabled = true;
      provisionBtn.textContent = text || 'Create My Portal';
    }
  },
  
  /**
   * Redirect to completion page after successful provisioning
   */
  redirectToCompletion(tenantName) {
    const completionUrl = new URL(window.location.href);
    completionUrl.searchParams.set('step', 'complete');
    completionUrl.searchParams.set('tenant', tenantName);
    
    setTimeout(() => {
      window.location.href = completionUrl.toString();
    }, 2000);
  }
}; 