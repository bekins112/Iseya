export const DEFAULT_ROLE_COLOR = "#64748b";

export function isValidHex(c: string | null | undefined): c is string {
  return typeof c === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c);
}

export function resolveRoleColor(color: string | null | undefined): string {
  return isValidHex(color) ? color : DEFAULT_ROLE_COLOR;
}

interface RoleColorDotProps {
  color?: string | null;
  className?: string;
  size?: "sm" | "md";
  title?: string;
  "data-testid"?: string;
}

export function RoleColorDot({
  color,
  className,
  size = "sm",
  title,
  ...rest
}: RoleColorDotProps) {
  const sizeCls = size === "md" ? "w-3 h-3" : "w-2.5 h-2.5";
  return (
    <span
      aria-hidden="true"
      title={title}
      className={`inline-block ${sizeCls} rounded-full border border-border shrink-0 ${className ?? ""}`}
      style={{ backgroundColor: resolveRoleColor(color) }}
      data-testid={rest["data-testid"]}
    />
  );
}
