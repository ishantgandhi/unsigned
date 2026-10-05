import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { createSessionFromUrl } from '../../lib/auth';

// Landing route for the magic link. On success the root layout's guards move the user to (app).
export default function Verify() {
  const router = useRouter();
  const url = Linking.useLinkingURL();

  useEffect(() => {
    if (!url) return;
    createSessionFromUrl(url)
      .then((ok) => ok || router.replace('/sign-in'))
      .catch(() => router.replace('/sign-in'));
  }, [url, router]);

  return null;
}
