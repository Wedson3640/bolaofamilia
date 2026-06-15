"use client";

import Link from "next/link";

/**
 * Botão "Criar agora" — navega para /login (rota dedicada com dark theme).
 * Aceita className e children para manter compatibilidade com os 3 usos em page.tsx.
 */
export function CriarAgoraButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href="/login" className={className}>
      {children}
    </Link>
  );
}
