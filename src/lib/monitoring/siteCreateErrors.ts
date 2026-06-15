/** User-facing copy for Supabase site insert failures. */
export function mapSiteCreateError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('permission denied for function current_company_id')) {
    return 'Site creation is blocked by a server permission issue. Deploy the latest database migration (fix RLS helper grants), then try again.';
  }

  if (
    lower.includes('row-level security') ||
    lower.includes('violates row-level security') ||
    lower.includes('is_company_admin')
  ) {
    return 'Only company administrators can create sites. Ask your admin to add this site or upgrade your role.';
  }

  return message;
}
