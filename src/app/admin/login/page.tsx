import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { haySesion } from "@/lib/auth";
import FormularioAcceso from "./FormularioAcceso";

export const dynamic = "force-dynamic";

export default async function Login() {
  if (await haySesion()) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4 py-10">
      <div className="tarjeta">
        <div className="mb-6 text-center">
          <Image
            src="/goyita.png"
            alt=""
            width={256}
            height={256}
            priority
            className="mx-auto mb-3 h-20 w-20 rounded-full object-cover ring-2 ring-marca-suave"
          />
          <h1 className="text-xl font-bold">Panel de la casera</h1>
          <p className="mt-1 text-sm text-tenue">Tienda Doña Goyita</p>
        </div>

        <FormularioAcceso />
      </div>

      <Link
        href="/"
        className="mt-6 text-center text-sm text-tenue underline underline-offset-4"
      >
        Volver a consultar mi deuda
      </Link>
    </main>
  );
}
