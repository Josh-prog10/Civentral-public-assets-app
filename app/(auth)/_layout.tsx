import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="verify-phone" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="employee-login" />
      <Stack.Screen name="employee-verify" />
    </Stack>
  );
}
