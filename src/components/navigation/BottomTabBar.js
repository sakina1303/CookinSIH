import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { applyAlpha } from '../shared/colorUtils';

export function BottomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, typography, radii, spacing } = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, spacing.md),
        },
      ]}
    >
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const icon = options.tabBarIcon?.({ focused: isFocused, color: colors.primary, size: 22 });

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.tab,
                {
                  backgroundColor: isFocused ? applyAlpha(colors.primary, 0.12) : 'transparent',
                  borderRadius: radii.md,
                },
                pressed ? styles.pressed : undefined,
              ]}
            >
              <View style={styles.iconContainer}>{icon}</View>
              <Text
                style={{
                  fontFamily: typography.family,
                  fontSize: 12,
                  fontWeight: typography.weightMedium,
                  color: isFocused ? colors.primary : colors.mutedForeground,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  iconContainer: {
    marginBottom: 4,
  },
  pressed: {
    opacity: 0.8,
  },
});
