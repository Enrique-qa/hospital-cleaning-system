import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminHeader } from "../components/AdminHeader";
import {
  PrintButton,
  ReportPrintFooter,
  ReportPrintHeader,
} from "../components/ReportPrint";
import { api } from "../services/api";
import {
  describeMonitoringRule,
  FREQUENCY_LABELS,
  type CleaningFrequencyType,
  type MonitoringStatus,
} from "../types/monitoring";

type MonitoringEntity = {
  id: number;
  name: string;
  slug: string;
  type: string;
  sector?: string | null;
  monitoringEnabled: boolean;
  frequencyType: CleaningFrequencyType;
  expectedCleaningsPerDay?: number | null;
  weeklyDays?: string[] | null;
  monthlyDays?: number[] | null;
  customIntervalHours?: number | null;
  monitoringStatus: MonitoringStatus;
};

type MonitoringReport = {
  issuedAt: string;
  total: number;
  pendingCount: number;
  entities: MonitoringEntity[];
};

export function MonitoringReportPage() {
  const [data, setData] = useState<MonitoringReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<MonitoringReport>("/reports/monitoring")
      .then((response) => setData(response.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 print:bg-white print:p-0">
      <section className="mx-auto max-w-6xl space-y-4 print:max-w-none">
        <div className="print:hidden">
          <AdminHeader
            title="Monitoramento e pendências"
            description="Situação das entidades conforme a rotina configurada."
            backTo="/reports"
            backLabel="Voltar para relatórios"
          />
        </div>

        {data && (
          <ReportPrintHeader
            title="Relatório de monitoramento e pendências"
            total={data.total}
          />
        )}

        <div className="flex justify-end print:hidden">
          {data && <PrintButton />}
        </div>

        {loading ? (
          <p className="text-sm text-slate-600">Carregando relatório...</p>
        ) : data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 shadow-sm print:rounded-none print:shadow-none">
                <p className="text-sm text-slate-500">Entidades ativas</p>
                <p className="mt-2 text-3xl font-black">{data.total}</p>
              </div>
              <div className="rounded-2xl bg-red-800 p-5 text-white shadow-sm print:rounded-none print:border print:border-slate-300 print:bg-white print:text-slate-950 print:shadow-none">
                <p className="text-sm">Fora da rotina</p>
                <p className="mt-2 text-3xl font-black">{data.pendingCount}</p>
              </div>
            </div>

            <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl bg-white shadow-sm print:rounded-none print:border print:border-slate-300 print:shadow-none">
              {data.entities.map((entity) => (
                <div
                  key={entity.id}
                  className="grid gap-2 p-4 text-sm md:grid-cols-[1fr_1fr_1.4fr] print:grid-cols-[1fr_1fr_1.4fr] print:break-inside-avoid"
                >
                  <div>
                    <Link
                      to={`/entities/${entity.slug}`}
                      className="font-bold text-emerald-700 print:text-slate-950"
                    >
                      {entity.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {entity.sector || entity.type}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      {FREQUENCY_LABELS[entity.frequencyType]}
                    </p>
                    <p className="text-xs text-slate-500">
                      {describeMonitoringRule(entity)}
                    </p>
                  </div>
                  <div>
                    <p
                      className={
                        entity.monitoringStatus.status === "PENDING"
                          ? "font-bold text-red-700"
                          : entity.monitoringStatus.status === "OK"
                            ? "font-bold text-green-700"
                            : "font-bold text-slate-600"
                      }
                    >
                      {entity.monitoringStatus.label}
                    </p>
                    <p className="text-xs text-slate-600">
                      {entity.monitoringStatus.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <ReportPrintFooter />
          </>
        ) : null}
      </section>
    </main>
  );
}
