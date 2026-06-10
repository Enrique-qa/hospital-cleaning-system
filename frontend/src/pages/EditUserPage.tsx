import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

type User = {
  id: number;
  name: string;
  username: string;
  role: "ADMIN" | "MANAGER";
  active: boolean;
};

function getErrorMessage(error: unknown, fallback: string) {
  return (
    (error as AxiosError<{ message?: string }>).response?.data?.message ||
    fallback
  );
}

export function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await api.get(`/users/${id}`);
        setUser(response.data);
      } catch (error) {
        setError(getErrorMessage(error, "Não foi possível carregar o usuário."));
      } finally {
        setLoading(false);
      }
    }

    if (id) loadUser();
  }, [id]);

  function updateField(
    field: "name" | "username" | "role" | "active",
    value: string | boolean
  ) {
    setUser((current) => {
      if (!current) return current;

      return {
        ...current,
        [field]: value,
      };
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!user) return;

    if (!user.name.trim() || !user.username.trim()) {
      setError("Nome e usuário são obrigatórios.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.put(`/users/${user.id}`, {
        name: user.name,
        username: user.username,
        role: user.role,
        active: user.active,
        password: password || undefined,
      });

      navigate("/users", { replace: true });
    } catch (error) {
      setError(
        getErrorMessage(error, "Não foi possível salvar as alterações.")
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-5">
        <p className="text-sm text-slate-600">Carregando usuário...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5">
      <section className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <Link to="/users" className="text-sm font-semibold text-emerald-700">
            ← Voltar para usuários
          </Link>

          <h1 className="mt-3 text-2xl font-black text-slate-950">
            Editar usuário
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Atualize os dados, o perfil de acesso e o status do usuário.
          </p>
        </div>

        {user ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-5 shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Nome
                </label>
                <input
                  value={user.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Usuário
                </label>
                <input
                  value={user.username}
                  onChange={(event) =>
                    updateField("username", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Perfil
                </label>
                <select
                  value={user.role}
                  onChange={(event) => updateField("role", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Status
                </label>
                <select
                  value={user.active ? "true" : "false"}
                  onChange={(event) =>
                    updateField("active", event.target.value === "true")
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-800">
                  Nova senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Deixe em branco para manter a senha atual"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Link
                to="/users"
                className="rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        ) : (
          <p className="rounded-2xl bg-white p-5 text-sm text-red-700 shadow-sm">
            {error || "Usuário não encontrado."}
          </p>
        )}
      </section>
    </main>
  );
}
