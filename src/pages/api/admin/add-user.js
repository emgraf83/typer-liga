import { getProfile } from '../../../lib/auth.js';
import { getServiceClient } from '../../../lib/supabase.js';

export const prerender = false;

export async function POST({ request, redirect }) {
  const profile = await getProfile(request);
  if (!profile || profile.role !== 'admin') return redirect('/');

  const form  = await request.formData();
  const email = form.get('email')?.toString().trim();
  const nick  = form.get('nick')?.toString().trim();
  const pass  = form.get('password')?.toString();

  if (!email || !nick || !pass) return redirect('/admin?error=fields');

  const sb = getServiceClient();

  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: pass,
    email_confirm: true,
    user_metadata: { nick },
  });

  if (error || !data.user) return redirect('/admin?error=user_exists');

  // Profile is created by DB trigger, but set nick + role explicitly
  await sb.from('profiles').upsert({ id: data.user.id, nick, role: 'user' });

  return redirect('/admin');
}
