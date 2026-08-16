"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { crearPagoAction, actualizarPagoAction, type Estado } from "@/app/admin/acciones";
import { aInputDateTime, centavosAInput } from "@/lib/format";
import Aviso from "./Aviso";
import Guardar from "./Guardar";

/** `fecha` llega ya formateada por el servidor como "2026-08-16T15:42". */
type Valores = { id: number; nota: string | null; monto_centavos: number; fecha: string };

export default function FormularioPago({
  clienteId,
  deuda,
  pago,
  ahora,
}: {
  clienteId: number;
  /** Deuda actual, para el boton "pagar todo". */
  deuda?: number;
  /** Si viene, el formulario edita ese pago en vez de crear uno nuevo. */
  pago?: Valores;
  ahora: string;
}) {
  const editando = Boolean(pago);
  const [estado, accion] = useActionState<Estado, FormData>(
    editando ? actualizarPagoAction : crearPagoAction,
    {},
  );

  const formRef = useRef<HTMLFormElement>(null);
  const [fecha, setFecha] = useState(pago ? pago.fecha : ahora);
  const [monto, setMonto] = useState(pago ? centavosAInput(pago.monto_centavos) : "");

  useEffect(() => {
    if (!estado.ok || editando) return;
    formRef.current?.reset();
    setMonto("");
    setFecha(aInputDateTime(new Date()));
  }, [estado.ok, editando]);

  return (
    <form ref={formRef} action={accion} className="space-y-4">
      <input type="hidden" name="cliente_id" value={clienteId} />
      {pago && <input type="hidden" name="id" value={pago.id} />}

      <div>
        <label htmlFor="monto-pago" className="etiqueta">
          ¿Cuánto pagó? (Bs)
        </label>
        <div className="flex gap-2">
          <input
            id="monto-pago"
            name="monto"
            type="number"
            step="0.01"
            min="0.01"
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
            required
            className="campo text-lg font-semibold"
          />
          {!editando && deuda !== undefined && deuda > 0 && (
            <button
              type="button"
              onClick={() => setMonto(centavosAInput(deuda))}
              className="boton-suave shrink-0"
            >
              Todo
            </button>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="nota" className="etiqueta">
          Nota <span className="font-normal">(opcional)</span>
        </label>
        <input
          id="nota"
          name="nota"
          defaultValue={pago?.nota ?? ""}
          placeholder="Ej: pago a cuenta, dejó QR"
          autoComplete="off"
          className="campo"
        />
      </div>

      <div>
        <label htmlFor="fecha-pago" className="etiqueta">
          Día y hora del pago
        </label>
        <div className="flex gap-2">
          <input
            id="fecha-pago"
            name="fecha"
            type="datetime-local"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="campo"
          />
          <button
            type="button"
            onClick={() => setFecha(aInputDateTime(new Date()))}
            className="boton-suave shrink-0"
          >
            Ahora
          </button>
        </div>
      </div>

      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.ok && !editando && <Aviso tipo="ok">Pago registrado ✅</Aviso>}

      <Guardar>{editando ? "Guardar cambios" : "Registrar pago"}</Guardar>
    </form>
  );
}
