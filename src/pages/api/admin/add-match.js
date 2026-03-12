import { getProfile } from '../../../lib/auth.js';
import { getServiceClient } from '../../../lib/supabase.js';

export const prerender = false;

export async function POST({ request, redirect }) {
  const profile = await getProfile(request);
  if (!profile || profile.role !== 'admin') return redirect('/');

  const form    = await request.formData();
  const home    = form.get('home')?.toString().trim();
  const away    = form.get('away')?.toString().trim();
  const kickOff = form.get('kick_off')?.toString();

  if (!home || !away) return redirect('/admin?error=fields');

  const sb = getServiceClient();
  await sb.from('matches').insert({ home_team: home, away_team: away, kick_off: kickOff || null, status: 'upcoming' });

  return redirect('/admin');
}
