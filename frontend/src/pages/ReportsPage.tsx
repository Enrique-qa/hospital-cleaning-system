import {
  Activity,
  Building2,
  CalendarDays,
  QrCode,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AdminHeader } from "../components/AdminHeader";

const reports = [
  {
    title: "Limpezas por período",
    description: "Consulte todos os registros entre duas datas.",
    to: "/reports/cleaning-records",
    icon: CalendarDays,
  },
  {
    title: "Por funcionário",
    description: "Analise os registros de uma colaboradora no período.",
    to: "/reports/employees",
    icon: UserRound,
  },
  {
    title: "Por entidade",
    description: "Consulte as limpezas realizadas em um ambiente ou equipamento.",
    to: "/reports/entities",
    icon: Building2,
  },
  {
    title: "Monitoramento e pendências",
    description: "Veja quais entidades estão fora da rotina configurada.",
    to: "/reports/monitoring",
    icon: Activity,
  },
  {
    title: "QR Codes",
    description: "Abra o relatório para impressão das etiquetas de acesso.",
    to: "/entities/qr-report",
    icon: QrCode,
  },
];

export function ReportsPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <section className="mx-auto max-w-6xl space-y-5">
        <AdminHeader
          title="Relatórios"
          description="Escolha uma visão para acompanhar os registros operacionais."
          backTo="/"
          backLabel="Voltar ao dashboard"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => {
            const Icon = report.icon;

            return (
              <Link
                key={report.to}
                to={report.to}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                  <Icon className="h-5 w-5 text-emerald-700" />
                </div>

                <h2 className="mt-4 text-lg font-black text-slate-950">
                  {report.title}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {report.description}
                </p>

                <p className="mt-4 text-sm font-bold text-emerald-700">
                  Abrir relatório
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
