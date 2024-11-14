import { TOKEN } from "../utils/constants";

export function setToken(token) {
  localStorage.setItem(TOKEN, token);
}

export function getToken() {
  try {
    const token = localStorage.getItem(TOKEN);
    if (token) {
      return token;
    }
    throw new Error("Token not found in localStorage");
  } catch (error) {
    return null;
  }
}

export function removeToken() {
  localStorage.removeItem(TOKEN);
}
