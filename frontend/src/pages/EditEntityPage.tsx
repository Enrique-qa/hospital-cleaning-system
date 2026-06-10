import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, api } from "../services/api";
import { uploadEntityImage } from "../services/uploadEntityImage";

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

export function EditEntityPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [entity, setEntity] = useState<CleaningEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    async function loadEntity() {
      try {
        const response = await api.get(`/cleaning-entities/slug/${slug}`);
        setEntity(response.data);
      } catch {
        setError("Não foi possível carregar a entidade.");
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadEntity();
  }, [slug]);

  useEffect(() => {
    async function handlePaste(event: ClipboardEvent) {
      const items = event.clipboardData?.items;

      if (!items) return;

      for (const item of Array.from(items)) {
        if (!item.type.startsWith("image/")) continue;

        const file = item.getAsFile();

        if (!file) continue;

        await handleImageUpload(file);
        break;
      }
    }

    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [entity]);

  function updateField(field: keyof CleaningEntity, value: string | boolean) {
    setEntity((current) => {
      if (!current) return current;

      return {
        ...current,
        [field]: value,
      };
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!entity) return;

    if (!entity.name.trim() || !entity.type.trim() || !entity.cleaningSteps.trim()) {
      setError("Nome, tipo e passo a passo são obrigatórios.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.put(`/cleaning-entities/${entity.id}`, {
        name: entity.name,
        type: entity.type,
        sector: entity.sector || null,
        location: entity.location || null,
        imageUrl: entity.imageUrl || null,
        description: entity.description || null,
        products: entity.products || null,
        frequency: entity.frequency || null,
        cleaningSteps: entity.cleaningSteps,
        active: entity.active,
      });

      navigate(`/entities/${entity.slug}`, { replace: true });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Não foi possível salvar alterações.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-5">
        <p className="text-sm text-slate-600">Carregando edição...</p>
      </main>
    );
  }

  if (!entity) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-5">
        <p className="text-sm text-red-700">
          Entidade não encontrada.
        </p>
      </main>
    );
  }

  function getImageSrc(imageUrl?: string | null) {
    if (!imageUrl) return "";

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return `${API_BASE_URL}${imageUrl}`;
  }

  async function handleImageUpload(file: File) {
    try {
      setImageUploading(true);

      const imageUrl = await uploadEntityImage(file);

      updateField("imageUrl", imageUrl);
    } catch {
      setError("Não foi possível enviar a imagem.");
    } finally {
      setImageUploading(false);
    }
  }

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    await handleImageUpload(file);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5">
      <section className="mx-auto max-w-4xl space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <Link
            to={`/entities/${entity.slug}`}
            className="text-sm font-semibold text-blue-700"
          >
            ← Voltar para entidade
          </Link>

          <h1 className="mt-3 text-2xl font-black text-slate-950">
            Editar entidade
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Atualize as informações do ambiente ou equipamento.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-5 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-800">
                Nome
              </label>

              <input
                value={entity.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800">
                Tipo
              </label>

              <select
                value={entity.type}
                onChange={(event) => updateField("type", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              >
                <option value="AMBIENTE">Ambiente</option>
                <option value="EQUIPAMENTO">Equipamento</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800">
                Status
              </label>

              <select
                value={entity.active ? "true" : "false"}
                onChange={(event) =>
                  updateField("active", event.target.value === "true")
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              >
                <option value="true">Ativa</option>
                <option value="false">Inativa</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800">
                Setor
              </label>

              <input
                value={entity.sector || ""}
                onChange={(event) => updateField("sector", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800">
                Localização
              </label>

              <input
                value={entity.location || ""}
                onChange={(event) =>
                  updateField("location", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-800">
                Imagem da entidade
              </label>

              <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />

                <p className="mt-3 text-xs text-slate-500">
                  Se preferir, copie uma imagem e pressione CTRL + V nesta página.
                </p>

                {imageUploading && (
                  <p className="mt-3 text-sm font-semibold text-blue-700">
                    Enviando imagem...
                  </p>
                )}

                {entity.imageUrl && (
                  <img
                    src={getImageSrc(entity.imageUrl)}
                    alt="Preview da entidade"
                    className="mt-4 h-56 w-full rounded-xl border border-slate-200 object-cover"
                  />
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-800">
                Descrição
              </label>

              <textarea
                value={entity.description || ""}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={3}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800">
                Produtos utilizados
              </label>

              <textarea
                value={entity.products || ""}
                onChange={(event) =>
                  updateField("products", event.target.value)
                }
                rows={6}
                placeholder={"Álcool 70%\nDetergente neutro\nDesinfetante hospitalar"}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800">
                Frequência
              </label>

              <textarea
                value={entity.frequency || ""}
                onChange={(event) =>
                  updateField("frequency", event.target.value)
                }
                rows={6}
                placeholder="Ex: Após cada atendimento"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-800">
                Passo a passo
              </label>

              <textarea
                value={entity.cleaningSteps}
                onChange={(event) =>
                  updateField("cleaningSteps", event.target.value)
                }
                rows={8}
                placeholder={"Recolher resíduos\nHigienizar superfícies\nFinalizar conforme POP"}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Link
              to={`/entities/${entity.slug}`}
              className="rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
