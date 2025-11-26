import { Session } from "next-auth";

type Role = "OPERATOR" | "ADMINISTRATOR";
type Resource = "flash" | "event" | "bilstatus" | "vaktplan" | "bonfire" | "audit" | "users";
type Action = "create" | "read" | "update" | "delete";

const permissions: Record<Role, Record<Resource, Action[]>> = {
  OPERATOR: {
    flash: ["create", "read", "delete"],
    event: ["create", "read", "update", "delete"],
    bilstatus: ["read", "update"],
    vaktplan: ["read", "update", "delete"],
    bonfire: ["create", "read", "update"],
    audit: [],
    users: [],
  },
  ADMINISTRATOR: {
    flash: ["create", "read", "delete"],
    event: ["create", "read", "update", "delete"],
    bilstatus: ["read", "update"],
    vaktplan: ["create", "read", "update", "delete"],
    bonfire: ["create", "read", "update", "delete"],
    audit: ["read"],
    users: ["create", "read", "update", "delete"],
  },
};

export function authorize(
  session: Session | null,
  resource: Resource,
  action: Action
): boolean {
  if (!session?.user?.role) return false;

  const role = session.user.role as Role;
  const allowedActions = permissions[role]?.[resource] ?? [];

  return allowedActions.includes(action);
}

export function requireRole(session: Session | null, roles: Role[]): boolean {
  if (!session?.user?.role) return false;
  return roles.includes(session.user.role as Role);
}

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "ADMINISTRATOR";
}

export function isOperator(session: Session | null): boolean {
  return session?.user?.role === "OPERATOR" || session?.user?.role === "ADMINISTRATOR";
}
