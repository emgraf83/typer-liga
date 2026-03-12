import { getProfile } from '../../../lib/auth.js';
import { getServiceClient } from '../../../lib/supabase.js';

export const prerender = false;

export async function POST({ request, redirect }) {
  const profile = await getProfile(request);
  if (!profile || profile.role !== 'admin') return redirect('/');

  const form = await request.formData();
  const id   = form.get('id')?.toString();

  const sb = getServiceClient();
  await sb.from('predictions').delete().eq('match_id', id);
  await sb.from('matches').delete().eq('id', id);

  return redirect('/admin');
}
