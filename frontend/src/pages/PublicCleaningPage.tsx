import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";

type CleaningEntity = {
  id: number;
  name: string;
  slug: string;
  type: string;
  sector?: string | null;
  location?: string | null;
  description?: string | null;
  cleaningSteps: string;
  products?: string | null;
  frequency?: string | null;
  active: boolean;
};

export function PublicCleaningPage() {
  const { slug } = useParams();

  const [entity, setEntity] = useState<CleaningEntity | null>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadEntity() {
      try {
        setLoading(true);

        const response = await api.get(`/cleaning-entities/slug/${slug}`);

        setEntity(response.data);
      } catch {
        setError("Não foi possível carregar as informações de limpeza.");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadEntity();
    }
  }, [slug]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!employeeName.trim()) {
      setError("Digite seu nome para registrar a limpeza.");
      return;
    }

    try {
      setSaving(true);

      await api.post(`/cleaning-records/public/${slug}`, {
        employeeName,
      });

      setSuccess("Limpeza registrada com sucesso.");
      setEmployeeName("");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Não foi possível registrar a limpeza.";

      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">Carregando instruções...</p>
        </div>
      </main>
    );
  }

  if (!entity) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-5 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            Item não encontrado
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Verifique se o QR Code está correto.
          </p>
        </div>
      </main>
    );
  }

  const steps = entity.cleaningSteps
    .split("\n")
    .map((step) => step.trim())
    .filter(Boolean);

  const products = entity.products
    ? entity.products
      .split("\n")
      .map((product) => product.trim())
      .filter(Boolean)
    : [];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-4">
      <section className="mx-auto max-w-md overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
            Registro de limpeza
          </p>

          <h1 className="mt-1 text-xl font-bold text-slate-950">
            {entity.name}
          </h1>

          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded-full bg-slate-100 px-2 py-1">
              {entity.type}
            </span>

            {entity.sector && (
              <span className="rounded-full bg-slate-100 px-2 py-1">
                {entity.sector}
              </span>
            )}

            {entity.location && (
              <span className="rounded-full bg-slate-100 px-2 py-1">
                {entity.location}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Passo a passo
          </h2>

          <ol className="mt-3 space-y-3">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-3 text-sm text-slate-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>

          {products.length > 0 && (
            <div className="mt-5 rounded-xl bg-blue-50 p-3">
              <h2 className="text-sm font-semibold text-blue-950">
                Produtos utilizados
              </h2>

              <ul className="mt-2 space-y-1">
                {products.map((product, index) => (
                  <li key={index} className="flex gap-2 text-sm text-blue-900">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700" />
                    <span>{product}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-200 p-5">
          <label className="text-sm font-medium text-slate-800">
            Nome da funcionária
          </label>

          <input
            value={employeeName}
            onChange={(event) => setEmployeeName(event.target.value)}
            placeholder="Digite seu nome completo"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          />

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

          <button
            type="submit"
            disabled={saving}
            className="mt-4 w-full rounded-xl bg-blue-700 px-4 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Registrando..." : "Registrar limpeza"}
          </button>

          <a
            href={`/entities/${entity.slug}`}
            className="mt-4 block text-center text-sm font-medium text-slate-500 underline"
          >
            Ver registros da entidade
          </a>
        </form>
      </section>
    </main>
  );
}