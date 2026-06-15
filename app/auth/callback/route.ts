import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?erro=sem_codigo", origin));
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?erro=auth_failed", origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?erro=sem_usuario", origin));
  }

  // Verifica se já tem registro de pagamento
  const { data: registro } = await supabase
    .from("usuarios_bolao")
    .select("pago")
    .eq("user_id", user.id)
    .maybeSingle();

  if (registro?.pago) {
    return NextResponse.redirect(new URL("/dashboard", origin));
  }

  // Cria registro se for a primeira vez
  if (!registro) {
    await supabase.from("usuarios_bolao").insert({
      user_id: user.id,
      email: user.email ?? "",
      nome: user.user_metadata?.full_name ?? "",
      pago: false,
    });
  }

  return NextResponse.redirect(new URL("/pagar", origin));
}
