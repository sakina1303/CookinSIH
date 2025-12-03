import { Platform } from 'react-native';
import { initLlama, releaseAllLlama } from 'llama.rn';
import { evaluateQuizSession, buildPerformanceSummary } from '../utils/quiz';
import { getRandomChunks } from './database';

const MODEL_FILENAME = 'qwen2.5-1.5b-q4_k_m.gguf';
let llamaContextPromise;

const STOP_WORDS = ['</s>', '<|im_end|>', '<|end|>', '<|endoftext|>', '<|EOT|>'];
const MAX_CHAT_MESSAGES = 8;

const TUTOR_SYSTEM_PROMPT =
  'You are a friendly offline tutor for curious middle school students. Explain ideas with short paragraphs, warm encouragement, and plain language. Only use bullet points if the learner specifically asks.';

const SUBJECT_TOPIC_HINTS = {
  science: 'chemical reactions',
  mathematics: 'fractions and multiplication basics',
  physics: 'forces, motion, and simple experiments',
  english: 'reading comprehension and grammar tips',
  history: 'important events and why they matter',
  coding: 'fundamentals of writing simple programs',
};

async function getLlamaContext() {
  if (!llamaContextPromise) {
    llamaContextPromise = (async () => {
      const params = await resolveModelParams();
      return initLlama({
        ...params,
        n_ctx: 4096,
        n_batch: 512,
        n_gpu_layers: Platform.OS === 'ios' ? 99 : 0,
        use_mlock: Platform.OS === 'ios',
        use_mmap: true,
        flash_attn_type: 'auto',
      });
    })().catch(async (error) => {
      llamaContextPromise = null;
      await releaseAllLlama().catch(() => { });
      throw error;
    });
  }

  return llamaContextPromise;
}

function buildTopic(session) {
  const subjectId = session?.subjectId?.toLowerCase?.();
  return SUBJECT_TOPIC_HINTS[subjectId] ?? `${session?.subjectName ?? 'the subject'} fundamentals`;
}

async function resolveModelParams() {
  if (Platform.OS === 'ios') {
    return {
      model: MODEL_FILENAME,
      is_model_asset: true,
    };
  }

  throw new Error('Local Llama model is only configured for iOS right now.');
}

function buildUserPrompt(session, performanceSummary) {
  const topic = buildTopic(session);
  const subjectLine = session?.subjectName ? `This was for a ${session.subjectName} practice quiz.` : '';

  const lines = [
    `Please explain ${topic} like you are teaching a curious 10-year-old.`,
    'Keep the explanation upbeat and easy to follow.',
    'Use short paragraphs and plain language, no bullet points.',
    'Give exactly two everyday life examples so the learner can picture the idea.',
    subjectLine,
    performanceSummary.headline,
  ];

  if (performanceSummary.mistakeSummaries.length > 0) {
    lines.push(
      'The learner would love gentle fixes for these tricky questions:',
      performanceSummary.mistakeSummaries.join(' '),
    );
  }

  return lines.join(' ');
}

function buildMessages(session, performanceSummary) {
  const topic = buildTopic(session);
  const userPrompt = buildUserPrompt(session, performanceSummary);

  return [
    {
      role: 'system',
      content: 'You are a friendly tutor who keeps concepts simple and encourages kids with positive reinforcement.',
    },
    {
      role: 'user',
      content: userPrompt,
    },
    {
      role: 'user',
      content: `Focus your answer on ${topic}. End with a one-sentence cheer for the learner.`,
    },
  ];
}

export async function generateQuizSummary(session) {
  const context = await getLlamaContext();
  const performance = evaluateQuizSession(session, session?.questions);
  const performanceSummary = buildPerformanceSummary(performance);
  const messages = buildMessages(session, performanceSummary);

  const result = await context.completion({
    messages,
    n_predict: 400,
    temperature: 0.8,
    top_p: 0.95,
    stop: STOP_WORDS,
  });

  const finalText = result?.text?.trim?.();
  if (!finalText) {
    return 'I could not put together a tutor message this time, but I believe you can master this topic—try again soon!';
  }

  return finalText;
}

function mapConversation(conversation = []) {
  return conversation
    .filter((message) => typeof message?.content === 'string' && message.content.trim().length > 0)
    .slice(-MAX_CHAT_MESSAGES)
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content,
    }));
}

