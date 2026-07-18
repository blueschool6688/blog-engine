import "./api-CarSwpKW.js";
import "./ToastContext-DvpLY35a.js";
import "react";
import "react/jsx-runtime";
import "@hookform/resolvers/zod";
import * as z from "zod";
z.object({ email: z.string().min(1, "Email is required").email("Invalid email address") });
//#endregion
export {};
