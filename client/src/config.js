// src/config.js
export const SERVER_URL = import.meta.env.VITE_SERVER_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:3000' : `${window.location.origin}`);

export const API_BASE_URL = `${SERVER_URL}/api`;
