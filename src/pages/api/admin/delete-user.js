import { getProfile } from '../../../lib/auth.js';
import { getServiceClient } from '../../../lib/supabase.js';

export const prerender = false;

export async function POST({ request, redirect }) {
  const profile = await getProfile(request);
  if (!profile || profile.role !== 'admin') return redirect('/');

  const form   = await request.formData();
  const userId = form.get('user_id')?.toString();

  const sb = getServiceClient();
  await sb.from('predictions').delete().eq('user_id', userId);
  await sb.from('profiles').delete().eq('id', userId);
  await sb.auth.admin.deleteUser(userId);

  return redirect('/admin');
}
