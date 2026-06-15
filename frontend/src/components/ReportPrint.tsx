import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white"
    >
      <Printer size={17} />
      Imprimir / Salvar PDF
    </button>
  );
}

export function ReportPrintHeader({
  title,
  period,
  total,
}: {
  title: string;
  period?: string;
  total?: number;
}) {
  return (
    <header className="hidden border-b-2 border-slate-900 pb-4 print:block">
      <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
        Hospital São Lucas
      </p>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        Controle de Higienização
      </p>
      <h1 className="mt-3 text-xl font-black text-slate-950">{title}</h1>
      <div className="mt-2 flex justify-between text-xs text-slate-600">
        <span>{period || "Situação atual"}</span>
        <span>
          Emissão: {new Date().toLocaleString("pt-BR")}
          {total !== undefined ? ` • Total: ${total}` : ""}
        </span>
      </div>
    </header>
  );
}

export function ReportPrintFooter() {
  return (
    <footer className="mt-6 hidden border-t border-slate-400 pt-2 text-center text-[10px] text-slate-500 print:block">
      Documento gerado pelo sistema interno de controle de higienização.
    </footer>
  );
}
