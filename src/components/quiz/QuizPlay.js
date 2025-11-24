import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { CardButton } from '../shared/CardButton';
import { applyAlpha } from '../shared/colorUtils';

export const QUIZ_QUESTIONS = [
  {
    question: 'What is the capital of France?',
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    correct: 1,
  },
  {
    question: 'Which planet is closest to the Sun?',
    options: ['Venus', 'Mercury', 'Earth', 'Mars'],
    correct: 1,
  },
  {
    question: 'What is 15 × 12?',
    options: ['160', '180', '200', '220'],
    correct: 1,
  },
  {
    question: 'Who wrote Romeo and Juliet?',
    options: ['Jane Austen', 'William Shakespeare', 'Mark Twain', 'Charles Dickens'],
    correct: 1,
  },
  {
    question: 'What is the chemical symbol for Gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correct: 2,
  },
  {
    question: 'Which country is home to the Great Wall?',
    options: ['Japan', 'India', 'China', 'Vietnam'],
    correct: 2,
  },
  {
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correct: 3,
  },
  {
    question: 'In what year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correct: 2,
  },
  {
    question: 'What is the smallest unit of life?',
    options: ['Atom', 'Molecule', 'Cell', 'Organ'],
    correct: 2,
  },
  {
    question: 'Which programming language is known for web development?',
    options: ['Python', 'JavaScript', 'C++', 'Java'],
    correct: 1,
  },
];

export function QuizPlay({ session, onAnswerSelect, onNext }) {
  const { colors, radii, spacing, typography } = useTheme();
  const questions = session?.questions ?? QUIZ_QUESTIONS;
  const totalQuestions = session?.totalQuestions ?? questions.length;
  const currentQuestion = questions[session.currentQuestion];
  const progress = ((session.currentQuestion + 1) / totalQuestions) * 100;
  const selected = session.answers[session.currentQuestion];

  if (!currentQuestion) {
    return null;
  }

  return (
    <View>
      <View style={{ marginBottom: spacing.lg }}>
        <View style={styles.progressRow}>
          <Text
            style={{
              fontFamily: typography.family,
              fontSize: 13,
              color: colors.mutedForeground,
              fontWeight: typography.weightMedium,
            }}
          >
            Question {session.currentQuestion + 1} of {totalQuestions}
          </Text>
          <Text
            style={{
              fontFamily: typography.family,
              fontWeight: typography.weightBold,
              color: colors.primary,
            }}
          >
            {Math.round(progress)}%
          </Text>
        </View>
        <View
          style={{
            height: 8,
            backgroundColor: colors.border,
            borderRadius: radii.full,
            overflow: 'hidden',
            marginTop: 12,
          }}
        >
          <View
            style={{
              width: `${progress}%`,
              backgroundColor: colors.primary,
              height: '100%',
              borderRadius: radii.full,
            }}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: colors.muted,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <Text
          style={{
            fontFamily: typography.family,
            color: colors.mutedForeground,
            fontSize: 13,
          }}
        >
          Time per question
        </Text>
        <Text
          style={{
            fontFamily: typography.family,
            fontWeight: typography.weightBold,
            color: colors.primary,
            fontSize: 18,
          }}
        >
          60s
        </Text>
      </View>

      <Text
        style={{
          fontFamily: typography.family,
          fontWeight: typography.weightBold,
          fontSize: 20,
          color: colors.foreground,
          lineHeight: 26,
          marginBottom: spacing.lg,
        }}
      >
        {currentQuestion.question}
      </Text>

      {currentQuestion.options.map((option, index) => {
        const label = String.fromCharCode(65 + index);
        const isSelected = selected === label;
        return (
          <Pressable
            key={option}
            onPress={() => onAnswerSelect?.(index)}
            style={({ pressed }) => [
              styles.option,
              {
                borderRadius: radii.lg,
                borderWidth: 2,
                borderColor: isSelected ? colors.primary : colors.border,
                backgroundColor: isSelected ? applyAlpha(colors.primary, 0.12) : colors.card,
                padding: spacing.md,
                marginBottom: spacing.md,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: radii.md,
                  backgroundColor: isSelected ? colors.primary : colors.muted,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                }}
              >
                <Text
                  style={{
                    color: isSelected ? colors.primaryForeground : colors.mutedForeground,
                    fontFamily: typography.family,
                    fontWeight: typography.weightBold,
                  }}
                >
                  {label}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: typography.family,
                  color: colors.foreground,
                  fontSize: 15,
                }}
              >
                {option}
              </Text>
            </View>
          </Pressable>
        );
      })}

      <CardButton
        variant="primary"
        size="lg"
        style={{ marginTop: spacing.lg }}
        disabled={!selected}
        onPress={onNext}
      >
        {session.currentQuestion === totalQuestions - 1 ? 'Finish' : 'Next'}
      </CardButton>
    </View>
  );
}

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  option: {
    borderRadius: 16,
  },
});
