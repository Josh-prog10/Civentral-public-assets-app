import { AuthService } from '@/src/services/auth-service';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function EmployeeLoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    if (!identifier.trim() || !password) {
      setErrorMessage('Enter your employee ID or email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    const result = await AuthService.loginEmployee(identifier.trim(), password);
    setIsLoading(false);

    if (result.status === 'otp_required') {
      router.push({ pathname: '/(auth)/employee-verify', params: { email: result.email || identifier.trim() } } as any);
      return;
    }
    if (result.status === 'success') {
      router.replace('/facilities/reservations' as any);
      return;
    }
    setErrorMessage(result.message);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>CIVENTRAL STAFF ACCESS</Text>
        <Text style={styles.title}>Employee sign in</Text>
        <Text style={styles.subtitle}>Use your existing employee account. Module access follows your assigned role and permissions.</Text>

        <Text style={styles.label}>Employee ID or email</Text>
        <TextInput value={identifier} onChangeText={setIdentifier} autoCapitalize="none" autoCorrect={false} style={styles.input} placeholder="Employee ID or email" placeholderTextColor="#64748B" />
        <Text style={styles.label}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry style={styles.input} placeholder="Password" placeholderTextColor="#64748B" />

        {errorMessage && <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text>}

        <TouchableOpacity onPress={() => void signIn()} disabled={isLoading} style={[styles.primaryButton, isLoading && styles.disabled]}>
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Sign in</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Back to citizen sign in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = {
  screen: { flex: 1, backgroundColor: '#F3F7F6', justifyContent: 'center' as const, padding: 22 },
  content: { width: '100%' as const, maxWidth: 480, alignSelf: 'center' as const, gap: 12 },
  eyebrow: { color: '#16764A', fontSize: 11, fontWeight: '800' as const },
  title: { color: '#172B25', fontSize: 26, fontWeight: '800' as const },
  subtitle: { color: '#62746D', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  label: { color: '#172B25', fontSize: 13, fontWeight: '700' as const },
  input: { color: '#172B25', backgroundColor: '#FFFFFF', borderColor: '#DCE5E1', borderWidth: 1, borderRadius: 10, minHeight: 48, paddingHorizontal: 12, fontSize: 15 },
  error: { color: '#B42318', fontSize: 13, lineHeight: 18 },
  primaryButton: { minHeight: 48, borderRadius: 10, backgroundColor: '#16764A', alignItems: 'center' as const, justifyContent: 'center' as const, marginTop: 8 },
  disabled: { opacity: 0.6 },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' as const },
  secondaryButton: { minHeight: 44, alignItems: 'center' as const, justifyContent: 'center' as const },
  secondaryText: { color: '#16764A', fontSize: 13, fontWeight: '700' as const },
};
