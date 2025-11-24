import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Send, Mic } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

export function ChatInput({ value, onChange, onSend, isLoading }) {
  const insets = useSafeAreaInsets();
  const { colors, radii, spacing } = useTheme();

  const handleSubmit = () => {
    if (!isLoading && value.trim().length > 0) {
      onSend?.(value.trim());
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={insets.bottom + 60}
    >
      <View
        style={{
          paddingBottom: Math.max(insets.bottom, spacing.sm),
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View style={styles.row}>
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Ask me anything..."
            placeholderTextColor={colors.mutedForeground}
            style={{
              flex: 1,
              borderRadius: radii.xl,
              borderWidth: 2,
              borderColor: colors.border,
              paddingHorizontal: spacing.lg,
              paddingVertical: 12,
              color: colors.foreground,
              backgroundColor: colors.background,
              marginRight: spacing.sm,
            }}
            editable={!isLoading}
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
          />
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              {
                borderRadius: radii.lg,
                backgroundColor: colors.muted,
                marginRight: spacing.sm,
                opacity: isLoading ? 0.6 : pressed ? 0.85 : 1,
              },
            ]}
            disabled={isLoading}
          >
            <Mic size={20} color={colors.mutedForeground} />
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: colors.primary,
                borderRadius: radii.lg,
                opacity: isLoading || value.trim().length === 0 ? 0.6 : pressed ? 0.85 : 1,
              },
            ]}
            disabled={isLoading || value.trim().length === 0}
          >
            <Send size={20} color={colors.primaryForeground} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 12,
  },
  sendButton: {
    padding: 12,
  },
});
