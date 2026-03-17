import type { Country, Role } from "@prisma/client";

interface RoleBadgeProps {
  role: Role;
  country?: Country | null;
}

const roleStyles: Record<Role, string> = {
  ADMIN: "bg-rose-100 text-rose-800 border-rose-300",
  MANAGER: "bg-amber-100 text-amber-800 border-amber-300",
  MEMBER: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export default function RoleBadge({ role, country }: RoleBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${roleStyles[role]}`}>{role}</span>
      {country ? (
        <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {country}
        </span>
      ) : null}
    </div>
  );
}
