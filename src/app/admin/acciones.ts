"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cerrarSesion, claveCorrecta, haySesion, iniciarSesion } from "@/lib/auth";
import { sql } from "@/lib/db";
import { aCentavos, desdeInputDateTime, normalizarCarnet } from "@/lib/format";

/** `ok` cambia en cada guardado exitoso; los formularios lo usan para limpiarse. */
export type Estado = { error?: string; ok?: string };

function exito(): Estado {
  return { ok: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
}

/** Toda accion del panel pasa por aca: sin sesion no se toca la base. */
async function exigirSesion(): Promise<void> {
  if (!(await haySesion())) redirect("/admin/login");
}

function texto(valor: FormDataEntryValue | null, max = 200): string {
  return typeof valor === "string" ? valor.trim().slice(0, max) : "";
}

function entero(valor: FormDataEntryValue | null): number {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

function refrescar(clienteId?: number): void {
  revalidatePath("/admin");
  revalidatePath("/");
  if (clienteId) revalidatePath(`/admin/clientes/${clienteId}`);
}

/* ----------------------------------- Sesion --------------------------------- */

export async function accederAction(_estado: Estado, datos: FormData): Promise<Estado> {
  const clave = texto(datos.get("clave"), 200);
  if (!clave) return { error: "Escribe la clave." };

  let ok = false;
  try {
    ok = claveCorrecta(clave);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error de configuración." };
  }
  if (!ok) return { error: "Clave incorrecta." };

  await iniciarSesion();
  redirect("/admin");
}

export async function salirAction(): Promise<void> {
  await cerrarSesion();
  redirect("/");
}

/* ---------------------------------- Clientes -------------------------------- */

export async function crearClienteAction(_estado: Estado, datos: FormData): Promise<Estado> {
  await exigirSesion();

  const carnet = normalizarCarnet(datos.get("carnet"));
  const nombre = texto(datos.get("nombre"), 120);
  const telefono = texto(datos.get("telefono"), 30) || null;
  const notas = texto(datos.get("notas"), 500) || null;

  if (carnet.length < 4) return { error: "El carnet debe tener al menos 4 caracteres." };
  if (!nombre) return { error: "Escribe el nombre del cliente." };

  const repetido = await sql<{ id: number }>`select id from clientes where carnet = ${carnet}`;
  if (repetido.length > 0) {
    return { error: `Ya existe un cliente con el carnet ${carnet}.` };
  }

  const filas = await sql<{ id: number }>`
    insert into clientes (carnet, nombre, telefono, notas)
    values (${carnet}, ${nombre}, ${telefono}, ${notas})
    returning id
  `;

  refrescar();
  redirect(`/admin/clientes/${filas[0].id}`);
}

export async function actualizarClienteAction(_estado: Estado, datos: FormData): Promise<Estado> {
  await exigirSesion();

  const id = entero(datos.get("id"));
  const carnet = normalizarCarnet(datos.get("carnet"));
  const nombre = texto(datos.get("nombre"), 120);
  const telefono = texto(datos.get("telefono"), 30) || null;
  const notas = texto(datos.get("notas"), 500) || null;

  if (!id) return { error: "Cliente no válido." };
  if (carnet.length < 4) return { error: "El carnet debe tener al menos 4 caracteres." };
  if (!nombre) return { error: "Escribe el nombre del cliente." };

  const repetido = await sql<{ id: number }>`
    select id from clientes where carnet = ${carnet} and id <> ${id}
  `;
  if (repetido.length > 0) {
    return { error: `Otro cliente ya usa el carnet ${carnet}.` };
  }

  await sql`
    update clientes
    set carnet = ${carnet}, nombre = ${nombre}, telefono = ${telefono},
        notas = ${notas}, actualizado_en = now()
    where id = ${id}
  `;

  refrescar(id);
  return exito();
}

export async function eliminarClienteAction(datos: FormData): Promise<void> {
  await exigirSesion();
  const id = entero(datos.get("id"));
  if (!id) return;

  // Los fiados y pagos se borran solos (on delete cascade).
  await sql`delete from clientes where id = ${id}`;
  refrescar();
  redirect("/admin");
}

/* ----------------------------------- Fiados --------------------------------- */

export async function crearFiadoAction(_estado: Estado, datos: FormData): Promise<Estado> {
  await exigirSesion();

  const clienteId = entero(datos.get("cliente_id"));
  const descripcion = texto(datos.get("descripcion"), 200);
  const centavos = aCentavos(datos.get("monto"));
  const fecha = desdeInputDateTime(datos.get("fecha"));

  if (!clienteId) return { error: "Cliente no válido." };
  if (centavos === null) return { error: "Escribe un monto válido, por ejemplo 12.50" };

  await sql`
    insert into fiados (cliente_id, descripcion, monto_centavos, fecha)
    values (${clienteId}, ${descripcion || "Fiado"}, ${centavos}, ${fecha.toISOString()})
  `;

  refrescar(clienteId);
  return exito();
}

export async function actualizarFiadoAction(_estado: Estado, datos: FormData): Promise<Estado> {
  await exigirSesion();

  const id = entero(datos.get("id"));
  const clienteId = entero(datos.get("cliente_id"));
  const descripcion = texto(datos.get("descripcion"), 200);
  const centavos = aCentavos(datos.get("monto"));
  const fecha = desdeInputDateTime(datos.get("fecha"));

  if (!id) return { error: "Venta no válida." };
  if (centavos === null) return { error: "Escribe un monto válido, por ejemplo 12.50" };

  await sql`
    update fiados
    set descripcion = ${descripcion || "Fiado"}, monto_centavos = ${centavos},
        fecha = ${fecha.toISOString()}, actualizado_en = now()
    where id = ${id}
  `;

  refrescar(clienteId);
  redirect(`/admin/clientes/${clienteId}`);
}

export async function eliminarFiadoAction(datos: FormData): Promise<void> {
  await exigirSesion();
  const id = entero(datos.get("id"));
  const clienteId = entero(datos.get("cliente_id"));
  if (!id) return;

  await sql`delete from fiados where id = ${id}`;
  refrescar(clienteId);
}

/* ------------------------------------ Pagos --------------------------------- */

export async function crearPagoAction(_estado: Estado, datos: FormData): Promise<Estado> {
  await exigirSesion();

  const clienteId = entero(datos.get("cliente_id"));
  const nota = texto(datos.get("nota"), 200) || null;
  const centavos = aCentavos(datos.get("monto"));
  const fecha = desdeInputDateTime(datos.get("fecha"));

  if (!clienteId) return { error: "Cliente no válido." };
  if (centavos === null) return { error: "Escribe un monto válido, por ejemplo 20" };

  await sql`
    insert into pagos (cliente_id, nota, monto_centavos, fecha)
    values (${clienteId}, ${nota}, ${centavos}, ${fecha.toISOString()})
  `;

  refrescar(clienteId);
  return exito();
}

export async function actualizarPagoAction(_estado: Estado, datos: FormData): Promise<Estado> {
  await exigirSesion();

  const id = entero(datos.get("id"));
  const clienteId = entero(datos.get("cliente_id"));
  const nota = texto(datos.get("nota"), 200) || null;
  const centavos = aCentavos(datos.get("monto"));
  const fecha = desdeInputDateTime(datos.get("fecha"));

  if (!id) return { error: "Pago no válido." };
  if (centavos === null) return { error: "Escribe un monto válido, por ejemplo 20" };

  await sql`
    update pagos
    set nota = ${nota}, monto_centavos = ${centavos},
        fecha = ${fecha.toISOString()}, actualizado_en = now()
    where id = ${id}
  `;

  refrescar(clienteId);
  redirect(`/admin/clientes/${clienteId}`);
}

export async function eliminarPagoAction(datos: FormData): Promise<void> {
  await exigirSesion();
  const id = entero(datos.get("id"));
  const clienteId = entero(datos.get("cliente_id"));
  if (!id) return;

  await sql`delete from pagos where id = ${id}`;
  refrescar(clienteId);
}
