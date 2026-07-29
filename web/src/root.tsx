import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteLoaderData } from "react-router";
import type { MetaFunction } from "react-router";
import React from "react";
import "./index.css";
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
  return { theme, language };
}

export const meta: MetaFunction = () => {
  return [
    { title: "BookData Store" },
    { name: "description", content: "Nền tảng chia sẻ kiến thức" },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData("root") as { theme: string; language: string } | null;
  const theme = data?.theme || "dark";
  const language = data?.language || "vi";

  return (
    <html lang={language} className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
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