import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { api } from "../services/api";

type CleaningEntity = {
  id: number;
  name: string;
  slug: string;
  type: string;
  sector?: string | null;
  location?: string | null;
};

export function QrPrintPage() {
  const { slug } = useParams();

  const [entity, setEntity] = useState<CleaningEntity | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    async function loadEntity() {
      const response = await api.get(`/cleaning-entities/slug/${slug}`);
      setEntity(response.data);
    }

    if (slug) loadEntity();
  }, [slug]);

  const cleaningPageUrl = useMemo(() => {
    if (!entity) return "";

    return `${window.location.origin}/cleaning/${entity.slug}`;
  }, [entity]);

  useEffect(() => {
    async function generateQrCode() {
      if (!cleaningPageUrl) return;

      const qrCode = await QRCode.toDataURL(cleaningPageUrl, {
        width: 420,
        margin: 1,
      });

      setQrCodeUrl(qrCode);
    }

    generateQrCode();
  }, [cleaningPageUrl]);

  if (!entity) {
    return (
      <main className="min-h-screen bg-white p-4">
        <p>Carregando etiqueta...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-100 p-3 sm:p-6 print:overflow-visible print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-md flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Link
          to={`/entities/${entity.slug}`}
          className="text-sm font-semibold text-emerald-700"
        >
          ← Voltar para entidade
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          className="w-full rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white sm:w-auto"
        >
          Imprimir etiqueta
        </button>
      </div>

      <section className="mx-auto flex h-[7cm] w-[10cm] max-w-full flex-col justify-between border-2 border-black bg-white p-[0.35cm] text-center shadow-sm print:max-w-none print:shadow-none">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">
            Hospital São Lucas
          </p>

          <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-slate-500">
            Controle de Higienização
          </p>

          <h1 className="mt-1 line-clamp-2 text-[16px] font-extrabold leading-tight text-slate-950">
            {entity.name}
          </h1>

          <p className="mt-1 text-[9px] text-slate-600">
            {entity.type === "AMBIENTE" ? "Ambiente" : "Equipamento"}
            {entity.sector ? ` • ${entity.sector}` : ""}
            {entity.location ? ` • ${entity.location}` : ""}
          </p>
        </div>

        {qrCodeUrl && (
          <div className="flex justify-center">
            <img
              src={qrCodeUrl}
              alt={`QR Code de ${entity.name}`}
              className="h-[3.15cm] w-[3.15cm]"
            />
          </div>
        )}

        <div>
          <p className="text-[10px] font-semibold text-slate-800">
            Escaneie para registrar a limpeza
          </p>

          <p className="mt-0.5 break-all text-[7px] leading-tight text-slate-500">
            {cleaningPageUrl}
          </p>
        </div>
      </section>
    </main>
  );
}
