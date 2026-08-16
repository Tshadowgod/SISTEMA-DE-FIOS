import { sql, toInt } from "@/lib/db";

/* ----------------------------------- Tipos ---------------------------------- */

export type Cliente = {
  id: number;
  carnet: string;
  nombre: string;
  telefono: string | null;
  notas: string | null;
  creado_en: Date | string;
};

export type ClienteConDeuda = Cliente & {
  total_fiado: number;
  total_pagado: number;
  deuda: number;
  ultimo_movimiento: Date | string | null;
};

export type Fiado = {
  id: number;
  cliente_id: number;
  descripcion: string;
  monto_centavos: number;
  fecha: Date | string;
};

export type Pago = {
  id: number;
  cliente_id: number;
  nota: string | null;
  monto_centavos: number;
  fecha: Date | string;
};

export type Movimiento = {
  tipo: "fiado" | "pago";
  id: number;
  detalle: string;
  monto_centavos: number;
  fecha: Date | string;
};

export type EstadoDeCuenta = {
  cliente: Cliente;
  movimientos: Movimiento[];
  total_fiado: number;
  total_pagado: number;
  deuda: number;
};

/* --------------------------------- Clientes -------------------------------- */

export async function buscarPorCarnet(carnet: string): Promise<Cliente | null> {
  if (!carnet) return null;
  const filas = await sql<Cliente>`
    select id, carnet, nombre, telefono, notas, creado_en
    from clientes
    where carnet = ${carnet}
    limit 1
  `;
  return filas[0] ?? null;
}

export async function obtenerCliente(id: number): Promise<Cliente | null> {
  const filas = await sql<Cliente>`
    select id, carnet, nombre, telefono, notas, creado_en
    from clientes
    where id = ${id}
    limit 1
  `;
  return filas[0] ?? null;
}

/** Lista de clientes con su deuda calculada. `busqueda` filtra por nombre o carnet. */
export async function listarClientes(busqueda = ""): Promise<ClienteConDeuda[]> {
  const patron = `%${busqueda.trim().toLowerCase()}%`;
  const filas = await sql<Record<string, unknown>>`
    select
      c.id, c.carnet, c.nombre, c.telefono, c.notas, c.creado_en,
      coalesce(f.total, 0)                        as total_fiado,
      coalesce(p.total, 0)                        as total_pagado,
      coalesce(f.total, 0) - coalesce(p.total, 0) as deuda,
      greatest(f.ultima, p.ultima)                as ultimo_movimiento
    from clientes c
    left join (
      select cliente_id, sum(monto_centavos) as total, max(fecha) as ultima
      from fiados group by cliente_id
    ) f on f.cliente_id = c.id
    left join (
      select cliente_id, sum(monto_centavos) as total, max(fecha) as ultima
      from pagos group by cliente_id
    ) p on p.cliente_id = c.id
    where ${busqueda.trim()}::text = ''
       or lower(c.nombre) like ${patron}
       or lower(c.carnet) like ${patron}
    order by deuda desc, c.nombre asc
  `;

  return filas.map((f) => ({
    id: toInt(f.id),
    carnet: String(f.carnet),
    nombre: String(f.nombre),
    telefono: (f.telefono as string | null) ?? null,
    notas: (f.notas as string | null) ?? null,
    creado_en: f.creado_en as Date | string,
    total_fiado: toInt(f.total_fiado),
    total_pagado: toInt(f.total_pagado),
    deuda: toInt(f.deuda),
    ultimo_movimiento: (f.ultimo_movimiento as Date | string | null) ?? null,
  }));
}

export type Resumen = {
  clientes: number;
  con_deuda: number;
  deuda_total: number;
  fiado_hoy: number;
  cobrado_hoy: number;
};

export async function resumen(): Promise<Resumen> {
  const filas = await sql<Record<string, unknown>>`
    with saldos as (
      select
        c.id,
        coalesce((select sum(monto_centavos) from fiados where cliente_id = c.id), 0)
        - coalesce((select sum(monto_centavos) from pagos  where cliente_id = c.id), 0) as deuda
      from clientes c
    )
    select
      (select count(*) from clientes)                             as clientes,
      (select count(*) from saldos where deuda > 0)               as con_deuda,
      (select coalesce(sum(deuda), 0) from saldos where deuda > 0) as deuda_total,
      (select coalesce(sum(monto_centavos), 0) from fiados
        where fecha >= date_trunc('day', now() at time zone 'America/La_Paz')
                       at time zone 'America/La_Paz')             as fiado_hoy,
      (select coalesce(sum(monto_centavos), 0) from pagos
        where fecha >= date_trunc('day', now() at time zone 'America/La_Paz')
                       at time zone 'America/La_Paz')             as cobrado_hoy
  `;
  const f = filas[0] ?? {};
  return {
    clientes: toInt(f.clientes),
    con_deuda: toInt(f.con_deuda),
    deuda_total: toInt(f.deuda_total),
    fiado_hoy: toInt(f.fiado_hoy),
    cobrado_hoy: toInt(f.cobrado_hoy),
  };
}

/* ------------------------------ Estado de cuenta ---------------------------- */

export async function estadoDeCuenta(cliente: Cliente): Promise<EstadoDeCuenta> {
  const filas = await sql<Record<string, unknown>>`
    select 'fiado' as tipo, id, descripcion as detalle, monto_centavos, fecha
    from fiados where cliente_id = ${cliente.id}
    union all
    select 'pago' as tipo, id, coalesce(nota, '') as detalle, monto_centavos, fecha
    from pagos where cliente_id = ${cliente.id}
    order by fecha desc, id desc
  `;

  const movimientos: Movimiento[] = filas.map((f) => ({
    tipo: f.tipo as "fiado" | "pago",
    id: toInt(f.id),
    detalle: String(f.detalle ?? ""),
    monto_centavos: toInt(f.monto_centavos),
    fecha: f.fecha as Date | string,
  }));

  let total_fiado = 0;
  let total_pagado = 0;
  for (const m of movimientos) {
    if (m.tipo === "fiado") total_fiado += m.monto_centavos;
    else total_pagado += m.monto_centavos;
  }

  return {
    cliente,
    movimientos,
    total_fiado,
    total_pagado,
    deuda: total_fiado - total_pagado,
  };
}

export async function obtenerFiado(id: number): Promise<Fiado | null> {
  const filas = await sql<Fiado>`
    select id, cliente_id, descripcion, monto_centavos, fecha
    from fiados where id = ${id} limit 1
  `;
  return filas[0] ?? null;
}

export async function obtenerPago(id: number): Promise<Pago | null> {
  const filas = await sql<Pago>`
    select id, cliente_id, nota, monto_centavos, fecha
    from pagos where id = ${id} limit 1
  `;
  return filas[0] ?? null;
}
