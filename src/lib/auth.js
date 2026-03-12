import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client that reads the session from the request cookies.
 * Use this inside Astro page frontmatter or API routes.
 */
export function getSupabaseFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );

  const accessToken  = cookies['sb-access-token']  ?? null;
  const refreshToken = cookies['sb-refresh-token'] ?? null;

  const client = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  if (accessToken && refreshToken) {
    client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  }

  return client;
}

/**
 * Returns the current user or null. Use in Astro frontmatter.
 */
export async function getUser(request) {
  const client = getSupabaseFromRequest(request);
  const { data: { user } } = await client.auth.getUser();
  return user;
}

/**
 * Returns the profile row (with role) for the current user.
 */
export async function getProfile(request) {
  const user = await getUser(request);
  if (!user) return null;

  const client = getSupabaseFromRequest(request);
  const { data } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}
