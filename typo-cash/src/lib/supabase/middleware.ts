import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: "", ...options });
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const protectedPaths = ["/dashboard", "/apply", "/loans", "/kyc", "/profile", "/disputes", "/history", "/notifications", "/help"];
    const adminPaths = ["/admin"];
    const authPaths = ["/login", "/register", "/verify"];
    const pathname = request.nextUrl.pathname;

    const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
    const isAdmin = adminPaths.some((p) => pathname.startsWith(p));
    const isAuth = authPaths.some((p) => pathname.startsWith(p));

    if (!user && (isProtected || isAdmin)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch {
    // Supabase not available — allow request to proceed
    // This enables local development without a running Supabase instance
  }

  return response;
}
