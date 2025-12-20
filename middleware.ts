import createMiddleware from "next-intl/middleware";
import { routing } from "./routing";

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames, exclude api routes
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
