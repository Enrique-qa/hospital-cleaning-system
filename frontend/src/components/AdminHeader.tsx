import type { ReactNode } from "react";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import hospitalLogo from "../assets/logo-hospital.png";
import { getUserRoleLabel } from "../utils/userRole";

type AdminHeaderProps = {
  title: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
};

export function AdminHeader({
  title,
  description,
  backTo,
  backLabel = "Voltar",
  actions,
}: AdminHeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    signOut();
    navigate("/login", { replace: true });
  }

  return (
    <header className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left">
          {backTo && (
            <Link
              to={backTo}
              className="mb-4 inline-flex text-sm font-semibold text-emerald-700"
            >
              ← {backLabel}
            </Link>
          )}

          <img
            src={hospitalLogo}
            alt="Hospital São Lucas"
            className="mx-auto h-12 w-auto md:mx-0"
          />

          <p className="mt-2 text-sm font-medium text-slate-500">
            Controle de Higienização
          </p>

          <h1 className="mt-4 text-2xl font-black text-slate-950 sm:text-3xl">
            {title}
          </h1>

          {description && (
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              {description}
            </p>
          )}

          {actions && <div className="mt-4">{actions}</div>}
        </div>

        <div className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:w-auto md:min-w-72">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <User className="h-5 w-5 text-emerald-700" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">
              {user?.name}
            </p>

            <p className="text-xs font-semibold text-slate-500">
              {getUserRoleLabel(user?.role)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
