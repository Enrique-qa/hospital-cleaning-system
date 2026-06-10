import { useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function getErrorMessage(error: unknown, fallback: string) {
  return (
    (error as AxiosError<{ message?: string }>).response?.data?.message ||
    fallback
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Informe usuário e senha.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await signIn(username, password);

      navigate("/", { replace: true });
    } catch (error) {
      setError(getErrorMessage(error, "Não foi possível realizar login."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-6">
      <section className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-blue-700">
            Hospital São Lucas
          </p>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Controle de Higienização
          </p>

          <h1 className="mt-6 text-2xl font-black text-slate-950">
            Entrar no sistema
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-800">
              Usuário
            </label>

            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Ex: admin"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-800">
              Senha
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
