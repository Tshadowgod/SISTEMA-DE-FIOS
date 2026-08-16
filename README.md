# Cobros Doña Goyita

Sistema de fiado para una tienda de barrio.

- **El cliente** entra a la página, escribe su número de carnet y ve cuánto debe.
- **La casera** entra con una clave, registra clientes, anota los fiados (con día y hora, editables) y los pagos.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Postgres en Neon · desplegado en Vercel.

---

## 1. Crear la base de datos en Neon

1. Entra a [neon.tech](https://neon.tech) y crea un proyecto (el plan gratis alcanza de sobra).
2. En el dashboard, copia la **connection string** — usa la opción **Pooled connection**.
   Se ve así: `postgresql://usuario:clave@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require`

## 2. Configurar el proyecto

```bash
cp .env.example .env.local
```

Abre `.env.local` y completa las tres variables:

| Variable         | Qué es                                                              |
| ---------------- | ------------------------------------------------------------------- |
| `DATABASE_URL`   | La cadena de conexión que copiaste de Neon                          |
| `ADMIN_PASSWORD` | La clave con la que entra la casera al panel                        |
| `AUTH_SECRET`    | Una cadena larga y aleatoria para firmar la sesión                  |

Para generar `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Crear las tablas

```bash
npm install
npm run db:init
```

Esto ejecuta `db/schema.sql` en Neon. Es seguro correrlo más de una vez
(todo usa `create table if not exists`).

## 4. Probar en la computadora

```bash
npm run dev
```

- Consulta del cliente: <http://localhost:3000>
- Panel de la casera: <http://localhost:3000/admin>

## 5. Publicar en Vercel

1. Sube el proyecto a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repo.
3. En **Environment Variables** carga las mismas tres: `DATABASE_URL`, `ADMIN_PASSWORD`, `AUTH_SECRET`.
4. **Deploy**. Vercel detecta Next.js solo, no hay que configurar nada más.

> Si conectas Neon desde el marketplace de Vercel, `DATABASE_URL` se carga sola.
> Igual tienes que agregar `ADMIN_PASSWORD` y `AUTH_SECRET` a mano.

---

## Cómo se usa

### La casera

| Quiero…                     | Dónde                                                        |
| --------------------------- | ------------------------------------------------------------ |
| Registrar un cliente nuevo  | Panel → botón **+ Cliente**                                  |
| Anotar un fiado             | Panel → toca el cliente → **Anotar fiado**                   |
| Corregir un fiado ya anotado| Historial del cliente → **Editar** (monto, detalle y fecha/hora) |
| Anotar que le pagaron       | Cliente → **Registrar pago** (el botón *Todo* pone la deuda completa) |
| Borrar algo mal anotado     | Historial → **Eliminar** (pide confirmar)                    |
| Ver cuánto hay por cobrar   | Es lo primero que sale en el panel                           |

La fecha y hora se llenan solas con el momento actual, pero se pueden cambiar:
sirve para anotar al final del día algo que se fió en la mañana.

### El cliente

Entra a la página principal, escribe su carnet y ve su deuda y todos sus movimientos.
No necesita clave ni cuenta. Da igual si escribe `8765432 LP`, `8765432-lp` o `8765432LP`.

---

## Detalles técnicos

- **Montos en centavos.** Se guardan como enteros (`monto_centavos`) para que
  nunca aparezcan errores de redondeo con los decimales.
- **Fechas.** Se guardan en UTC (`timestamptz`) y se muestran en hora de Bolivia
  (`America/La_Paz`). El país no tiene horario de verano, así que la conversión es fija.
- **Carnets.** Se normalizan antes de guardar (mayúsculas, sin espacios ni guiones)
  para que el cliente encuentre su cuenta escriba como escriba.
- **Sesión.** Cookie `httpOnly` firmada con HMAC-SHA256 usando `AUTH_SECRET`, válida 30 días.
  Cada acción del panel verifica la sesión en el servidor antes de tocar la base.
- **SQL.** Todas las consultas usan template literals de `@neondatabase/serverless`,
  que mandan los valores como parámetros: no hay inyección SQL.

### Estructura

```
db/schema.sql                  Tablas: clientes, fiados, pagos
scripts/init-db.mjs            Crea las tablas en Neon
src/lib/db.ts                  Conexión a Neon
src/lib/format.ts              Bolivianos, fechas de Bolivia, carnets
src/lib/consultas.ts           Lecturas de la base
src/lib/auth.ts                Sesión de la casera
src/app/page.tsx               Consulta pública por carnet
src/app/admin/acciones.ts      Server actions (crear/editar/borrar)
src/app/admin/login/           Ingreso de la casera
src/app/admin/(panel)/         Panel protegido
src/components/                Formularios reutilizables
```
