"use client";

import { useActionState } from "react";
import { actualizarClienteAction, crearClienteAction, type Estado } from "@/app/admin/acciones";
import Aviso from "./Aviso";
import Guardar from "./Guardar";

type Valores = {
  id: number;
  carnet: string;
  nombre: string;
  telefono: string | null;
  notas: string | null;
};

export default function FormularioCliente({ cliente }: { cliente?: Valores }) {
  const editando = Boolean(cliente);
  const [estado, accion] = useActionState<Estado, FormData>(
    editando ? actualizarClienteAction : crearClienteAction,
    {},
  );

  return (
    <form action={accion} className="space-y-4">
      {cliente && <input type="hidden" name="id" value={cliente.id} />}

      <div>
        <label htmlFor="nombre" className="etiqueta">
          Nombre del cliente
        </label>
        <input
          id="nombre"
          name="nombre"
          defaultValue={cliente?.nombre ?? ""}
          placeholder="Ej: María Quispe"
          autoComplete="off"
          required
          className="campo"
        />
      </div>

      <div>
        <label htmlFor="carnet-cliente" className="etiqueta">
          Número de carnet
        </label>
        <input
          id="carnet-cliente"
          name="carnet"
          defaultValue={cliente?.carnet ?? ""}
          placeholder="Ej: 8765432 LP"
          autoComplete="off"
          required
          className="campo"
        />
        <p className="mt-1 text-xs text-tenue">
          Con este número el cliente consulta su deuda. No importa si escribes espacios o guiones.
        </p>
      </div>

      <div>
        <label htmlFor="telefono" className="etiqueta">
          Teléfono <span className="font-normal">(opcional)</span>
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          inputMode="tel"
          defaultValue={cliente?.telefono ?? ""}
          placeholder="Ej: 71234567"
          autoComplete="off"
          className="campo"
        />
      </div>

      <div>
        <label htmlFor="notas" className="etiqueta">
          Notas <span className="font-normal">(opcional)</span>
        </label>
        <textarea
          id="notas"
          name="notas"
          defaultValue={cliente?.notas ?? ""}
          rows={2}
          placeholder="Ej: vive en la esquina, paga los viernes"
          className="campo resize-y"
        />
      </div>

      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.ok && editando && <Aviso tipo="ok">Datos guardados ✅</Aviso>}

      <Guardar>{editando ? "Guardar cambios" : "Registrar cliente"}</Guardar>
    </form>
  );
}
