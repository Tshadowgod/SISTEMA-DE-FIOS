import Link from "next/link";
import { notFound } from "next/navigation";
import { eliminarClienteAction } from "@/app/admin/acciones";
import BotonEliminar from "@/components/BotonEliminar";
import FormularioCliente from "@/components/FormularioCliente";
import { obtenerCliente } from "@/lib/consultas";

export const dynamic = "force-dynamic";

export default async function EditarCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await obtenerCliente(Number(id));
  if (!cliente) notFound();

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Link
        href={`/admin/clientes/${cliente.id}`}
        className="text-sm text-tenue underline underline-offset-4"
      >
        ← Volver a {cliente.nombre}
      </Link>

      <h1 className="text-xl font-bold">Editar cliente</h1>

      <div className="tarjeta">
        <FormularioCliente
          cliente={{
            id: cliente.id,
            carnet: cliente.carnet,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            notas: cliente.notas,
          }}
        />
      </div>

      <div className="tarjeta">
        <p className="text-sm font-semibold">Eliminar cliente</p>
        <p className="mt-1 mb-3 text-sm text-tenue">
          Se borra el cliente junto con todos sus fiados y pagos. No se puede deshacer.
        </p>
        <BotonEliminar
          action={eliminarClienteAction}
          campos={{ id: cliente.id }}
          etiqueta="Eliminar cliente"
          confirmacion="Sí, eliminar todo"
        />
      </div>
    </div>
  );
}
