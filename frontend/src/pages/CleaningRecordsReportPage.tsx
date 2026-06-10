import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

function getTodayDate() {
    return new Date().toISOString().slice(0, 10);
}

export function CleaningRecordsReportPage() {
    const [startDate, setStartDate] = useState(getTodayDate());
    const [endDate, setEndDate] = useState(getTodayDate());

    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadReport() {
        try {
            setLoading(true);
            setError("");

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start > end) {
                setError("A data inicial não pode ser maior que a data final.");
                return;
            }
            const response = await api.get("/reports/cleaning-records", {
                params: {
                    startDate,
                    endDate,
                },
            });

            setData(response.data);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Não foi possível carregar o relatório.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadReport();
    }, []);

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-5">
            <section className="mx-auto max-w-6xl space-y-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <Link to="/" className="text-sm font-semibold text-blue-700">
                        ← Voltar ao dashboard
                    </Link>

                    <h1 className="mt-3 text-2xl font-black text-slate-950">
                        Relatório de limpezas
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Consulte registros de higienização por período.
                    </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                        <div>
                            <label className="text-sm font-semibold text-slate-800">
                                Data inicial
                            </label>

                            <input
                                type="date"
                                value={startDate}
                                onChange={(event) => setStartDate(event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-800">
                                Data final
                            </label>

                            <input
                                type="date"
                                value={endDate}
                                onChange={(event) => setEndDate(event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={loadReport}
                                disabled={loading}
                                className="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
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
                            <div className="flex items-center justify-between gap-3">
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
                                                        className="font-bold text-blue-700"
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
                    </>
                )}
            </section>
        </main>
    );
}