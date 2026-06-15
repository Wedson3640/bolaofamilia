import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getSession() lê o JWT do cookie localmente — sem chamada de rede ao Supabase.
  // Evita falha de SSL em ambiente local e loop de redirect.
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const path = request.nextUrl.pathname;

  // Rotas protegidas — requer login
  if ((path.startsWith("/dashboard") || path === "/pagar") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Já logado — não exibe login novamente
  if (path === "/login" && user) {
    return NextResponse.redirect(new URL("/pagar", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/pagar", "/login"],
};
