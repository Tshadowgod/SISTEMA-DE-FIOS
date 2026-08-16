import Image from "next/image";
import Link from "next/link";
import { buscarPorCarnet, estadoDeCuenta } from "@/lib/consultas";
import { bs, carnetLegible, fechaHora, normalizarCarnet } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Inicio({
  searchParams,
}: {
  searchParams: Promise<{ carnet?: string }>;
}) {
  const { carnet: crudo } = await searchParams;
  const carnet = normalizarCarnet(crudo);
  const busco = carnet !== "";

  const cliente = busco ? await buscarPorCarnet(carnet) : null;
  const cuenta = cliente ? await estadoDeCuenta(cliente) : null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 py-8">
      <header className="text-center">
        <Image
          src="/logo.png"
          alt="Tienda Doña Goyita"
          width={277}
          height={358}
          priority
          className="mx-auto w-36 rounded-2xl border border-borde shadow-sm"
        />
        {/* El nombre ya está en el logo; lo repetimos solo para lectores de pantalla. */}
        <h1 className="sr-only">Tienda Doña Goyita</h1>
        <p className="mt-4 text-tenue">Consulta cuánto debes con tu número de carnet</p>
      </header>

      <form action="/" method="get" className="mt-7">
        <label htmlFor="carnet" className="etiqueta">
          Número de carnet
        </label>
        <div className="flex gap-2">
          <input
            id="carnet"
            name="carnet"
            defaultValue={crudo ?? ""}
            placeholder="Ej: 8765432 LP"
            autoComplete="off"
            inputMode="text"
            required
            className="campo"
          />
          <button type="submit" className="boton shrink-0 px-6">
            Buscar
          </button>
        </div>
      </form>

      {busco && !cuenta && (
        <div className="tarjeta mt-6 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 font-semibold">No encontramos el carnet {carnetLegible(carnet)}</p>
          <p className="mt-1 text-sm text-tenue">
            Revisa que esté bien escrito, o pregúntale a la casera para que te registre.
          </p>
        </div>
      )}

      {cuenta && (
        <section className="mt-6 space-y-4">
          <div className="tarjeta text-center">
            <p className="text-sm text-tenue">Cuenta de</p>
            <p className="text-xl font-bold">{cuenta.cliente.nombre}</p>
            <p className="text-sm text-tenue">CI {carnetLegible(cuenta.cliente.carnet)}</p>

            <hr className="my-4 border-borde" />

            <p className="text-sm text-tenue">
              {cuenta.deuda > 0 ? "Debes" : "Tu cuenta está"}
            </p>
            {cuenta.deuda > 0 ? (
              <p className="mt-1 text-4xl font-bold text-deuda">{bs(cuenta.deuda)}</p>
            ) : (
              <p className="mt-1 text-3xl font-bold text-pagado">
                Al día ✅
                {cuenta.deuda < 0 && (
                  <span className="mt-1 block text-base font-semibold text-tenue">
                    Tienes {bs(-cuenta.deuda)} a favor
                  </span>
                )}
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-crema px-3 py-2">
                <p className="text-tenue">Total fiado</p>
                <p className="font-bold">{bs(cuenta.total_fiado)}</p>
              </div>
              <div className="rounded-xl bg-crema px-3 py-2">
                <p className="text-tenue">Total pagado</p>
                <p className="font-bold">{bs(cuenta.total_pagado)}</p>
              </div>
            </div>
          </div>

          <div className="tarjeta">
            <h2 className="mb-3 font-bold">Movimientos</h2>
            {cuenta.movimientos.length === 0 ? (
              <p className="text-sm text-tenue">Todavía no hay movimientos registrados.</p>
            ) : (
              <ul className="divide-y divide-borde">
                {cuenta.movimientos.map((m) => (
                  <li key={`${m.tipo}-${m.id}`} className="flex items-start gap-3 py-3">
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                        m.tipo === "fiado"
                          ? "bg-red-50 text-deuda"
                          : "bg-green-50 text-pagado"
                      }`}
                    >
                      {m.tipo === "fiado" ? "🧾" : "💵"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
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
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-center text-xs text-tenue">
            ¿Ves algo raro en tu cuenta? Habla con la casera.
          </p>
        </section>
      )}

      <footer className="mt-auto pt-10 text-center">
        <Link href="/admin" className="text-sm text-tenue underline underline-offset-4">
          Entrar como casera
        </Link>
      </footer>
    </main>
  );
}
