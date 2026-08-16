import Link from "next/link";
import { notFound } from "next/navigation";
import FormularioPago from "@/components/FormularioPago";
import { obtenerCliente, obtenerPago } from "@/lib/consultas";
import { aInputDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EditarPago({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pago = await obtenerPago(Number(id));
  if (!pago) notFound();

  const cliente = await obtenerCliente(pago.cliente_id);
  if (!cliente) notFound();

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Link
        href={`/admin/clientes/${cliente.id}`}
        className="text-sm text-tenue underline underline-offset-4"
      >
        ← Volver a {cliente.nombre}
      </Link>

      <h1 className="text-xl font-bold">Editar pago</h1>

      <div className="tarjeta">
        <FormularioPago
          clienteId={cliente.id}
          ahora={aInputDateTime(new Date())}
          pago={{
            id: pago.id,
            nota: pago.nota,
            monto_centavos: pago.monto_centavos,
            fecha: aInputDateTime(pago.fecha),
          }}
        />
      </div>
    </div>
  );
}
