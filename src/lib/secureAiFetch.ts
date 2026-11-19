import { auth } from './firebase';

/** All paid AI requests carry a verified Firebase identity. */
export async function secureAiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser;
  if (!user) throw new Error('Yapay zekâ için Google hesabınızla oturum açın.');
  const token = await user.getIdToken();
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...options, headers });
}
