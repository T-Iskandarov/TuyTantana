import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, CalendarBlank, SquaresFour, User, Headset } from 'phosphor-react-native';
import { ActivityIndicator, View, Platform } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/lib/theme';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ServiceDetailScreen from './src/screens/ServiceDetailScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import ProviderDashboardScreen from './src/screens/ProviderDashboardScreen';
import ProviderServicesScreen from './src/screens/ProviderServicesScreen';
import ProviderServiceCalendarScreen from './src/screens/ProviderServiceCalendarScreen';
import AddServiceScreen from './src/screens/AddServiceScreen';
import ContactScreen from './src/screens/ContactScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AllServicesScreen from './src/screens/AllServicesScreen';
import MyReviewsScreen from './src/screens/MyReviewsScreen';
import PaymentMethodsScreen from './src/screens/PaymentMethodsScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import AboutAppScreen from './src/screens/AboutAppScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 30 : 20,
          left: 12,
          right: 12,
          elevation: 4,
          backgroundColor: COLORS.white,
          borderRadius: 16,
          height: 70,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          paddingTop: 12,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.05,
          shadowRadius: 15,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ focused, color, size }) => {
          let IconComp;
          if (route.name === 'HomeTab') IconComp = House;
          else if (route.name === 'BookingsTab') IconComp = CalendarBlank;
          else if (route.name === 'DashboardTab') IconComp = SquaresFour;
          else if (route.name === 'ContactTab') IconComp = Headset;
          else if (route.name === 'ProfileTab') IconComp = User;
          return <IconComp size={24} color={color} weight={focused ? 'fill' : 'regular'} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Bosh sahifa' }}
      />
      {user?.role === 'PROVIDER' ? (
        <Tab.Screen
          name="DashboardTab"
          component={ProviderDashboardScreen}
          options={{ tabBarLabel: 'Dashboard' }}
        />
      ) : (
        <Tab.Screen
          name="BookingsTab"
          component={MyBookingsScreen}
          options={{ tabBarLabel: 'Bronlarim' }}
        />
      )}
      <Tab.Screen
        name="ContactTab"
        component={ContactScreen}
        options={{ tabBarLabel: 'Kontakt' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Main" component={HomeTabs} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="AllServices" component={AllServicesScreen} />
      
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="ProviderServices" component={ProviderServicesScreen} />
          <Stack.Screen name="ProviderServiceCalendar" component={ProviderServiceCalendarScreen} />
          <Stack.Screen name="AddService" component={AddServiceScreen} />
          <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="AboutApp" component={AboutAppScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
