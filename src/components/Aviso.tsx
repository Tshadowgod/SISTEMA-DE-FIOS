export default function Aviso({
  tipo = "error",
  children,
}: {
  tipo?: "error" | "ok";
  children: React.ReactNode;
}) {
  const estilos =
    tipo === "error"
      ? "bg-red-50 text-deuda"
      : "bg-green-50 text-pagado";
  return (
    <p className={`rounded-xl px-4 py-3 text-sm font-medium ${estilos}`} role="status">
      {children}
    </p>
  );
}
