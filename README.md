# Auth0 PAR Demo

A comprehensive demonstration application comparing OAuth 2.0 Authorization Code flow with Pushed Authorization Request (PAR) flow using Auth0.

Live Demo Site: https://par-demo-two.vercel.app/ 

## 🎯 Purpose

This demo application helps developers understand the differences between traditional OAuth 2.0 flows and the enhanced security provided by PAR (Pushed Authorization Request). It provides a side-by-side comparison showing how PAR improves security by moving authorization parameters from the front-channel to a secure back-channel.

## ✨ Features

- 🔐 **Dual Auth Flows**: Compare regular OAuth and PAR side-by-side
- 📁 **JSON Configuration**: Upload config files to quickly populate both flows
- 🍪 **Cookie Persistence**: Save configurations across browser sessions
- 🚀 **Full-Stack**: Frontend + Vercel serverless functions for CORS-free PAR requests

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
    "response_type": "code",
    "scope": "openid profile email",
    "audience": "your-api-audience",
    "domain": "your-domain.auth0.com",
    "prompt": "login"
  },
  "par": {
    "client_id": "your-par-client-id",
    "response_type": "code",
    "scope": "openid profile email",
    "audience": "your-api-audience",
    "domain": "your-domain.auth0.com",
    "prompt": "login",
    "client_secret": "your-par-client-secret"
  }
}
```

**Note**: The `state` parameter is automatically generated for security purposes. You can optionally include it in your configuration file if you need a specific state value, otherwise a random one will be generated for each request.

## 🏗️ Architecture

### Regular OAuth Flow
1. User configures OAuth parameters in the JSON editor
2. Application generates an authorization URL with parameters in the query string
3. User is redirected to Auth0 for authentication
4. Auth0 redirects back with an authorization code
5. Callback page displays the received parameters

### PAR Flow
1. User configures PAR parameters including client credentials
2. Application makes a POST request to Auth0's `/oauth/par` endpoint via proxy
3. Auth0 returns a `request_uri` for the authorization request
4. Application generates a short authorization URL using only `client_id` and `request_uri`
5. User is redirected to Auth0 for authentication
6. Same callback flow as regular OAuth

### Backend Proxy

The application includes Vercel serverless functions (`/api/par.js`) to:
- Proxy PAR requests to Auth0 to avoid CORS issues
- Handle the client secret securely on the backend
- Convert JSON requests to form-encoded data for Auth0

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── Home.tsx              # Main page layout
│   │   ├── AuthFlowCard.tsx      # Individual flow cards
│   │   ├── ConfigUploader.tsx    # JSON config upload/download
│   │   └── Callback.tsx          # OAuth callback handler
│   ├── utils/
│   │   ├── config.ts             # Environment configuration
│   │   └── cookies.ts            # Cookie persistence utilities
│   ├── App.tsx                   # Router setup
│   └── main.tsx                  # Application entry point
├── api/
│   └── par.js                    # Vercel serverless function for PAR proxy
├── vercel.json                   # Vercel deployment configuration
└── vite.config.ts               # Vite + Tailwind CSS v4 setup
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔒 Security Benefits of PAR

### Why Use PAR?

1. **Enhanced Security**: Authorization parameters are sent via secure back-channel instead of front-channel URLs
2. **Reduced URL Length**: Authorization URLs are short and clean, preventing URL length limitations
3. **OAuth 2.1 Ready**: Future-proof implementation aligned with OAuth 2.1 security best practices
4. **FAPI Compliance**: Required for Financial-grade API implementations
5. **Reduced Attack Surface**: Sensitive parameters never appear in browser history or server logs

### Security Considerations

⚠️ **Important Notes:**

1. **Client Secret Exposure**: This demo exposes client secrets for educational purposes. In production:
   - Keep client secrets on your backend server only
   - Use PKCE for public clients (SPAs, mobile apps)

2. **Token Exchange**: This demo shows the authorization code flow only. In production:
   - Exchange authorization codes for tokens on your backend server
   - Never handle access tokens in frontend JavaScript

3. **Public Applications**: PAR is designed for confidential clients with client credentials. Public applications should use PKCE instead.

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

3. **Configure environment variables** for production

## 🐛 Troubleshooting

### Common Issues

**PAR Request Failed:**
- Ensure your Auth0 tenant supports PAR
- Check that client credentials are correct
- Verify the domain format (should not include `https://`)
- Ensure the PAR application is a "Regular Web Application"

**CORS Errors:**
- Add your deployment URL to Auth0 allowed origins
- Ensure the callback URL is properly configured in both applications

**Build Errors:**
- Check that all JSX tags are properly closed
- Verify TypeScript types are correct
- Run `npm run build` locally to test

**Configuration Issues:**
- Use the download example button to get the correct JSON format
- Ensure both `regular` and `par` objects are present in your config
- Check that all required fields are filled

## 📚 Resources

- [Auth0 PAR Documentation](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow/authorization-code-flow-with-par)
- [PAR RFC 9126](https://tools.ietf.org/rfc/rfc9126.txt)
- [OAuth 2.1 Draft](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
- [Auth0 Application Types](https://auth0.com/docs/get-started/applications/application-types)
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
