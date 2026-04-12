import { jwtDecode } from 'jwt-decode';

const STORAGE_KEY = 'token';

const JWTService = {

  saveTokenDetails(token) {
    if (typeof token === 'string') {
      localStorage.setItem(STORAGE_KEY, token);
    }
  },

  getTokenDetails() {
    return localStorage.getItem(STORAGE_KEY);
  },

  decodeTokenDetails() {
    const token = this.getTokenDetails();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (err) {
      console.error('Failed to decode JWT:', err);
      return null;
    }
  },

  clearTokenDetails() {
    localStorage.removeItem(STORAGE_KEY);
  },

  isTokenValid() {
    const decoded = this.decodeTokenDetails();
    if (!decoded || !decoded.exp) return false;

    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  }
};

export default JWTService;