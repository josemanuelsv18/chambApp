import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export default function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const pathname = usePathname();
  
  const tabs = [
    { name: 'index', title: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
    { name: 'TrabajosScreen', title: 'Trabajos', icon: 'work-outline', activeIcon: 'work', isMaterial: true },
    { name: 'CompanyScreen', title: 'Chat', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses' },
    { name: 'PerfilScreen', title: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => {
        const isFocused = pathname === `/${tab.name}` || (tab.name === 'index' && pathname === '/');
        
        const onPress = () => {
          if (!isFocused) {
            router.push(`/${tab.name}` as any);
          }
        };

        const IconComponent = tab.isMaterial ? MaterialIcons : Ionicons;
        const iconName = isFocused ? tab.activeIcon : tab.icon;
        const color = isFocused ? '#4C3A34' : '#755B51';

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={onPress}
            style={styles.tab}
          >
            <IconComponent
              name={iconName as any}
              size={28}
              color={color}
            />
            <Text style={[styles.tabLabel, { color }]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F2F0F0',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    height: 70,
    paddingBottom: 10,
    paddingTop: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});