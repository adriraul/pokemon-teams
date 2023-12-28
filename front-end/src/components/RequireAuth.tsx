import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/redux/hooks";
import { Outlet, useNavigate } from "react-router-dom";
import { logoutSuccess } from "../services/auth/authSlice";

const parseJwt = (token: string): any => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

const RequireAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [authFinished, setAuthFinished] = useState(false);

  const userToken = localStorage.getItem("userToken");
  const token = userToken ? userToken : null;

  const handleLogoutAndRedirect = useCallback(() => {
    dispatch(logoutSuccess());
    navigate("/login");
  }, [dispatch, navigate]);

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        const decodedJwt = parseJwt(token);
        if (decodedJwt.exp * 1000 < Date.now()) {
          console.log("Token ha expirado");
          localStorage.setItem("tokenExpired", "true");
          handleLogoutAndRedirect();
        }
      }
    };

    checkTokenExpiration();
    setAuthFinished(true);
  }, [token, handleLogoutAndRedirect]);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("No está autenticado");
      handleLogoutAndRedirect();
    }
  }, [isAuthenticated, handleLogoutAndRedirect]);

  return authFinished ? <Outlet /> : null;
};

export default RequireAuth;
