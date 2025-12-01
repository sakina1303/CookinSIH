import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { applyAlpha } from '../shared/colorUtils';
import { CardButton } from '../shared/CardButton';
import { GradientProgressBar } from '../shared/GradientProgressBar';

export function QuizSubjectCard({ subject, onStart, disabled }) {
  const { colors, radii, spacing, typography } = useTheme();
  const accentKey = subject.accentKey ?? 'primary';
  const accent = colors[accentKey] ?? colors.primary;
  const completion = subject.progress ?? 67;

  return (
    <LinearGradient
      colors={[applyAlpha(accent, 0.12), applyAlpha(accent, 0.04)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: radii.xl,
        borderWidth: 2,
        borderColor: applyAlpha(accent, 0.2),
        padding: spacing.lg,
        marginBottom: spacing.md,
      }}
    >
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: spacing.md }}>
          <Text
            style={{
              fontFamily: typography.family,
              fontWeight: typography.weightMedium,
              fontSize: 12,
              color: colors.mutedForeground,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {subject.icon}
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontFamily: typography.family,
              fontWeight: typography.weightBold,
              fontSize: 18,
              color: colors.foreground,
            }}
          >
            {subject.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <GradientProgressBar value={completion} accentKey={accentKey} height={6} />
            </View>
            <Text
              style={{
                fontSize: 12,
                color: colors.mutedForeground,
                fontFamily: typography.family,
              }}
            >
              {`${Math.round(completion)}% complete`}
            </Text>
          </View>
        </View>
        <CardButton
          variant="primary"
          size="sm"
          onPress={() => onStart?.(subject)}
          disabled={disabled}
        >
          Start
        </CardButton>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
