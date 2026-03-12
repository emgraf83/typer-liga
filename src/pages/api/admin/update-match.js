import { getProfile } from '../../../lib/auth.js';
import { getServiceClient } from '../../../lib/supabase.js';

export const prerender = false;

export async function POST({ request, redirect }) {
  const profile = await getProfile(request);
  if (!profile || profile.role !== 'admin') return redirect('/');

  const form    = await request.formData();
  const id      = form.get('id')?.toString();
  const status  = form.get('status')?.toString();
  const scoreH  = form.get('score_home')?.toString();
  const scoreA  = form.get('score_away')?.toString();

  const sb = getServiceClient();

  const update = {};
  if (status) update.status = status;
  if (scoreH !== '' && scoreA !== '') {
    update.score_home = parseInt(scoreH ?? '0');
    update.score_away = parseInt(scoreA ?? '0');
    update.status = 'finished';
  }

  await sb.from('matches').update(update).eq('id', id);

  return redirect('/admin');
}
