//#region src/utils/cookie.ts
function setCookie(name, value, days = 365) {
	const date = /* @__PURE__ */ new Date();
	date.setTime(date.getTime() + days * 24 * 60 * 60 * 1e3);
	const expires = "; expires=" + date.toUTCString();
	document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}
//#endregion
export { setCookie as t };
