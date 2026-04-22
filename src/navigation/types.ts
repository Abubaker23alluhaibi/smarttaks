import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type TasksStackParamList = {
  TaskList: undefined;
  AddTask: undefined;
};

export type RootTabParamList = {
  TasksTab: undefined;
  Focus: undefined;
  Insights: undefined;
  Settings: undefined;
};

export type TasksStackNavProp = NativeStackNavigationProp<TasksStackParamList>;
