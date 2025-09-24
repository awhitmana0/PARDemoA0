# Auth0 PAR Demo

> **⚠️ DISCLAIMER: EDUCATIONAL DEMO ONLY**
>
> This application is intended **SOLELY for demonstration and educational purposes** to help developers understand OAuth 2.0 and PAR (Pushed Authorization Request) flows with Auth0.
>
> **🚫 NOT FOR PRODUCTION USE**
>
> This demo contains educational shortcuts and simplified implementations that are **NOT suitable for production environments**. Key limitations include:
> - Client secrets are exposed in the frontend for demonstration purposes
> - Tokens are stored in localStorage instead of secure, httpOnly cookies
> - Simplified error handling and validation
> - Missing production-level security measures
>
> For production implementations, follow Auth0's official documentation and security best practices.

A comprehensive demonstration application comparing OAuth 2.0 Authorization Code flow with Pushed Authorization Request (PAR) flow using Auth0.

Live Demo Site: https://par-demo-two.vercel.app/

## 🎯 Purpose

This demo application helps developers understand the differences between traditional OAuth 2.0 flows and the enhanced security provided by PAR (Pushed Authorization Request). It provides a side-by-side comparison showing how PAR improves security by moving authorization parameters from the front-channel to a secure back-channel.

## ✨ Features

### 🔐 **Authentication Flows**
- **Manual OAuth Flow**: Standard authorization code flow with URL parameters
- **Manual PAR Flow**: Enhanced security with Pushed Authorization Requests
- **Real Token Exchange**: Direct integration with Auth0's `/oauth/token` endpoint
- **JWT Token Parsing**: Decode and display ID token claims with human-readable names

### 🎨 **Modern UI/UX**
- **Clean Navigation Menu**: Professional shadcn/ui dropdown navigation
- **Dialog-Based Configuration**: Edit OAuth parameters in a modern dialog interface
- **Responsive Design**: Mobile-friendly interface with modern styling
- **User Session Management**: Persistent authentication state with visual indicators

### 🔄 **Session Management**
- **Authentication Persistence**: Sessions cached in localStorage with expiration
- **Dedicated Authentication Page**: `/authenticated` route for viewing token details
- **Automatic Cleanup**: Clear cached tokens on new login attempts
- **Smart Flow Detection**: Automatically determine which OAuth configuration to use

### 📁 **Configuration Management**
- **JSON Configuration Upload**: Upload config files to populate both flows
- **Cookie Persistence**: Save configurations across browser sessions
- **Example Download**: Download sample configuration files
- **Visual Configuration Editor**: Edit parameters in a clean dialog interface

### 🚀 **Full-Stack Architecture**
- **Vercel Serverless Functions**: Backend proxy for CORS-free PAR requests
- **Direct Token Exchange**: Real token retrieval and JWT parsing
- **Modern Tech Stack**: React 19, TypeScript, Tailwind CSS v4, shadcn/ui

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Two Auth0 applications (one for regular OAuth, one for PAR)
- Auth0 tenant with PAR support

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd PARDemoA0
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser to `http://localhost:5173`**

## 🔧 Auth0 Setup

### Creating Auth0 Applications

You need **two separate Auth0 applications** for this demo:

