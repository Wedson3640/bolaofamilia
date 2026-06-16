"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeletarBolao({ id, titulo }: { id: string; titulo: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const router = useRouter();

  const confirmar = async () => {
    setDeletando(true);
    try {
      const res = await fetch("/api/bolao/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Erro ao excluir. Tente novamente.");
        setDeletando(false);
        setConfirmando(false);
      }
    } catch {
      alert("Erro ao excluir. Tente novamente.");
      setDeletando(false);
      setConfirmando(false);
    }
  };

  if (confirmando) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-red-600 font-bold">Excluir &quot;{titulo}&quot;?</span>
        <button
          onClick={confirmar}
          disabled={deletando}
          className="text-xs font-bold px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all disabled:opacity-50"
        >
          {deletando ? "Excluindo…" : "Confirmar"}
        </button>
        <button
          onClick={() => setConfirmando(false)}
          disabled={deletando}
          className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirmando(true)}
      className="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
      title="Excluir bolão"
    >
      {/* Ícone lixeira */}
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}
