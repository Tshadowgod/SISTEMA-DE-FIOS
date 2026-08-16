import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "goyita_sesion";
const DURACION_DIAS = 30;

function secreto(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "Falta AUTH_SECRET (o es muy corta). Generala con: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }
  return s;
}

function firmar(datos: string): string {
  return createHmac("sha256", secreto()).update(datos).digest("hex");
}

/** Compara dos strings sin filtrar informacion por el tiempo que tarda. */
function igualSeguro(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function claveCorrecta(intento: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) {
    throw new Error("Falta ADMIN_PASSWORD. Definila en .env.local (o en Vercel).");
  }
  return igualSeguro(intento, real);
}

export async function iniciarSesion(): Promise<void> {
  const expira = Date.now() + DURACION_DIAS * 24 * 60 * 60 * 1000;
  const valor = `${expira}.${firmar(String(expira))}`;
  const tienda = await cookies();
  tienda.set(COOKIE, valor, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_DIAS * 24 * 60 * 60,
  });
}

export async function cerrarSesion(): Promise<void> {
  const tienda = await cookies();
  tienda.delete(COOKIE);
}

export async function haySesion(): Promise<boolean> {
  const valor = (await cookies()).get(COOKIE)?.value;
  if (!valor) return false;

  const corte = valor.lastIndexOf(".");
  if (corte < 1) return false;

  const expira = valor.slice(0, corte);
  const firma = valor.slice(corte + 1);
  if (!igualSeguro(firma, firmar(expira))) return false;

  return Number(expira) > Date.now();
}
