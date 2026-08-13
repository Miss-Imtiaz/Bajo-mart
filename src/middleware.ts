export { default } from "next-auth/middleware";

// Any route matched here requires a logged-in session.
// Unauthenticated visits are redirected straight to /login before any page content loads.
export const config = {
  matcher: [
    "/",
    "/daily-entry/:path*",
    "/vendors/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
