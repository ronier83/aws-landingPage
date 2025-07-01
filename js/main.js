/**
 * Main application logic for CTERA AWS Marketplace fulfillment page
 * Handles URL parameter parsing and application initialization
 */

// Global application state
window.CteraApp = {
  config: {
    apiEndpoint: 'https://5vrhjgx1a0.execute-api.us-east-1.amazonaws.com/prod/register'
  },
  state: {
    urlParams: null,
    currentSection: null
  }
};

/**
 * Parse URL parameters and extract relevant data
 */
function parseUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    awsToken: urlParams.get('x-amzn-marketplace-token') || urlParams.get('token'),
    customerId: urlParams.get('customer'),
    productCode: urlParams.get('product'),
    tenantName: urlParams.get('tenant'),
    step: urlParams.get('step'),
    error: urlParams.get('error'),
    errorMessage: urlParams.get('message')
  };
}

/**
 * Initialize application on DOM ready
 */
function initializeApp() {
  console.log('CTERA App: Initializing...');
  
  // Parse URL parameters
  CteraApp.state.urlParams = parseUrlParameters();
  
  // Initialize UI based on parameters
  UI.initializeSections(CteraApp.state.urlParams);
  
  // Set up event listeners
  setupEventListeners();
  
  console.log('CTERA App: Initialization complete');
}

/**
 * Set up global event listeners
 */
function setupEventListeners() {
  // Token display buttons for all sections
  setupTokenDisplayButtons();
}

/**
 * Set up token display functionality for all sections
 */
function setupTokenDisplayButtons() {
  // Registration complete section
  const regShowTokenBtn = document.getElementById('reg-show-token-btn');
  if (regShowTokenBtn) {
    regShowTokenBtn.addEventListener('click', function() {
      document.getElementById('reg-token-support-section').style.display = 'block';
      this.style.display = 'none';
    });
  }

  // DNS selection section
  const dnsShowTokenBtn = document.getElementById('dns-show-token-btn');
  if (dnsShowTokenBtn) {
    dnsShowTokenBtn.addEventListener('click', function() {
      document.getElementById('dns-token-support-section').style.display = 'block';
      this.style.display = 'none';
    });
  }

  // Completion section
  const showTokenBtn = document.getElementById('show-token-btn');
  if (showTokenBtn) {
    showTokenBtn.addEventListener('click', function() {
      document.getElementById('token-support-section').style.display = 'block';
      this.style.display = 'none';
    });
  }

  // Error section
  const errorShowDetailsBtn = document.getElementById('error-show-details-btn');
  if (errorShowDetailsBtn) {
    errorShowDetailsBtn.addEventListener('click', function() {
      document.getElementById('error-details-section').style.display = 'block';
      this.style.display = 'none';
    });
  }
}

/**
 * Utility function to populate customer information elements
 */
function populateCustomerInfo(prefix, params) {
  const customerIdEl = document.getElementById(`${prefix}-customer-id`);
  const productCodeEl = document.getElementById(`${prefix}-product-code`);
  
  if (customerIdEl && params.customerId) {
    customerIdEl.textContent = params.customerId;
  }
  
  if (productCodeEl && params.productCode) {
    productCodeEl.textContent = params.productCode;
  }
}

/**
 * Utility function to set AWS token in display elements
 */
function setAwsToken(elementId, token) {
  const tokenEl = document.getElementById(elementId);
  if (tokenEl) {
    tokenEl.textContent = token || 'Not provided';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp); 