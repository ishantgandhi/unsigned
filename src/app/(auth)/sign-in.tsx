import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { signInWithEmail } from '../../lib/auth';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError('');
    const { error } = await signInWithEmail(email.trim());
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check your email for a link</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>unsigned</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />
      <Button title="Send magic link" onPress={submit} disabled={busy || !email.trim()} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  input: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  error: { color: 'crimson' },
});
