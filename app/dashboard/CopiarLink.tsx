"use client";

import { useState } from "react";

export function CopiarLink({ slug }: { slug: string }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = () => {
    navigator.clipboard.writeText(`${window.location.origin}/bolao/${slug}`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <button
      onClick={copiar}
      className={`shrink-0 text-xs font-bold px-2 py-1 rounded transition-all ${
        copiado ? "text-green-700" : "text-green-600 hover:text-green-700"
      }`}
    >
      {copiado ? "✅ Copiado!" : "📋 Copiar link"}
    </button>
  );
}
