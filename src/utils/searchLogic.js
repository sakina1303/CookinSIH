// ==========================================
// FUNCTION A: EXTRACT KEYWORDS
// ==========================================
const STOP_WORDS = new Set([
  "a", "an", "the", "what", "is", "how", "to", "do", "explain", "tell", "me",
  "ki", "hai", "kiven", "si", "ate", "vich"
]);

export const extractKeywords = (userQuestion) => {
  if (!userQuestion) return "";

  // 1. Remove special chars but keep English + Punjabi
  const cleanText = userQuestion
    .toLowerCase()
    .replace(/[^\w\s\u0a00-\u0a7f]/g, "");

  // 2. Remove stopwords
  const words = cleanText
    .split(/\s+/)
    .filter((w) => !STOP_WORDS.has(w) && w.length > 1);

  // 3. Join using AND for FTS5 search
  return words.join(" AND ");
};

// ==========================================
// FUNCTION C: CONSTRUCT PROMPT (The Glue)
// ==========================================
export const constructPrompt = (userQuestion, context) => {
  return `
<|im_start|>system
You are a kind and helpful tutor for rural students. 
Answer the question using ONLY the Context below. 
Keep the answer simple and easy to understand.
If the answer is not in the Context, say "I don't know".

CONTEXT:
${context}
<|im_end|>

<|im_start|>user
${userQuestion}
<|im_end|>

<|im_start|>assistant
`;
};