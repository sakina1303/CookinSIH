import React from 'react';
import { ScrollView, View, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '../theme';
import { Header } from '../components/navigation/Header';
import { QuizHome } from '../components/quiz/QuizHome';
import { QuizPlay } from '../components/quiz/QuizPlay';
import { QuizResults } from '../components/quiz/QuizResults';
import { generateQuizQuestions, generateQuizInsights } from '../services/ai';
import { getRandomChunks } from '../services/database';

export function QuizScreen() {
  const { colors, spacing } = useTheme();
  const [state, setState] = React.useState('home');
  const [session, setSession] = React.useState(null);
  const [aiSummary, setAiSummary] = React.useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false);
  const [summaryError, setSummaryError] = React.useState(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = React.useState(false);
  const [contentChunks, setContentChunks] = React.useState([]);

  const handleStartQuiz = async (subject) => {
    setAiSummary(null);
    setSummaryError(null);
    setIsGeneratingSummary(false);
    setIsGeneratingQuiz(true);
    setState('loading');

    try {
      // Generate quiz questions from database content
      const questions = await generateQuizQuestions(10);

      // Get content chunks for later use in insights
      const chunks = await getRandomChunks(3);
      setContentChunks(chunks);

      const answers = Array(questions.length).fill(null);
      setSession({
        subjectId: subject.id,
        subjectName: subject.name,
        totalQuestions: questions.length,
        currentQuestion: 0,
        answers,
        questions,
      });
      setState('playing');
    } catch (error) {
      console.error('Error generating quiz:', error);
      setState('home');
      // You might want to show an error message to the user here
    } finally {
      setIsGeneratingQuiz(false);
    }
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
        const summary = await generateQuizInsights(session, contentChunks);
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
  }, [aiSummary, isGeneratingSummary, session, state, contentChunks]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Practice Quizzes" showSettings={false} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {state === 'home' && <QuizHome onStartQuiz={handleStartQuiz} isGenerating={isGeneratingQuiz} />}
        {state === 'loading' && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.xxl }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{
              marginTop: spacing.lg,
              color: colors.mutedForeground,
              fontSize: 16,
              fontFamily: 'System'
            }}>
              Generating quiz from textbook content...
            </Text>
          </View>
        )}
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
