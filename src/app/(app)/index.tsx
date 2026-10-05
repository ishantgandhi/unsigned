import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { getCurrentUser, signOut } from '../../lib/auth';

export default function Home() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    getCurrentUser().then((u) => setEmail(u?.email ?? ''));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signed in as {email}</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 18 },
});
