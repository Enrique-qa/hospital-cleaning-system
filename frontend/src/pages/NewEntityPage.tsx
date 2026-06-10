import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL, api } from "../services/api";
import { uploadEntityImage } from "../services/uploadEntityImage";

const initialForm = {
    name: "",
    type: "AMBIENTE",
    sector: "",
    location: "",
    description: "",
    products: "",
    frequency: "",
    cleaningSteps: "",
    imageUrl: "",
};

const initialProducts = [""];
const initialSteps = [""];

export function NewEntityPage() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [imageUploading, setImageUploading] = useState(false);

    const [productsList, setProductsList] = useState(initialProducts);
    const [stepsList, setStepsList] = useState(initialSteps);

    function updateForm(field: keyof typeof initialForm, value: string) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }
    function updateProduct(index: number, value: string) {
        setProductsList((current) =>
            current.map((item, itemIndex) => (itemIndex === index ? value : item))
        );
    }

    function addProduct() {
        setProductsList((current) => [...current, ""]);
    }

    function removeProduct(index: number) {
        setProductsList((current) => {
            if (current.length === 1) return current;
            return current.filter((_, itemIndex) => itemIndex !== index);
        });
    }

    function updateStep(index: number, value: string) {
        setStepsList((current) =>
            current.map((item, itemIndex) => (itemIndex === index ? value : item))
        );
    }

    function addStep() {
        setStepsList((current) => [...current, ""]);
    }

    function removeStep(index: number) {
        setStepsList((current) => {
            if (current.length === 1) return current;
            return current.filter((_, itemIndex) => itemIndex !== index);
        });
    }

    function nextStep() {
        setError("");

        const validSteps = stepsList.map((item) => item.trim()).filter(Boolean);

        if (step === 2 && validSteps.length === 0) {
            setError("Informe pelo menos uma etapa da limpeza.");
            return;
        }

        setStep((current) => current + 1);
    }

    function previousStep() {
        setError("");
        setStep((current) => current - 1);
    }

    async function handleSubmit() {
        setError("");

        const productsText = productsList
            .map((item) => item.trim())
            .filter(Boolean)
            .join("\n");

        const stepsText = stepsList
            .map((item) => item.trim())
            .filter(Boolean)
            .join("\n");

        try {
            setSaving(true);

            const response = await api.post("/cleaning-entities", {
                name: form.name,
                type: form.type,
                sector: form.sector || null,
                location: form.location || null,
                description: form.description || null,
                products: productsText || null,
                frequency: form.frequency || null,
                cleaningSteps: stepsText,
                imageUrl: form.imageUrl || null,
            });

            navigate(`/entities/${response.data.slug}`);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Não foi possível cadastrar.";
            setError(message);
        } finally {
            setSaving(false);
        }
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

            updateForm("imageUrl" as keyof typeof initialForm, imageUrl);
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
    }, []);

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-5">
            <section className="mx-auto max-w-3xl space-y-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <Link
                        to="/entities"
                        className="text-sm font-semibold text-blue-700"
                    >
                        ← Voltar para entidades
                    </Link>

                    <h1 className="mt-3 text-2xl font-bold text-slate-950">
                        Nova entidade
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Cadastre um ambiente ou equipamento que terá controle de limpeza por QR Code.
                    </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((item) => (
                            <div key={item}>
                                <div
                                    className={
                                        item <= step
                                            ? "h-2 rounded-full bg-blue-700"
                                            : "h-2 rounded-full bg-slate-200"
                                    }
                                />

                                <p
                                    className={
                                        item <= step
                                            ? "mt-2 text-xs font-semibold text-blue-700"
                                            : "mt-2 text-xs font-semibold text-slate-400"
                                    }
                                >
                                    {item === 1 && "Informações"}
                                    {item === 2 && "Padronização"}
                                    {item === 3 && "Revisão"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    {step === 1 && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-950">
                                Informações gerais
                            </h2>

                            <div className="mt-4 grid gap-3">
                                <input
                                    value={form.name}
                                    onChange={(event) => updateForm("name", event.target.value)}
                                    placeholder="Nome da entidade"
                                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                                />

                                <select
                                    value={form.type}
                                    onChange={(event) => updateForm("type", event.target.value)}
                                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="AMBIENTE">Ambiente</option>
                                    <option value="EQUIPAMENTO">Equipamento</option>
                                </select>

                                <input
                                    value={form.sector}
                                    onChange={(event) => updateForm("sector", event.target.value)}
                                    placeholder="Setor"
                                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                                />

                                <input
                                    value={form.location}
                                    onChange={(event) =>
                                        updateForm("location", event.target.value)
                                    }
                                    placeholder="Localização"
                                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                                />

                                <textarea
                                    value={form.description}
                                    onChange={(event) =>
                                        updateForm("description", event.target.value)
                                    }
                                    placeholder="Descrição"
                                    rows={3}
                                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                                />

                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                                    <label className="text-sm font-semibold text-slate-800">
                                        Imagem da entidade
                                    </label>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                                    />

                                    <p className="mt-3 text-xs text-slate-500">
                                        Se preferir, copie uma imagem e pressione CTRL + V nesta página.
                                    </p>

                                    {imageUploading && (
                                        <p className="mt-3 text-sm font-semibold text-blue-700">
                                            Enviando imagem...
                                        </p>
                                    )}

                                    {form.imageUrl && (
                                        <img
                                            src={getImageSrc(form.imageUrl)}
                                            alt="Preview da entidade"
                                            className="mt-4 h-56 w-full rounded-xl border border-slate-200 object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-950">
                                Padronização da limpeza
                            </h2>

                            <div className="mt-4 grid gap-3">
                                <div>
                                    <label className="text-sm font-semibold text-slate-800">
                                        Produtos utilizados
                                    </label>

                                    <div className="mt-2 space-y-2">
                                        {productsList.map((product, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    value={product}
                                                    onChange={(event) => updateProduct(index, event.target.value)}
                                                    placeholder={`Produto ${index + 1}`}
                                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => removeProduct(index)}
                                                    className="rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-600"
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addProduct}
                                        className="mt-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700"
                                    >
                                        + Adicionar produto
                                    </button>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-800">
                                        Frequência
                                    </label>

                                    <input
                                        value={form.frequency}
                                        onChange={(event) => updateForm("frequency", event.target.value)}
                                        placeholder="Diário, semanal, 2x ao dia....."
                                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-800">
                                        Passo a passo da limpeza
                                    </label>

                                    <div className="mt-2 space-y-2">
                                        {stepsList.map((stepItem, index) => (
                                            <div key={index} className="flex gap-2">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-sm font-bold text-white">
                                                    {index + 1}
                                                </div>

                                                <input
                                                    value={stepItem}
                                                    onChange={(event) => updateStep(index, event.target.value)}
                                                    placeholder={`Etapa ${index + 1}`}
                                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => removeStep(index)}
                                                    className="rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-600"
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addStep}
                                        className="mt-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700"
                                    >
                                        + Adicionar etapa
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-950">
                                Revisão do cadastro
                            </h2>

                            <div className="mt-4 space-y-3 text-sm">
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                        Nome
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-950">
                                        {form.name || "Não informado"}
                                    </p>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase text-slate-500">
                                            Tipo
                                        </p>
                                        <p className="mt-1 text-slate-800">
                                            {form.type === "AMBIENTE" ? "Ambiente" : "Equipamento"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase text-slate-500">
                                            Setor
                                        </p>
                                        <p className="mt-1 text-slate-800">
                                            {form.sector || "Não informado"}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                        Localização
                                    </p>
                                    <p className="mt-1 text-slate-800">
                                        {form.location || "Não informado"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                        Produtos
                                    </p>
                                    <p className="mt-1 text-slate-800">
                                        {productsList.map((item) => item.trim()).filter(Boolean).join(", ") ||
                                            "Não informado"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                        Frequência
                                    </p>
                                    <p className="mt-1 text-slate-800">
                                        {form.frequency || "Não informado"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                        Passo a passo
                                    </p>
                                    <p className="mt-1 whitespace-pre-line text-slate-800">
                                        {stepsList
                                            .map((item, index) => {
                                                const text = item.trim();
                                                return text ? `${index + 1}. ${text}` : "";
                                            })
                                            .filter(Boolean)
                                            .join("\n") || "Não informado"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    <div className="mt-5 flex justify-between gap-3">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={previousStep}
                                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
                            >
                                Voltar
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white"
                            >
                                Próximo
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={saving}
                                className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                            >
                                {saving ? "Cadastrando..." : "Cadastrar entidade"}
                            </button>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}