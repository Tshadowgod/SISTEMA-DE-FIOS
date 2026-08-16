"use client";

import { useFormStatus } from "react-dom";

/** Boton de envio que se bloquea solo mientras se guarda (evita dobles registros). */
export default function Guardar({
  children,
  guardando = "Guardando…",
  className = "boton w-full",
}: {
  children: React.ReactNode;
  guardando?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? guardando : children}
    </button>
  );
}
