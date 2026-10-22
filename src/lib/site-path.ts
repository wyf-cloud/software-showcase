export const siteBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withSiteBasePath(value: string) {
  if (!value || /^(?:https?:|mailto:|tel:|#|data:|\/\/)/i.test(value)) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${siteBasePath}${path}` || "/";
}
