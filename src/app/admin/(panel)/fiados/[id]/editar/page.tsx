import Link from "next/link";
import { notFound } from "next/navigation";
import FormularioFiado from "@/components/FormularioFiado";
import { obtenerCliente, obtenerFiado } from "@/lib/consultas";
import { aInputDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EditarFiado({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fiado = await obtenerFiado(Number(id));
  if (!fiado) notFound();

  const cliente = await obtenerCliente(fiado.cliente_id);
  if (!cliente) notFound();

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Link
        href={`/admin/clientes/${cliente.id}`}
        className="text-sm text-tenue underline underline-offset-4"
      >
        ← Volver a {cliente.nombre}
      </Link>

      <h1 className="text-xl font-bold">Editar fiado</h1>

      <div className="tarjeta">
        <FormularioFiado
          clienteId={cliente.id}
          ahora={aInputDateTime(new Date())}
          fiado={{
            id: fiado.id,
            descripcion: fiado.descripcion,
            monto_centavos: fiado.monto_centavos,
            fecha: aInputDateTime(fiado.fecha),
          }}
        />
      </div>
    </div>
  );
}
