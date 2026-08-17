export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/",
    "/daily-entry/:path*",
    "/vendors/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
