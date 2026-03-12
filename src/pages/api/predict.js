import { getSupabaseFromRequest, getProfile } from '../../lib/auth.js';

export const prerender = false;

export async function POST({ request, redirect }) {
  const profile = await getProfile(request);
  if (!profile) return redirect('/login');

  const form   = await request.formData();
  const matchId   = form.get('match_id')?.toString();
  const predHome  = form.get('pred_home')?.toString();
  const predAway  = form.get('pred_away')?.toString();

  if (!matchId || predHome === '' || predAway === '') {
    return new Response('Bad request', { status: 400 });
  }

  const sb = getSupabaseFromRequest(request);

  // Check match still upcoming
  const { data: match } = await sb
    .from('matches')
    .select('status, kick_off')
    .eq('id', matchId)
    .single();

  if (!match) return new Response('Match not found', { status: 404 });

  const started = match.status !== 'upcoming' || new Date() >= new Date(match.kick_off);
  if (started) return new Response('Match already started', { status: 403 });

  await sb.from('predictions').upsert(
    { match_id: matchId, user_id: profile.id, pred_home: parseInt(predHome), pred_away: parseInt(predAway) },
    { onConflict: 'match_id,user_id' }
  );

  return redirect('/mecze');
}
