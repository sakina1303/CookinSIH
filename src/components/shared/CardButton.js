import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';

const SIZE_PRESETS = {
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  lg: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 17,
  },
};

export function CardButton({
  children,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  contentStyle,
  disabled,
  ...rest
}) {
  const { colors, radii, typography } = useTheme();

  const palette = {
    primary: {
      backgroundColor: colors.primary,
      textColor: colors.primaryForeground,
      borderColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.secondary,
      textColor: colors.secondaryForeground,
      borderColor: colors.secondary,
    },
    outline: {
      backgroundColor: colors.card,
      textColor: colors.foreground,
      borderColor: colors.border,
    },
    destructive: {
      backgroundColor: colors.destructive,
      textColor: colors.destructiveForeground,
      borderColor: colors.destructive,
    },
  };

  const sizePreset = SIZE_PRESETS[size] ?? SIZE_PRESETS.md;
  const currentPalette = palette[variant] ?? palette.primary;

  const childArray = React.Children.toArray(children);
  const defaultTextStyle = {
    color: currentPalette.textColor,
    fontFamily: typography.family,
    fontSize: sizePreset.fontSize,
    fontWeight: typography.weightMedium,
    textAlign: 'center',
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: currentPalette.backgroundColor,
          borderColor: variant === 'outline' ? currentPalette.borderColor : 'transparent',
          opacity: disabled ? 0.6 : 1,
          borderWidth: variant === 'outline' ? 2 : 0,
          borderRadius: radii.lg,
          paddingHorizontal: sizePreset.paddingHorizontal,
          paddingVertical: sizePreset.paddingVertical,
        },
        pressed && !disabled ? styles.pressed : undefined,
        style,
      ]}
      {...rest}
    >
      <View style={[styles.content, contentStyle]}>
        {childArray.map((child, index) => {
          const isLast = index === childArray.length - 1;

          if (typeof child === 'string' || typeof child === 'number') {
            return (
              <Text
                key={index}
                style={[
                  styles.text,
                  defaultTextStyle,
                  textStyle,
                  !isLast ? styles.spacing : null,
                ]}
              >
                {child}
              </Text>
            );
          }

          return (
            <View key={index} style={!isLast ? styles.spacing : null}>
              {child}
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.9,
  },
  spacing: {
    marginRight: 8,
  },
});
