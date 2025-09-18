# React Casino (Demo)

A small, modern React + Vite demo app showing a simple slot machine.

Getting started (PowerShell):

```powershell
cd "c:\Users\armin\vscode projects\turksod"
npm install
npm run dev
```

Notes:
- This is a demo project without real-money gambling features.
- To build for production: `npm run build` and `npm run preview` to test the build.
 
Backend server
 - The backend now defaults to port 5000. Start it from the `server` folder:

```powershell
cd "c:\Users\armin\vscode projects\turksod\server"
# optional: set a JWT secret for this session
$env:JWT_SECRET = "dev_secret"
npm start
```

Frontend environment
 - You can override the API URL by creating a `.env` file in the project root with `VITE_API_URL=http://localhost:5000` or another host.
 - An example is provided in `.env.example`.

Google Sign-In
- To enable Google Sign-In, create an OAuth client ID in Google Cloud Console (APIs & Services → Credentials).
- Add `http://localhost:5173` to Authorized JavaScript origins for the Web client ID.
- Copy the Web client ID into `.env` as `VITE_GOOGLE_CLIENT_ID=<your-client-id>` and restart the dev server.
- The app uses Google Identity Services and will POST the ID token to `/api/auth/google` on the backend which verifies it and issues the app JWT.
 - For the server-side Authorization Code flow (recommended for production), also set `GOOGLE_CLIENT_SECRET` in the server environment and add your redirect URI (e.g. `http://localhost:5175/oauth-callback`) in Google Console.
 - The app provides two flows:
	 - Client-side ID token flow: quick, handled by Google Identity Services button.
	 - Authorization Code flow: full consent flow. Use the "Sign in with Google (consent)" link in the Auth page; Google will redirect to `/oauth-callback` and the frontend will POST the code to the server which exchanges it for tokens and returns your app JWT.
