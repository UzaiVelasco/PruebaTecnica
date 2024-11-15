import React, { useState, useEffect, createContext } from "react";
import { setToken, getToken, removeToken } from "./Token";
import axios from "axios";
import { BASE_API } from "../server/BASE_API";

export const AuthContext = createContext({
  auth: undefined,
  login: () => null,
  logout: () => null,
});

export function AuthProvider(props) {
  const { children } = props;
  const [auth, setAuth] = useState(undefined);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          await login(token);
        } catch (error) {
          setAuth(null);
        }
      } else {
        setAuth(null);
      }
    };

    initializeAuth();
    // eslint-disable-next-line
  }, []);

  const login = async (token) => {
    console.log("Token recibido en frontend:", token); // Agregar esto
    setToken(token);
    const me = await getMeApi(token);
    setAuth({ token, me });
  };

  async function getMeApi(token) {
    try {
      const url = `${BASE_API}/auth/me/`;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  const logout = () => {
    if (auth) {
      removeToken();
      setAuth(null);
    }
  };

  const valueContext = {
    auth,
    login,
    logout,
  };

  if (auth === undefined) {
    return null;
  }

  return (
    <AuthContext.Provider value={valueContext}>{children}</AuthContext.Provider>
  );
}
