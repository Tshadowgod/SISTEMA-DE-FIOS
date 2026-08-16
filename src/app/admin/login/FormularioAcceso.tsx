"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { accederAction, type Estado } from "@/app/admin/acciones";

function BotonEntrar() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="boton w-full">
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

export default function FormularioAcceso() {
  const [estado, accion] = useActionState<Estado, FormData>(accederAction, {});

  return (
    <form action={accion} className="space-y-4">
      <div>
        <label htmlFor="clave" className="etiqueta">
          Clave de la casera
        </label>
        <input
          id="clave"
          name="clave"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className="campo"
        />
      </div>

      {estado.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-deuda">
          {estado.error}
        </p>
      )}

      <BotonEntrar />
    </form>
  );
}
