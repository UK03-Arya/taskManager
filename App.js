import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import store from './src/redux/store';

import Dashboard from './src/screens/Dashboard';
import TaskFormScreen from './src/screens/TaskForm';
import TaskDetailScreen from './src/screens/TaskDetail';
import Video from './src/screens/Video';
import Videos from './src/screens/Video';
import TaskDetail from './src/screens/TaskDetail';
import TaskForm from './src/screens/TaskForm';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator initialRouteName="DashboardMain">
      <Stack.Screen
        name="DashboardMain"
        component={Dashboard}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="TaskForm"
        component={TaskForm}
        options={{ title: 'Add / Edit Task' }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetail}
        options={{ title: 'Task Details' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false, 
            tabBarIcon: () => null,  
            tabBarLabelStyle: {
              fontSize: 15,   
              fontWeight: 'bold',
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 10,
            },

          }}
        >
          <Tab.Screen
            name="DashboardTab"
            component={DashboardStack}
            options={{ tabBarLabel: 'Dashboard' }}
          />
          <Tab.Screen
            name="VideosTab"
            component={Videos}
            options={{ tabBarLabel: 'Videos' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
