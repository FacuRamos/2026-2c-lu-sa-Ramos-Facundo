import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext.js';
import { USER_ROLES } from '../constants/roles.js';

// Buyer Nav & Screens
import { BuyerTabNavigator } from './BuyerTabNavigator.js';
import { SearchScreen } from '../screens/buyer/SearchScreen.js';
import { EventDetailScreen } from '../screens/buyer/EventDetailScreen.js';
import { TicketSelectionScreen } from '../screens/buyer/TicketSelectionScreen.js';
import { PurchaseDetailScreen } from '../screens/buyer/PurchaseDetailScreen.js';
import { ChatScreen } from '../screens/buyer/ChatScreen.js';
import { ReviewScreen } from '../screens/buyer/ReviewScreen.js';

// Common & Auth Screens
import { NotificationScreen } from '../screens/common/NotificationScreen.js';
import { LoginScreen } from '../screens/auth/LoginScreen.js';
import { RegisterBuyerScreen } from '../screens/auth/RegisterBuyerScreen.js';
import { RegisterOrganizerScreen } from '../screens/auth/RegisterOrganizerScreen.js';

// Organizer Screens
import { OrganizerDashboardScreen } from '../screens/organizer/OrganizerDashboardScreen.js';
import { CreateEventScreen } from '../screens/organizer/CreateEventScreen.js';
import { ManageEventScreen } from '../screens/organizer/ManageEventScreen.js';
import { OrganizerSalesScreen } from '../screens/organizer/OrganizerSalesScreen.js';
import { OrganizerInboxScreen } from '../screens/organizer/OrganizerInboxScreen.js';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { currentUser, userRole, isReady } = useApp();

  if (isReady === false) {
    return null;
  }

  const isAuthenticated = Boolean(currentUser && currentUser.id);
  const isOrganizer = userRole === USER_ROLES.ORGANIZER || currentUser?.rol === USER_ROLES.ORGANIZER;
  const MainComponent = isOrganizer ? OrganizerDashboardScreen : BuyerTabNavigator;

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={isAuthenticated ? (isOrganizer ? 'org-stack' : 'buyer-stack') : 'auth-stack'}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialRouteName={isAuthenticated ? 'MainTabs' : 'Login'}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="RegisterBuyer" component={RegisterBuyerScreen} />
            <Stack.Screen name="RegisterOrganizer" component={RegisterOrganizerScreen} />
          </>
        ) : isOrganizer ? (
          <>
            <Stack.Screen name="MainTabs" component={OrganizerDashboardScreen} />
            <Stack.Screen name="OrganizerDashboard" component={OrganizerDashboardScreen} />
            <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
            <Stack.Screen name="ManageEvent" component={ManageEventScreen} />
            <Stack.Screen name="OrganizerSales" component={OrganizerSalesScreen} />
            <Stack.Screen name="OrganizerInbox" component={OrganizerInboxScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={BuyerTabNavigator} />
            <Stack.Screen name="BuyerTabs" component={BuyerTabNavigator} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="EventDetail" component={EventDetailScreen} />
            <Stack.Screen name="TicketSelection" component={TicketSelectionScreen} />
            <Stack.Screen name="PurchaseDetail" component={PurchaseDetailScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Review" component={ReviewScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
