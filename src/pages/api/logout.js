export const prerender = false;

export async function POST() {
  const clearCookie = 'Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/login',
      'Set-Cookie': [
        `sb-access-token=; ${clearCookie}`,
        `sb-refresh-token=; ${clearCookie}`,
      ].join(', '),
    },
  });
}
