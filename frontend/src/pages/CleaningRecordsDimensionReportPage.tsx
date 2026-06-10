import type { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminHeader } from "../components/AdminHeader";
import { api } from "../services/api";

type Dimension = "employee" | "entity";

type Option = {
  id: number;
  name: string;
  employeeCode?: string | null;
  type?: string;
  active: boolean;
};

type CleaningRecord = {
  id: number;
  cleanedAt: string;
  employeeNameTyped: string;
  employee: {
    name: string;
    employeeCode?: string | null;
  };
  entity: {
    name: string;
    slug: string;
    type: string;
    sector?: string | null;
    location?: string | null;
  };
};

type ReportData = {
  total: number;
  records: CleaningRecord[];
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  return (
    (error as AxiosError<{ message?: string }>).response?.data?.message ||
    fallback
  );
}

export function CleaningRecordsDimensionReportPage({
  dimension,
}: {
  dimension: Dimension;
}) {
  const isEmployee = dimension === "employee";
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Option[]>(isEmployee ? "/employees" : "/cleaning-entities")
      .then((response) => setOptions(response.data))
      .catch((error) =>
        setError(getErrorMessage(error, "Não foi possível carregar as opções."))
      );
  }, [isEmployee]);

  async function loadReport() {
    setError("");
    setData(null);

    if (!selectedId) {
      setError(
        isEmployee ? "Selecione uma funcionária." : "Selecione uma entidade."
      );
      return;
    }

    if (!startDate || !endDate || startDate > endDate) {
      setError("Informe um período válido.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.get<ReportData>("/reports/cleaning-records", {
        params: {
          startDate,
          endDate,
          [isEmployee ? "employeeId" : "entityId"]: selectedId,
        },
      });

      setData(response.data);
    } catch (error) {
      setError(getErrorMessage(error, "Não foi possível carregar o relatório."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <section className="mx-auto max-w-6xl space-y-4">
        <AdminHeader
          title={isEmployee ? "Relatório por funcionária" : "Relatório por entidade"}
          description="Filtre os registros por período para acompanhar a operação."
          backTo="/reports"
          backLabel="Voltar para relatórios"
        />

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">
                {isEmployee ? "Selecione a funcionária" : "Selecione a entidade"}
              </option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                  {isEmployee && option.employeeCode
                    ? ` - ${option.employeeCode}`
                    : ""}
                  {!option.active ? " (inativa)" : ""}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />

            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />

            <button
              type="button"
              onClick={loadReport}
              disabled={loading}
              className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        {data && (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-950">
                Registros encontrados
              </h2>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {data.total} registros
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
              {data.records.length === 0 ? (
                <p className="p-4 text-sm text-slate-600">
                  Nenhum registro encontrado no período.
                </p>
              ) : (
                data.records.map((record) => (
                  <div
                    key={record.id}
                    className="grid gap-2 p-4 text-sm md:grid-cols-[1fr_1fr_auto]"
                  >
                    <Link
                      to={`/entities/${record.entity.slug}`}
                      className="font-bold text-emerald-700"
                    >
                      {record.entity.name}
                    </Link>
                    <span className="text-slate-700">{record.employee.name}</span>
                    <span className="text-slate-600 md:text-right">
                      {new Date(record.cleanedAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
