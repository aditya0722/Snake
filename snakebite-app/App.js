// Navigation.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Auth Screens
import LoginScreen from './screens/auth/AuthScreens';
import RegisterScreen from './screens/auth/AuthScreens';

// Community Screens
import CommunityHomeScreen from './screens/community/CommunityScreens';
import HospitalsMapScreen from './screens/community/CommunityScreens';
import ReportSnakeScreen from './screens/community/CommunityScreens';

// CHW Screens
import CHWHomeScreen from './screens/chw/CHWScreens';
import ActiveCasesScreen from './screens/chw/CHWScreens';

// Provider Screens
import ProviderHomeScreen from './screens/provider/ProviderScreens';
import RegisterNewCaseScreen from './screens/provider/ProviderScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Community Tab Navigation
const CommunityTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'file-document' : 'file-document-outline';
          } else if (route.name === 'Emergency') {
            iconName = focused ? 'alert-circle' : 'alert-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1a472a',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: 56,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={CommunityHomeScreen}
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportSnakeScreen}
        options={{
          title: 'Report',
          headerStyle: {
            backgroundColor: '#f5f5f5',
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
          },
          headerTitleStyle: {
            color: '#1a1a1a',
            fontWeight: 'bold',
          },
        }}
      />
      <Tab.Screen
        name="Emergency"
        component={HospitalsMapScreen}
        options={{
          title: 'Emergency',
          headerStyle: {
            backgroundColor: '#f5f5f5',
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
          },
          headerTitleStyle: {
            color: '#1a1a1a',
            fontWeight: 'bold',
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CommunityHomeScreen}
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

// CHW Tab Navigation
const CHWTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cases') {
            iconName = focused ? 'file-document' : 'file-document-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'bell' : 'bell-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1a472a',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: 56,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={CHWHomeScreen}
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Cases"
        component={ActiveCasesScreen}
        options={{
          title: 'Active Cases',
          headerStyle: {
            backgroundColor: '#f5f5f5',
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
          },
          headerTitleStyle: {
            color: '#1a1a1a',
            fontWeight: 'bold',
          },
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={CHWHomeScreen}
        options={{
          title: 'Notifications',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CHWHomeScreen}
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

// Provider Tab Navigation
const ProviderTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'hospital-box' : 'hospital-box-outline';
          } else if (route.name === 'Cases') {
            iconName = focused ? 'file-document' : 'file-document-outline';
          } else if (route.name === 'Stock') {
            iconName = focused ? 'warehouse' : 'warehouse';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1a472a',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: 56,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={ProviderHomeScreen}
        options={{
          title: 'Dashboard',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Cases"
        component={RegisterNewCaseScreen}
        options={{
          title: 'Register Case',
          headerStyle: {
            backgroundColor: '#f5f5f5',
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
          },
          headerTitleStyle: {
            color: '#1a1a1a',
            fontWeight: 'bold',
          },
        }}
      />
      <Tab.Screen
        name="Stock"
        component={ProviderHomeScreen}
        options={{
          title: 'ASV Stock',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProviderHomeScreen}
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

// Manager Tab Navigation
const ManagerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'chart-box' : 'chart-box-outline';
          } else if (route.name === 'Cases') {
            iconName = focused ? 'file-document' : 'file-document-outline';
          } else if (route.name === 'Stock') {
            iconName = focused ? 'warehouse' : 'warehouse';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1a472a',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: 56,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={ProviderHomeScreen}
        options={{
          title: 'Manager',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Cases"
        component={ActiveCasesScreen}
        options={{
          title: 'All Cases',
          headerStyle: {
            backgroundColor: '#f5f5f5',
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
          },
          headerTitleStyle: {
            color: '#1a1a1a',
            fontWeight: 'bold',
          },
        }}
      />
      <Tab.Screen
        name="Stock"
        component={ProviderHomeScreen}
        options={{
          title: 'ASV Management',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProviderHomeScreen}
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
const RootNavigator = ({ userRole }) => {
  switch (userRole) {
    case 'community':
      return <CommunityTabs />;
    case 'chw':
      return <CHWTabs />;
    case 'treatment_provider':
      return <ProviderTabs />;
    case 'programme_manager':
      return <ManagerTabs />;
    default:
      return <CommunityTabs />;
  }
};

// Main Navigation Container
export const Navigation = ({ isAuthenticated, userRole }) => {
  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <RootNavigator userRole={userRole} />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

// App.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import store from './store';
import Navigation from './Navigation';
import { setUser, setToken } from './store/slices/authSlice';
import { setLocation, setPermission } from './store/slices/locationSlice';
import FlashMessage from 'react-native-flash-message';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // Restore user session
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');
      
      if (userStr && token) {
        const user = JSON.parse(userStr);
        dispatch(setUser(user));
        dispatch(setToken(token));
      }

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        dispatch(setPermission(true));
        const location = await Location.getCurrentPositionAsync({});
        dispatch(
          setLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
          })
        );

        // Watch location changes
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            dispatch(
              setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy,
              })
            );
          }
        );
      }

      // Request notification permission
      const { status: notifStatus } = 
        await Notifications.requestPermissionsAsync();
      if (notifStatus !== 'granted') {
        console.log('Notification permission denied');
      }

    } catch (e) {
      console.error('Failed to restore session:', e);
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a472a" />
      </View>
    );
  }

  return (
    <>
      <Navigation 
        isAuthenticated={isAuthenticated} 
        userRole={user?.role} 
      />
      <FlashMessage position="top" />
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;