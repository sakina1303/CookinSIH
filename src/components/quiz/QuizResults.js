import React from 'react';
import { Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { Trophy, TrendingUp, Home as HomeIcon, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { applyAlpha } from '../shared/colorUtils';
import { CardButton } from '../shared/CardButton';
import { evaluateQuizSession } from '../../utils/quiz';

export function QuizResults({ session, aiSummary, isGeneratingSummary, summaryError, onRetake, onHome }) {
  const { colors, radii, spacing, typography } = useTheme();
  const performance = React.useMemo(
    () => evaluateQuizSession(session, session?.questions),
    [session],
  );
  const correctCount = performance.correctCount;
  const totalQuestions = performance.total || session.totalQuestions;
  const incorrectCount = performance.incorrectCount + performance.skippedCount;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const suggestions = React.useMemo(() => {
    const tips = [];

    if (performance.incorrectCount > 0) {
      tips.push('Review the questions you missed and note the correct answers');
    }

    if (performance.skippedCount > 0) {
      tips.push('Try to answer every question—even an educated guess helps');
    }

    tips.push('Ask your AI tutor for a kid-friendly explanation');
    tips.push('Practice similar topics to build confidence');

    return tips.slice(0, 3);
  }, [performance.incorrectCount, performance.skippedCount]);
  const summaryParagraphs = aiSummary ? aiSummary.split('\n') : [];

  return (
    <View>
      <LinearGradient
        colors={[applyAlpha(colors.primary, 0.18), applyAlpha(colors.secondary, 0.16)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: radii.xl,
          borderWidth: 2,
          borderColor: applyAlpha(colors.primary, 0.24),
          padding: spacing.xl,
          alignItems: 'center',
          marginBottom: spacing.xl,
        }}
      >
        <Trophy size={48} color={colors.primary} style={{ marginBottom: spacing.md }} />
        <Text
          style={{
            fontFamily: typography.family,
            fontWeight: typography.weightBold,
            fontSize: 36,
            color: colors.foreground,
          }}
        >
          {scorePercentage}%
        </Text>
        <Text
          style={{
            marginTop: spacing.xs,
            fontFamily: typography.family,
            color: colors.mutedForeground,
            fontSize: 14,
          }}
        >
          You got {correctCount} out of {totalQuestions} correct
        </Text>
        <Text
          style={{
            marginTop: spacing.sm,
            fontFamily: typography.family,
            fontWeight: typography.weightMedium,
            color: colors.primary,
            fontSize: 15,
          }}
        >
          {scorePercentage >= 80 ? '🎉 Excellent work!' : scorePercentage >= 60 ? '👍 Good job!' : '💪 Keep practicing!'}
        </Text>
      </LinearGradient>

      <View
        style={{
          borderRadius: radii.xl,
          borderWidth: 2,
          borderColor: colors.border,
          backgroundColor: colors.card,
          padding: spacing.lg,
          marginBottom: spacing.xl,
        }}
      >
        <Svg height={200} width="100%" viewBox="0 0 320 200">
          <Rect x={40} y={40} width={240} height={1} fill={colors.border} />
          {[correctCount, incorrectCount].map((value, index) => {
            const x = 80 + index * 120;
            const safeTotal = totalQuestions > 0 ? totalQuestions : 1;
            const barHeight = (value / safeTotal) * 120;
            const y = 160 - barHeight;
            const fill = index === 0 ? colors.primary : colors.muted;
            const label = index === 0 ? 'Correct' : 'Incorrect';

            return (
              <React.Fragment key={label}>
                <Rect x={x} y={y} width={60} height={barHeight} rx={12} ry={12} fill={fill} />
                <SvgText
                  x={x + 30}
                  y={y - 10}
                  fill={fill}
                  fontSize={14}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {value}
                </SvgText>
                <SvgText
                  x={x + 30}
                  y={180}
                  fill={colors.mutedForeground}
                  fontSize={13}
                  textAnchor="middle"
                >
                  {index === 0 ? 'Correct' : 'Others'}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      <View
        style={{
          borderRadius: radii.xl,
          borderWidth: 2,
          borderColor: applyAlpha(colors.primary, 0.2),
          backgroundColor: applyAlpha(colors.primary, 0.08),
          padding: spacing.lg,
          marginBottom: spacing.xl,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
          <Sparkles size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
          <Text
            style={{
              fontFamily: typography.family,
              fontWeight: typography.weightMedium,
              color: colors.foreground,
              fontSize: 16,
            }}
          >
            AI Tutor Insight
          </Text>
        </View>

        {isGeneratingSummary ? (
          <Text
            style={{
              fontFamily: typography.family,
              color: colors.mutedForeground,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            Generating a personalized explanation...
          </Text>
        ) : summaryError ? (
          <Text
            style={{
              fontFamily: typography.family,
              color: colors.destructive,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            {summaryError}
          </Text>
        ) : aiSummary ? (
          summaryParagraphs
            .filter((paragraph) => paragraph.trim().length > 0)
            .map((paragraph, index, filtered) => (
            <Text
              key={`ai-summary-${index}`}
              style={{
                fontFamily: typography.family,
                color: colors.foreground,
                fontSize: 14,
                lineHeight: 20,
                marginBottom: index === filtered.length - 1 ? 0 : spacing.xs,
              }}
            >
              {paragraph.trim()}
            </Text>
          ))
        ) : (
          <Text
            style={{
              fontFamily: typography.family,
              color: colors.mutedForeground,
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            No AI summary available yet.
          </Text>
        )}
      </View>

      {performance.incorrectDetails.length > 0 ? (
        <View
          style={{
            borderRadius: radii.xl,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: spacing.lg,
            marginBottom: spacing.xl,
          }}
        >
          <Text
            style={{
              fontFamily: typography.family,
              fontWeight: typography.weightMedium,
              color: colors.foreground,
              fontSize: 16,
              marginBottom: spacing.sm,
            }}
          >
            Quick review
          </Text>
          {performance.incorrectDetails.slice(0, 3).map(({ index, question, selectedLetter, correctLetter }) => (
            <Text
              key={`mistake-${index}`}
              style={{
                fontFamily: typography.family,
                color: colors.mutedForeground,
                fontSize: 14,
                marginBottom: spacing.xs,
                lineHeight: 20,
              }}
            >
              Question {index + 1}: you picked {selectedLetter ?? 'no answer'} for "{question.question}", but the correct choice is {correctLetter}.
            </Text>
          ))}
        </View>
      ) : null}

      <View style={{ marginBottom: spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
          <TrendingUp size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
          <Text
            style={{
              fontFamily: typography.family,
              fontWeight: typography.weightMedium,
              color: colors.foreground,
              fontSize: 16,
            }}
          >
            How to improve
          </Text>
        </View>
        {suggestions.map((suggestion) => (
          <Text
            key={suggestion}
            style={{
              fontFamily: typography.family,
              color: colors.mutedForeground,
              fontSize: 14,
              marginBottom: spacing.xs,
            }}
          >
            ✓ {suggestion}
          </Text>
        ))}
      </View>

      <View>
        <CardButton
          variant="primary"
          size="lg"
          style={{ marginBottom: spacing.md }}
          onPress={onRetake}
        >
          <Trophy size={20} color={colors.primaryForeground} />
          Retake Quiz
        </CardButton>
        <CardButton variant="outline" size="lg" onPress={onHome}>
          <HomeIcon size={20} color={colors.foreground} />
          Go Home
        </CardButton>
      </View>
    </View>
  );
}
