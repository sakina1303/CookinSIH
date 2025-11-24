import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BookOpen, Zap, Brain, TrendingUp } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { applyAlpha } from '../shared/colorUtils';

const ACTIONS = [
  { key: 'quiz', label: 'Practice\nQuizzes', icon: BookOpen },
  { key: 'subjects', label: 'Subjects', icon: Zap },
  { key: 'tutor', label: 'Ask AI\nTutor', icon: Brain },
  { key: 'progress', label: 'Your\nProgress', icon: TrendingUp },
];

const actionToColorKey = {
  quiz: 'primary',
  subjects: 'secondary',
  tutor: 'accent',
  progress: 'primary',
};

export function QuickActions({ onSelect }) {
  const { colors, radii, spacing, typography } = useTheme();

  return (
    <View>
      <Text
        style={{
          fontSize: 13,
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          fontFamily: typography.family,
          fontWeight: typography.weightMedium,
          color: colors.mutedForeground,
          marginBottom: spacing.sm,
        }}
      >
        Quick Access
      </Text>
      <View style={styles.grid}>
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const accentKey = actionToColorKey[action.key] ?? 'primary';
          const accentColor = colors[accentKey] ?? colors.primary;
          const gradientColors = [applyAlpha(accentColor, 0.12), applyAlpha(accentColor, 0.02)];

          return (
            <Pressable
              key={action.key}
              onPress={() => onSelect?.(action.key)}
              style={({ pressed }) => [
                styles.card,
                {
                  borderRadius: radii.xl,
                  borderColor: applyAlpha(accentColor, 0.2),
                  borderWidth: 2,
                },
              ]}
            >
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradient, { borderRadius: radii.xl, padding: spacing.lg }]}
              >
                <View
                  style={{
                    backgroundColor: applyAlpha(accentColor, 0.25),
                    borderRadius: radii.md,
                    padding: 10,
                    marginBottom: spacing.sm,
                    width: 40,
                    alignItems: 'center',
                  }}
                >
                  <Icon size={20} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    fontFamily: typography.family,
                    fontWeight: typography.weightMedium,
                    fontSize: 14,
                    color: colors.foreground,
                    lineHeight: 18,
                  }}
                >
                  {action.label}
                </Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 12,
  },
  gradient: {
    width: '100%',
  },
});
