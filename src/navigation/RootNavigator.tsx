import { useMemo } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  type Theme as NavTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TaskListScreen } from '../screens/TaskListScreen';
import { AddTaskScreen } from '../screens/AddTaskScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AuthScreen } from '../screens/AuthScreen';
import type { RootTabParamList, TasksStackParamList } from './types';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';

const TasksStack = createNativeStackNavigator<TasksStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
const AuthStack = createNativeStackNavigator();

function TasksStackNavigator() {
  const { colors } = useTheme();
  return (
    <TasksStack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <TasksStack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{ headerShown: false }}
      />
      <TasksStack.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={{
          title: 'New task',
          presentation: 'modal',
        }}
      />
    </TasksStack.Navigator>
  );
}

export function RootNavigator() {
  const { colors, isDark } = useTheme();
  const { user, hydrated } = useAuth();

  const navTheme = useMemo((): NavTheme => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.surface,
        card: colors.surfaceContainerLowest,
        text: colors.onSurface,
        border: colors.outlineVariant,
        primary: colors.primaryContainer,
        notification: colors.primaryContainer,
      },
    };
  }, [colors, isDark]);

  if (!hydrated) {
    return null;
  }

  if (!user) {
    return (
      <NavigationContainer theme={navTheme}>
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Auth" component={AuthScreen} />
        </AuthStack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primaryContainer,
          tabBarInactiveTintColor: colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: colors.surfaceContainerLowest,
            borderTopColor: colors.outlineVariant,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}
      >
        <Tab.Screen
          name="TasksTab"
          component={TasksStackNavigator}
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Focus"
          component={FocusScreen}
          options={{
            title: 'Focus',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="timer-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Insights"
          component={InsightsScreen}
          options={{
            title: 'Insights',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
