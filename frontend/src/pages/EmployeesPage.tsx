import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

type Employee = {
  id: number;
  employeeCode?: string | null;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadEmployees() {
    const response = await api.get("/employees");
    setEmployees(response.data);
    setLoading(false);
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Informe o nome do funcionário.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/employees", {
        name,
      });

      setName("");
      setSuccess("Funcionário cadastrado com sucesso.");
      await loadEmployees();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Não foi possível cadastrar.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleEmployee(employee: Employee) {
    setError("");
    setSuccess("");

    try {
      await api.put(`/employees/${employee.id}`, {
        active: !employee.active,
      });

      setSuccess(
        employee.active
          ? "Funcionário inativada com sucesso."
          : "Funcionário ativada com sucesso."
      );

      await loadEmployees();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Não foi possível atualizar.";
      setError(message);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5">
      <section className="mx-auto max-w-4xl space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <Link to="/" className="text-sm font-semibold text-emerald-700">
            ← Voltar ao dashboard
          </Link>

          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Gestão
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            Funcionários
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Cadastre colaboradoras autorizadas a registrar limpezas pelo QR Code.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="rounded-2xl bg-white p-5 shadow-sm"
        >
          <h2 className="text-base font-bold text-slate-950">
            Novo funcionário
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome completo"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Cadastrando..." : "Cadastrar"}
            </button>
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
        </form>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-950">
              Lista de funcionários
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {employees.length} cadastros
            </span>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-slate-600">Carregando...</p>
          ) : employees.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              Nenhum funcionário cadastrado.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="grid gap-3 p-4 md:grid-cols-[100px_1fr_auto] md:items-center"
                >
                  <div>
                    <p className="text-xs text-slate-500">Código</p>
                    <p className="font-mono text-sm font-bold text-slate-900">
                      {employee.employeeCode || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-950">
                      {employee.name}
                    </p>
                    <p
                      className={
                        employee.active
                          ? "text-sm text-green-700"
                          : "text-sm text-red-700"
                      }
                    >
                      {employee.active ? "Ativa" : "Inativa"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/employees/${employee.id}/edit`}
                      className="rounded-xl border border-emerald-200 px-4 py-2 text-center text-sm font-semibold text-emerald-700"
                    >
                      Editar
                    </Link>

                    <button
                      type="button"
                      onClick={() => toggleEmployee(employee)}
                      className={
                        employee.active
                          ? "rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"
                          : "rounded-xl border border-green-200 px-4 py-2 text-sm font-semibold text-green-700"
                      }
                    >
                      {employee.active ? "Inativar" : "Ativar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
