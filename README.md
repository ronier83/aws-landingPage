# CTERA AWS Marketplace Landing Page

This is the customer fulfillment landing page for CTERA's File Services Platform AWS Marketplace subscription. The page handles the complete customer onboarding flow from AWS Marketplace to CTERA portal provisioning.

## 📁 Project Structure

```
aws-landingPage/
├── index.html              # Main HTML structure
├── css/
│   └── styles.css          # All CSS styles and animations
├── js/
│   ├── main.js             # Main application logic and URL parsing
│   ├── ui.js               # UI state management and section control
│   ├── email.js            # Email validation and form validation
│   └── lambda.js           # AWS Lambda API calls and provisioning
├── assets/
│   ├── README.md           # Instructions for adding logo and favicon
│   ├── logo.png            # CTERA logo (to be added)
│   └── favicon.png         # Site favicon (to be added)
└── README.md               # This file
```

## 🚀 Deployment

This project is designed to work with **GitHub Pages** and serves static files only.

### Quick Deploy to GitHub Pages

1. Push all files to your GitHub repository
2. Go to repository Settings → Pages
3. Select source: Deploy from a branch
4. Choose `main` branch and `/ (root)` folder
5. Save and wait for deployment

## 🔧 Development Setup

### Prerequisites
- Web browser (for testing)
- Text editor or IDE
- Local web server (optional, for development)

### Local Development
```bash
# Clone the repository
git clone <your-repo-url>
cd aws-landingPage

# Option 1: Use Python's built-in server (if you have Python)
python -m http.server 8000

# Option 2: Use Node.js serve (if you have Node.js)
npx serve .

# Option 3: Open index.html directly in browser (limited functionality)
```

Visit `http://localhost:8000` to test locally.

## 📝 File Descriptions

### `index.html`
- **Purpose**: Main HTML structure containing all UI sections
- **Dependencies**: All CSS and JavaScript modules
- **Key sections**: Registration complete, DNS selection, completion, error handling

### `css/styles.css`
- **Purpose**: All styling including responsive design, animations, and theming
- **Features**: CTERA branding colors, loading animations, form styling
- **Responsive**: Mobile-friendly design with flexbox and grid layouts

### `js/main.js`
- **Purpose**: Application initialization and URL parameter handling
- **Key functions**: 
  - `parseUrlParameters()` - Extract AWS marketplace tokens and parameters
  - `initializeApp()` - Main application startup
  - Token display management

### `js/ui.js`
- **Purpose**: UI state management and section visibility control
- **Key functions**:
  - `initializeSections()` - Show appropriate section based on URL parameters
  - `showFormMessage()` - Display form feedback messages
  - `updateProvisionButton()` - Manage button states during provisioning

### `js/email.js`
- **Purpose**: Email and form validation logic
- **Key functions**:
  - `validateEmail()` - Email format validation
  - `validateDnsName()` - DNS name format and requirements validation
  - `validateForm()` - Complete form validation

### `js/lambda.js`
- **Purpose**: AWS Lambda API integration for tenant provisioning
- **Key functions**:
  - `provisionTenant()` - Main provisioning API call
  - `registerSubscription()` - Subscription registration (if needed)
  - Error handling and user feedback

## 🔗 API Integration

The landing page integrates with AWS Lambda function:
- **Endpoint**: `https://5vrhjgx1a0.execute-api.us-east-1.amazonaws.com/prod/register`
- **Purpose**: Handle tenant provisioning and AWS Marketplace fulfillment
- **Actions**: `provision`, `register`

### Request Format
```json
{
  "action": "provision",
  "customer": "customer-id",
  "product": "product-code", 
  "dnsName": "chosen-subdomain",
  "email": "customer@email.com",
  "token": "aws-marketplace-token"
}
```

## 🎯 Customer Journey Flow

1. **AWS Marketplace Subscription**: Customer subscribes via AWS Marketplace
2. **Redirect to Landing Page**: AWS redirects with marketplace token and parameters
3. **Section Selection**: Page shows appropriate section based on URL parameters:
   - `?step=registration-complete` - Registration confirmation
   - `?step=dns-selection` - Portal setup form
   - `?error=...` - Error handling
   - Default - Completion/success page
4. **Portal Provisioning**: Customer fills form, Lambda creates CTERA tenant
5. **Email Delivery**: Customer receives portal credentials via email

## 🎨 Customization

### Colors and Branding
Primary colors are defined in `css/styles.css`:
- **Primary Blue**: `#00B4E5`
- **Secondary Green**: `#00CDAF`
- **Orange Accent**: `#F39200`
- **Dark Background**: `#0f2342`

### Fonts
- **Primary Font**: Montserrat (Google Fonts)
- **Fallback**: Arial, sans-serif

## 📱 Responsive Design

The page is fully responsive with:
- Mobile-first design approach
- Flexible grid layouts
- Scalable typography
- Touch-friendly buttons and forms

## 🔒 Security Considerations

- **No sensitive data storage**: All tokens are processed client-side temporarily
- **HTTPS required**: Ensure deployment uses HTTPS for security
- **Input validation**: All form inputs are validated both client and server-side
- **Error handling**: User-friendly error messages without exposing system details

## 🚀 Adding Assets

1. **Logo**: Download from current URL and save as `assets/logo.png`
2. **Favicon**: Create or obtain favicon and save as `assets/favicon.png`
3. **Update HTML**: Change image src from external URL to local path

See `assets/README.md` for detailed instructions.

## 🧪 Testing

### URL Parameters for Testing

Test different customer journeys by appending URL parameters:

```bash
# Registration complete
?step=registration-complete&customer=123&product=abc&token=test-token

# DNS selection  
?step=dns-selection&customer=123&product=abc&token=test-token

# Error state
?error=subscription_failed&message=Test%20error%20message

# Completion (default)
?customer=123&product=abc&tenant=mycompany&token=test-token
```

### Browser Testing
- Test in Chrome, Firefox, Safari, Edge
- Test on mobile devices and tablets
- Verify all form validations work
- Check responsive design at different screen sizes

## 📞 Support

For technical support or questions:
- **Email**: support@ctera.com
- **Documentation**: [CTERA Knowledge Base](https://kb.ctera.com/)
- **Contact**: [CTERA Contact Page](https://www.ctera.com/company/contact/)

## 📄 License

© 2025 CTERA Networks Ltd. All Rights Reserved

See [CTERA EULA](https://www.ctera.com/eula/) for terms and conditions. 