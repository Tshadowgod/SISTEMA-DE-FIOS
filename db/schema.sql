-- Esquema de la base de datos - Cobros Dona Goyita
-- Los montos se guardan en centavos (enteros) para no perder precision con decimales.

create table if not exists clientes (
  id             serial primary key,
  carnet         text        not null unique,
  nombre         text        not null,
  telefono       text,
  notas          text,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists fiados (
  id             serial      primary key,
  cliente_id     integer     not null references clientes(id) on delete cascade,
  descripcion    text        not null,
  monto_centavos integer     not null check (monto_centavos > 0),
  fecha          timestamptz not null default now(),
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists pagos (
  id             serial      primary key,
  cliente_id     integer     not null references clientes(id) on delete cascade,
  monto_centavos integer     not null check (monto_centavos > 0),
  nota           text,
  fecha          timestamptz not null default now(),
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists fiados_cliente_idx on fiados (cliente_id, fecha desc);
create index if not exists pagos_cliente_idx  on pagos  (cliente_id, fecha desc);
create index if not exists clientes_nombre_idx on clientes (lower(nombre));
