import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { AdminHeader } from "../components/AdminHeader";
import {
    PrintButton,
    ReportPrintFooter,
    ReportPrintHeader,
} from "../components/ReportPrint";
import { api } from "../services/api";

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
    startDate: string;
    endDate: string;
    total: number;
    records: CleaningRecord[];
};

function getErrorMessage(error: unknown, fallback: string) {
    return (
        (error as AxiosError<{ message?: string }>).response?.data?.message ||
        fallback
    );
}

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function CleaningRecordsReportPage() {
    const [startDate, setStartDate] = useState(getTodayDate());
    const [endDate, setEndDate] = useState(getTodayDate());

    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadReport() {
        try {
            setLoading(true);
            setError("");

            if (!startDate || !endDate) {
                setError("Informe a data inicial e a data final.");
                return;
            }

            if (startDate > endDate) {
                setError("A data inicial não pode ser maior que a data final.");
                return;
            }
            const response = await api.get<ReportData>("/reports/cleaning-records", {
                params: {
                    startDate,
                    endDate,
                },
            });

            setData(response.data);
        } catch (error) {
            setError(
                getErrorMessage(error, "Não foi possível carregar o relatório.")
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const today = getTodayDate();

        api.get<ReportData>("/reports/cleaning-records", {
            params: {
                startDate: today,
                endDate: today,
            },
        })
            .then((response) => setData(response.data))
            .catch((error) =>
                setError(
                    getErrorMessage(error, "Não foi possível carregar o relatório.")
                )
            )
            .finally(() => setLoading(false));
    }, []);

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-5 print:bg-white print:p-0">
            <section className="mx-auto max-w-6xl space-y-4 print:max-w-none">
                <div className="print:hidden">
                    <AdminHeader
                        title="Relatório de limpezas"
                        description="Consulte registros de higienização por período."
                        backTo="/reports"
                        backLabel="Voltar para relatórios"
                    />
                </div>

                {data && (
                    <ReportPrintHeader
                        title="Relatório de limpezas por período"
                        period={`${new Date(`${data.startDate}T00:00:00`).toLocaleDateString("pt-BR")} a ${new Date(`${data.endDate}T00:00:00`).toLocaleDateString("pt-BR")}`}
                        total={data.total}
                    />
                )}

                <div className="rounded-2xl bg-white p-5 shadow-sm print:hidden">
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                        <div>
                            <label className="text-sm font-semibold text-slate-800">
                                Data inicial
                            </label>

                            <input
                                type="date"
                                required
                                value={startDate}
                                onChange={(event) => setStartDate(event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-800">
                                Data final
                            </label>

                            <input
                                type="date"
                                required
                                value={endDate}
                                onChange={(event) => setEndDate(event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={loadReport}
                                disabled={loading}
                                className="w-full rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                            >
                                {loading ? "Buscando..." : "Buscar"}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </p>
                    )}
                </div>

                {data && (
                    <>
                        <div className="flex justify-end print:hidden">
                            <PrintButton />
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <p className="text-sm text-slate-500">Total de registros</p>
                                <p className="mt-2 text-4xl font-black text-slate-950">
                                    {data.total}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <p className="text-sm text-slate-500">Data inicial</p>
                                <p className="mt-2 text-xl font-black text-slate-950">
                                    {new Date(`${data.startDate}T00:00:00`).toLocaleDateString(
                                        "pt-BR"
                                    )}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <p className="text-sm text-slate-500">Data final</p>
                                <p className="mt-2 text-xl font-black text-slate-950">
                                    {new Date(`${data.endDate}T00:00:00`).toLocaleDateString(
                                        "pt-BR"
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                                <h2 className="text-lg font-black text-slate-950">
                                    Registros encontrados
                                </h2>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                    {data.records.length} registros
                                </span>
                            </div>

                            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                                {data.records.length === 0 ? (
                                    <p className="p-4 text-sm text-slate-600">
                                        Nenhum registro encontrado no período.
                                    </p>
                                ) : (
                                    <div className="divide-y divide-slate-200">
                                        {data.records.map((record) => (
                                            <div
                                                key={record.id}
                                                className="grid gap-2 p-4 text-sm transition hover:bg-slate-50 md:grid-cols-[1fr_1fr_auto]"
                                            >
                                                <div>
                                                    <Link
                                                        to={`/entities/${record.entity.slug}`}
                                                        className="font-bold text-emerald-700"
                                                    >
                                                        {record.entity.name}
                                                    </Link>

                                                    <p className="mt-1 text-xs text-slate-600">
                                                        {record.entity.type === "AMBIENTE"
                                                            ? "Ambiente"
                                                            : "Equipamento"}
                                                        {record.entity.sector
                                                            ? ` • ${record.entity.sector}`
                                                            : ""}
                                                        {record.entity.location
                                                            ? ` • ${record.entity.location}`
                                                            : ""}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {record.employee.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-600">
                                                        Código: {record.employee.employeeCode || "—"} •
                                                        Digitado: {record.employeeNameTyped}
                                                    </p>
                                                </div>

                                                <span className="text-slate-600 md:text-right">
                                                    {new Date(record.cleanedAt).toLocaleString("pt-BR")}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <ReportPrintFooter />
                    </>
                )}
            </section>
        </main>
    );
}
