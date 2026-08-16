/** Utilidades de formato: dinero en bolivianos, fechas en hora de Bolivia y carnets. */

export const ZONA = "America/La_Paz";
/** Bolivia esta fija en UTC-4 todo el ano (no tiene horario de verano). */
const OFFSET_BOLIVIA = "-04:00";

/* ---------------------------------- Dinero --------------------------------- */

/** 12345 -> "Bs 123,45" */
export function bs(centavos: number): string {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 2,
  }).format(centavos / 100);
}

/** 12345 -> "123.45"  (para rellenar un <input type="number">) */
export function centavosAInput(centavos: number): string {
  return (centavos / 100).toFixed(2);
}

/**
 * Convierte lo que escribio la ventera a centavos.
 * Acepta "12", "12.50", "12,50" y "Bs 12,50". Devuelve null si no es valido.
 */
export function aCentavos(entrada: FormDataEntryValue | null | undefined): number | null {
  if (typeof entrada !== "string") return null;
  const limpio = entrada.replace(/[^\d.,-]/g, "").replace(",", ".").trim();
  if (limpio === "") return null;
  const numero = Number(limpio);
  if (!Number.isFinite(numero) || numero <= 0) return null;
  const centavos = Math.round(numero * 100);
  if (centavos <= 0 || centavos > 2_000_000_000) return null;
  return centavos;
}

/* ---------------------------------- Fechas --------------------------------- */

/** Date -> "16/08/2026, 15:42" en hora de Bolivia */
export function fechaHora(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: ZONA,
  }).format(d);
}

/** Date -> "16 de agosto de 2026" en hora de Bolivia */
export function fechaLarga(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "long",
    timeZone: ZONA,
  }).format(d);
}

/** Date -> "2026-08-16T15:42", el formato que pide <input type="datetime-local"> */
export function aInputDateTime(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const p = (tipo: string) => partes.find((x) => x.type === tipo)?.value ?? "00";
  // en-CA con hour12:false puede devolver "24" para la medianoche.
  const hora = p("hour") === "24" ? "00" : p("hour");
  return `${p("year")}-${p("month")}-${p("day")}T${hora}:${p("minute")}`;
}

/**
 * Lee un <input type="datetime-local">, interpretandolo como hora de Bolivia.
 * Si viene vacio o invalido devuelve la fecha y hora actual.
 */
export function desdeInputDateTime(entrada: FormDataEntryValue | null | undefined): Date {
  if (typeof entrada !== "string" || entrada.trim() === "") return new Date();
  const texto = entrada.length === 16 ? `${entrada}:00` : entrada;
  const fecha = new Date(`${texto}${OFFSET_BOLIVIA}`);
  return Number.isNaN(fecha.getTime()) ? new Date() : fecha;
}

/* ---------------------------------- Carnet --------------------------------- */

/**
 * Normaliza el carnet para que "1234567 LP", "1234567-lp" y "1234567LP"
 * sean el mismo cliente. Guardamos siempre la version normalizada.
 */
export function normalizarCarnet(entrada: FormDataEntryValue | null | undefined): string {
  if (typeof entrada !== "string") return "";
  return entrada
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 20);
}

/** "1234567LP" -> "1234567 LP" (solo para mostrarlo mas legible) */
export function carnetLegible(carnet: string): string {
  const m = /^(\d+)([A-Z]{1,3})$/.exec(carnet);
  return m ? `${m[1]} ${m[2]}` : carnet;
}
