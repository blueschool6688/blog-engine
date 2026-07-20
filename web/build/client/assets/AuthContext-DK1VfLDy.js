import { t as api } from "./api-CItDfJrl.js";
import { useNavigate } from "react-router";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
//#region src/context/AuthContext.tsx
var AuthContext = createContext(null);
var AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();
	/**
	* On mount, try to restore session from localStorage.
	* Calls /auth/me with the stored token. If invalid, clears state.
	*/
	useEffect(() => {
		const restoreSession = async () => {
			const token = localStorage.getItem("access_token");
			if (!token) {
				setIsLoading(false);
				return;
			}
			try {
				const response = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
				setUser(response.data.data);
			} catch {
				localStorage.removeItem("access_token");
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};
		restoreSession();
	}, []);
	/**
	* Log in by POSTing credentials to /auth/login.
	* Stores the returned access_token and sets user state.
	*/
	const login = useCallback(async (email, password) => {
		const { access_token, user: loggedInUser } = (await api.post("/auth/login", {
			email,
			password
		})).data.data;
		localStorage.setItem("access_token", access_token);
		setUser(loggedInUser);
	}, []);
	/**
	* Log out: POST /auth/logout, clear token, reset user state, navigate to /login.
	*/
	const logout = useCallback(async () => {
		try {
			const token = localStorage.getItem("access_token");
			if (token) await api.post("/auth/logout", null, { headers: { Authorization: `Bearer ${token}` } });
		} catch {} finally {
			localStorage.removeItem("access_token");
			setUser(null);
			navigate("/login", { replace: true });
		}
	}, [navigate]);
	const updateUser = useCallback((updatedUser) => {
		setUser(updatedUser);
	}, []);
	const value = {
		user,
		isAuthenticated: user !== null,
		isLoading,
		login,
		logout,
		updateUser
	};
	return /* @__PURE__ */ jsx(AuthContext.Provider, {
		value,
		children
	});
};
var useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>. Make sure it wraps your router.");
	return ctx;
};
//#endregion
export { useAuth as n, AuthProvider as t };
