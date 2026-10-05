import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { createSessionFromUrl } from '../../lib/auth';

// Landing route for the magic link. On success the root layout's guards move the user to (app).
export default function Verify() {
  const router = useRouter();
  const url = Linking.useLinkingURL();

  useEffect(() => {
    if (!url) {
      router.replace('/sign-in');
      return;
    }
    createSessionFromUrl(url)
      .then((ok) => ok || router.replace('/sign-in'))
      .catch((e) => {
        console.warn('[verify] failed:', e);
        router.replace('/sign-in');
      });
  }, [url, router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Signing you in…</Text>
    </View>
  );
}
