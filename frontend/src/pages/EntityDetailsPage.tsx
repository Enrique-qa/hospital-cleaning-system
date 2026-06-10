import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { API_BASE_URL, api } from "../services/api";

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
};

type CleaningRecord = {
  id: number;
  employeeNameTyped: string;
  cleanedAt: string;
  employee: {
    id: number;
    name: string;
  };
};

export function EntityDetailsPage() {
  const { slug } = useParams();

  const [entity, setEntity] = useState<CleaningEntity | null>(null);
  const [records, setRecords] = useState<CleaningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    async function loadData() {
      const response = await api.get(`/cleaning-records/entity/${slug}`);
      setEntity(response.data.entity);
      setRecords(response.data.records);
      setLoading(false);
    }

    if (slug) loadData();
  }, [slug]);

  const cleaningPageUrl = useMemo(() => {
    if (!entity) return "";

    return `${window.location.origin}/cleaning/${entity.slug}`;
  }, [entity]);

  useEffect(() => {
    async function generateQrCode() {
      if (!cleaningPageUrl) return;

      const qrCode = await QRCode.toDataURL(cleaningPageUrl, {
        width: 320,
        margin: 2,
      });

      setQrCodeUrl(qrCode);
    }

    generateQrCode();
  }, [cleaningPageUrl]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-6">
        <p className="text-sm text-slate-600">Carregando entidade...</p>
      </main>
    );
  }

  if (!entity) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-6">
        <p className="text-sm text-slate-600">Entidade não encontrada.</p>
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

  function getImageSrc(imageUrl?: string | null) {
    if (!imageUrl) return "";

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return `${API_BASE_URL}${imageUrl}`;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5">
      <section className="mx-auto max-w-5xl space-y-4">
        <Link
          to="/entities"
          className="inline-flex text-sm font-semibold text-emerald-700"
        >
          ← Voltar para entidades
        </Link>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {entity.imageUrl ? (
            <img
              src={getImageSrc(entity.imageUrl)}
              alt={entity.name}
              className="h-56 w-full object-cover"
            />
          ) : (
            <div className="flex h-40 items-center justify-center bg-emerald-50 text-sm font-medium text-emerald-800">
              Sem imagem cadastrada
            </div>
          )}

          <div className="p-5">
            <div className="grid gap-6 md:grid-cols-[1fr_260px]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Página da entidade
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-950">
                  {entity.name}
                </h1>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {entity.type === "AMBIENTE" ? "Ambiente" : "Equipamento"}
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
                  <p className="mt-4 text-sm leading-relaxed text-slate-700">
                    {entity.description}
                  </p>
                )}

                <div className="mt-5">
                  <Link
                    to={`/cleaning/${entity.slug}`}
                    className="inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Abrir página de limpeza
                  </Link>

                  <Link
                    to={`/entities/${entity.slug}/edit`}
                    className="inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Editar entidade
                  </Link>

                  <Link
                    to={`/entities/${entity.slug}/qr-print`}
                    className="ml-2 inline-flex rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700"
                  >
                    Imprimir etiqueta
                  </Link>
                </div>
              </div>

              {qrCodeUrl && (
                <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <img
                    src={qrCodeUrl}
                    alt={`QR Code de ${entity.name}`}
                    className="h-44 w-44"
                  />

                  <p className="mt-3 break-all text-center text-xs text-slate-600">
                    {cleaningPageUrl}
                  </p>

                  <a
                    href={qrCodeUrl}
                    download={`qr-code-${entity.slug}.png`}
                    className="mt-3 inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Baixar PNG
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">
              Passo a passo
            </h2>

            <ol className="mt-4 space-y-3">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">
                Produtos utilizados
              </h2>

              {products.length === 0 ? (
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  Nenhum produto informado.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {products.map((product, index) => (
                    <li key={index} className="flex gap-2 text-sm text-slate-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
                      <span>{product}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">
                Frequência
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {entity.frequency || "Nenhuma frequência informada."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-950">
              Histórico de limpezas
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {records.length} registros
            </span>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            {records.length === 0 ? (
              <p className="p-4 text-sm text-slate-600">
                Nenhuma limpeza registrada.
              </p>
            ) : (
              <div className="divide-y divide-slate-200">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="grid gap-1 p-4 text-sm md:grid-cols-3"
                  >
                    <span className="font-medium text-slate-900">
                      {record.employee.name}
                    </span>

                    <span className="text-slate-600">
                      Digitado: {record.employeeNameTyped}
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
      </section>
    </main>
  );
}
