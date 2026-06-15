export type UserRole = "ADMIN" | "MANAGER";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gestor",
};

export function getUserRoleLabel(role?: UserRole | null) {
  return role ? USER_ROLE_LABELS[role] : "";
}
