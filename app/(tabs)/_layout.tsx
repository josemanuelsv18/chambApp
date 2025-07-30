import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 16 },
        tabBarStyle: {
          backgroundColor: '#F2F0F0',
          borderTopWidth: 0,
          height: 65,
        },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'index') {
            return (
              <Ionicons
                name="home-outline"
                size={30}
                color={focused ? "#4C3A34" : "#755B51"}
              />
            );
          }
          if (route.name === 'TrabajosScreen') {
            return (
              <MaterialIcons
                name="work-outline"
                size={30}
                color={focused ? "#4C3A34" : "#755B51"}
              />
            );
          }
          if (route.name === 'ChatScreen') {
            return (
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={30}
                color={focused ? "#4C3A34" : "#755B51"}
              />
            );
          }
          if (route.name === 'PerfilScreen') {
            return (
              <Ionicons
                name="person-outline"
                size={30}
                color={focused ? "#4C3A34" : "#755B51"}
              />
            );
          }
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="TrabajosScreen" options={{ title: 'Trabajos' }} />
      <Tabs.Screen name="ChatScreen" options={{ title: 'Chat' }} />
      <Tabs.Screen name="PerfilScreen" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
