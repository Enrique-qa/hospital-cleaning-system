import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

type CleaningEntity = {
  id: number;
  name: string;
  slug: string;
  type: string;
  sector?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  cleaningSteps: string;
  products?: string | null;
  frequency?: string | null;
  active: boolean;

  lastCleaningRecord?: {
    id: number;
    cleanedAt: string;
    employeeNameTyped: string;
    employee: {
      id: number;
      name: string;
      employeeCode?: string | null;
    };
  } | null;
};

export function EntitiesPage() {
  const [entities, setEntities] = useState<CleaningEntity[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadEntities() {
    const response = await api.get("/cleaning-entities");
    setEntities(response.data);
    setLoading(false);
  }

  useEffect(() => {
    loadEntities();
  }, []);

  const filteredEntities = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return entities;

    return entities.filter((entity) => {
      const text = [
        entity.name,
        entity.type,
        entity.sector,
        entity.location,
        entity.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(term);
    });
  }, [entities, search]);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5">
      <section className="mx-auto max-w-5xl space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <Link to="/" className="text-sm font-semibold text-emerald-700">
            ← Voltar ao dashboard
          </Link>

          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Gestão
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-950">
                Entidades de limpeza
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                Consulte ambientes e equipamentos cadastrados no sistema.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                to="/entities/qr-report"
                className="rounded-xl border border-emerald-200 px-4 py-3 text-center text-sm font-semibold text-emerald-700"
              >
                Relatório de QR Codes
              </Link>

              <Link
                to="/entities/new"
                className="rounded-xl bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Nova entidade
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Entidades cadastradas
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {filteredEntities.length} entidade(s) encontrada(s)
              </p>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, setor, tipo..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 md:max-w-xs"
            />
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-slate-600">Carregando...</p>
          ) : filteredEntities.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              Nenhuma entidade encontrada.
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              {filteredEntities.map((entity) => (
                <div
                  key={entity.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-bold text-slate-950">
                        {entity.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {entity.type === "AMBIENTE"
                            ? "Ambiente"
                            : "Equipamento"}
                        </span>

                        {entity.sector && (
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            {entity.sector}
                          </span>
                        )}

                        {entity.location && (
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            {entity.location}
                          </span>
                        )}

                        <span
                          className={
                            entity.active
                              ? "rounded-full bg-green-50 px-3 py-1 text-green-700"
                              : "rounded-full bg-red-50 px-3 py-1 text-red-700"
                          }
                        >
                          {entity.active ? "Ativa" : "Inativa"}
                        </span>
                      </div>

                      {entity.description && (
                        <p className="mt-3 text-sm text-slate-600">
                          {entity.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 md:items-end">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/entities/${entity.slug}`}
                          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          Abrir
                        </Link>

                        <Link
                          to={`/cleaning/${entity.slug}`}
                          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Página QR
                        </Link>
                      </div>

                      <div className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm md:min-w-56">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Última limpeza
                        </p>

                        {entity.lastCleaningRecord ? (
                          <>
                            <p className="mt-1 font-semibold text-slate-900">
                              {entity.lastCleaningRecord.employee.name}
                            </p>
                            <p className="text-slate-600">
                              {new Date(
                                entity.lastCleaningRecord.cleanedAt
                              ).toLocaleString("pt-BR")}
                            </p>
                          </>
                        ) : (
                          <p className="mt-1 text-slate-600">
                            Nenhum registro encontrado.
                          </p>
                        )}
                      </div>
                    </div>
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
