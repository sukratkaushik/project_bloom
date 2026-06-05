/**
 * Pregnancy topic classifier to restrict chatbot interactions to pregnancy-related topics.
 */
export const isPregnancyRelated = (text: string): boolean => {
  const clean = text.toLowerCase().trim();
  if (!clean) return false;

  // 1. Check for greetings or simple conversational starters
  const greetings = [
    'hi', 'hello', 'hey', 'yo', 'sup', 'good morning', 'good afternoon', 'good evening',
    'how are you', 'how\'s it going', 'who are you', 'what are you', 'what is your name',
    'help', 'menu', 'options', 'start', 'restart', 'reset', 'clear', 'thank you', 'thanks', 'bye', 'goodbye'
  ];
  // If the entire text is just a greeting/thank you or start command
  if (greetings.includes(clean) || greetings.some(g => clean === g + '?' || clean === g + '!' || clean === g + '.')) {
    return true;
  }

  // 2. Comprehensive blocklist of unrelated fields (e.g. computer science, coding, politics, physics, non-pregnancy math, sports, movies, etc.)
  const blocklist = [
    // Programming / IT / Web development
    'python', 'javascript', 'typescript', 'write code', 'print hello', 'programming',
    'write a function', 'coding', 'software development', 'html', 'css', 'java', 'rust lang',
    'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'golang', 'sql', 'database', 'git',
    'docker', 'kubernetes', 'npm', 'yarn', 'pip', 'github', 'vscode', 'compiler', 'interpreter',
    'algorithm', 'data structure', 'machine learning', 'artificial intelligence', 'neural network',
    'frontend', 'backend', 'fullstack', 'web development', 'app development', 'debug', 'react', 'vue', 'angular',
    'bash', 'shell script', 'command line', 'programming language', 'hello world',
    // Mathematics / Calculus (non-pregnancy related)
    'solve equation', 'calculus', 'algebra', 'geometry', 'trigonometry', 'integral', 'derivative', 'matrix', 'quadratic',
    // General Knowledge / Science (unrelated to human biology/reproduction)
    'capital of', 'president of', 'prime minister', 'history of', 'quantum', 'astronomy', 'planet', 'galaxy',
    'chemistry', 'physics', 'geology', 'dinosaur', 'world war', 'historical', 'civil war',
    // Sports / Games
    'cricket', 'football', 'soccer', 'basketball', 'tennis', 'olympics', 'ipl', 'fifa', 'nba', 'player', 'match score',
    // Entertainment / Media
    'movie', 'actor', 'actress', 'singer', 'director', 'netflix', 'hollywood', 'bollywood', 'celebrity',
    // Non-pregnancy Finance / Tech / Vehicles / Real Estate
    'bitcoin', 'cryptocurrency', 'stock market', 'investing', 'car repair', 'motorcycle', 'automotive', 'real estate'
  ];

  if (blocklist.some(term => clean.includes(term))) {
    return false;
  }

  // 3. Positive keywords: if the text mentions any of these, we allow it.
  const pregnancyKeywords = [
    // Pregnancy core
    'pregnan', 'gestat', 'trimester', 'due date', 'concep', 'fertility', 'ovulation', 'miscarriage', 'ectopic', 'stillbirth',
    'fetus', 'fetal', 'embryo', 'womb', 'uterus', 'placenta', 'umbilical', 'cervix', 'amniotic', 'gestational',
    'week', 'trimester',
    // Baby & Child
    'baby', 'babies', 'newborn', 'infant', 'toddler', 'child', 'kid', 'son', 'daughter', 'boy', 'girl',
    'parent', 'mother', 'mom', 'mama', 'father', 'dad', 'papa', 'partner', 'husband', 'wife', 'family',
    // Symptoms / Health & Vitals
    'symptom', 'nausea', 'vomit', 'morning sickness', 'heartburn', 'acid reflux', 'indigestion', 'constipation',
    'diarrhea', 'gas', 'bloat', 'hemorrhoid', 'piles', 'swelling', 'edema', 'back pain', 'pelvic', 'sciatica',
    'fatigue', 'tired', 'sleep', 'insomnia', 'stretch mark', 'melasma', 'linea nigra', 'cramp', 'bleed', 'spotting',
    'headache', 'vision change', 'shortness of breath', 'fluid leaking', 'discharge', 'fever', 'chills', 'dizzy',
    'high blood pressure', 'bp', 'hypertension', 'preeclampsia', 'eclampsia', 'gestational diabetes', 'gdm',
    'blood sugar', 'glucose', 'weight', 'heart rate', 'pulse', 'vital', 'vitals', 'health', 'medical', 'pain',
    'body', 'fever', 'cold', 'flu', 'vaccin', 'immuniz', 'medicine', 'pill', 'supplement', 'vitamin', 'iron', 'calcium',
    'folic acid', 'folate',
    // Nutrition / Diet / Food
    'food', 'eat', 'drink', 'diet', 'nutrition', 'recipe', 'meal', 'fruit', 'vegetable', 'meat', 'fish', 'egg', 'dairy',
    'milk', 'cheese', 'papaya', 'pineapple', 'saffron', 'coconut', 'caffeine', 'coffee', 'tea', 'alcohol', 'wine', 'beer',
    'smoking', 'tobacco', 'drug', 'street food', 'ragi', 'dates', 'nut', 'seed', 'saf', 'hazard', 'risk', 'danger',
    // Care & Labor & Tracking
    'ob-gyn', 'obgyn', 'midwife', 'gynecologist', 'obstetrician', 'pediatrician', 'prenatal', 'postpartum', 'post-partum',
    'antenatal', 'c-section', 'cesarean', 'vaginal delivery', 'labor', 'contraction', 'water broke', 'delivery', 'birth',
    'breastfeed', 'breast milk', 'lactation', 'colostrum', 'formula feeding', 'diaper', 'lullaby', 
    'kick', 'kicks', 'count', 'counting', 'counter', 'movement', 'movements', 'ultrasound', 'scan', 'sonography',
    'hcg', 'progesterone', 'estrogen', 'hormone', 'bag', 'checklist', 'nursery', 'cot', 'crib', 'stroller', 'car seat',
    'swaddle', 'pacifier', 'teething', 'weaning', 'colic', 'tummy time', 'milestone', 'growth chart', 'doula', 'epidural',
    'pain relief', 'nesting', 'braxton hicks', 'kegel', 'pelvic floor', 'prenatal yoga', 'exercise', 'stretch',
    'anxiety', 'mood swing', 'baby blues', 'postpartum depression', 'ppd', 'mental health',
    // App features / Administration
    'tracker', 'budget', 'finance', 'pmmvy', 'jsy', 'scheme', 'maternity leave', 'delivery cost', 'hospital cost',
    'baby name', 'suggest names', 'name', 'names', 'naming', 'meaning',
    // General helpful descriptors/actions
    'doctor', 'physician', 'call', 'consult', 'rule', 'rules', 'guideline', 'guidelines', 'normal', 'abnormal',
    'high', 'low', 'average', 'level', 'levels', 'test', 'tests', 'result', 'results', 'advice', 'advise',
    'prevent', 'cause', 'effect', 'safety', 'warning', 'danger', 'alert', 'time', 'when', 'schedule', 'planning'
  ];

  // If the query contains any of the positive keywords, allow it
  if (pregnancyKeywords.some(keyword => clean.includes(keyword))) {
    return true;
  }

  // 4. General question patterns with safety check
  const questionPatterns = [
    'safe to', 'can i', 'should i', 'is it normal', 'how to treat', 'how to cure',
    'what happens when', 'why does my', 'feel like', 'sensation in'
  ];

  if (questionPatterns.some(pattern => clean.includes(pattern))) {
    const healthWords = ['body', 'health', 'pain', 'sore', 'belly', 'stomach', 'ache', 'skin', 'sleep', 'feel'];
    if (healthWords.some(hw => clean.includes(hw))) {
      return true;
    }
  }

  return false;
};
