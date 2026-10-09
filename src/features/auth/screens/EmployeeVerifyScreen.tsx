import { AuthService } from '@/src/services/auth-service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function EmployeeVerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const verify = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      setErrorMessage('Enter the complete 6-digit verification code.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    const result = await AuthService.verifyEmployeeOtp(code.trim());
    setIsLoading(false);
    if (result.status === 'success') {
      router.replace('/facilities/reservations' as any);
      return;
    }
    setErrorMessage(result.message);
  };

  const resend = async () => {
    const result = await AuthService.resendEmployeeOtp();
    if (result.status === 'success') setNotice(result.message);
    else setErrorMessage(result.message);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>EMPLOYEE VERIFICATION</Text>
        <Text style={styles.title}>Verify your sign in</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to {email || 'your registered work email'}.</Text>
        <TextInput value={code} onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" maxLength={6} style={styles.input} placeholder="000000" placeholderTextColor="#64748B" />
        {errorMessage && <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text>}
        {notice && <Text style={styles.notice}>{notice}</Text>}
        <TouchableOpacity onPress={() => void verify()} disabled={isLoading} style={[styles.primaryButton, isLoading && styles.disabled]}>
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Verify and continue</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => void resend()} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Resend code</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Back to employee sign in</Text>
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
  input: { color: '#172B25', backgroundColor: '#FFFFFF', borderColor: '#DCE5E1', borderWidth: 1, borderRadius: 10, minHeight: 52, paddingHorizontal: 12, fontSize: 20, textAlign: 'center' as const, letterSpacing: 4 },
  error: { color: '#B42318', fontSize: 13, lineHeight: 18 },
  notice: { color: '#16764A', fontSize: 13, lineHeight: 18 },
  primaryButton: { minHeight: 48, borderRadius: 10, backgroundColor: '#16764A', alignItems: 'center' as const, justifyContent: 'center' as const, marginTop: 8 },
  disabled: { opacity: 0.6 },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' as const },
  secondaryButton: { minHeight: 40, alignItems: 'center' as const, justifyContent: 'center' as const },
  secondaryText: { color: '#16764A', fontSize: 13, fontWeight: '700' as const },
};
