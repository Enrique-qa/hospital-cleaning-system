import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  Check,
  ClipboardList,
  FileText,
  Plus,
  QrCode,
  RefreshCw,
  UserCog,
  Users,
} from "lucide-react";
import { AdminHeader } from "../components/AdminHeader";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";

type PendingEntity = {
  id: number;
  name: string;
  slug: string;
  type: string;
  sector?: string | null;
  location?: string | null;
  reason: string;
};

type DashboardData = {
  activeEntities: number;
  activeEmployees: number;
  cleaningsToday: number;
  monitoredEntities: number;
  pendingEntitiesCount: number;
  pendingEntities: PendingEntity[];
  monitoringSummary: {
    ok: number;
    pending: number;
    notMonitored: number;
  };
  latestRecords: {
    id: number;
    cleanedAt: string;
    employee: { name: string };
    entity: { name: string; slug: string };
  }[];
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  async function loadDashboard(showRefreshing = false) {
    if (showRefreshing) setRefreshing(true);

    try {
      const response = await api.get<DashboardData>("/dashboard");
      setData(response.data);
    } finally {
      if (showRefreshing) setRefreshing(false);
    }
  }

  useEffect(() => {
    api
      .get<DashboardData>("/dashboard")
      .then((response) => setData(response.data));
  }, []);

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-5">
        <p className="text-sm text-slate-600">Carregando dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 sm:px-4 sm:py-6">
      <section className="mx-auto max-w-6xl space-y-4 sm:space-y-5">
        <AdminHeader title="Dashboard" />

        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <p className="max-w-2xl text-center text-sm leading-relaxed text-slate-600 md:text-left">
            Acompanhe a rotina configurada, pendências reais e os registros mais
            recentes.
          </p>
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2 text-sm font-bold text-emerald-700 disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Atualizando..." : "Atualizar"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-5 [&>*:last-child]:col-span-2 xl:[&>*:last-child]:col-span-1">
          <MetricCard
            label="Entidades ativas"
            value={data.activeEntities}
            detail="Operação cadastrada"
            icon={<Building2 size={18} />}
          />
          <MetricCard
            label="Funcionários ativos"
            value={data.activeEmployees}
            detail="Equipe disponível"
            icon={<Users size={18} />}
          />
          <MetricCard
            label="Limpezas hoje"
            value={data.cleaningsToday}
            detail="Registros do dia"
            icon={<Check size={18} />}
            tone="success"
          />
          <MetricCard
            label="Monitoradas"
            value={data.monitoredEntities}
            detail={`${data.monitoringSummary.ok} dentro da rotina`}
            icon={<ClipboardList size={18} />}
          />
          <MetricCard
            label="Fora da rotina"
            value={data.pendingEntitiesCount}
            detail="Pendências reais"
            icon={<AlertTriangle size={18} />}
            tone={data.pendingEntitiesCount > 0 ? "danger" : "success"}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
                  <ClipboardList size={20} className="text-emerald-700" />
                  Últimas limpezas
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Registros mais recentes do sistema.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {data.latestRecords.length} registros
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
              {data.latestRecords.length === 0 ? (
                <p className="p-4 text-sm text-slate-600">
                  Nenhum registro encontrado.
                </p>
              ) : (
                data.latestRecords.map((record) => (
                  <div
                    key={record.id}
                    className="grid gap-1 p-4 text-sm md:grid-cols-[1fr_1fr_auto]"
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
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
                  <AlertTriangle size={20} className="text-red-600" />
                  Entidades fora da rotina
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Apenas rotinas que exigem limpeza neste momento.
                </p>
              </div>
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                {data.pendingEntities.length} pendentes
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
              {data.pendingEntities.length === 0 ? (
                <p className="p-4 text-sm font-medium text-green-700">
                  Nenhuma entidade está fora da rotina configurada.
                </p>
              ) : (
                data.pendingEntities.map((entity) => (
                  <div key={entity.id} className="p-4 text-sm">
                    <Link
                      to={`/entities/${entity.slug}`}
                      className="font-bold text-emerald-700"
                    >
                      {entity.name}
                    </Link>
                    <p className="mt-1 text-xs text-slate-600">
                      {entity.type === "AMBIENTE" ? "Ambiente" : "Equipamento"}
                      {entity.sector ? ` • ${entity.sector}` : ""}
                      {entity.location ? ` • ${entity.location}` : ""}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-red-700">
                      {entity.reason}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <nav className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-center text-sm font-semibold text-slate-500">
            Acessos rápidos
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <QuickLink to="/entities" label="Entidades" icon={<Building2 size={18} />} />
            <QuickLink to="/employees" label="Funcionários" icon={<Users size={18} />} />
            <QuickLink to="/entities/qr-report" label="QR Codes" icon={<QrCode size={18} />} />
            <QuickLink to="/reports" label="Relatórios" icon={<FileText size={18} />} />
            {user?.role === "ADMIN" && (
              <QuickLink to="/users" label="Usuários" icon={<UserCog size={18} />} />
            )}
            <Link
              to="/entities/new"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white"
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

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = "default",
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
  tone?: "default" | "success" | "danger";
}) {
  const colored = tone !== "default";
  const cardClass =
    tone === "danger"
      ? "bg-red-800 text-white"
      : tone === "success"
        ? "bg-emerald-700 text-white"
        : "bg-white text-slate-950";

  return (
    <div className={`rounded-2xl p-3 shadow-sm sm:p-5 ${cardClass}`}>
      <div className={`flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm ${colored ? "text-white/80" : "text-slate-500"}`}>
        {icon}
        <p className="font-medium">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-black sm:mt-3 sm:text-4xl">{value}</p>
      <p className={`mt-2 text-[10px] font-bold uppercase leading-tight tracking-wide sm:mt-3 sm:text-xs ${colored ? "text-white/80" : "text-emerald-700"}`}>
        {detail}
      </p>
    </div>
  );
}

function QuickLink({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-700"
    >
      {icon}
      {label}
    </Link>
  );
}
