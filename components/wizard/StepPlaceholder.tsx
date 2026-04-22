import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeConfig } from '../../context/ThemeConfig';

export default function StepPlaceholder({ stepNum, title }: { stepNum: number, title: string }) {
  const { colors } = useThemeConfig();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
        (Develop this step following the Step 2 structure)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
});
