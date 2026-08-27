/**
 * Lightweight topic classifier to filter blatant non-pregnancy abuse/spam
 * while letting all natural pregnancy, travel, symptom, nutrition, and parenting questions reach Bloom AI.
 */
export const isPregnancyRelated = (text: string): boolean => {
  const clean = text.toLowerCase().trim();
  if (!clean) return false;

  // 1. Hard blocklist of blatant non-pregnancy topics (e.g. programming, cryptocurrency, non-pregnancy math)
  const blocklist = [
    // Programming / IT
    'write code', 'print hello', 'write a function', 'write python', 'write javascript', 'write script',
    'coding in', 'software development', 'html code', 'css code', 'react component code',
    'dockerfile', 'kubernetes cluster', 'sql query', 'git commit', 'compiler error',
    // Non-pregnancy math
    'solve equation', 'calculus integral', 'matrix multiplication',
    // Crypto / finance
    'bitcoin mining', 'cryptocurrency trading', 'forex trading', 'stock market predictions',
    // Random mechanics
    'car engine repair', 'motorcycle maintenance'
  ];

  if (blocklist.some(term => clean.includes(term))) {
    return false;
  }

  // Allow all natural user conversations and pregnancy queries through to Bloom AI
  return true;
};
