import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTasks } from '../context/TasksContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { PROFILE_STORAGE_KEY } from '../constants';
import type { AppPalette } from '../theme/palettes';

type ProfilePayload = { displayName: string };

/**
 * Global preferences: theme via Context, profile + destructive data reset persisted with AsyncStorage.
 */
export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, setMode } = useTheme();
  const { clearAllTasks } = useTasks();
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(PROFILE_STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        try {
          const p = JSON.parse(raw) as ProfilePayload;
          if (typeof p.displayName === 'string') setDisplayName(p.displayName);
        } catch {
          /* ignore */
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveProfile = useCallback(async () => {
    const payload: ProfilePayload = { displayName: displayName.trim() };
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload));
      Alert.alert('Saved', 'Your display name was updated.');
    } catch {
      Alert.alert('Error', 'Could not save profile.');
    }
  }, [displayName]);

  const onClearAll = useCallback(() => {
    Alert.alert(
      'Delete all tasks?',
      'This removes every task from this device. Profile and theme are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete all',
          style: 'destructive',
          onPress: () => {
            clearAllTasks();
            Alert.alert('Done', 'All tasks were removed.');
          },
        },
      ],
    );
  }, [clearAllTasks]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!loaded) {
    return (
      <View style={[styles.screen, styles.loader, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: 16 + insets.top }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.headline}>Settings</Text>
      <Text style={styles.lead}>Theme, profile, account, and data controls.</Text>
      <Text style={styles.greeting}>
        Signed in as {displayName.trim() || user?.email || 'Unknown user'}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>APPEARANCE</Text>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>Dark mode</Text>
            <Text style={styles.rowSub}>Applies across tabs via ThemeContext.</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={(v) => setMode(v ? 'dark' : 'light')}
            trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
            thumbColor={colors.surfaceContainerLowest}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>PROFILE</Text>
        <Text style={styles.label}>Display name</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your name"
          placeholderTextColor={`${colors.onSurfaceVariant}99`}
          style={styles.input}
        />
        <Pressable onPress={saveProfile} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Save profile</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ACCOUNT</Text>
        <Text style={styles.rowSub}>You can sign out and login with another account.</Text>
        <Pressable onPress={() => void logout()} style={styles.dangerBtn}>
          <Text style={styles.dangerBtnText}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>DATA</Text>
        <Text style={styles.rowSub}>
          Tasks are synced to backend and cached on this device for offline access.
        </Text>
        <Pressable onPress={onClearAll} style={styles.dangerBtn}>
          <Text style={styles.dangerBtnText}>Delete all tasks</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    headline: {
      fontSize: 32,
      fontWeight: '900',
      color: colors.primary,
      letterSpacing: -0.5,
    },
    lead: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
    greeting: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.primaryContainer,
      marginBottom: 16,
    },
    loader: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.outlineVariant,
    },
    cardTitle: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: colors.onSurfaceVariant,
      marginBottom: 14,
    },
    rowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    flex: { flex: 1 },
    rowTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.onSurface,
    },
    rowSub: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      marginTop: 4,
    },
    label: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.outlineVariant,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      fontWeight: '600',
      color: colors.onSurface,
      backgroundColor: colors.surface,
      marginBottom: 12,
    },
    primaryBtn: {
      backgroundColor: colors.primaryContainer,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    primaryBtnText: {
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: '800',
    },
    dangerBtn: {
      marginTop: 12,
      borderWidth: 1,
      borderColor: '#c62828',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: `${'#c62828'}12`,
    },
    dangerBtnText: {
      color: '#c62828',
      fontSize: 15,
      fontWeight: '800',
    },
  });
}
