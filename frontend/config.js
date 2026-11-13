/* ============ config.js ============
   The site WORKS WITHOUT the backend (it searches the NASA/ASF archive directly).
   The backend is optional: it adds LIVE ground-motion processing (interferogram) for the
   "Ground motion" type. Leave BACKEND_URL empty ("") to switch it off.

   SECURITY: everything in this file is public once the site is online.
   Do not rely on API_KEY as a secret: restrict the backend (CORS: only your site address,
   request limits, budget alert in Google Cloud) and rotate the key if it leaked. */
window.NISAR_CONFIG = {
  BACKEND_URL: "https://nisar-backend-330055874590.us-central1.run.app",
  API_KEY: "PUT_YOUR_NEW_KEY_HERE"
};
