import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarShowLabel: true,
        tabBarLabelStyle: { 
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 5,
        },
        tabBarStyle: {
          backgroundColor: '#F2F0F0',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 70,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#4C3A34',
        tabBarInactiveTintColor: '#755B51',
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          let IconComponent: any = Ionicons;

          if (route.name === 'internals/HomeScreen') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'TrabajosScreen') {
            IconComponent = MaterialIcons;
            iconName = focused ? 'work' : 'work-outline';
          } else if (route.name === 'CompanyScreen') {
            iconName = focused ? 'business' : 'business-outline';
            IconComponent = Ionicons;
          } else if (route.name === 'PerfilScreen') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <IconComponent
              name={iconName}
              size={28}
              color={color}
            />
          );
        },
      })}
    >
      <Tabs.Screen 
        name="internals/HomeScreen" 
        options={{ 
          title: 'Inicio',
          headerShown: false,
        }} 
      />
      <Tabs.Screen 
        name="TrabajosScreen" 
        options={{ 
          title: 'Trabajos',
          headerShown: false,
        }} 
      />
      <Tabs.Screen 
        name="CompanyScreen" 
        options={{ 
          title: 'Empresa',
          headerShown: false,
        }} 
      />
      <Tabs.Screen 
        name="PerfilScreen" 
        options={{ 
          title: 'Perfil',
          headerShown: false,
        }} 
      />
      
      {/* Screens que no deben aparecer en el tab bar */}
      <Tabs.Screen 
        name="index" 
        options={{ 
          href: null, // Esto oculta la pantalla del tab bar
          headerShown: false,
        }} 
      />
      <Tabs.Screen 
        name="internals/ChatDetailScreen" 
        options={{ 
          href: null,
          headerShown: false,
        }} 
      />
      <Tabs.Screen 
        name="internals/PublicarTrabajoScreen" 
        options={{ 
          href: null,
          headerShown: false,
        }} 
      />
    </Tabs>
  );
}
