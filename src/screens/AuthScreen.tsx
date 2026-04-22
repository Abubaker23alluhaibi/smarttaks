import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import type { AppPalette } from '../theme/palettes';

export function AuthScreen() {
  const { login, register } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const safeEmail = email.trim();
    if (!safeEmail || !password) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isRegisterMode) {
        await register(safeEmail, password);
      } else {
        await login(safeEmail, password);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Smart Task Planner</Text>
        <Text style={styles.subtitle}>
          {isRegisterMode ? 'Create account' : 'Sign in to continue'}
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor={`${colors.onSurfaceVariant}aa`}
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor={`${colors.onSurfaceVariant}aa`}
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable onPress={submit} style={styles.button} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.buttonText}>
              {isRegisterMode ? 'Create account' : 'Login'}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => setIsRegisterMode((prev) => !prev)}>
          <Text style={styles.toggle}>
            {isRegisterMode
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create one"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 16,
      padding: 18,
      gap: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.outlineVariant,
    },
    title: {
      fontSize: 24,
      fontWeight: '900',
      color: colors.onSurface,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      marginBottom: 10,
    },
    input: {
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.outlineVariant,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: colors.onSurface,
      fontSize: 15,
      fontWeight: '600',
      backgroundColor: colors.surface,
    },
    error: {
      color: '#D32F2F',
      fontSize: 13,
      fontWeight: '600',
    },
    button: {
      marginTop: 4,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      backgroundColor: colors.primaryContainer,
    },
    buttonText: {
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: '800',
    },
    toggle: {
      textAlign: 'center',
      color: colors.primaryContainer,
      fontWeight: '700',
      marginTop: 8,
    },
  });
}
