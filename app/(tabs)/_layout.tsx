import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useThemeConfig } from "../../context/ThemeConfig";

export default function TabsLayout() {
  const { colors } = useThemeConfig();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarStyle: {
            backgroundColor: colors.inputBackground,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            elevation: 0,
            boxShadow: "none",
            height: 65,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("tab_home"),
            tabBarIcon: ({ color }) => (
              <Ionicons name="leaf" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: t("tab_events") || "Events",
            tabBarIcon: ({ color }) => (
              <Ionicons name="calendar" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: t("tab_library"),
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="book" size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("tab_profile"),
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" size={24} color={color} />
            ),
          }}
        />
      </Tabs>

    </View>
  );
}

const styles = StyleSheet.create({});
