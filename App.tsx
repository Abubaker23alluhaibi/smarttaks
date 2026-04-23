import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { TasksProvider } from './src/context/TasksContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { API_BASE_URL } from './src/config/env';

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  useEffect(() => {
    if (__DEV__) {
      console.log('[API] Using base URL:', API_BASE_URL);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <TasksProvider>
            <ThemedStatusBar />
            <RootNavigator />
          </TasksProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