export async function generateTutorResponse(conversation) {
  const context = await getLlamaContext();
  const history = mapConversation(conversation);
  const messages = [
    { role: 'system', content: TUTOR_SYSTEM_PROMPT },
    ...history,
  ];

  const result = await context.completion({
    messages,
    n_predict: 320,
    temperature: 0.75,
    top_p: 0.9,
    stop: STOP_WORDS,
  });

  const finalText = result?.text?.trim?.();
  if (!finalText) {
    throw new Error('Tutor model returned an empty response');
  }

  return finalText;
}

export async function preloadTutorModel() {
  if (Platform.OS !== 'ios') {
    return;
  }

  try {
    await getLlamaContext();
  } catch (error) {
    console.warn('Failed to preload tutor model', error);
  }
}

/**
 * Generate quiz questions from database content using AI
 * @param {number} numberOfQuestions - Number of questions to generate
 * @returns {Promise<Array>} Array of quiz questions
 */
export async function generateQuizQuestions(numberOfQuestions = 10) {
  try {
    // Get random chunks from the database
    const chunks = await getRandomChunks(Math.min(numberOfQuestions, 5));

    if (chunks.length === 0) {
      throw new Error('No content available in the database');
    }

    // Combine chunks into context
    const contentContext = chunks.map(chunk => chunk.content).join('\n\n');

    const context = await getLlamaContext();

    const systemPrompt = `You are a quiz generator for middle school students. Based on the provided textbook content, create ${numberOfQuestions} multiple-choice questions. Each question must have exactly 4 options (A, B, C, D) and one correct answer. Format your response as a JSON array. Each question object must have: "question" (string), "options" (array of 4 strings), and "correct" (number 0-3 for the correct option index). Make questions educational and appropriate for the content level. Focus on understanding concepts, not just memorization.`;

    const userPrompt = `Based on this content:\n\n${contentContext.substring(0, 2000)}\n\nGenerate ${numberOfQuestions} multiple-choice questions with 4 options each. Return ONLY a valid JSON array, no other text.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const result = await context.completion({
      messages,
      n_predict: 800,
      temperature: 0.7,
      top_p: 0.9,
      stop: STOP_WORDS,
    });

    const responseText = result?.text?.trim?.();

    if (!responseText) {
      console.error('AI returned empty response for quiz generation');
      return getFallbackQuestions();
    }

    // Try to parse JSON from the response
    let questions = [];
    try {
      // Extract JSON if wrapped in markdown code blocks
      let jsonText = responseText;
      const jsonMatch = responseText.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      } else {
        // Try to find JSON array in the response
        const arrayMatch = responseText.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          jsonText = arrayMatch[0];
        }
      }

      questions = JSON.parse(jsonText);

      // Validate questions structure
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      questions = questions.filter(q =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correct === 'number' &&
        q.correct >= 0 &&
        q.correct <= 3
      );

      if (questions.length < numberOfQuestions / 2) {
        console.warn('Too few valid questions generated, using fallback');
        return getFallbackQuestions();
      }

      // Ensure we have the requested number of questions
      while (questions.length < numberOfQuestions) {
        questions = [...questions, ...questions].slice(0, numberOfQuestions);
      }

      return questions.slice(0, numberOfQuestions);

    } catch (parseError) {
      console.error('Failed to parse AI quiz response:', parseError);
      console.log('Raw response:', responseText);
      return getFallbackQuestions();
    }

  } catch (error) {
    console.error('Error generating quiz questions:', error);
    return getFallbackQuestions();
  }
}

/**
 * Fallback questions when AI generation fails
 */
function getFallbackQuestions() {
  return [
    {
      question: 'What happens when a chemical reaction takes place?',
      options: [
        'Only physical properties change',
        'The nature and identity of substances change',
        'Nothing changes',
        'Only temperature changes'
      ],
      correct: 1,
    },
    {
      question: 'What is observed when magnesium ribbon burns in air?',
      options: [
        'It turns blue',
        'It produces a bright white light',
        'It becomes liquid',
        'Nothing happens'
      ],
      correct: 1,
    },
    {
      question: 'What type of reaction occurs when hydrogen gas is formed from zinc and acid?',
      options: [
        'Decomposition',
        'Displacement',
        'Combination',
        'Neutralization'
      ],
      correct: 1,
    },
    {
      question: 'Which of the following is a sign of a chemical reaction?',
      options: [
        'Change in shape',
        'Change in size',
        'Formation of gas or precipitate',
        'Change in location'
      ],
      correct: 2,
    },
    {
      question: 'In a chemical equation, what do the reactants represent?',
      options: [
        'Products formed after reaction',
        'Substances present after reaction',
        'Substances that undergo change',
        'Final result'
      ],
      correct: 2,
    },
    {
      question: 'What is the product when magnesium burns in air?',
      options: [
        'Magnesium chloride',
        'Magnesium oxide',
        'Magnesium hydroxide',
        'Magnesium carbonate'
      ],
      correct: 1,
    },
    {
      question: 'Why is it important to balance a chemical equation?',
      options: [
        'To make it look neat',
        'To follow the law of conservation of mass',
        'To use more symbols',
        'To make it longer'
      ],
      correct: 1,
    },
    {
      question: 'What does the arrow (→) represent in a chemical equation?',
      options: [
        'Direction of heat',
        'Yields or produces',
        'Equals to',
        'Moving backwards'
      ],
      correct: 1,
    },
    {
      question: 'Which gas is produced when zinc reacts with dilute sulphuric acid?',
      options: [
        'Oxygen',
        'Hydrogen',
        'Carbon dioxide',
        'Nitrogen'
      ],
      correct: 1,
    },
    {
      question: 'What precaution should be taken while burning magnesium ribbon?',
      options: [
        'Look directly at it',
        'Touch it with bare hands',
        'Keep it away from eyes',
        'Burn it in a closed room'
      ],
      correct: 2,
    },
  ];
}

/**
 * Generate AI insights for quiz results based on actual content and performance
 * @param {Object} session - Quiz session with answers
 * @param {Array} contentChunks - Content chunks used for the quiz
 * @returns {Promise<string>} AI-generated insights
 */
export async function generateQuizInsights(session, contentChunks = []) {
  try {
    const context = await getLlamaContext();
    const performance = evaluateQuizSession(session, session?.questions);
    const performanceSummary = buildPerformanceSummary(performance);

    // Build context from content chunks if available
    let contentContext = '';
    if (contentChunks && contentChunks.length > 0) {
      contentContext = '\n\nThe quiz was based on this content:\n' +
        contentChunks.map(chunk => chunk.content).join('\n').substring(0, 1500);
    }

    const systemPrompt = 'You are an encouraging tutor analyzing a student\'s quiz performance. Provide personalized, constructive feedback that motivates the student and helps them improve. Keep your response warm, friendly, and under 200 words.';

    const userPrompt = `A student just completed a quiz. Here are their results:
${performanceSummary.headline}

${performanceSummary.mistakeSummaries.length > 0
        ? 'They struggled with:\n' + performanceSummary.mistakeSummaries.slice(0, 2).join('\n')
        : 'They did great on all questions!'}
${contentContext}

Provide encouraging feedback and helpful tips for improvement. Focus on building confidence and understanding. End with a motivational message.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const result = await context.completion({
      messages,
      n_predict: 350,
      temperature: 0.8,
      top_p: 0.95,
      stop: STOP_WORDS,
    });

    const finalText = result?.text?.trim?.();
    if (!finalText) {
      return getFallbackInsight(performance);
    }

    return finalText;
  } catch (error) {
    console.error('Error generating quiz insights:', error);
    return getFallbackInsight(session ? evaluateQuizSession(session, session?.questions) : null);
  }
}

/**
 * Fallback insight when AI generation fails
 */
function getFallbackInsight(performance) {
  if (!performance || performance.total === 0) {
    return "Great job attempting the quiz! Keep practicing and you'll see improvement. Remember, every question you answer helps you learn something new. Keep up the excellent work! 🌟";
  }

  const score = performance.correctCount;
  const total = performance.total;
  const percentage = Math.round((score / total) * 100);

  if (percentage >= 80) {
    return `Excellent work! You scored ${score} out of ${total}! You have a strong understanding of the material. Keep up this fantastic effort! Your dedication to learning really shows. 🌟`;
  } else if (percentage >= 60) {
    return `Good job! You scored ${score} out of ${total}. You're on the right track! Review the questions you missed and try to understand the concepts better. With a bit more practice, you'll master this topic! 📚`;
  } else {
    return `You scored ${score} out of ${total}. Don't worry - learning takes time! Review the material carefully and try the quiz again. Each attempt helps you understand better. You've got this! 💪`;
  }
}

