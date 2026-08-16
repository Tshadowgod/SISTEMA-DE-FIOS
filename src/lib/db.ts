import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

function getClient(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "Falta la variable DATABASE_URL. Copia .env.example a .env.local y pega ahi la cadena de conexion de Neon.",
      );
    }
    client = neon(url);
  }
  return client;
}

/**
 * Consulta a Postgres con template literals. Los valores interpolados viajan
 * siempre como parametros ($1, $2, ...), nunca concatenados: no hay inyeccion SQL.
 *
 *   const filas = await sql<Cliente>`select * from clientes where id = ${id}`;
 */
export function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  return getClient()(strings, ...values) as unknown as Promise<T[]>;
}

/** Postgres devuelve sum()/bigint como string. Esto normaliza a number. */
export function toInt(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.round(n) : 0;
}
