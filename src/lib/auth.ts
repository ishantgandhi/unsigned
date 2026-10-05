import * as Linking from 'expo-linking';

import { supabase } from './supabase';

export function signInWithEmail(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: Linking.createURL('verify') },
  });
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

export function signOut() {
  return supabase.auth.signOut();
}

// Turns a magic-link deep link into a session. Returns false if the URL carries no auth data.
// Supports both flows: ?code=... (PKCE) and #access_token=...&refresh_token=... (implicit).
export async function createSessionFromUrl(url: string) {
  const { searchParams, hash } = new URL(url);
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const error = searchParams.get('error_description') ?? params.get('error_description');
  if (error) throw new Error(error);

  const code = searchParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return true;
  }
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) throw error;
    return true;
  }
  return false;
}
