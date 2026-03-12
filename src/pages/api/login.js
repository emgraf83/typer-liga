import { supabase } from '../../lib/supabase.js';

export const prerender = false;

export async function POST({ request, redirect }) {
  const form = await request.formData();
  const email    = form.get('email')?.toString().trim() ?? '';
  const password = form.get('password')?.toString() ?? '';

  if (!email || !password) {
    return redirect('/login?error=required');
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return redirect('/login?error=invalid');
  }

  const { access_token, refresh_token } = data.session;

  // Lokalnie HTTP nie ma Secure, na Netlify (HTTPS) dodajemy
  const isSecure = request.headers.get('x-forwarded-proto') === 'https';
  const secure = isSecure ? '; Secure' : '';
  const base = `Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`;

  // Dwa osobne Set-Cookie headery (nie łączone przecinkiem!)
  const headers = new Headers();
  headers.append('Location', '/');
  headers.append('Set-Cookie', `sb-access-token=${access_token}; ${base}`);
  headers.append('Set-Cookie', `sb-refresh-token=${refresh_token}; ${base}`);

  return new Response(null, { status: 302, headers });
}
