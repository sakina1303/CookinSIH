import React from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '../theme';
import { Header } from '../components/navigation/Header';
import { QuizHome } from '../components/quiz/QuizHome';
import { QuizPlay, QUIZ_QUESTIONS } from '../components/quiz/QuizPlay';
import { QuizResults } from '../components/quiz/QuizResults';
import { generateQuizSummary } from '../services/ai';

const TOTAL_QUESTIONS = QUIZ_QUESTIONS.length;

export function QuizScreen() {
  const { colors, spacing } = useTheme();
  const [state, setState] = React.useState('home');
  const [session, setSession] = React.useState(null);
  const [aiSummary, setAiSummary] = React.useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false);
  const [summaryError, setSummaryError] = React.useState(null);

  const handleStartQuiz = (subject) => {
    setAiSummary(null);
    setSummaryError(null);
    setIsGeneratingSummary(false);
    const answers = Array(TOTAL_QUESTIONS).fill(null);
    setSession({
      subjectId: subject.id,
      subjectName: subject.name,
      totalQuestions: TOTAL_QUESTIONS,
      currentQuestion: 0,
      answers,
      questions: QUIZ_QUESTIONS,
    });
    setState('playing');
  };

  const handleAnswerSelect = (answerIndex) => {
    setSession((prev) => {
      if (!prev) return prev;
      const choice = String.fromCharCode(65 + answerIndex);
      const updated = [...prev.answers];
      updated[prev.currentQuestion] = choice;
      return { ...prev, answers: updated };
    });
  };

  const handleNext = () => {
    setSession((prev) => {
      if (!prev) return prev;
      if (prev.currentQuestion >= prev.totalQuestions - 1) {
        setState('results');
        return prev;
      }
      return { ...prev, currentQuestion: prev.currentQuestion + 1 };
    });
  };

  const handleRetake = () => {
    if (!session) return;
    handleStartQuiz({ id: session.subjectId, name: session.subjectName });
  };

  const handleHome = () => {
    setState('home');
    setSession(null);
    setAiSummary(null);
    setSummaryError(null);
    setIsGeneratingSummary(false);
  };

  React.useEffect(() => {
    if (state !== 'results' || !session) {
      return;
    }

    if (aiSummary || isGeneratingSummary) {
      return;
    }

    let isMounted = true;
    const fetchSummary = async () => {
      try {
        setIsGeneratingSummary(true);
        setSummaryError(null);
        const summary = await generateQuizSummary(session);
        if (isMounted) {
          setAiSummary(summary);
        }
      } catch (error) {
        console.error('AI summary error:', error);
        if (isMounted) {
          setSummaryError('Unable to fetch the AI explanation right now. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsGeneratingSummary(false);
        }
      }
    };

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [aiSummary, isGeneratingSummary, session, state]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Practice Quizzes" showSettings={false} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {state === 'home' && <QuizHome onStartQuiz={handleStartQuiz} />}
        {state === 'playing' && session ? (
          <QuizPlay session={session} onAnswerSelect={handleAnswerSelect} onNext={handleNext} />
        ) : null}
        {state === 'results' && session ? (
          <QuizResults
            session={session}
            aiSummary={aiSummary}
            isGeneratingSummary={isGeneratingSummary}
            summaryError={summaryError}
            onRetake={handleRetake}
            onHome={handleHome}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
