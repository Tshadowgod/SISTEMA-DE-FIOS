"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

function Confirmar({ etiqueta }: { etiqueta: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-deuda px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
    >
      {pending ? "Borrando…" : etiqueta}
    </button>
  );
}

/**
 * Borrar en dos pasos: el primer clic pregunta, el segundo borra.
 * Asi no se pierde nada por un toque sin querer en el celular.
 */
export default function BotonEliminar({
  action,
  campos,
  etiqueta = "Eliminar",
  confirmacion = "Sí, borrar",
}: {
  action: (datos: FormData) => Promise<void>;
  campos: Record<string, string | number>;
  etiqueta?: string;
  confirmacion?: string;
}) {
  const [preguntando, setPreguntando] = useState(false);

  if (!preguntando) {
    return (
      <button
        type="button"
        onClick={() => setPreguntando(true)}
        className="rounded-lg px-3 py-1.5 text-sm font-semibold text-tenue hover:bg-red-50 hover:text-deuda"
      >
        {etiqueta}
      </button>
    );
  }

  return (
    <form action={action} className="flex items-center gap-2">
      {Object.entries(campos).map(([nombre, valor]) => (
        <input key={nombre} type="hidden" name={nombre} value={valor} />
      ))}
      <Confirmar etiqueta={confirmacion} />
      <button
        type="button"
        onClick={() => setPreguntando(false)}
        className="rounded-lg px-3 py-1.5 text-sm font-semibold text-tenue hover:bg-crema"
      >
        No
      </button>
    </form>
  );
}
