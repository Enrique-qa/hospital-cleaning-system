import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  Check,
  ClipboardList,
  MessageSquareWarning,
  Plus,
  QrCode,
  Sparkles,
  Users,
} from "lucide-react";
import { api } from "../services/api";

type DashboardData = {
  activeEntities: number;
  activeEmployees: number;
  cleaningsToday: number;
  entitiesWithoutCleaningToday: number;
  latestRecords: {
    id: number;
    cleanedAt: string;
    employee: {
      name: string;
    };
    entity: {
      name: string;
      slug: string;
    };
  }[];
  entitiesPendingToday: {
    id: number;
    name: string;
    slug: string;
    type: string;
    sector?: string | null;
    location?: string | null;
  }[];
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const response = await api.get("/dashboard");
      setData(response.data);
    }

    loadDashboard();
  }, []);

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-5">
        <p className="text-sm text-slate-600">Carregando dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <section className="mx-auto max-w-6xl space-y-5">
        <header className="text-center">
          <p className="text-base font-extrabold uppercase tracking-[0.18em] text-blue-700">
            Hospital São Lucas
          </p>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Controle de Higienização
          </p>

          <h1 className="mt-6 text-3xl font-black text-slate-950">
            Dashboard
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Acompanhe os registros de limpeza, entidades pendentes e atalhos
            principais do sistema.
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-4">
          <Link
            to="/entities"
            className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <Building2 size={18} />
              <p className="text-sm font-medium">Entidades ativas</p>
            </div>

            <p className="mt-3 text-4xl font-black text-slate-950">
              {data.activeEntities}
            </p>

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-blue-700">
              Ver entidades
            </p>
          </Link>

          <Link
            to="/employees"
            className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-2 text-slate-500">
              <Users size={18} />
              <p className="text-sm font-medium">Funcionárias ativas</p>
            </div>

            <p className="mt-3 text-4xl font-black text-slate-950">
              {data.activeEmployees}
            </p>

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-blue-700">
              Ver funcionárias
            </p>
          </Link>

          <div className="rounded-2xl bg-green-600 p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 text-green-50">
              <Check size={18} />
              <p className="text-sm font-medium">Limpezas hoje</p>
            </div>

            <p className="mt-3 text-4xl font-black">
              {data.cleaningsToday}
            </p>

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-green-50">
              Registros do dia
            </p>
          </div>

          <div className="rounded-2xl bg-red-800 p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 text-red-50">
              <AlertTriangle size={18} />
              <p className="text-sm font-medium">Sem limpeza hoje</p>
            </div>

            <p className="mt-3 text-4xl font-black">
              {data.entitiesWithoutCleaningToday}
            </p>

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-red-50">
              Pendências do dia
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ClipboardList size={20} className="text-blue-700" />

                  <h2 className="text-lg font-black text-slate-950">
                    Últimas limpezas
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Registros mais recentes do sistema.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {data.latestRecords.length} registros
              </span>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              {data.latestRecords.length === 0 ? (
                <p className="p-4 text-sm text-slate-600">
                  Nenhum registro encontrado.
                </p>
              ) : (
                <div className="divide-y divide-slate-200">
                  {data.latestRecords.map((record) => (
                    <div
                      key={record.id}
                      className="grid gap-1 p-4 text-sm transition hover:bg-slate-50 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <Link
                        to={`/entities/${record.entity.slug}`}
                        className="font-bold text-blue-700"
                      >
                        {record.entity.name}
                      </Link>

                      <span className="text-slate-700">
                        {record.employee.name}
                      </span>

                      <span className="text-slate-600 md:text-right">
                        {new Date(record.cleanedAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={20} className="text-red-600" />

                  <h2 className="text-lg font-black text-slate-950">
                    Pendentes hoje
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Entidades ativas sem registro de limpeza hoje.
                </p>
              </div>

              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                {data.entitiesPendingToday.length} pendentes
              </span>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              {data.entitiesPendingToday.length === 0 ? (
                <p className="p-4 text-sm font-medium text-green-700">
                  Todas as entidades ativas possuem limpeza registrada hoje.
                </p>
              ) : (
                <div className="divide-y divide-slate-200">
                  {data.entitiesPendingToday.map((entity) => (
                    <div
                      key={entity.id}
                      className="p-4 text-sm transition hover:bg-slate-50"
                    >
                      <Link
                        to={`/entities/${entity.slug}`}
                        className="font-bold text-blue-700"
                      >
                        {entity.name}
                      </Link>

                      <p className="mt-1 text-xs text-slate-600">
                        {entity.type === "AMBIENTE"
                          ? "Ambiente"
                          : "Equipamento"}
                        {entity.sector ? ` • ${entity.sector}` : ""}
                        {entity.location ? ` • ${entity.location}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <Sparkles size={16} />

            <p className="text-center text-sm font-semibold">
              Acessos rápidos
            </p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/entities"
              className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              <Building2 size={18} />
              Entidades
            </Link>

            <Link
              to="/employees"
              className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              <Users size={18} />
              Funcionários
            </Link>

            <Link
              to="/entities/qr-report"
              className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              <QrCode size={18} />
              QR Codes
            </Link>

            <Link
              to="/reports/cleaning-records"
              className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              <MessageSquareWarning size={18}/>
              Relatórios
            </Link>

            <Link
              to="/entities/new"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-800"
            >
              <Plus size={18} />
              Nova entidade
            </Link>
          </div>
        </nav>
      </section>
    </main>
  );
}