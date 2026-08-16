import Link from "next/link";
import { redirect } from "next/navigation";
import { haySesion } from "@/lib/auth";
import { salirAction } from "@/app/admin/acciones";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await haySesion())) redirect("/admin/login");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-borde bg-crema/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2 font-bold">
            <span className="text-xl">🏪</span>
            <span>Doña Goyita</span>
          </Link>

          <nav className="ml-auto flex items-center gap-2">
            <Link href="/admin/clientes/nuevo" className="boton-suave text-sm">
              + Cliente
            </Link>
            <form action={salirAction}>
              <button type="submit" className="boton-suave text-sm">
                Salir
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
