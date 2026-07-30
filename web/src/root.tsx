import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteLoaderData } from "react-router";
import type { MetaFunction } from "react-router";
import React from "react";
import "./index.css";
import { settingsService, getFullUrl } from "./services/api";
function parseCookies(cookieHeader: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const key = parts.shift()?.trim();
    if (key) {
      list[key] = decodeURIComponent(parts.join("="));
    }
  });
  return list;
}

export async function loader({ request }: { request: Request }) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = parseCookies(cookieHeader);
  const theme = cookies.theme === "light" ? "light" : "dark";
  const language = cookies.language === "en" ? "en" : "vi";

  let settings: Record<string, string> = {};
  try {
    const res = await settingsService.getPublic();
    if (res.success && res.data) {
      settings = res.data;
    }
  } catch (err) {
    console.error("Failed to load settings in root loader", err);
  }

  return { theme, language, settings };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const settings = data?.settings || {};
  return [
    { title: settings.site_name || "Blogs" },
    { name: "description", content: settings.site_description || "Nền tảng chia sẻ kiến thức" },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData("root") as { theme: string; language: string; settings?: Record<string, string> } | null;
  const theme = data?.theme || "dark";
  const language = data?.language || "vi";
  const settings = data?.settings || {};

  return (
    <html lang={language} className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
        {settings.logo_url && <link rel="icon" type="image/x-icon" href={getFullUrl(settings.logo_url)} />}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}