export const ADMIN_EMAILS: readonly string[] = [
  'sukrat.kaushik@gmail.com',
  'kaushiksukrat@gmail.com',
  'sukrat.kaushik@ourpregnancy.in'
];

export const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};
