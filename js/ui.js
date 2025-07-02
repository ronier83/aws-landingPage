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
      completion: document.getElementById('completion-section'),
      noSubscription: document.getElementById('no-subscription-section')
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
      // Always show DNS selection form - let Lambda handle deduplication based on actual DynamoDB state
      this.showDnsSelectionSection(params, sections.dnsSelection);
    } else if (params.step === 'complete') {
      // Portal creation completed successfully - show completion page
      this.showCompletionSection(params, sections.completion);
    } else if (!params.awsToken && !params.customerId && !params.productCode) {
      // No valid AWS marketplace parameters - show guidance instead of misleading success
      this.showNoSubscriptionSection(sections.noSubscription, sections.completion);
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
   * Show warning for customers who already have portals (duplicate prevention)
   */
  showDuplicateCustomerWarning(params, section) {
    if (!section) return;
    
    console.log('UI: Showing duplicate customer warning for:', params.customerId);
    section.style.display = 'block';
    CteraApp.state.currentSection = 'duplicate-customer';
    
    // Modify section title and content using correct selectors
    const titleEl = section.querySelector('.loading-title');
    if (titleEl) {
      titleEl.innerHTML = '⚠️ Portal Already Exists';
      titleEl.style.color = '#F39200'; // Orange warning color
    }
    
    // Modify main message
    const messageEl = section.querySelector('.loading-message');
    if (messageEl) {
      const portalInfo = params.portal ? 
        `<br><strong>Portal URL:</strong> <a href="https://${params.portal}.use.azure.cterafs.com" target="_blank" style="color: #00B4E5;">${params.portal}.use.azure.cterafs.com</a>` : 
        '';
      
      messageEl.innerHTML = `
        A CTERA Portal has already been created for this AWS Marketplace subscription.<br>
        <strong>Customer ID ${params.customerId}</strong> already has an active portal.${portalInfo}
      `;
    }
    
    // Modify success message section
    const successMessageEl = section.querySelector('.success-message');
    if (successMessageEl) {
      const portalAccessInfo = params.portal ? 
        `<li><strong>Access your existing portal:</strong> <a href="https://${params.portal}.use.azure.cterafs.com" target="_blank" style="color: #00B4E5;">${params.portal}.use.azure.cterafs.com</a></li>` : 
        '';
      
      successMessageEl.innerHTML = `
        <div class="success-title" style="color: #F39200;">What Should You Do?</div>
        <div class="success-details">
          <ol>
            ${portalAccessInfo}
            <li><strong>Check your email</strong> for the original portal credentials</li>
            <li><strong>Search for "CTERA"</strong> in your email inbox and spam folder</li>
            <li><strong>Contact support</strong> if you can't find your portal access</li>
          </ol>
          <p style="margin-top: 15px; padding: 10px; background: rgba(243, 146, 0, 0.1); border-left: 3px solid #F39200; border-radius: 4px;">
            <strong>Important:</strong> Multiple portals cannot be created for the same AWS Marketplace subscription. 
            If you need additional portals, please contact CTERA support.
          </p>
        </div>
      `;
    }
    
    // Show customer info
    const customerInfoEl = document.getElementById('reg-customer-info');
    if (customerInfoEl) {
      customerInfoEl.style.display = 'block';
      populateCustomerInfo('reg', params);
    }
    
    // Set AWS token for support
    setAwsToken('reg-aws-token', params.awsToken);
    
    // Modify next steps section to show support information
    const nextStepsEl = section.querySelector('.next-steps');
    if (nextStepsEl) {
      const portalNameInfo = params.portal ? 
        `<li>Portal Name: <strong>${params.portal}</strong></li>` : 
        '';
      
      const emailBody = params.portal ? 
        `Hi CTERA Support,%0A%0AI need access to my existing CTERA portal.%0A%0ACustomer ID: ${params.customerId}%0AProduct Code: ${params.productCode}%0APortal Name: ${params.portal}%0APortal URL: ${params.portal}.use.azure.cterafs.com%0A%0APlease help me with login credentials.%0A%0AThank you!` :
        `Hi CTERA Support,%0A%0AI need access to my existing CTERA portal.%0A%0ACustomer ID: ${params.customerId}%0AProduct Code: ${params.productCode}%0A%0APlease send me the portal URL and help with login credentials.%0A%0AThank you!`;
      
      nextStepsEl.innerHTML = `
        <div class="next-steps-title">Need Your Portal Access?</div>
        <div class="next-steps-content">
          <p><strong>Contact CTERA Support with these details:</strong></p>
          <ul>
            <li>Customer ID: <strong>${params.customerId}</strong></li>
            <li>Product Code: <strong>${params.productCode}</strong></li>
            ${portalNameInfo}
            <li>Issue: "Need access to existing portal"</li>
          </ul>
          <p style="margin-top: 15px;">
            Email: <a href="mailto:support@ctera.com?subject=Portal Access Request - Customer ${params.customerId}&body=${emailBody}" style="color: #00B4E5;">support@ctera.com</a>
          </p>
          <p style="margin-top: 10px; font-size: 13px; color: rgba(255,255,255,0.7);">
            Our support team will help you access your existing portal.
          </p>
        </div>
      `;
    }
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
   * Show no subscription section when no valid AWS marketplace parameters are present
   */
  showNoSubscriptionSection(noSubscriptionSection, completionSection) {
    console.log('UI: No valid AWS marketplace parameters detected');
    
    if (noSubscriptionSection) {
      // Show dedicated no-subscription section if it exists
      noSubscriptionSection.style.display = 'block';
      CteraApp.state.currentSection = 'no-subscription';
    } else if (completionSection) {
      // Fallback: modify completion section to show appropriate message
      completionSection.style.display = 'block';
      CteraApp.state.currentSection = 'no-subscription-fallback';
      this.modifyCompletionForNoSubscription(completionSection);
    }
  },
  
  /**
   * Modify completion section content for no subscription case
   */
  modifyCompletionForNoSubscription(section) {
    const titleEl = section.querySelector('.loading-title');
    const messageEl = section.querySelector('.loading-message');
    const successMessageEl = section.querySelector('.success-message');
    const customerInfoEl = section.querySelector('#customer-info');
    const nextStepsEl = section.querySelector('.next-steps');
    
    if (titleEl) {
      titleEl.textContent = '🔗 CTERA File Services Platform';
      titleEl.style.color = '#F39200'; // Orange instead of blue
    }
    
    if (messageEl) {
      messageEl.innerHTML = 'To access CTERA File Services Platform, you need to subscribe through AWS Marketplace.<br>This page is designed for AWS Marketplace subscription fulfillment.';
    }
    
    if (successMessageEl) {
      successMessageEl.innerHTML = `
        <div class="success-title" style="color: #F39200;">🚀 Get Started with CTERA</div>
        <div class="success-details">
          <ol>
            <li><strong>Visit AWS Marketplace</strong> to browse CTERA offerings</li>
            <li><strong>Subscribe to CTERA File Services Platform</strong></li>
            <li><strong>Complete the subscription process</strong> - you'll be redirected back here</li>
            <li><strong>Set up your portal</strong> using the guided process</li>
          </ol>
          <p style="margin-top: 15px;">
            <a href="https://aws.amazon.com/marketplace/search/results?searchTerms=ctera" target="_blank" 
               style="color: #00B4E5; text-decoration: none; font-weight: 600;">
              → Browse CTERA on AWS Marketplace
            </a>
          </p>
        </div>
      `;
    }
    
    // Hide customer info section since there's no subscription
    if (customerInfoEl) {
      customerInfoEl.style.display = 'none';
    }
    
    // Update next steps section
    if (nextStepsEl) {
      nextStepsEl.innerHTML = `
        <div class="next-steps-title">Need Help?</div>
        <div class="next-steps-content">
          <p><strong>For questions about CTERA File Services Platform:</strong></p>
          <ul>
            <li>Email: <a href="mailto:support@ctera.com" style="color: #00B4E5;">support@ctera.com</a></li>
            <li>Visit: <a href="https://www.ctera.com/" target="_blank" style="color: #00B4E5;">CTERA.com</a></li>
            <li>Documentation: <a href="https://kb.ctera.com/" target="_blank" style="color: #00B4E5;">Knowledge Base</a></li>
          </ul>
          <p style="margin-top: 15px; font-size: 13px; color: rgba(255,255,255,0.7);">
            If you believe you should have access, please contact support with details about your AWS subscription.
          </p>
        </div>
      `;
    }
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
        
        // Populate customer info - completion section has NO prefix
        const customerIdEl = document.getElementById('customer-id');
        const productCodeEl = document.getElementById('product-code');
        
        if (customerIdEl && params.customerId) {
          customerIdEl.textContent = params.customerId;
        }
        
        if (productCodeEl && params.productCode) {
          productCodeEl.textContent = params.productCode;
        }
        
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