#### 1. Regular OAuth Application
1. Go to your [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to Applications → Create Application
3. Choose **"Single Page Application"**
4. Configure the application:
   - **Allowed Callback URLs**: `http://localhost:5173/callback` (or your deployed URL)
   - **Allowed Web Origins**: `http://localhost:5173`
   - **Allowed Origins (CORS)**: `http://localhost:5173`

#### 2. PAR Application
1. Create another application
2. Choose **"Regular Web Application"** (required for client credentials)
3. Go to **Settings** → **Advanced Settings** → **Grant Types**
4. Enable **"Authorization Code"** and **"Client Credentials"**
5. In the main Settings tab, note down:
   - **Domain**
   - **Client ID**
   - **Client Secret** (keep this secure!)
6. Configure the same callback URLs as above

### Enabling PAR

1. In your Auth0 Dashboard, go to **Tenant Settings** → **Advanced**
2. Look for **"Pushed Authorization Requests"** and enable it
3. Configure PAR settings as needed for your tenant

### Configuration File Format

Create a JSON configuration file with both application details:

```json
{
  "regular": {
    "client_id": "your-regular-client-id",
    "audience": "your-api-audience",
    "domain": "your-domain.auth0.com",
    "prompt": "login"
  },
  "par": {
    "client_id": "your-par-client-id",
    "audience": "your-api-audience",
    "domain": "your-domain.auth0.com",
    "prompt": "login",
    "client_secret": "your-par-client-secret"
  }
}
```

**Default Values**: The following parameters are automatically set with sensible defaults but can be overridden in your configuration:

- `state`: Automatically prefixed with flow type (`regular_` or `par_`) + random string for security
- `response_type`: `"code"` (OAuth authorization code flow)
- `scope`: `"openid profile email"` (basic OpenID Connect scopes)

## 🏗️ Architecture

### Authentication Flow Overview

1. **Configuration**: Upload JSON config or use the dialog editor to set OAuth parameters
2. **Authorization URL Generation**: Different flows create different authorization URLs
3. **User Authentication**: Redirect to Auth0 for user login
4. **Token Exchange**: Exchange authorization code for real access and ID tokens
5. **Session Management**: Store authentication session with automatic expiration
6. **Token Display**: View decoded tokens and user information on `/authenticated` page

### Regular OAuth Flow
1. Generate authorization URL with parameters in query string
2. User redirects to Auth0 for authentication
3. Auth0 redirects back with authorization code
4. Exchange code for tokens using regular OAuth configuration
5. Parse and display real tokens and user information

### PAR Flow
1. POST authorization parameters to Auth0's `/oauth/par` endpoint via proxy
2. Receive `request_uri` for the authorization request
3. Generate short authorization URL using only `client_id` and `request_uri`
4. User redirects to Auth0 for authentication
5. Exchange code for tokens using PAR configuration
6. Parse and display real tokens and user information

### Backend Proxy

Vercel serverless functions (`/api/par.js` and `/api/token.js`) provide:
- **PAR Proxy**: Handle PAR requests to avoid CORS issues
- **Token Exchange**: Secure token exchange with proper error handling
- **Client Secret Security**: Keep credentials secure on the backend
- **CORS Management**: Proper cross-origin request handling

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── Home.tsx              # Main page with navigation menu
│   │   ├── AuthFlowCard.tsx      # Individual flow cards
│   │   ├── ConfigUploader.tsx    # JSON config upload/download
│   │   ├── Callback.tsx          # OAuth callback handler
│   │   ├── Authenticated.tsx     # Authentication details page
│   │   └── ui/                   # shadcn/ui components
│   │       ├── dialog.tsx        # Dialog component
│   │       ├── button.tsx        # Button component
│   │       └── navigation-menu.tsx # Navigation menu component
│   ├── utils/
│   │   ├── config.ts             # Environment configuration
│   │   ├── cookies.ts            # Cookie persistence utilities
│   │   ├── auth.ts               # Authentication session management
│   │   └── jwt.ts                # JWT decoding and formatting utilities
│   ├── lib/
│   │   └── utils.ts              # Utility functions for styling
│   ├── App.tsx                   # Router setup with authentication routes
│   └── main.tsx                  # Application entry point
├── api/
│   ├── par.js                    # Vercel serverless function for PAR proxy
│   └── token.js                  # Vercel serverless function for token exchange
├── components.json               # shadcn/ui configuration
├── vercel.json                   # Vercel deployment configuration
├── vite.config.ts               # Vite + Tailwind CSS v4 setup with path aliases
└── tsconfig.app.json            # TypeScript configuration with path mapping
```

## 🎨 User Interface Features

### Navigation Menu
- **User Menu**: When authenticated, shows user info with dropdown for viewing details and logout
- **Settings Menu**: Access to configuration management and documentation
- **Responsive Design**: Clean, professional navigation that works on all screen sizes
- **Right-Aligned Dropdowns**: Prevents overflow on smaller screens

### Authentication States
- **Unauthenticated**: Standard flow selection and configuration
- **Authenticated**: User info in navigation with quick access to token details
- **Session Persistence**: Authentication state maintained across page refreshes

### Configuration Management
- **Dialog Editor**: Modern dialog interface for editing OAuth parameters
- **Visual Feedback**: Clear indicators for saved configurations and authentication status
- **Error Handling**: Comprehensive error messages and validation

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production with TypeScript checking
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality
- `npm run vercel-build` - Vercel-specific build command

## 🔒 Security Benefits of PAR

### Why Use PAR?

1. **Enhanced Security**: Authorization parameters sent via secure back-channel instead of front-channel URLs
2. **Reduced URL Length**: Authorization URLs are short and clean, preventing URL length limitations
3. **OAuth 2.1 Ready**: Future-proof implementation aligned with OAuth 2.1 security best practices
4. **FAPI Compliance**: Required for Financial-grade API implementations
5. **Reduced Attack Surface**: Sensitive parameters never appear in browser history or server logs

### Security Implementations in This Demo

✅ **Secure Practices:**
- Flow type detection prevents credential cross-contamination
- State parameter always controlled by application (tamper-proof)
- Real token exchange with Auth0's official endpoints
- Proper error handling and validation
- Session expiration and cleanup

⚠️ **Educational Notes:**
- Client secrets shown for demonstration purposes only
- In production, handle all token exchange on backend servers
- PAR requires confidential clients; public applications should use PKCE
- Tokens stored in localStorage for demo - use httpOnly cookies in production

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Configure environment variables** in Vercel dashboard:
   ```
   VITE_BACKEND_URL=https://your-app.vercel.app
   ```
3. **Deploy** - Vercel will automatically detect the configuration

### Manual Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

3. **Ensure serverless functions are supported** for the full PAR experience

## 🐛 Troubleshooting

### Common Issues

**Authentication Flow Issues:**
- Ensure state parameter prefixes match expected format (`regular_` or `par_`)
- Check that correct OAuth configuration is being used for each flow
- Verify callback URLs are identical in both Auth0 applications

**PAR Request Failed:**
- Ensure your Auth0 tenant supports PAR
- Check that client credentials are correct
- Verify the domain format (should not include `https://`)
- Ensure the PAR application is a "Regular Web Application"

**Token Exchange Errors:**
- Verify authorization code is being passed correctly
- Check client credentials match the flow being used
- Ensure proper content-type headers in requests

**Session Management:**
- Check localStorage for cached sessions
- Verify expiration times are set correctly
- Clear localStorage if sessions appear corrupted

**Navigation Issues:**
- Ensure shadcn/ui components are properly installed
- Check path aliases are configured in TypeScript and Vite
- Verify navigation menu dropdowns are positioned correctly

## 📚 Resources

- [Auth0 PAR Documentation](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow/authorization-code-flow-with-par)
- [PAR RFC 9126](https://tools.ietf.org/rfc/rfc9126.txt)
- [OAuth 2.1 Draft](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
- [Auth0 Application Types](https://auth0.com/docs/get-started/applications/application-types)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ using React 19, TypeScript, Tailwind CSS v4, and shadcn/ui**