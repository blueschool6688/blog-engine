import "./api-CarSwpKW.js";
import "./ToastContext-DvpLY35a.js";
import "react";
import "react/jsx-runtime";
import "@hookform/resolvers/zod";
import * as z from "zod";
z.object({
	password: z.string().min(6, "Password must be at least 6 characters"),
	confirmPassword: z.string().min(6, "Confirm password is required")
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"]
});
//#endregion
export {};
