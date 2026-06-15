import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { AdminHeader } from "../components/AdminHeader";
import { api } from "../services/api";
import {
  getUserRoleLabel,
  USER_ROLE_LABELS,
  type UserRole,
} from "../utils/userRole";

type User = {
  id: number;
  name: string;
  username: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  return (
    (error as AxiosError<{ message?: string }>).response?.data?.message ||
    fallback
  );
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("MANAGER");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadUsers() {
    const response = await api.get("/users");
    setUsers(response.data);
    setLoading(false);
  }

  useEffect(() => {
    api
      .get<User[]>("/users")
      .then((response) => setUsers(response.data))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.username.toLowerCase().includes(normalizedSearch);
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? user.active : !user.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, search, statusFilter, users]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim() || !username.trim() || !password.trim()) {
      setError("Nome, usuário e senha são obrigatórios.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/users", {
        name,
        username,
        password,
        role,
      });

      setName("");
      setUsername("");
      setPassword("");
      setRole("MANAGER");

      setSuccess("Usuário cadastrado com sucesso.");
      await loadUsers();
    } catch (error) {
      setError(
        getErrorMessage(error, "Não foi possível cadastrar usuário.")
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <section className="mx-auto max-w-6xl space-y-5">
        <AdminHeader
          title="Usuários"
          description="Gerencie os acessos administrativos do sistema."
          backTo="/"
          backLabel="Voltar ao dashboard"
        />

        <form
          onSubmit={handleCreate}
          className="rounded-2xl bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-black text-slate-950">
            Novo usuário
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Cadastre gestores que terão acesso ao sistema administrativo.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome completo"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />

            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Usuário"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Senha"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />

            <select
              value={role}
              onChange={(event) =>
                setRole(event.target.value as UserRole)
              }
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="MANAGER">{USER_ROLE_LABELS.MANAGER}</option>
              <option value="ADMIN">{USER_ROLE_LABELS.ADMIN}</option>
            </select>
          </div>

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="mt-3 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Cadastrando..." : "Cadastrar usuário"}
          </button>
        </form>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou usuário"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="ALL">Todos os perfis</option>
              <option value="ADMIN">{USER_ROLE_LABELS.ADMIN}</option>
              <option value="MANAGER">{USER_ROLE_LABELS.MANAGER}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="ALL">Todos os status</option>
              <option value="ACTIVE">Ativos</option>
              <option value="INACTIVE">Inativos</option>
            </select>
          </div>

          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-black text-slate-950">
              Usuários cadastrados
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {filteredUsers.length} usuários
            </span>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-slate-600">Carregando...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              Nenhum usuário cadastrado.
            </p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <div className="divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="grid gap-2 p-4 text-sm md:grid-cols-[1fr_1fr_120px_100px_auto] md:items-center"
                  >
                    <div>
                      <p className="font-bold text-slate-950">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        ID: {user.id}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {user.username}
                      </p>
                      <p className="text-xs text-slate-500">
                        Usuário de acesso
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-center text-xs font-bold text-emerald-700">
                      {getUserRoleLabel(user.role)}
                    </span>

                    <span
                      className={
                        user.active
                          ? "rounded-full bg-green-50 px-3 py-1 text-center text-xs font-bold text-green-700"
                          : "rounded-full bg-red-50 px-3 py-1 text-center text-xs font-bold text-red-700"
                      }
                    >
                      {user.active ? "Ativo" : "Inativo"}
                    </span>

                    <Link
                      to={`/users/${user.id}/edit`}
                      className="rounded-xl border border-emerald-200 px-4 py-2 text-center text-sm font-semibold text-emerald-700"
                    >
                      Editar
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
