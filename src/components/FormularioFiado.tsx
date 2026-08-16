"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { crearFiadoAction, actualizarFiadoAction, type Estado } from "@/app/admin/acciones";
import { aInputDateTime, centavosAInput } from "@/lib/format";
import Aviso from "./Aviso";
import Guardar from "./Guardar";

/** `fecha` llega ya formateada por el servidor como "2026-08-16T15:42". */
type Valores = { id: number; descripcion: string; monto_centavos: number; fecha: string };

export default function FormularioFiado({
  clienteId,
  fiado,
  ahora,
}: {
  clienteId: number;
  /** Si viene, el formulario edita esa venta en vez de crear una nueva. */
  fiado?: Valores;
  /** Fecha y hora actual de Bolivia, calculada en el servidor. */
  ahora: string;
}) {
  const editando = Boolean(fiado);
  const [estado, accion] = useActionState<Estado, FormData>(
    editando ? actualizarFiadoAction : crearFiadoAction,
    {},
  );

  const formRef = useRef<HTMLFormElement>(null);
  const [fecha, setFecha] = useState(fiado ? fiado.fecha : ahora);

  // Al registrar una venta nueva, dejamos el formulario listo para la siguiente.
  useEffect(() => {
    if (!estado.ok || editando) return;
    formRef.current?.reset();
    setFecha(aInputDateTime(new Date()));
  }, [estado.ok, editando]);

  return (
    <form ref={formRef} action={accion} className="space-y-4">
      <input type="hidden" name="cliente_id" value={clienteId} />
      {fiado && <input type="hidden" name="id" value={fiado.id} />}

      <div>
        <label htmlFor="descripcion" className="etiqueta">
          ¿Qué se llevó?
        </label>
        <input
          id="descripcion"
          name="descripcion"
          defaultValue={fiado?.descripcion ?? ""}
          placeholder="Ej: 2 panes, 1 leche, aceite"
          autoComplete="off"
          className="campo"
        />
      </div>

      <div>
        <label htmlFor="monto" className="etiqueta">
          Monto (Bs)
        </label>
        <input
          id="monto"
          name="monto"
          type="number"
          step="0.01"
          min="0.01"
          inputMode="decimal"
          defaultValue={fiado ? centavosAInput(fiado.monto_centavos) : ""}
          placeholder="0.00"
          required
          className="campo text-lg font-semibold"
        />
      </div>

      <div>
        {/* El atajo va junto a la etiqueta y no al lado del campo: así el campo
            usa todo el ancho y en celulares angostos no se corta el "a. m./p. m." */}
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <label htmlFor="fecha" className="etiqueta mb-0">
            Día y hora del fiado
          </label>
          <button
            type="button"
            onClick={() => setFecha(aInputDateTime(new Date()))}
            className="shrink-0 text-sm font-semibold text-marca underline underline-offset-2"
          >
            Poner ahora
          </button>
        </div>
        <input
          id="fecha"
          name="fecha"
          type="datetime-local"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          className="campo"
        />
        <p className="mt-1 text-xs text-tenue">
          Se pone la hora actual sola. Cámbiala si estás anotando algo de antes.
        </p>
      </div>

      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.ok && !editando && <Aviso tipo="ok">Venta registrada ✅</Aviso>}

      <Guardar>{editando ? "Guardar cambios" : "Anotar fiado"}</Guardar>
    </form>
  );
}
