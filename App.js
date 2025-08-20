// App.js
import 'react-native-gesture-handler';                           
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { Ionicons, Feather } from "@expo/vector-icons";

// Écrans
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import HomeScreen from "./screens/HomeScreen";
import HistoriqueScreen from "./screens/HistoriqueScreen";

// Nouveaux écrans
import AddRoomScreen from "./screens/AddRoomScreen";
import AddPatientScreen from "./screens/AddPatientScreen";
import PatientListScreen from "./screens/PatientListScreen";
import CalendarScreen from "./screens/CalendarScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SettingsScreen from "./screens/SettingsScreen";
import RoomsListScreen from "./screens/RoomsListScreen";
import EditRoomScreen from "./screens/EditRoomScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { height: 60, borderTopWidth: 0, elevation: 4 },
        tabBarIcon: ({ focused }) => {
          const size = 26;
          if (route.name === "HomeTab")
            return <Ionicons name="home" size={size} color={focused ? "#6C63FF" : "#999"} />;
          if (route.name === "Profile")
            return <Ionicons name="person-circle-outline" size={size} color={focused ? "#6C63FF" : "#999"} />;
          if (route.name === "History")
            return <Feather name="activity" size={size} color={focused ? "#6C63FF" : "#999"} />;
          if (route.name === "Settings")
            return <Ionicons name="settings-outline" size={size} color={focused ? "#6C63FF" : "#999"} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="History" component={HistoriqueScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}> {/* ⬅️ Enveloppe racine */}
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="AddRoom" component={AddRoomScreen} />
              <Stack.Screen name="AddPatient" component={AddPatientScreen} />
              <Stack.Screen name="PatientList" component={PatientListScreen} />
              <Stack.Screen name="Calendar" component={CalendarScreen} />
              <Stack.Screen name="Rooms" component={RoomsListScreen} />
              <Stack.Screen name="EditRoom" component={EditRoomScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
