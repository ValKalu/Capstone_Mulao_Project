// Mualo-Frontend/config/api.js
export const NODE_BACKEND_URL = "http://127.0.0.1:5000";  // Node.js
export const FASTAPI_NEXT_ACTION = "http://127.0.0.1:8000/next_action";
export const FASTAPI_UPDATE = "http://127.0.0.1:8000/update";
export const FASTAPI_URL = process.env.FASTAPI_NEXT_ACTION || FASTAPI_NEXT_ACTION;
export const UPDATE_API = process.env.FASTAPI_UPDATE || FASTAPI_UPDATE; 

// Debug log
console.log('✅ API URLs loaded:', { NODE_BACKEND_URL, FASTAPI_URL });