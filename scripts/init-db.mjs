// Crea las tablas en Neon. Uso:  npm run db:init
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL. Copia .env.example a .env.local y completalo.");
  process.exit(1);
}

const sql = neon(url);
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");

// Neon HTTP no acepta varias sentencias en una sola llamada: las separamos.
const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s && !s.split("\n").every((line) => line.trim().startsWith("--")));

for (const statement of statements) {
  await sql.query(statement);
  console.log("OK ->", statement.split("\n")[0].slice(0, 70));
}

console.log("\nBase de datos lista.");
