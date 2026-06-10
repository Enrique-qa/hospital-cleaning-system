import { LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function AdminHeader({ title }: { title: string }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    signOut();
    navigate("/login", { replace: true });
  }

  return (
    <header className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <p className="text-base font-extrabold uppercase tracking-[0.18em] text-blue-700">
            Hospital São Lucas
          </p>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Controle de Higienização
          </p>

          <h1 className="mt-5 text-3xl font-black text-slate-950">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
            <User className="h-5 w-5 text-blue-700" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {user?.name}
            </p>

            <p className="text-xs font-semibold text-slate-500">
              {user?.role}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="ml-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}