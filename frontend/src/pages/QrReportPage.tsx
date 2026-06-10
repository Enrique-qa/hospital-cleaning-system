import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { api } from "../services/api";

type CleaningEntity = {
  id: number;
  name: string;
  slug: string;
  type: string;
  sector?: string | null;
  location?: string | null;
  active: boolean;
};

type EntityWithQrCode = CleaningEntity & {
  qrCodeUrl: string;
  cleaningPageUrl: string;
};

export function QrReportPage() {
  const [entities, setEntities] = useState<CleaningEntity[]>([]);
  const [qrEntities, setQrEntities] = useState<EntityWithQrCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEntities() {
      const response = await api.get("/cleaning-entities");
      setEntities(response.data);
    }

    loadEntities();
  }, []);

  const activeEntities = useMemo(() => {
    return entities.filter((entity) => entity.active);
  }, [entities]);

  useEffect(() => {
    async function generateQrCodes() {
      if (activeEntities.length === 0) {
        setQrEntities([]);
        setLoading(false);
        return;
      }

      const generated = await Promise.all(
        activeEntities.map(async (entity) => {
          const cleaningPageUrl = `${window.location.origin}/cleaning/${entity.slug}`;

          const qrCodeUrl = await QRCode.toDataURL(cleaningPageUrl, {
            width: 420,
            margin: 1,
          });

          return {
            ...entity,
            cleaningPageUrl,
            qrCodeUrl,
          };
        })
      );

      setQrEntities(generated);
      setLoading(false);
    }

    generateQrCodes();
  }, [activeEntities]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-6">
        <p className="text-sm text-slate-600">
          Gerando relatório de QR Codes...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between gap-3 print:hidden">
        <Link
          to="/entities"
          className="text-sm font-semibold text-blue-700"
        >
          ← Voltar para entidades
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Imprimir todos
        </button>
      </div>

      <section className="mx-auto flex max-w-5xl flex-wrap gap-4 print:max-w-none print:gap-0">
        {qrEntities.map((entity) => (
          <article
            key={entity.id}
            className="flex h-[7cm] w-[10cm] flex-col justify-between border-2 border-black bg-white p-[0.35cm] text-center print:break-inside-avoid"
          >
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

            <div className="flex justify-center">
              <img
                src={entity.qrCodeUrl}
                alt={`QR Code de ${entity.name}`}
                className="h-[3.15cm] w-[3.15cm]"
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-800">
                Escaneie para registrar a limpeza
              </p>

              <p className="mt-0.5 break-all text-[7px] leading-tight text-slate-500">
                {entity.cleaningPageUrl}
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
