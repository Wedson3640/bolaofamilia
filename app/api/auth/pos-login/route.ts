import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const { data: registros, error: selectError } = await admin
    .from("usuarios_bolao")
    .select("pago")
    .eq("user_id", user.id)
    .order("pago", { ascending: false })
    .limit(1);

  if (selectError) {
    console.error("[pos-login] SELECT usuarios_bolao:", selectError);
    return NextResponse.json({ error: "Erro ao verificar cadastro" }, { status: 500 });
  }

  const registro = registros?.[0];

  if (!registro) {
    const { error: insertError } = await admin.from("usuarios_bolao").insert({
      user_id: user.id,
      email: user.email ?? "",
      nome: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
      pago: false,
    });

    if (insertError) {
      console.error("[pos-login] INSERT usuarios_bolao:", insertError);
      return NextResponse.json({ error: "Erro ao criar cadastro" }, { status: 500 });
    }

    return NextResponse.json({ redirectTo: "/checkout" });
  }

  return NextResponse.json({
    redirectTo: registro.pago ? "/dashboard" : "/checkout",
  });
}
