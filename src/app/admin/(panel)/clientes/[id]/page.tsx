import Link from "next/link";
import { notFound } from "next/navigation";
import { eliminarFiadoAction, eliminarPagoAction } from "@/app/admin/acciones";
import BotonEliminar from "@/components/BotonEliminar";
import FormularioFiado from "@/components/FormularioFiado";
import FormularioPago from "@/components/FormularioPago";
import { estadoDeCuenta, obtenerCliente } from "@/lib/consultas";
import { aInputDateTime, bs, carnetLegible, fechaHora } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DetalleCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await obtenerCliente(Number(id));
  if (!cliente) notFound();

  const cuenta = await estadoDeCuenta(cliente);
  const ahora = aInputDateTime(new Date());

  return (
    <div className="space-y-5">
      <Link href="/admin" className="text-sm text-tenue underline underline-offset-4">
        ← Todos los clientes
      </Link>

      <section className="tarjeta">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold">{cliente.nombre}</h1>
            <p className="text-sm text-tenue">CI {carnetLegible(cliente.carnet)}</p>
            {cliente.telefono && (
              <a
                href={`tel:${cliente.telefono}`}
                className="text-sm text-marca underline underline-offset-4"
              >
                {cliente.telefono}
              </a>
            )}
          </div>
          <Link href={`/admin/clientes/${cliente.id}/editar`} className="boton-suave text-sm">
            Editar
          </Link>
        </div>

        {cliente.notas && (
          <p className="mt-3 rounded-xl bg-crema px-3 py-2 text-sm text-tenue">{cliente.notas}</p>
        )}

        <div className="mt-4 rounded-xl bg-crema px-4 py-3 text-center">
          <p className="text-sm text-tenue">Debe</p>
          <p
            className={`text-3xl font-bold ${cuenta.deuda > 0 ? "text-deuda" : "text-pagado"}`}
          >
            {cuenta.deuda > 0 ? bs(cuenta.deuda) : "Al día"}
          </p>
          <p className="mt-1 text-xs text-tenue">
            Fiado {bs(cuenta.total_fiado)} · Pagado {bs(cuenta.total_pagado)}
            {cuenta.deuda < 0 && ` · ${bs(-cuenta.deuda)} a favor`}
          </p>
        </div>
      </section>

      <section className="tarjeta">
        <h2 className="mb-4 font-bold">🧾 Anotar fiado</h2>
        <FormularioFiado clienteId={cliente.id} ahora={ahora} />
      </section>

      <details className="tarjeta">
        <summary className="cursor-pointer font-bold marker:text-marca">💵 Registrar pago</summary>
        <div className="mt-4">
          <FormularioPago clienteId={cliente.id} deuda={cuenta.deuda} ahora={ahora} />
        </div>
      </details>

      <section>
        <h2 className="mb-3 font-bold">Historial ({cuenta.movimientos.length})</h2>

        {cuenta.movimientos.length === 0 ? (
          <p className="tarjeta text-sm text-tenue">
            Todavía no hay nada anotado para este cliente.
          </p>
        ) : (
          <ul className="space-y-2">
            {cuenta.movimientos.map((m) => (
              <li key={`${m.tipo}-${m.id}`} className="tarjeta">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                      m.tipo === "fiado" ? "bg-red-50" : "bg-green-50"
                    }`}
                  >
                    {m.tipo === "fiado" ? "🧾" : "💵"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium break-words">
                      {m.detalle || (m.tipo === "fiado" ? "Fiado" : "Pago")}
                    </p>
                    <p className="text-xs text-tenue">{fechaHora(m.fecha)}</p>
                  </div>
                  <span
                    className={`shrink-0 font-bold tabular-nums ${
                      m.tipo === "fiado" ? "text-deuda" : "text-pagado"
                    }`}
                  >
                    {m.tipo === "fiado" ? "+" : "−"}
                    {bs(m.monto_centavos)}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-end gap-1 border-t border-borde pt-2">
                  <Link
                    href={`/admin/${m.tipo === "fiado" ? "fiados" : "pagos"}/${m.id}/editar`}
                    className="rounded-lg px-3 py-1.5 text-sm font-semibold text-tenue hover:bg-marca-suave hover:text-marca"
                  >
                    Editar
                  </Link>
                  <BotonEliminar
                    action={m.tipo === "fiado" ? eliminarFiadoAction : eliminarPagoAction}
                    campos={{ id: m.id, cliente_id: cliente.id }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
