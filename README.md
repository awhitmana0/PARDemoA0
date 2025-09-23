# Auth0 PAR Demo

A demonstration application comparing OAuth 2.0 Authorization Code flow with Pushed Authorization Request (PAR) flow.

## Features

- 🔐 **Dual Auth Flows**: Compare regular OAuth and PAR side-by-side
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 📁 **JSON Configuration**: Upload config files to quickly populate both flows
- 🍪 **Cookie Persistence**: Save configurations across browser sessions
- 🔄 **Copy to Clipboard**: Easy callback URL copying
- 🚀 **Full-Stack**: Frontend + backend proxy for CORS-free PAR requests

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- An Auth0 account and application

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Auth0 application details:
   ```env
   VITE_AUTH0_DOMAIN=your-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-client-id
   VITE_AUTH0_CLIENT_SECRET=your-client-secret
   VITE_AUTH0_AUDIENCE=your-api-audience
   VITE_CALLBACK_URL=http://localhost:5173/callback
   ```

3. **Configure your Auth0 application:**
   - Add `http://localhost:5173/callback` to your allowed callback URLs
   - Add `http://localhost:5173` to your allowed web origins
   - For PAR flow, ensure your application type supports client credentials

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser to `http://localhost:5173`**

## Auth0 Application Setup

### Creating an Auth0 Application

1. Go to your [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to Applications → Create Application
3. Choose "Single Page Application" for regular OAuth flow
4. For PAR flow support, you may need "Regular Web Application"

### Required Configuration

**Allowed Callback URLs:**
```
http://localhost:5173/callback
```

**Allowed Web Origins:**
```
http://localhost:5173
```

**Allowed Origins (CORS):**
```
http://localhost:5173
```

### PAR Flow Requirements

For the PAR (Pushed Authorization Request) flow:

1. Your Auth0 tenant must support PAR (available in newer Auth0 versions)
2. Use a "Regular Web Application" type for client secret support
3. Enable the "Client Credentials" grant type if using client authentication

## How It Works

### Regular OAuth Flow

1. User configures OAuth parameters in the JSON editor
2. Application generates an authorization URL
3. User is redirected to Auth0 for authentication
4. Auth0 redirects back with an authorization code
5. Callback page displays the received parameters

### PAR Flow

1. User configures PAR parameters including client credentials
2. Application makes a POST request to `/oauth/par` endpoint
3. Auth0 returns a `request_uri` for the authorization request
4. Application generates authorization URL using the `request_uri`
5. User is redirected to Auth0 for authentication
6. Same callback flow as regular OAuth

## Project Structure

```
src/
├── components/
│   ├── Home.tsx              # Main page with two-column layout
│   ├── OAuthFlowColumn.tsx    # Regular OAuth flow implementation
│   ├── PARFlowColumn.tsx      # PAR flow implementation
│   ├── ConfigurationBox.tsx   # Shared JSON configuration component
│   └── Callback.tsx          # OAuth callback handler
├── App.tsx                   # Router setup
└── main.tsx                  # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Development Notes

- This is a demo application for educational purposes
- Token exchange is mocked in the callback for security reasons
- In production, token exchange should happen on your backend server
- Client secrets should never be exposed in frontend applications

## Security Considerations

⚠️ **Important Security Notes:**

1. **Client Secret**: The client secret is exposed in this demo for educational purposes. In production:
   - Use the implicit flow or authorization code flow with PKCE for SPAs
   - Keep client secrets on your backend server only

2. **Token Exchange**: Real applications should exchange authorization codes for tokens on the backend server

3. **Environment Variables**: Never commit `.env` files with real credentials to version control

## Troubleshooting

### Common Issues

**PAR Request Failed:**
- Ensure your Auth0 tenant supports PAR
- Check that client credentials are correct
- Verify the domain format (should not include `https://`)

**CORS Errors:**
- Add your local development URL to Auth0 allowed origins
- Ensure the callback URL is properly configured

**Invalid JSON:**
- The JSON editor validates syntax in real-time
- Check for missing quotes, commas, or brackets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [PAR RFC 9126](https://tools.ietf.org/rfc/rfc9126.txt)
- [OAuth 2.1 Draft](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
