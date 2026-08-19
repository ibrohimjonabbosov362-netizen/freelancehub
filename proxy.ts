import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/proposals/:path*",
    "/projects/:path*",
    "/billing/:path*",
  ],
};
