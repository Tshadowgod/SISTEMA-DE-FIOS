import Link from "next/link";
import { listarClientes, resumen } from "@/lib/consultas";
import { bs, carnetLegible, fechaHora } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Tablero({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [datos, clientes] = await Promise.all([resumen(), listarClientes(q)]);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3">
        <div className="tarjeta">
          <p className="text-sm text-tenue">Por cobrar</p>
          <p className="mt-1 text-2xl font-bold text-deuda">{bs(datos.deuda_total)}</p>
          <p className="mt-1 text-xs text-tenue">
            {datos.con_deuda} de {datos.clientes} clientes
          </p>
        </div>
        <div className="tarjeta">
          <p className="text-sm text-tenue">Hoy</p>
          <p className="mt-1 text-sm">
            Fiado <span className="font-bold text-deuda">{bs(datos.fiado_hoy)}</span>
          </p>
          <p className="text-sm">
            Cobrado <span className="font-bold text-pagado">{bs(datos.cobrado_hoy)}</span>
          </p>
        </div>
      </section>

      <form action="/admin" method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre o carnet…"
          autoComplete="off"
          className="campo"
        />
        <button type="submit" className="boton shrink-0 px-5">
          Buscar
        </button>
      </form>

      <section>
        <h2 className="mb-3 font-bold">
          Clientes {q && <span className="font-normal text-tenue">— resultados de “{q}”</span>}
        </h2>

        {clientes.length === 0 ? (
          <div className="tarjeta text-center">
            <p className="text-3xl">📒</p>
            <p className="mt-3 font-semibold">
              {q ? "Ningún cliente coincide con la búsqueda" : "Todavía no hay clientes"}
            </p>
            <Link href="/admin/clientes/nuevo" className="boton mt-4">
              Registrar cliente
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {clientes.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/admin/clientes/${c.id}`}
                  className="tarjeta flex items-center gap-3 transition hover:border-marca"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.nombre}</p>
                    <p className="text-xs text-tenue">
                      CI {carnetLegible(c.carnet)}
                      {c.ultimo_movimiento && ` · último: ${fechaHora(c.ultimo_movimiento)}`}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-bold tabular-nums ${
                      c.deuda > 0 ? "text-deuda" : "text-pagado"
                    }`}
                  >
                    {c.deuda > 0 ? bs(c.deuda) : "Al día"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
