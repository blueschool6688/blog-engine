import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("layouts/RootLayout.tsx", [
    layout("layouts/PublicLayout.tsx", [
      index("pages/BlogHome.tsx"),
      route("posts/:slug", "pages/BlogPostDetail.tsx"),
      route("feedback", "pages/FeedbackNew.tsx"),
      route("authors", "pages/AuthorsList.tsx"),
      route("authors/:nickname", "pages/AuthorDetail.tsx"),
    ]),

    route("forgot-password", "pages/ForgotPassword.tsx"),
    route("reset-password", "pages/ResetPassword.tsx"),

    route("system/login", "pages/Login.tsx"),
    route("admin", "components/ProtectedRoute.tsx", [
      layout("layouts/AdminLayout.tsx", [
        index("pages/Dashboard.tsx"),
        route("feedbacks", "pages/FeedbacksAdmin.tsx"),
        route("media", "pages/MediaLibrary.tsx"),
        route("categories", "pages/Categories.tsx"),
        route("tags", "pages/Tags.tsx"),
        route("comments", "pages/CommentModeration.tsx"),
        route("settings", "pages/Settings.tsx"),
        route("users", "pages/Users.tsx"),
        route("audit-logs", "pages/AuditLog.tsx"),
        route("posts", "pages/PostList.tsx"),
        route("posts/new", "pages/PostEditor.tsx", { id: "post-new" }),
        route("posts/edit/:id", "pages/PostEditor.tsx", { id: "post-edit" }),
      ]),
    ]),
    route("*", "pages/NotFound.tsx"),
  ]),
] satisfies RouteConfig;