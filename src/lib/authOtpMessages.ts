const INVALID_API_KEY_HELP =
  'Supabase anon key looks wrong. Use the JWT anon key (starts with eyJ) from Project Settings → API, not the publishable key.';

export function friendlySendError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid api key') || m.includes('invalid apikey')) {
    return INVALID_API_KEY_HELP;
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Too many attempts. Wait a minute and try again.';
  }
  if (m.includes('signup') && m.includes('disabled')) {
    return 'Email sign-up is disabled in Supabase. Enable the Email provider for your project.';
  }
  if (m.includes('invalid') && m.includes('email')) {
    return 'Enter a valid work email address.';
  }
  if (m.includes('smtp') || m.includes('mail')) {
    return 'Email could not be sent. Check Supabase Auth email settings (SMTP / templates).';
  }
  if (m.includes('email address not authorized') || m.includes('not authorized')) {
    return 'This email is not allowed for sign-in on this project. Check Supabase Auth allow-list settings.';
  }
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return 'This email already has an account. Use the same email and enter the new code we send.';
  }
  return message;
}

export function friendlyVerifyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid api key') || m.includes('invalid apikey')) {
    return INVALID_API_KEY_HELP;
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Too many attempts. Wait a minute and try again.';
  }
  if (
    m.includes('invalid') ||
    m.includes('expired') ||
    m.includes('token') ||
    m.includes('otp') ||
    m.includes('does not match')
  ) {
    return "That code doesn't match. Check the 6-digit code in your email and try again.";
  }
  if (m.includes('magiclink') || m.includes('link is invalid')) {
    return 'This project is still sending a sign-in link instead of a 6-digit code. In Supabase → Authentication → Email Templates → Magic Link, use {{ .Token }} only (remove {{ .ConfirmationURL }}). See eso-energy-com/docs/ESO_PAY_EMAIL_OTP.md';
  }
  return message;
}

export function isRetryableVerifyError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('invalid') ||
    m.includes('expired') ||
    m.includes('token') ||
    m.includes('otp') ||
    m.includes('magiclink') ||
    m.includes('signup')
  );
}
