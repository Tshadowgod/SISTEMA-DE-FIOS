import Link from "next/link";
import FormularioCliente from "@/components/FormularioCliente";

export const dynamic = "force-dynamic";

export default function NuevoCliente() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <Link href="/admin" className="text-sm text-tenue underline underline-offset-4">
        ← Volver
      </Link>

      <h1 className="text-xl font-bold">Nuevo cliente</h1>

      <div className="tarjeta">
        <FormularioCliente />
      </div>
    </div>
  );
}
