import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

type Employee = {
  id: number;
  employeeCode?: string | null;
  name: string;
  active: boolean;
};

function getErrorMessage(error: unknown, fallback: string) {
  return (
    (error as AxiosError<{ message?: string }>).response?.data?.message ||
    fallback
  );
}

export function EditEmployeePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEmployee() {
      try {
        const response = await api.get(`/employees/${id}`);
        setEmployee(response.data);
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Não foi possível carregar a funcionária."
          )
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) loadEmployee();
  }, [id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!employee) return;

    if (!employee.name.trim()) {
      setError("Informe o nome da funcionária.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.put(`/employees/${employee.id}`, {
        name: employee.name,
        active: employee.active,
      });

      navigate("/employees", { replace: true });
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
        <p className="text-sm text-slate-600">Carregando funcionária...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5">
      <section className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <Link to="/employees" className="text-sm font-semibold text-emerald-700">
            ← Voltar para funcionários
          </Link>

          <h1 className="mt-3 text-2xl font-black text-slate-950">
            Editar funcionária
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Atualize o nome e o status sem alterar o código de identificação.
          </p>
        </div>

        {employee ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-5 shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Código
                </label>
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm font-bold text-slate-700">
                  {employee.employeeCode || "—"}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">
                  Status
                </label>
                <select
                  value={employee.active ? "true" : "false"}
                  onChange={(event) =>
                    setEmployee((current) =>
                      current
                        ? { ...current, active: event.target.value === "true" }
                        : current
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="true">Ativa</option>
                  <option value="false">Inativa</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-800">
                  Nome
                </label>
                <input
                  value={employee.name}
                  onChange={(event) =>
                    setEmployee((current) =>
                      current
                        ? { ...current, name: event.target.value }
                        : current
                    )
                  }
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
                to="/employees"
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
            {error || "Funcionária não encontrada."}
          </p>
        )}
      </section>
    </main>
  );
}
