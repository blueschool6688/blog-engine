import "./api-CarSwpKW.js";
import "./ToastContext-DvpLY35a.js";
import "./LanguageContext-v-iKyRTm.js";
import "./ConfirmModal-BycBXeK5.js";
import "react";
import "react/jsx-runtime";
import "@hookform/resolvers/zod";
import * as zod from "zod";
import "@tiptap/starter-kit";
import "@tiptap/extension-image";
import "@tiptap/extension-link";
zod.object({
	title: zod.string().min(1, "Title is required").max(255, "Title is too long"),
	slug: zod.string().max(255, "Slug is too long").optional(),
	content: zod.string().optional(),
	status: zod.enum(["draft", "published"]),
	cover_media_id: zod.number().optional().nullable(),
	meta_title: zod.string().max(255, "Meta title is too long").optional().default(""),
	meta_desc: zod.string().optional().default(""),
	excerpt: zod.string().optional().default(""),
	is_featured: zod.boolean().optional().default(false),
	published_at: zod.string().optional().nullable().default("")
});
//#endregion
export {};
