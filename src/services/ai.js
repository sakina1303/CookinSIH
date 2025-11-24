import { Platform } from 'react-native';
import { initLlama, releaseAllLlama } from 'llama.rn';
import { evaluateQuizSession, buildPerformanceSummary } from '../utils/quiz';

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
      await releaseAllLlama().catch(() => {});
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
