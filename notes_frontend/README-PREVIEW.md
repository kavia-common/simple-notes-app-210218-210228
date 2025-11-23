# Preview Environment Configuration

This project uses Create React App (react-scripts). In certain preview environments, accessing the dev server via a non-localhost host can trigger the Webpack Dev Server host check and show:

  Invalid Host header

To resolve this only for development, we include a `.env.development.local` with:

- DANGEROUSLY_DISABLE_HOST_CHECK=true
- HOST=0.0.0.0

This allows the preview host to connect while keeping production builds unaffected.

Notes:
- Local development on http://localhost:3000 continues to work.
- If your preview requires specific websocket settings, set WDS_SOCKET_PORT accordingly (e.g., 3000).
- The .env.development.local is ignored by production builds and should not be used to configure production.
