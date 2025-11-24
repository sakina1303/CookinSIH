export function evaluateQuizSession(session, questions = []) {
  if (!session || !Array.isArray(questions) || questions.length === 0) {
    return {
      total: 0,
      answeredCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      skippedCount: 0,
      details: [],
      incorrectDetails: [],
    };
  }

  const details = questions.map((question, index) => {
    const selectedLetter = session.answers?.[index] ?? null;
    const selectedIndex = typeof selectedLetter === 'string' ? selectedLetter.charCodeAt(0) - 65 : null;
    const correctLetter = String.fromCharCode(65 + (question.correct ?? 0));
    const isAnswered = selectedIndex !== null && !Number.isNaN(selectedIndex);
    const isCorrect = isAnswered && selectedIndex === question.correct;

    return {
      index,
      question,
      selectedLetter,
      correctLetter,
      isAnswered,
      isCorrect,
    };
  });

  const answeredDetails = details.filter((detail) => detail.isAnswered);
  const incorrectDetails = answeredDetails.filter((detail) => !detail.isCorrect);

  return {
    total: questions.length,
    answeredCount: answeredDetails.length,
    correctCount: answeredDetails.length - incorrectDetails.length,
    incorrectCount: incorrectDetails.length,
    skippedCount: details.length - answeredDetails.length,
    details,
    incorrectDetails,
  };
}

export function buildPerformanceSummary(performance) {
  if (!performance || performance.total === 0) {
    return {
      headline: 'No quiz answers were recorded.',
      mistakeSummaries: [],
    };
  }

  const headlineParts = [`They answered ${performance.answeredCount} out of ${performance.total} questions.`];

  const accuracyLineBase = `They got ${performance.correctCount} correct and ${performance.incorrectCount} incorrect`;
  const accuracyLine = performance.skippedCount > 0
    ? `${accuracyLineBase}, and skipped ${performance.skippedCount}.`
    : `${accuracyLineBase}.`;

  headlineParts.push(accuracyLine);

  const mistakeSummaries = performance.incorrectDetails
    .slice(0, 3)
    .map(({ index, question, selectedLetter, correctLetter }) => {
      const promptIndex = index + 1;
      const chosen = selectedLetter ? `answer ${selectedLetter}` : 'no answer';
      return `Question ${promptIndex}: chose ${chosen} for "${question.question}", but the correct answer is ${correctLetter}.`;
    });

  return {
    headline: headlineParts.join(' '),
    mistakeSummaries,
  };
}
