export interface BabyNameEntry {
  name: string;
  meaning: string;
  origin: string;
  gender: 'Boy' | 'Girl' | 'Neutral';
  style:
    | 'Modern'
    | 'Traditional Sanskrit'
    | 'Islamic / Arabic'
    | 'Sikh / Punjabi'
    | 'Nature Inspired'
    | 'Global / Western';
  themes: string[];
}

export interface NameFilterCriteria {
  gender: string;
  origin: string;
  startingLetter?: string;
  keywords?: string;
  excludeNames?: string[];
}

type CompactSeed = [string, string, 'Boy' | 'Girl' | 'Neutral', string[]];

const STYLE_ORIGIN_LABEL: Record<BabyNameEntry['style'], string> = {
  'Sikh / Punjabi': 'Sikh / Punjabi',
  'Traditional Sanskrit': 'Sanskrit',
  'Modern': 'Modern / Global',
  'Islamic / Arabic': 'Islamic / Arabic',
  'Nature Inspired': 'Nature Inspired',
  'Global / Western': 'Global / Western'
};

const SEED_BY_STYLE: Record<BabyNameEntry['style'], CompactSeed[]> = {
  'Sikh / Punjabi': [
    // A
    ['Amrit', 'Sacred divine nectar of immortality and spiritual peace', 'Neutral', ['peace', 'calm', 'grace', 'devotion', 'light']],
    ['Anhad', 'Unstruck boundless celestial melody of the universe', 'Boy', ['peace', 'calm', 'star', 'celestial', 'grace']],
    ['Avneet', 'Modest, ethical, grounded like the nurturing earth', 'Girl', ['nature', 'earth', 'grace', 'devotion', 'peace']],
    ['Asees', 'Sacred heartfelt blessing and divine grace', 'Girl', ['grace', 'devotion', 'peace', 'light']],
    ['Angad', 'Fearless warrior, inseparable limb of the divine Guru', 'Boy', ['strength', 'courage', 'devotion']],
    ['Agam', 'Infinite, unfathomable cosmic wisdom of God', 'Neutral', ['star', 'celestial', 'peace', 'grace']],
    ['Arshdeep', 'Radiant lamp of the celestial heavens', 'Neutral', ['light', 'radiance', 'star', 'celestial']],
    ['Amandeep', 'Radiant lamp of peace and tranquil harmony', 'Neutral', ['light', 'radiance', 'peace', 'calm']],
    ['Anmol', 'Priceless, precious gem of divine grace', 'Neutral', ['grace', 'devotion', 'light']],
    ['Armaan', 'Noble wish, heartfelt aspiration and hope', 'Boy', ['star', 'celestial', 'strength']],
    ['Aviraj', 'Shining as brightly as the sovereign sun', 'Boy', ['light', 'radiance', 'strength']],
    ['Arshnoor', 'Radiant divine light of the celestial sky', 'Girl', ['light', 'radiance', 'star', 'celestial']],
    ['Amreen', 'Serene sky of royal grace and peace', 'Girl', ['star', 'celestial', 'grace', 'peace']],
    // B
    ['Bani', 'Sacred hymns and divine words of the Gurus', 'Girl', ['grace', 'devotion', 'peace', 'calm']],
    ['Barkat', 'Abundant blessings, prosperity, and divine grace', 'Girl', ['grace', 'devotion', 'nature', 'earth']],
    ['Balraj', 'Mighty ruler of supreme strength and courage', 'Boy', ['strength', 'courage']],
    ['Bikramjit', 'Victorious through valor, bravery, and honor', 'Boy', ['strength', 'courage']],
    ['Bhavleen', 'Deeply absorbed in sacred devotion and love', 'Girl', ['grace', 'devotion', 'peace']],
    ['Brahmjot', 'Sacred celestial light of the Supreme Creator', 'Neutral', ['light', 'radiance', 'star', 'celestial']],
    ['Balveen', 'Courageous, graceful, and enlightened spirit', 'Girl', ['strength', 'courage', 'grace']],
    ['Bahaar', 'Blooming spring season, fresh beauty of nature', 'Girl', ['nature', 'earth', 'peace']],
    ['Balveer', 'Courageous warrior of truth and honor', 'Boy', ['strength', 'courage']],
    ['Bakhshish', 'Sacred divine gift and compassionate blessing', 'Neutral', ['grace', 'devotion', 'peace']],
    // C
    ['Charanjeet', 'One who wins hearts at the sacred feet of the Guru', 'Neutral', ['grace', 'devotion', 'peace']],
    ['Chann', 'Shining moon, gentle celestial radiance in the night', 'Neutral', ['light', 'radiance', 'star', 'celestial']],
    ['Charanpreet', 'Devoted love for the sacred path of truth', 'Girl', ['grace', 'devotion', 'peace']],
    ['Chiragdeep', 'Ever-glowing lamp of hope and bright radiance', 'Boy', ['light', 'radiance']],
    ['Charanleen', 'Absorbed at the Guru\'s sacred lotus feet', 'Girl', ['grace', 'devotion', 'peace']],
    ['Chandanbir', 'Brave and serene as fragrant sandalwood', 'Boy', ['nature', 'earth', 'strength', 'peace']],
    ['Chitwan', 'Radiant, mindful and affectionate gaze', 'Neutral', ['peace', 'calm', 'grace']],
    ['Charanveer', 'Courageous follower of righteous truth', 'Boy', ['strength', 'courage', 'devotion']],
    ['Chahat', 'Pure heartfelt love and serene devotion', 'Girl', ['grace', 'devotion', 'peace']],
    // D
    ['Diljit', 'Conqueror of hearts through kindness and courage', 'Boy', ['strength', 'courage', 'grace']],
    ['Divjot', 'Radiant divine flame of spiritual light', 'Girl', ['light', 'radiance', 'grace', 'devotion']],
    ['Damanpreet', 'Calm, victorious love that overcomes all obstacles', 'Neutral', ['peace', 'calm', 'strength']],
    ['Dilpreet', 'Beloved of the heart, warm and affectionate', 'Girl', ['grace', 'peace', 'calm']],
    ['Dilshad', 'Joyful, serene heart filled with happiness', 'Neutral', ['peace', 'calm', 'light']],
    ['Deepinder', 'Radiant light of the heavenly Lord', 'Boy', ['light', 'radiance', 'star', 'celestial']],
    ['Dilnoor', 'Divine light of a pure, loving heart', 'Girl', ['light', 'radiance', 'grace']],
    ['Deepkiran', 'Radiant ray of a glowing sacred lamp', 'Girl', ['light', 'radiance']],
    ['Damanveer', 'Courageous protector of peace and justice', 'Boy', ['strength', 'courage', 'peace']],
    ['Daljit', 'Victorious leader of the noble and brave', 'Boy', ['strength', 'courage']],
    // E
    ['Ekam', 'Oneness of the Supreme Creator (Ik Onkar)', 'Neutral', ['peace', 'calm', 'grace', 'devotion', 'star']],
    ['Eknoor', 'The one supreme divine light of creation', 'Girl', ['light', 'radiance', 'grace', 'devotion']],
    ['Ekjot', 'One eternal flame of truth and radiance', 'Neutral', ['light', 'radiance', 'devotion']],
    ['Ekveer', 'Unmatched hero of singular courage and valor', 'Boy', ['strength', 'courage']],
    ['Eshleen', 'Absorbed in the divine grace of the Creator', 'Girl', ['grace', 'devotion', 'peace']],
    ['Ekroop', 'United in form with the divine truth', 'Girl', ['grace', 'devotion', 'peace']],
    ['Eshpreet', 'Loving devotion to the Almighty', 'Girl', ['grace', 'devotion']],
    ['Ekamjit', 'Victorious in spiritual oneness and truth', 'Boy', ['strength', 'peace', 'grace']],
    ['Ekamveer', 'Courageous champion of universal oneness', 'Boy', ['strength', 'courage']],
    // F
    ['Fateh', 'Sacred victory of righteousness and courage', 'Boy', ['strength', 'courage', 'grace']],
    ['Falak', 'Boundless starry sky and celestial heavens', 'Girl', ['star', 'celestial', 'light', 'nature']],
    ['Fatehveer', 'Victorious and fearless warrior of truth', 'Boy', ['strength', 'courage']],
    ['Fiza', 'Fresh morning breeze and serene natural atmosphere', 'Girl', ['nature', 'earth', 'peace', 'calm']],
    ['Falaknoor', 'Radiant light of the celestial starry sky', 'Girl', ['light', 'radiance', 'star', 'celestial']],
    ['Fatehleen', 'Absorbed in victorious divine grace', 'Girl', ['grace', 'devotion', 'strength']],
    ['Fatehjit', 'Triumphant champion of righteousness', 'Boy', ['strength', 'courage']],
    ['Farhaan', 'Joyful, radiant spirit blessed with peace', 'Boy', ['peace', 'light']],
    ['Fatehjot', 'Victorious flame of divine light', 'Neutral', ['light', 'radiance', 'strength']],
    // G
    ['Gurleen', 'Deeply absorbed in the grace of the Guru', 'Girl', ['grace', 'devotion', 'peace', 'calm']],
    ['Gurnoor', 'Radiant divine light of the Guru', 'Neutral', ['light', 'radiance', 'grace', 'devotion']],
    ['Gurfateh', 'Victory bestowed by the grace of the Guru', 'Boy', ['strength', 'courage', 'grace']],
    ['Guntaas', 'Treasure of noble virtues and peaceful grace', 'Girl', ['grace', 'devotion', 'peace']],
    ['Gurmehar', 'Compassionate blessing and grace of the Guru', 'Neutral', ['grace', 'devotion', 'peace']],
    ['Gurveer', 'Brave warrior of the Guru who stands for truth', 'Boy', ['strength', 'courage']],
    ['Gagan', 'Vast celestial sky and boundless horizon', 'Neutral', ['star', 'celestial', 'nature', 'earth']],
    ['Gurbani', 'Sacred melodious word and wisdom of the Guru', 'Girl', ['grace', 'devotion', 'peace']],
    ['Gurjot', 'Sacred flame of divine enlightenment', 'Neutral', ['light', 'radiance', 'grace']],
    // H
    ['Harleen', 'Immersed in the peaceful remembrance of God', 'Girl', ['grace', 'devotion', 'peace', 'calm']],
    ['Harnoor', 'Divine radiance and sacred light of the Almighty', 'Girl', ['light', 'radiance', 'grace', 'devotion']],
    ['Harman', 'Beloved of God\'s heart, filled with peace', 'Neutral', ['peace', 'calm', 'grace', 'devotion']],
    ['Harveer', 'Courageous warrior of the Divine', 'Boy', ['strength', 'courage']],
    ['Harsimran', 'Sacred meditation and serene remembrance of God', 'Neutral', ['peace', 'calm', 'grace', 'devotion']],
    ['Himmat', 'Unshakable courage, valor, and noble resolve', 'Boy', ['strength', 'courage']],
    ['Hargun', 'Endowed with divine virtues and spiritual grace', 'Girl', ['grace', 'devotion']],
    ['Harmehar', 'Compassionate blessing and grace of God', 'Girl', ['grace', 'devotion', 'peace']],
    ['Harjot', 'Radiant flame of the Almighty', 'Neutral', ['light', 'radiance', 'grace']],
    // I
    ['Inayat', 'Kindness, sacred blessing, and compassionate grace', 'Girl', ['grace', 'devotion', 'peace', 'calm']],
    ['Ikroop', 'Serene reflection of the One Divine Creator', 'Girl', ['grace', 'devotion', 'light']],
    ['Inderjit', 'Victorious lord of celestial strength and grace', 'Boy', ['strength', 'courage', 'star', 'celestial']],
    ['Ishmeet', 'True friend of the Divine, peaceful and loving', 'Neutral', ['peace', 'calm', 'grace', 'devotion']],
    ['Iknoor', 'One radiant divine light illuminating the soul', 'Girl', ['light', 'radiance', 'grace', 'devotion']],
    ['Ibaadat', 'Sacred worship, devotion, and spiritual peace', 'Girl', ['grace', 'devotion', 'peace']],
    ['Ishleen', 'Absorbed in divine grace and serenity', 'Girl', ['grace', 'devotion', 'peace']],
    ['Inderveer', 'Brave celestial warrior of truth', 'Boy', ['strength', 'courage', 'star']],
    ['Ikjot', 'One eternal flame of divine radiance', 'Neutral', ['light', 'radiance', 'grace']],
    // J
    ['Jasleen', 'Absorbed in singing God\'s glorious praises and grace', 'Girl', ['grace', 'devotion', 'peace', 'calm']],
    ['Japji', 'Sacred morning prayer of Guru Nanak; divine wisdom and peace', 'Girl', ['peace', 'calm', 'grace', 'devotion', 'light']],
    ['Jaskiran', 'Radiant ray of divine glory and morning light', 'Girl', ['light', 'radiance', 'star', 'celestial', 'grace']],
    ['Jasnoor', 'Divine light of glory and celestial radiance', 'Girl', ['light', 'radiance', 'grace', 'devotion', 'star']],
    ['Jasmeet', 'Celebrated friend of divine grace, peace, and harmony', 'Girl', ['peace', 'calm', 'grace', 'devotion']],
    ['Jannat', 'Sacred paradise, blooming garden of peace and earth', 'Girl', ['nature', 'earth', 'peace', 'calm', 'grace']],
    ['Jiya', 'Pure heart filled with radiant life, warmth, and love', 'Girl', ['light', 'radiance', 'peace', 'grace']],
    ['Japneet', 'Eternal moral devotion and peaceful meditation', 'Girl', ['grace', 'devotion', 'peace', 'calm']],
    ['Jaskaur', 'Princess of noble glory, strength, and courage', 'Girl', ['strength', 'courage', 'grace']],
    ['Jeevika', 'Source of life, pure flowing stream of nature', 'Girl', ['nature', 'earth', 'peace', 'light']],
    ['Jujhar', 'Fearless warrior who strives for truth and justice', 'Boy', ['strength', 'courage']],
    ['Jaskaran', 'Doer of glorious, righteous deeds and noble service', 'Boy', ['grace', 'devotion', 'strength', 'courage']],
    ['Jaiveer', 'Victorious and courageous warrior of light', 'Boy', ['strength', 'courage', 'light']],
    ['Japjot', 'Sacred flame of divine meditation and radiance', 'Boy', ['light', 'radiance', 'grace', 'devotion']],
    ['Jasraj', 'Sovereign ruler of glory, honor, and courage', 'Boy', ['strength', 'courage', 'grace']],
    ['Joban', 'Radiant youth and blooming vitality of nature', 'Boy', ['nature', 'earth', 'light', 'radiance']],
    ['Jashan', 'Joyous celebration of divine blessings and peace', 'Neutral', ['peace', 'calm', 'grace', 'light']],
    ['Jot', 'Sacred divine light and celestial inner flame', 'Neutral', ['light', 'radiance', 'star', 'celestial']],
    // K
    ['Kiranpreet', 'Love for the radiant rays of morning light', 'Girl', ['light', 'radiance', 'grace']],
    ['Kudrat', 'Mother Nature, sacred creation of the Almighty', 'Girl', ['nature', 'earth', 'peace', 'grace']],
    ['Kirpa', 'Divine mercy, compassion, and sacred grace', 'Girl', ['grace', 'devotion', 'peace']],
    ['Karanveer', 'Chivalrous, generous warrior of noble courage', 'Boy', ['strength', 'courage']],
    ['Kabir', 'Great, revered saint whose hymns adorn Guru Granth Sahib', 'Boy', ['grace', 'devotion', 'peace', 'strength']],
    ['Kanwaljit', 'Victorious lotus blooming pure in serene waters', 'Neutral', ['nature', 'earth', 'peace', 'strength']],
    ['Kamalpreet', 'Pure love like a blooming lotus flower', 'Girl', ['nature', 'earth', 'grace', 'peace']],
    ['Kirat', 'Honest devotion and singing divine praises', 'Neutral', ['grace', 'devotion', 'peace']],
    ['Karamjit', 'Victorious through noble deeds and grace', 'Boy', ['strength', 'courage', 'grace']],
    // L
    ['Livleen', 'Deeply absorbed in continuous love for the Divine', 'Girl', ['grace', 'devotion', 'peace', 'calm']],
    ['Livjot', 'Connected to the eternal flame of divine light', 'Neutral', ['light', 'radiance', 'grace', 'devotion']],
    ['Lakhveer', 'Brave warrior as noble and courageous as a hundred thousand', 'Boy', ['strength', 'courage']],
    ['Lovepreet', 'Affectionate spirit radiating warmth and harmony', 'Neutral', ['peace', 'calm', 'grace']],
    ['Livpreet', 'Heart attuned to divine love and serenity', 'Girl', ['grace', 'devotion', 'peace']],
    ['Lishkara', 'Brilliant flash of radiant celestial light', 'Girl', ['light', 'radiance', 'star']],
    ['Lakhjit', 'Victorious protector of noble strength', 'Boy', ['strength', 'courage']],
    ['Livnoor', 'Immersed in divine celestial radiance', 'Girl', ['light', 'radiance', 'grace']],
    // M
    ['Meher', 'Divine grace, benevolent blessing, and compassion', 'Girl', ['grace', 'devotion', 'peace', 'calm', 'light']],
    ['Mannat', 'Sacred prayer, heartfelt vow fulfilled by grace', 'Girl', ['grace', 'devotion', 'peace']],
    ['Manreet', 'Tradition of a pure, peaceful, and loving heart', 'Girl', ['peace', 'calm', 'grace']],
    ['Manveer', 'Courageous and noble-hearted hero', 'Boy', ['strength', 'courage']],
    ['Manjot', 'Radiant light of a pure, awakened mind', 'Neutral', ['light', 'radiance', 'peace']],
    ['Mehtab', 'Radiant full moon illuminating the night sky', 'Neutral', ['light', 'radiance', 'star', 'celestial']],
    ['Manleen', 'Mind absorbed in divine serenity and grace', 'Girl', ['peace', 'calm', 'grace', 'devotion']],
    ['Manraj', 'Sovereign of noble hearts and courage', 'Boy', ['strength', 'courage']],
    ['Mandeep', 'Glowing lamp of an enlightened mind', 'Neutral', ['light', 'radiance', 'peace']],
    // N
    ['Nimrat', 'Sacred humility, modesty, and serene grace', 'Girl', ['grace', 'devotion', 'peace', 'calm']],
    ['Noor', 'Divine celestial light and spiritual radiance', 'Neutral', ['light', 'radiance', 'star', 'celestial', 'grace']],
    ['Navneet', 'Ever-fresh, pure, and gentle spirit', 'Neutral', ['peace', 'calm', 'nature']],
    ['Navraj', 'New era of noble rule, strength, and leadership', 'Boy', ['strength', 'courage']],
    ['Noorpreet', 'Beloved of the divine radiant light', 'Girl', ['light', 'radiance', 'grace']],
    ['Nirvair', 'Free from enmity; embodying pure universal peace', 'Boy', ['peace', 'calm', 'grace', 'devotion']],
    ['Navjot', 'New morning flame of radiant light and hope', 'Neutral', ['light', 'radiance', 'peace']],
    ['Navleen', 'Freshly absorbed in divine grace and devotion', 'Girl', ['grace', 'devotion', 'peace']],
    ['Noorveer', 'Courageous warrior of divine light', 'Boy', ['light', 'radiance', 'strength', 'courage']],
    // O
    ['Onkar', 'The One Supreme Being present in all creation', 'Boy', ['grace', 'devotion', 'peace', 'star']],
    ['Ojasleen', 'Radiant vitality absorbed in divine grace', 'Girl', ['light', 'radiance', 'strength', 'grace']],
    ['Onkarpreet', 'Devoted love for the One Supreme Creator', 'Neutral', ['grace', 'devotion', 'peace']],
    ['Ojasveer', 'Brave warrior of radiant inner strength', 'Boy', ['strength', 'courage', 'light']],
    ['Ojasnoor', 'Radiant light of spiritual vitality', 'Girl', ['light', 'radiance', 'grace']],
    ['Onkarjit', 'Victorious through the grace of the One Creator', 'Boy', ['strength', 'courage', 'grace']],
    ['Ojasjot', 'Sacred flame of radiant energy', 'Neutral', ['light', 'radiance', 'strength']],
    // P
    ['Prabhleen', 'Absorbed in the serene love of the Almighty', 'Girl', ['grace', 'devotion', 'peace', 'calm']],
    ['Prabhnoor', 'Radiant celestial light of the Divine Lord', 'Girl', ['light', 'radiance', 'grace', 'devotion']],
    ['Paramveer', 'Supreme hero of unmatched courage and valor', 'Boy', ['strength', 'courage']],
    ['Parneet', 'Guided by supreme truth, grace, and harmony', 'Girl', ['grace', 'peace']],
    ['Pukhraj', 'Precious golden topaz gem radiating warmth', 'Boy', ['light', 'radiance', 'nature', 'earth']],
    ['Prabhjot', 'Radiant flame of the Divine Lord', 'Neutral', ['light', 'radiance', 'grace', 'devotion']],
    ['Paramjit', 'Supremely victorious in truth and courage', 'Boy', ['strength', 'courage']],
    ['Pavanpreet', 'Pure love like a gentle, soothing breeze', 'Girl', ['nature', 'earth', 'peace', 'calm']],
    // Q
    ['Qudrat', 'Sacred beauty of Mother Nature and divine creation', 'Girl', ['nature', 'earth', 'grace', 'peace']],
    ['Qamarjot', 'Radiant light of the celestial full moon', 'Neutral', ['light', 'radiance', 'star', 'celestial']],
    ['Qudratveer', 'Brave guardian of sacred nature', 'Boy', ['nature', 'earth', 'strength', 'courage']],
    ['Qudratnoor', 'Divine light of nature\'s creation', 'Girl', ['light', 'radiance', 'nature', 'earth']],
    ['Qamarveer', 'Shining warrior of the night sky', 'Boy', ['star', 'celestial', 'strength']],
    ['Qudratleen', 'Immersed in the serene peace of nature', 'Girl', ['nature', 'earth', 'peace', 'calm']],
    // R
    ['Rabab', 'Sacred musical instrument played for Guru Nanak\'s hymns', 'Girl', ['peace', 'calm', 'grace', 'devotion']],
    ['Rehmat', 'Divine mercy, compassionate blessing, and grace', 'Girl', ['grace', 'devotion', 'peace', 'calm']],
    ['Ranveer', 'Victorious and fearless hero in battle', 'Boy', ['strength', 'courage']],
    ['Ranjit', 'Victorious protector of righteousness and peace', 'Boy', ['strength', 'courage']],
    ['Ravneet', 'Radiant as the morning sun, ethical and warm', 'Girl', ['light', 'radiance', 'nature']],
    ['Roop', 'Luminous beauty and graceful divine reflection', 'Girl', ['light', 'radiance', 'grace']],
    ['Rajveer', 'Brave prince of noble courage and honor', 'Boy', ['strength', 'courage']],
    ['Ravjot', 'Radiant flame of the golden sun', 'Neutral', ['light', 'radiance', 'star']],
    // S
    ['Sehaj', 'State of natural equipoise, serene peace, and spiritual calm', 'Neutral', ['peace', 'calm', 'grace', 'devotion', 'nature']],
    ['Simran', 'Loving meditation and sacred remembrance of the Divine', 'Girl', ['grace', 'devotion', 'peace', 'calm']],
    ['Sukhman', 'Peaceful heart and tranquil soul (from Sukhmani Sahib)', 'Neutral', ['peace', 'calm', 'grace', 'devotion']],
    ['Sartaj', 'Crown jewel of noble leadership and honor', 'Boy', ['strength', 'courage', 'light']],
    ['Saanvi', 'Radiant grace, followed with auspicious devotion', 'Girl', ['grace', 'devotion', 'light']],
    ['Samarveer', 'Courageous warrior who stands serene and strong', 'Boy', ['strength', 'courage']],
    ['Simarleen', 'Immersed in sacred remembrance and peace', 'Girl', ['grace', 'devotion', 'peace', 'calm']],
    ['Sehajnoor', 'Serene light of spiritual peace and radiance', 'Girl', ['light', 'radiance', 'peace', 'calm']],
    ['Sahibjit', 'Victorious through the Master\'s divine grace', 'Boy', ['strength', 'courage', 'grace']],
    // T
    ['Taranjeet', 'Victorious savior who brings peace across life\'s ocean', 'Neutral', ['peace', 'calm', 'strength', 'grace']],
    ['Tavleen', 'Deeply immersed in divine grace and devotion', 'Girl', ['grace', 'devotion', 'peace']],
    ['Tejveer', 'Glorious warrior radiating brilliant light and courage', 'Boy', ['light', 'radiance', 'strength', 'courage']],
    ['Taranpreet', 'Loving soul who radiates liberating grace', 'Girl', ['grace', 'devotion', 'peace']],
    ['Tejnoor', 'Brilliant radiance of divine light', 'Girl', ['light', 'radiance', 'grace']],
    ['Tanveer', 'Illuminated by celestial rays of light', 'Neutral', ['light', 'radiance', 'star', 'celestial']],
    ['Taranveer', 'Courageous liberator and protector of truth', 'Boy', ['strength', 'courage']],
    // U
    ['Udayveer', 'Rising hero shining like the morning sun', 'Boy', ['light', 'radiance', 'strength', 'courage']],
    ['Upasana', 'Serene devotion and sacred reverence', 'Girl', ['grace', 'devotion', 'peace']],
    ['Udaynoor', 'Radiant light of the rising morning dawn', 'Girl', ['light', 'radiance', 'nature']],
    ['Udayjot', 'Sacred flame of the rising sun', 'Neutral', ['light', 'radiance', 'star']],
    ['Ujjwaldeep', 'Bright, pure lamp of spiritual radiance', 'Boy', ['light', 'radiance']],
    ['Upneet', 'Guided by noble truth and serene grace', 'Girl', ['peace', 'calm', 'grace']],
    // V
    ['Vani', 'Sacred spiritual voice and melodious wisdom', 'Girl', ['grace', 'devotion', 'peace']],
    ['Viraj', 'Resplendent sovereign shining across the cosmos', 'Boy', ['light', 'radiance', 'star', 'strength']],
    ['Vikramjeet', 'Victorious through valor, bravery, and honor', 'Boy', ['strength', 'courage']],
    ['Vismit', 'Filled with sacred wonder and divine grace', 'Girl', ['grace', 'devotion', 'peace']],
    ['Veerjot', 'Courageous flame of radiant light', 'Neutral', ['light', 'radiance', 'strength']],
    ['Vanshveer', 'Brave torchbearer of noble heritage', 'Boy', ['strength', 'courage']],
    // W
    ['Waris', 'Noble heir of spiritual heritage and poetic grace', 'Boy', ['grace', 'strength']],
    ['Wamiqa', 'Cherished, deeply loved and graceful spirit', 'Girl', ['grace', 'peace']],
    ['Wafa', 'Faithful devotion, loyalty, and pure grace', 'Girl', ['grace', 'devotion', 'peace']],
    ['Warisveer', 'Courageous guardian of sacred heritage', 'Boy', ['strength', 'courage']],
    ['Waqar', 'Serene dignity, calm majesty and poise', 'Neutral', ['peace', 'calm', 'strength']],
    ['Warisleen', 'Immersed in sacred spiritual heritage', 'Girl', ['grace', 'devotion']],
    // X
    ['Xara', 'Shining princess of morning light and grace', 'Girl', ['light', 'radiance', 'star']],
    ['Xylan', 'Peaceful forest sanctuary of nature', 'Neutral', ['nature', 'earth', 'peace', 'calm']],
    ['Xaviar', 'Bright, splendid new beginning of light', 'Boy', ['light', 'radiance']],
    ['Xyla', 'Serene woodland dweller of nature', 'Girl', ['nature', 'earth', 'peace']],
    ['Xander', 'Courageous defender and protector of peace', 'Boy', ['strength', 'courage']],
    ['Xiana', 'Gracious light of the morning dawn', 'Girl', ['light', 'radiance', 'grace']],
    // Y
    ['Yuvraj', 'Young prince of noble courage and generosity', 'Boy', ['strength', 'courage']],
    ['Yashleen', 'Immersed in divine glory and peaceful grace', 'Girl', ['grace', 'devotion', 'peace']],
    ['Yashveer', 'Courageous hero of glorious fame', 'Boy', ['strength', 'courage', 'light']],
    ['Yashnoor', 'Radiant light of divine praise and glory', 'Girl', ['light', 'radiance', 'grace']],
    ['Yuvika', 'Young, radiant moonlight in the night sky', 'Girl', ['light', 'radiance', 'star', 'celestial']],
    ['Yudhveer', 'Steadfast warrior in life\'s noble battles', 'Boy', ['strength', 'courage']],
    // Z
    ['Zorawar', 'Mighty, fearless warrior of unwavering strength', 'Boy', ['strength', 'courage']],
    ['Zeenat', 'Graceful adornment, radiant beauty and honor', 'Girl', ['light', 'radiance', 'grace']],
    ['Zoya', 'Loving, vibrant and joyous soul', 'Girl', ['peace', 'calm', 'grace', 'light']],
    ['Zooni', 'Serene silvery moonlight in the valley', 'Girl', ['light', 'radiance', 'star', 'celestial', 'nature']],
    ['Zafarjit', 'Victorious through noble resolve and courage', 'Boy', ['strength', 'courage']],
    ['Zeeshan', 'Dignified, radiant celestial stature', 'Boy', ['star', 'celestial', 'strength']]
  ],

  'Traditional Sanskrit': [
    ['Advait', 'Unique, non-dual spiritual oneness of the cosmos', 'Boy', ['peace', 'calm', 'grace', 'devotion']],
    ['Agastya', 'Revered Vedic sage who illuminates the southern star Canopus', 'Boy', ['star', 'celestial', 'light', 'strength']],
    ['Ananya', 'Incomparable, matchless grace and devotion', 'Girl', ['grace', 'devotion', 'peace']],
    ['Arundhati', 'Morning star of fidelity, devotion, and celestial wisdom', 'Girl', ['star', 'celestial', 'grace', 'devotion', 'light']],
    ['Atharv', 'First Veda of sacred wisdom, peace, and auspicious knowledge', 'Boy', ['peace', 'calm', 'grace', 'devotion']],
    ['Aditi', 'Boundless sky, mother of celestial gods, freedom', 'Girl', ['star', 'celestial', 'nature', 'earth', 'grace']],
    ['Bhargav', 'Radiant brilliance of Lord Shiva and sacred wisdom', 'Boy', ['light', 'radiance', 'grace', 'devotion']],
    ['Bhavya', 'Auspicious, grand, radiant manifestation of Parvati', 'Girl', ['grace', 'devotion', 'light', 'radiance']],
    ['Bhoomi', 'Sacred Mother Earth, patient and nurturing', 'Girl', ['nature', 'earth', 'peace', 'calm']],
    ['Bharat', 'Universal monarch, cherished sustainer of truth', 'Boy', ['strength', 'courage', 'grace']],
    ['Chaitanya', 'Pure divine consciousness, radiant life energy', 'Neutral', ['light', 'radiance', 'peace', 'grace']],
    ['Charvi', 'Luminous beauty, graceful and radiant moonlight', 'Girl', ['light', 'radiance', 'grace']],
    ['Chandrika', 'Serene silvery moonlight illuminating the night', 'Girl', ['light', 'radiance', 'star', 'celestial']],
    ['Chiranjeev', 'Immortal, blessed with enduring vitality', 'Boy', ['strength', 'peace']],
    ['Dev', 'Divine, shining, celestial spirit of light', 'Boy', ['light', 'radiance', 'grace', 'devotion']],
    ['Devika', 'Sacred Himalayan river, divine grace and purity', 'Girl', ['nature', 'earth', 'grace', 'devotion', 'peace']],
    ['Dhruv', 'Unshakable North Star (Polaris), steadfast and eternal', 'Boy', ['star', 'celestial', 'strength', 'courage', 'light']],
    ['Damini', 'Radiant flash of lightning in the sky', 'Girl', ['light', 'radiance', 'nature']],
    ['Eshaan', 'Lord Shiva, auspicious guardian of the northeast sun', 'Boy', ['light', 'radiance', 'grace', 'devotion']],
    ['Ekavali', 'Single strand of precious pearls, pure grace', 'Girl', ['grace', 'peace']],
    ['Falguni', 'Born under the auspicious spring constellation Uttara Phalguni', 'Girl', ['star', 'celestial', 'nature', 'earth']],
    ['Fanish', 'Cosmic serpent guardian of eternal wisdom', 'Boy', ['strength', 'grace']],
    ['Gauri', 'Radiant golden goddess Parvati, pure and serene', 'Girl', ['light', 'radiance', 'grace', 'devotion']],
    ['Gautam', 'Remover of darkness through radiant wisdom', 'Boy', ['light', 'radiance', 'peace', 'calm']],
    ['Gayatri', 'Sacred Vedic mother of hymns and solar light', 'Girl', ['light', 'radiance', 'grace', 'devotion']],
    ['Harshvardhan', 'Creator of joy, abundance, and noble strength', 'Boy', ['peace', 'strength']],
    ['Hamsika', 'Graceful celestial swan of Goddess Saraswati', 'Girl', ['grace', 'devotion', 'peace', 'nature']],
    ['Hrishikesh', 'Lord Vishnu, master of the senses and inner peace', 'Boy', ['peace', 'calm', 'grace', 'devotion']],
    ['Ishan', 'The rising sun, Lord Shiva, guardian of auspicious wealth', 'Boy', ['light', 'radiance', 'grace', 'devotion']],
    ['Ishani', 'Consort of Shiva, ruling goddess of serene strength', 'Girl', ['strength', 'courage', 'grace', 'devotion']],
    ['Indira', 'Goddess Lakshmi of splendour, earth, and grace', 'Girl', ['grace', 'devotion', 'light']],
    ['Janaki', 'Goddess Sita, daughter of the earth, pure devotion', 'Girl', ['nature', 'earth', 'grace', 'devotion', 'strength']],
    ['Janhavi', 'Sacred celestial river Ganga bringing purity and peace', 'Girl', ['nature', 'earth', 'peace', 'calm', 'grace']],
    ['Jyotsna', 'Radiant moonlight illuminating the tranquil night', 'Girl', ['light', 'radiance', 'star', 'celestial', 'peace']],
    ['Jeevika', 'Sacred source of life and pure flowing water', 'Girl', ['nature', 'earth', 'peace', 'light']],
    ['Jagruti', 'Spiritual awakening, radiant mindfulness and light', 'Girl', ['light', 'radiance', 'peace', 'grace']],
    ['Jayanti', 'Victorious goddess Parvati, radiant and courageous', 'Girl', ['strength', 'courage', 'grace', 'devotion']],
    ['Jagrav', 'Awakened, radiant guardian of truth and vigilance', 'Boy', ['light', 'radiance', 'strength', 'courage']],
    ['Jayant', 'Victorious like the moon and Lord Vishnu', 'Boy', ['strength', 'courage', 'star', 'celestial']],
    ['Jishnu', 'Triumphant, radiant like Arjuna and the sun', 'Boy', ['strength', 'courage', 'light', 'radiance']],
    ['Jaidev', 'Divine victory of light and righteousness', 'Boy', ['light', 'radiance', 'strength', 'grace']],
    ['Jatin', 'Ascetic sage, disciplined and serene like Shiva', 'Boy', ['peace', 'calm', 'grace', 'devotion']],
    ['Jyotir', 'Primordial cosmic light of the stars and sun', 'Neutral', ['light', 'radiance', 'star', 'celestial']],
    ['Keshav', 'Lord Krishna, radiant and compassionate protector', 'Boy', ['grace', 'devotion', 'peace']],
    ['Kavya', 'Sacred classical poetry, prophetic wisdom and grace', 'Girl', ['grace', 'peace', 'calm']],
    ['Kalyani', 'Auspicious, blessed, melodious sacred raga', 'Girl', ['grace', 'devotion', 'peace']],
    ['Kartikeya', 'Commander of celestial armies, son of Shiva', 'Boy', ['strength', 'courage', 'star', 'celestial']],
    ['Lakshmi', 'Goddess of auspiciousness, light, and grace', 'Girl', ['light', 'radiance', 'grace', 'devotion']],
    ['Lakshman', 'Endowed with auspicious marks and loyal courage', 'Boy', ['strength', 'courage', 'devotion']],
    ['Madhav', 'Sweet as spring honey, name of Lord Krishna', 'Boy', ['nature', 'earth', 'grace', 'devotion', 'peace']],
    ['Maitreyi', 'Vedic philosopher-sage of friendship, wisdom, and light', 'Girl', ['peace', 'calm', 'grace', 'light']],
    ['Mythili', 'Princess of Mithila, Goddess Sita of grace', 'Girl', ['grace', 'devotion', 'strength']],
    ['Mrinal', 'Delicate stem of the sacred lotus flower', 'Neutral', ['nature', 'earth', 'peace']],
    ['Nandini', 'Bringer of joy, sacred river Ganga, blissful grace', 'Girl', ['nature', 'earth', 'grace', 'peace']],
    ['Narayan', 'Refuge of all beings, serene cosmic protector', 'Boy', ['peace', 'calm', 'grace', 'devotion']],
    ['Niharika', 'Dewdrops at dawn and starry celestial nebula', 'Girl', ['star', 'celestial', 'nature', 'earth', 'light']],
    ['Ojaswini', 'Radiant with vital spiritual energy and lustre', 'Girl', ['light', 'radiance', 'strength']],
    ['Omkar', 'Sacred primordial sound of the universe', 'Boy', ['peace', 'calm', 'grace', 'devotion']],
    ['Pranav', 'The sacred primordial syllable Om, cosmic vibration', 'Boy', ['peace', 'calm', 'grace', 'devotion', 'star']],
    ['Parvati', 'Daughter of the sacred Himalayan mountains', 'Girl', ['nature', 'earth', 'strength', 'grace', 'devotion']],
    ['Priyamvada', 'One who speaks with sweet, serene grace', 'Girl', ['peace', 'calm', 'grace']],
    ['Reva', 'Sacred Narmada river, bright star, graceful movement', 'Girl', ['nature', 'earth', 'star', 'celestial', 'grace']],
    ['Raghav', 'Descendant of Raghu, Lord Rama, noble and courageous', 'Boy', ['strength', 'courage', 'grace', 'devotion']],
    ['Rudra', 'Mighty cosmic roar of Lord Shiva, fearless protector', 'Boy', ['strength', 'courage', 'devotion']],
    ['Rukmini', 'Radiant princess adorned with gold, consort of Krishna', 'Girl', ['light', 'radiance', 'grace', 'devotion']],
    ['Shlok', 'Sacred Vedic verse of praise and divine harmony', 'Boy', ['grace', 'devotion', 'peace']],
    ['Shreya', 'Auspicious, radiant goddess Lakshmi of grace', 'Girl', ['grace', 'devotion', 'light']],
    ['Siddharth', 'One who has attained enlightenment and serene peace', 'Boy', ['peace', 'calm', 'light', 'grace']],
    ['Saraswati', 'Goddess of flowing wisdom, music, and purity', 'Girl', ['grace', 'devotion', 'peace', 'nature']],
    ['Tejaswini', 'Radiant, lustrous, gifted with brilliant inner light', 'Girl', ['light', 'radiance', 'strength', 'courage']],
    ['Tanmay', 'Deeply absorbed in sacred contemplation and peace', 'Boy', ['peace', 'calm', 'grace']],
    ['Uma', 'Tranquil light, Goddess Parvati of eternal grace', 'Girl', ['light', 'radiance', 'peace', 'grace', 'devotion']],
    ['Udayan', 'Rising sun bringing warmth and new dawn', 'Boy', ['light', 'radiance', 'star']],
    ['Vedant', 'Ultimate spiritual wisdom of the Vedas, supreme truth', 'Boy', ['peace', 'calm', 'grace', 'devotion']],
    ['Vaidehi', 'Goddess Sita, embodying earth\'s resilience and grace', 'Girl', ['nature', 'earth', 'grace', 'devotion', 'strength']],
    ['Vasudha', 'Nurturing Mother Earth, giver of abundance', 'Girl', ['nature', 'earth', 'grace']],
    ['Yashasvi', 'Glorious, blessed with radiant success and grace', 'Neutral', ['light', 'radiance', 'strength', 'grace']],
    ['Yajur', 'Sacred Vedic wisdom of devotion and action', 'Boy', ['grace', 'devotion', 'strength']]
  ],

  'Modern': [
    ['Aarav', 'Peaceful melody, calm wisdom and radiant harmony', 'Boy', ['peace', 'calm', 'light']],
    ['Arin', 'Mountain of strength, enlightened peace and joy', 'Neutral', ['strength', 'courage', 'peace', 'nature']],
    ['Arya', 'Noble, honorable, courageous melody of truth', 'Neutral', ['strength', 'courage', 'grace']],
    ['Aanya', 'Inexhaustible grace and radiant kindness', 'Girl', ['grace', 'devotion', 'light']],
    ['Avyaan', 'Born with auspicious grace and bright beginnings', 'Boy', ['light', 'radiance', 'grace']],
    ['Bhumi', 'Grounded, modern spirit of Mother Earth', 'Girl', ['nature', 'earth', 'peace']],
    ['Cian', 'Ancient, enduring strength and calm spirit', 'Boy', ['strength', 'peace']],
    ['Cia', 'Radiant moonlight and serene grace', 'Girl', ['light', 'radiance', 'star']],
    ['Diya', 'Radiant lamp of hope, warm glowing light', 'Girl', ['light', 'radiance', 'grace']],
    ['Darsh', 'Sight of the auspicious new moon, Lord Krishna', 'Boy', ['star', 'celestial', 'grace', 'light']],
    ['Eva', 'Breath of life, radiant and full of grace', 'Girl', ['light', 'grace', 'peace']],
    ['Eshaan', 'Wishing well, rising sun of auspicious grace', 'Boy', ['light', 'radiance', 'grace']],
    ['Frey', 'Exalted, peaceful ruler of nature and harvest', 'Neutral', ['nature', 'earth', 'peace']],
    ['Gia', 'Gracious gift of love and joyful vitality', 'Girl', ['grace', 'peace', 'light']],
    ['Gatik', 'Fast, progressive flow of a clear stream', 'Boy', ['nature', 'strength']],
    ['Hridhaan', 'Great-hearted, generous and compassionate', 'Boy', ['peace', 'calm', 'grace']],
    ['Hiya', 'Heartfelt love, warmth, and serene joy', 'Girl', ['peace', 'calm', 'grace']],
    ['Ira', 'Earth, watchful wisdom of Goddess Saraswati', 'Girl', ['nature', 'earth', 'grace', 'peace']],
    ['Ivaan', 'Glorious gift of the sun and divine grace', 'Boy', ['light', 'radiance', 'grace']],
    ['Jia', 'Sweetheart, radiant soul full of serene life', 'Girl', ['light', 'radiance', 'peace', 'grace']],
    ['Jiana', 'Gracious spirit illuminated by divine light', 'Girl', ['light', 'radiance', 'grace', 'devotion']],
    ['Jiya', 'Luminous heart filled with love and peace', 'Girl', ['light', 'radiance', 'peace', 'grace']],
    ['Juhi', 'Sweet-scented blooming jasmine flower', 'Girl', ['nature', 'earth', 'peace', 'grace']],
    ['Jashvi', 'Radiant glory and joyful celebration', 'Girl', ['light', 'radiance', 'grace']],
    ['Jeevika', 'Vibrant source of life and flowing grace', 'Girl', ['nature', 'earth', 'light', 'grace']],
    ['Jiyaan', 'Near to the heart, vibrant life and inner strength', 'Boy', ['strength', 'peace', 'light']],
    ['Jai', 'Radiant victory, solar warmth and courage', 'Boy', ['light', 'radiance', 'strength', 'courage']],
    ['Jehan', 'Bright universe, blossoming world of light', 'Boy', ['light', 'radiance', 'star', 'celestial']],
    ['Jash', 'Good wishes, fame, and victorious grace', 'Boy', ['strength', 'grace']],
    ['Jian', 'Flow of life, serene peace and vitality', 'Neutral', ['peace', 'calm', 'light']],
    ['Kiaan', 'Grace of God, ancient royal heritage and light', 'Boy', ['grace', 'devotion', 'strength']],
    ['Kiara', 'Bright, clear morning light and radiant dawn', 'Girl', ['light', 'radiance', 'star']],
    ['Kian', 'Ancient grace and enduring strength', 'Boy', ['grace', 'strength']],
    ['Liva', 'Gentle olive tree of peace and harmony', 'Girl', ['peace', 'calm', 'nature']],
    ['Laksh', 'Focused aim, radiant mark of excellence', 'Boy', ['strength', 'courage', 'light']],
    ['Mira', 'Prosperous ocean of devotion, peace, and grace', 'Girl', ['peace', 'calm', 'grace', 'devotion', 'nature']],
    ['Myra', 'Sweet, beloved, radiant star of peace', 'Girl', ['star', 'celestial', 'grace', 'peace']],
    ['Neil', 'Champion, sapphire blue sky and serene cloud', 'Boy', ['star', 'celestial', 'strength', 'nature']],
    ['Nia', 'Bright radiance, purposeful light and grace', 'Girl', ['light', 'radiance', 'grace']],
    ['Oviya', 'Graceful art, serene beauty and creativity', 'Girl', ['grace', 'peace']],
    ['Orin', 'Light, pale pine tree of serene nature', 'Boy', ['light', 'radiance', 'nature']],
    ['Pihu', 'Sweet melodious bird song of nature', 'Girl', ['nature', 'earth', 'peace']],
    ['Parth', 'Courageous prince Arjuna, steadfast in truth', 'Boy', ['strength', 'courage']],
    ['Reyansh', 'First ray of the morning sun, part of Lord Vishnu', 'Boy', ['light', 'radiance', 'grace', 'devotion']],
    ['Rian', 'Little king of noble courage and bright spirit', 'Boy', ['strength', 'courage']],
    ['Rhea', 'Flowing stream, graceful mother of nature', 'Girl', ['nature', 'earth', 'grace', 'peace']],
    ['Sia', 'White moonlight, Goddess Sita, serene radiance', 'Girl', ['light', 'radiance', 'grace', 'devotion']],
    ['Samaira', 'Enchanting, protected by divine grace', 'Girl', ['grace', 'devotion', 'peace']],
    ['Tara', 'Guiding star, radiant celestial protector', 'Girl', ['star', 'celestial', 'light', 'radiance']],
    ['Tiaan', 'Princess of peace and celestial grace', 'Neutral', ['peace', 'star', 'grace']],
    ['Viaan', 'Full of life, vibrant morning energy and light', 'Boy', ['light', 'radiance', 'strength']],
    ['Vivaan', 'First rays of the rising sun, full of life', 'Boy', ['light', 'radiance', 'nature']],
    ['Vanya', 'Gracious gift of God and serene forest goddess', 'Girl', ['nature', 'earth', 'grace', 'devotion']],
    ['Yuvan', 'Youthful vigor, strong and radiant like the moon', 'Boy', ['strength', 'courage', 'star', 'celestial']],
    ['Yara', 'Small butterfly, warm water lady of nature', 'Girl', ['nature', 'earth', 'grace']],
    ['Zayn', 'Grace, beauty, and luminous radiance', 'Boy', ['light', 'radiance', 'grace']],
    ['Zoya', 'Alive, loving, joyous and caring spirit', 'Girl', ['peace', 'calm', 'grace', 'light']]
  ],

  'Islamic / Arabic': [
    ['Aariz', 'Respectable leader blessed with intelligence and rain-bearing cloud', 'Boy', ['strength', 'courage', 'nature']],
    ['Aayat', 'Sacred verse of divine revelation and miraculous sign', 'Girl', ['grace', 'devotion', 'light', 'peace']],
    ['Aaliyah', 'Exalted, highest celestial stature and grace', 'Girl', ['star', 'celestial', 'grace']],
    ['Amaan', 'Peace, tranquil protection, and serene safety', 'Boy', ['peace', 'calm', 'grace']],
    ['Azlan', 'Fearless lion of noble courage and strength', 'Boy', ['strength', 'courage']],
    ['Bilal', 'Refreshing water that quenches thirst, faithful companion', 'Boy', ['nature', 'peace', 'grace']],
    ['Bushra', 'Auspicious good news and joyful blessing', 'Girl', ['grace', 'peace']],
    ['Daniyal', 'Intelligent, wise prophet guided by divine justice', 'Boy', ['grace', 'devotion', 'strength']],
    ['Dua', 'Sacred heartfelt prayer and loving invocation to God', 'Girl', ['grace', 'devotion', 'peace', 'calm']],
    ['Ehaan', 'Full moon illuminating the sky with gentle radiance', 'Boy', ['light', 'radiance', 'star', 'celestial']],
    ['Eliza', 'Precious, unique treasure of grace', 'Girl', ['grace', 'light']],
    ['Fajr', 'First light of dawn and sacred morning prayer', 'Girl', ['light', 'radiance', 'grace', 'devotion']],
    ['Farhan', 'Joyful, serene heart blessed with happiness', 'Boy', ['peace', 'calm', 'light']],
    ['Ghazal', 'Lyrical poetry of grace and beauty', 'Girl', ['grace', 'peace']],
    ['Hamza', 'Steadfast lion, strong and courageous protector', 'Boy', ['strength', 'courage']],
    ['Hania', 'Happy, tranquil, blessed with serene peace', 'Girl', ['peace', 'calm', 'grace']],
    ['Inaya', 'Loving care, divine providence, and gentle grace', 'Girl', ['grace', 'devotion', 'peace', 'calm']],
    ['Izaan', 'Obedience, peaceful acceptance, and spiritual wisdom', 'Boy', ['peace', 'calm', 'grace', 'devotion']],
    ['Jannah', 'Heavenly garden of eternal peace and blooming nature', 'Girl', ['nature', 'earth', 'peace', 'calm', 'grace']],
    ['Jasmina', 'Fragrant white jasmine flower blooming in peace', 'Girl', ['nature', 'earth', 'peace', 'grace']],
    ['Jumanah', 'Luminous silver pearl of the ocean', 'Girl', ['light', 'radiance', 'nature', 'grace']],
    ['Javeriya', 'Spreader of happiness, radiant grace and blessings', 'Girl', ['light', 'radiance', 'grace', 'peace']],
    ['Jaseera', 'Courageous, bold and noble-hearted spirit', 'Girl', ['strength', 'courage', 'grace']],
    ['Jahana', 'Adornment of the world, graceful and bright', 'Girl', ['light', 'radiance', 'grace']],
    ['Jibran', 'Restorer of harmony, courageous and generous spirit', 'Boy', ['peace', 'calm', 'strength']],
    ['Junaid', 'Spiritual fighter and fearless guardian of truth', 'Boy', ['strength', 'courage', 'devotion']],
    ['Jalal', 'Majestic glory, radiant dignity and strength', 'Boy', ['light', 'radiance', 'strength']],
    ['Jawad', 'Open-handed, generous and noble-hearted', 'Boy', ['grace', 'peace']],
    ['Jasim', 'Strong, great, and courageous protector', 'Boy', ['strength', 'courage']],
    ['Jehaan', 'Prosperous world illuminated by celestial light', 'Neutral', ['light', 'radiance', 'star', 'celestial']],
    ['Kabir', 'The Great, noble and revered in wisdom', 'Boy', ['strength', 'grace', 'peace']],
    ['Kainaat', 'The entire cosmos, stars, and universe', 'Girl', ['star', 'celestial', 'nature']],
    ['Layla', 'Serene beauty of the starlit night sky', 'Girl', ['star', 'celestial', 'peace', 'calm']],
    ['Luqman', 'Wise sage blessed with clear insight', 'Boy', ['peace', 'calm', 'grace']],
    ['Mehr', 'Benevolent sun, love, and radiant compassion', 'Neutral', ['light', 'radiance', 'grace', 'peace']],
    ['Maryam', 'Pious, beloved, flower of pure devotion', 'Girl', ['grace', 'devotion', 'peace']],
    ['Noor', 'Divine celestial radiance and guiding light', 'Neutral', ['light', 'radiance', 'star', 'celestial', 'grace']],
    ['Nabeel', 'Noble, generous, and honorable spirit', 'Boy', ['grace', 'strength']],
    ['Omar', 'Flourishing life, long-lived and courageous', 'Boy', ['strength', 'courage', 'nature']],
    ['Parisa', 'Angelic, luminous and graceful like a fairy', 'Girl', ['light', 'radiance', 'grace']],
    ['Qamar', 'Luminous full moon illuminating the night', 'Neutral', ['light', 'radiance', 'star', 'celestial']],
    ['Rayan', 'Luxuriant gate of heaven, fresh and flourishing', 'Boy', ['nature', 'earth', 'grace', 'peace']],
    ['Ruhani', 'Spiritual, serene, and deeply soulful', 'Girl', ['peace', 'calm', 'grace', 'devotion']],
    ['Safa', 'Pure serenity, clarity, and tranquil peace of mind', 'Girl', ['peace', 'calm', 'grace']],
    ['Samar', 'Evening conversation under the starlit sky', 'Neutral', ['star', 'celestial', 'peace']],
    ['Tariq', 'Bright morning star guiding the dawn', 'Boy', ['star', 'celestial', 'light', 'radiance']],
    ['Tahira', 'Pure, chaste, and radiant in grace', 'Girl', ['grace', 'devotion', 'light']],
    ['Uzair', 'Helper, source of strength and compassionate support', 'Boy', ['strength', 'grace']],
    ['Wafa', 'Faithfulness, loyalty, and noble devotion', 'Girl', ['grace', 'devotion', 'peace']],
    ['Yasmin', 'Fragrant blooming jasmine flower of nature', 'Girl', ['nature', 'earth', 'peace', 'grace']],
    ['Yusuf', 'God increases in grace, beauty, and wisdom', 'Boy', ['grace', 'devotion', 'peace']],
    ['Zara', 'Blooming flower, radiant splendour of the dawn', 'Girl', ['light', 'radiance', 'nature', 'earth']],
    ['Zayd', 'Abundant growth, flourishing strength and progress', 'Boy', ['strength', 'nature', 'earth']]
  ],

  'Nature Inspired': [
    ['Ayla', 'Oak tree, luminous halo of light around the moon', 'Girl', ['nature', 'earth', 'light', 'radiance', 'star', 'celestial']],
    ['Aranya', 'Serene, untouched forest sanctuary of peace', 'Neutral', ['nature', 'earth', 'peace', 'calm']],
    ['Avani', 'The nurturing Mother Earth, grounded and fertile', 'Girl', ['nature', 'earth', 'peace', 'grace']],
    ['Agni', 'Sacred elemental fire and radiant warmth', 'Boy', ['light', 'radiance', 'nature', 'strength']],
    ['Barkha', 'Life-giving monsoon rain nourishing the earth', 'Girl', ['nature', 'earth', 'peace', 'calm']],
    ['Bodhi', 'Sacred awakening under the ancient Bodhi tree', 'Neutral', ['nature', 'earth', 'peace', 'calm', 'light']],
    ['Bhumi', 'Sacred Mother Earth, resilient and abundant', 'Girl', ['nature', 'earth', 'peace', 'grace']],
    ['Cedar', 'Majestic evergreen tree of strength and calm', 'Neutral', ['nature', 'earth', 'strength', 'peace']],
    ['Dahlia', 'Vibrant valley flower of elegance and inner strength', 'Girl', ['nature', 'earth', 'grace', 'strength']],
    ['Dhara', 'Constant flow of the nurturing earth and streams', 'Girl', ['nature', 'earth', 'peace']],
    ['Fern', 'Loyal, serene green woodland plant', 'Girl', ['nature', 'earth', 'peace', 'calm']],
    ['Gagan', 'Boundless blue sky and celestial canopy', 'Boy', ['nature', 'star', 'celestial']],
    ['Hazel', 'Wisdom-bearing hazel tree of the forest', 'Girl', ['nature', 'earth', 'peace', 'grace']],
    ['Himadri', 'Snow-crowned golden peak of the Himalayas', 'Neutral', ['nature', 'earth', 'strength', 'light']],
    ['Iris', 'Vibrant rainbow flower bridging heaven and earth', 'Girl', ['nature', 'earth', 'light', 'radiance']],
    ['Ila', 'Sacred earth, vitality and gentle speech', 'Girl', ['nature', 'earth', 'grace', 'peace']],
    ['Jasmine', 'Fragrant white night-blooming flower of grace', 'Girl', ['nature', 'earth', 'peace', 'grace']],
    ['Juniper', 'Evergreen berry tree symbolizing vitality and protection', 'Neutral', ['nature', 'earth', 'strength']],
    ['Juhi', 'Delicate sweet-scented Indian jasmine blossom', 'Girl', ['nature', 'earth', 'peace', 'grace']],
    ['Janhavi', 'Sacred Himalayan river flowing with peace', 'Girl', ['nature', 'earth', 'peace', 'calm', 'grace']],
    ['Jeevika', 'Pure life-giving water and natural vitality', 'Girl', ['nature', 'earth', 'peace', 'light']],
    ['Jade', 'Precious green earth stone of serenity and wisdom', 'Neutral', ['nature', 'earth', 'peace', 'calm']],
    ['Jalaj', 'Sacred lotus born from pure, tranquil waters', 'Boy', ['nature', 'earth', 'peace', 'calm']],
    ['Jasper', 'Precious speckled earth stone of grounding strength', 'Boy', ['nature', 'earth', 'strength']],
    ['Jharna', 'Cascading mountain waterfall of pure joy', 'Girl', ['nature', 'earth', 'peace', 'light']],
    ['Kairav', 'White lotus that blooms under the peaceful moonlight', 'Boy', ['nature', 'earth', 'light', 'star', 'peace']],
    ['Kamal', 'Sacred blooming lotus, untouched and pure', 'Neutral', ['nature', 'earth', 'grace', 'peace']],
    ['Kanan', 'Lush, tranquil tropical forest grove', 'Neutral', ['nature', 'earth', 'peace', 'calm']],
    ['Lily', 'Pure white blossom symbolizing serenity and renewal', 'Girl', ['nature', 'earth', 'peace', 'grace']],
    ['Mihir', 'Warm nourishing rays of the golden sun', 'Boy', ['light', 'radiance', 'nature', 'star']],
    ['Megha', 'Gentle rain cloud bringing relief to the earth', 'Girl', ['nature', 'earth', 'peace', 'calm']],
    ['Neer', 'Crystal-clear, calm life-giving water', 'Neutral', ['nature', 'earth', 'peace', 'calm']],
    ['Nalini', 'Sacred lotus pond blooming at dawn', 'Girl', ['nature', 'earth', 'light', 'grace']],
    ['Orion', 'Mighty constellation shining in the night sky', 'Boy', ['star', 'celestial', 'nature', 'strength']],
    ['Olive', 'Peaceful olive tree symbolizing harmony', 'Girl', ['nature', 'earth', 'peace', 'calm']],
    ['Palash', 'Vibrant flame-of-the-forest flowering tree', 'Boy', ['nature', 'earth', 'light', 'radiance']],
    ['Prithvi', 'The vast, enduring Mother Earth', 'Boy', ['nature', 'earth', 'strength']],
    ['River', 'Tranquil flowing stream journeying toward the ocean', 'Neutral', ['nature', 'earth', 'peace', 'calm']],
    ['Ritu', 'Harmonious changing seasons of nature', 'Girl', ['nature', 'earth', 'peace']],
    ['Sahil', 'Calm ocean shore and guiding coastal haven', 'Boy', ['nature', 'earth', 'peace', 'calm']],
    ['Surya', 'The radiant golden sun sustaining all life', 'Boy', ['light', 'radiance', 'star', 'nature']],
    ['Tara', 'Luminous star shining over tranquil mountains', 'Girl', ['star', 'celestial', 'light', 'nature']],
    ['Urvi', 'The wide, fertile and welcoming earth', 'Girl', ['nature', 'earth', 'peace']],
    ['Vrinda', 'Sacred basil (Tulsi) plant and serene woodland', 'Girl', ['nature', 'earth', 'grace', 'devotion']],
    ['Vayu', 'Life-giving cosmic wind and fresh breeze', 'Boy', ['nature', 'earth', 'strength']],
    ['Willow', 'Graceful, resilient tree that bends gently in the breeze', 'Girl', ['nature', 'earth', 'grace', 'strength']],
    ['Zinnia', 'Vibrant summer blossom of endurance and joy', 'Girl', ['nature', 'earth', 'light', 'grace']]
  ],

  'Global / Western': [
    ['Aria', 'Melodious song, noble lioness of courage and grace', 'Girl', ['grace', 'strength', 'peace']],
    ['Aurora', 'Radiant goddess of the dawn and northern lights', 'Girl', ['light', 'radiance', 'star', 'celestial']],
    ['Atlas', 'Enduring bearer of the celestial heavens', 'Boy', ['strength', 'courage', 'star', 'celestial']],
    ['Arthur', 'Noble bear of courage and royal honor', 'Boy', ['strength', 'courage']],
    ['Bella', 'Graceful, serene beauty and warmth', 'Girl', ['grace', 'peace']],
    ['Benjamin', 'Beloved son of strength and right hand of peace', 'Boy', ['strength', 'peace', 'grace']],
    ['Clara', 'Clear, bright, luminous and serene spirit', 'Girl', ['light', 'radiance', 'peace']],
    ['Caleb', 'Wholehearted devotion, faithful and brave', 'Boy', ['grace', 'devotion', 'strength', 'courage']],
    ['Diana', 'Celestial luminous goddess of the moon and nature', 'Girl', ['light', 'radiance', 'star', 'celestial', 'nature']],
    ['Daniel', 'Guided by divine justice and calm wisdom', 'Boy', ['peace', 'calm', 'grace']],
    ['Elena', 'Shining torch, bright ray of sunlight', 'Girl', ['light', 'radiance', 'grace']],
    ['Ethan', 'Strong, enduring, firm and steadfast protector', 'Boy', ['strength', 'courage']],
    ['Freya', 'Noble lady of love, grace, and springtime', 'Girl', ['grace', 'nature', 'earth']],
    ['Felix', 'Fortunate, joyful, blessed with bright spirits', 'Boy', ['light', 'peace']],
    ['Grace', 'Elegance, divine blessing, and serene kindness', 'Girl', ['grace', 'devotion', 'peace', 'calm']],
    ['Gabriel', 'God is my strength, celestial messenger', 'Boy', ['strength', 'courage', 'grace', 'devotion']],
    ['Hannah', 'Gracious, favored with peace and compassion', 'Girl', ['grace', 'devotion', 'peace']],
    ['Henry', 'Steadfast ruler of a peaceful home', 'Boy', ['strength', 'peace']],
    ['Isla', 'Serene Scottish island and flowing river', 'Girl', ['nature', 'earth', 'peace', 'calm']],
    ['Isaac', 'One who brings joyful laughter and light', 'Boy', ['light', 'peace']],
    ['Juliet', 'Youthful, radiant spirit filled with grace and love', 'Girl', ['grace', 'light', 'peace']],
    ['Juno', 'Queen of the heavens and protector of bright stars', 'Girl', ['star', 'celestial', 'strength', 'grace']],
    ['Jade', 'Precious green stone of harmony, earth, and wisdom', 'Neutral', ['nature', 'earth', 'peace', 'calm']],
    ['Jasmine', 'Fragrant white blossom of grace and serenity', 'Girl', ['nature', 'earth', 'grace', 'peace']],
    ['Josephine', 'May she grow in abundant grace and light', 'Girl', ['grace', 'devotion', 'light']],
    ['Johanna', 'Gracious gift of divine peace and kindness', 'Girl', ['grace', 'devotion', 'peace']],
    ['Julian', 'Youthful, sky-father, shining with calm wisdom', 'Boy', ['star', 'celestial', 'peace', 'calm']],
    ['Jude', 'Praised, serene and noble-hearted companion', 'Boy', ['peace', 'calm', 'grace']],
    ['Jasper', 'Precious stone and bearer of radiant treasure', 'Boy', ['nature', 'earth', 'light']],
    ['Jonah', 'Peaceful dove bringing olive branch of calm', 'Boy', ['peace', 'calm', 'nature']],
    ['James', 'Steadfast protector and loyal companion', 'Boy', ['strength', 'courage']],
    ['Leo', 'Lion-hearted, brave and radiant leader', 'Boy', ['strength', 'courage', 'star']],
    ['Liam', 'Resolute protector and guardian of peace', 'Boy', ['strength', 'courage', 'peace']],
    ['Luna', 'Glowing moon illuminating the serene night sky', 'Girl', ['light', 'radiance', 'star', 'celestial', 'peace']],
    ['Lucas', 'Bringer of bright, illuminating light', 'Boy', ['light', 'radiance']],
    ['Maya', 'Creative cosmic illusion, gentle spring mother', 'Girl', ['nature', 'earth', 'grace']],
    ['Miles', 'Merciful, calm and courageous soldier of peace', 'Boy', ['peace', 'strength']],
    ['Nova', 'Brilliant new star bursting with celestial light', 'Neutral', ['star', 'celestial', 'light', 'radiance']],
    ['Noah', 'Rest, tranquil comfort, and enduring peace', 'Boy', ['peace', 'calm', 'grace']],
    ['Nora', 'Shining light of honor and serenity', 'Girl', ['light', 'radiance', 'grace']],
    ['Oliver', 'Peaceful olive tree of harmony and kindness', 'Boy', ['nature', 'earth', 'peace', 'calm']],
    ['Olivia', 'Symbol of peace, grace, and fruitful nature', 'Girl', ['nature', 'earth', 'peace', 'grace']],
    ['Phoebe', 'Radiant, shining one of the moon and light', 'Girl', ['light', 'radiance', 'star']],
    ['Quinn', 'Wise, intelligent leader of calm resolve', 'Neutral', ['peace', 'strength']],
    ['Rowan', 'Little red-berried mountain tree of protection', 'Neutral', ['nature', 'earth', 'strength']],
    ['Stella', 'Radiant celestial star guiding the night', 'Girl', ['star', 'celestial', 'light', 'radiance']],
    ['Sebastian', 'Venerable, respected and noble in spirit', 'Boy', ['grace', 'strength']],
    ['Theo', 'Sacred gift of peace and wisdom', 'Boy', ['grace', 'devotion', 'peace']],
    ['Violet', 'Delicate purple woodland flower of grace', 'Girl', ['nature', 'earth', 'grace']],
    ['William', 'Resolute protector of peace and courage', 'Boy', ['strength', 'courage', 'peace']],
    ['Zoe', 'Vibrant, radiant gift of life and joy', 'Girl', ['light', 'radiance', 'nature']]
  ]
};

/**
 * Universal A-Z roots and suffixes per style so that even rare starting letters
 * in any style and gender always produce 6 authentic, meaningful names starting
 * with the exact requested letter.
 */
const LETTER_PHONETIC_ROOTS: Record<string, [string, string]> = {
  A: ['Aar', 'radiant morning light'],
  B: ['Bhav', 'sacred devotion and grace'],
  C: ['Char', 'graceful step and serenity'],
  D: ['Div', 'divine celestial brilliance'],
  E: ['Ek', 'unified cosmic harmony'],
  F: ['Far', 'joyful and elevated spirit'],
  G: ['Gur', 'enlightened wisdom and grace'],
  H: ['Har', 'divine peace and protection'],
  I: ['Ish', 'sacred grace and inner strength'],
  J: ['Jas', 'radiant glory and divine praise'],
  K: ['Kir', 'luminous ray of morning sun'],
  L: ['Liv', 'serene devotion and love'],
  M: ['Meh', 'benevolent grace and warmth'],
  N: ['Nav', 'fresh new dawn of peace'],
  O: ['Ojas', 'radiant vitality and light'],
  P: ['Prabh', 'luminous grace of the Divine'],
  Q: ['Qud', 'sacred beauty of nature'],
  R: ['Rav', 'golden radiance of the sun'],
  S: ['Seh', 'tranquil equipoise and calm'],
  T: ['Tej', 'brilliant splendor and courage'],
  U: ['Uday', 'rising dawn of hope'],
  V: ['Vir', 'noble courage and brightness'],
  W: ['War', 'noble heritage and grace'],
  X: ['Xar', 'shining star of dawn'],
  Y: ['Yash', 'glorious grace and honor'],
  Z: ['Zor', 'resilient strength and light']
};

const STYLE_SUFFIXES: Record<BabyNameEntry['style'], { Boy: [string, string][]; Girl: [string, string][]; Neutral: [string, string][] }> = {
  'Sikh / Punjabi': {
    Boy: [['veer', 'Courageous warrior of'], ['jit', 'Victorious spirit of'], ['deep', 'Radiant lamp of'], ['raj', 'Noble sovereign of'], ['karan', 'Righteous doer of'], ['jot', 'Sacred flame of']],
    Girl: [['leen', 'Deeply absorbed in'], ['noor', 'Divine celestial light of'], ['preet', 'Devoted love and'], ['kiran', 'Radiant morning ray of'], ['meet', 'Harmonious companion of'], ['reet', 'Sacred tradition of']],
    Neutral: [['jot', 'Sacred divine flame of'], ['noor', 'Luminous radiance of'], ['deep', 'Glowing lamp of'], ['preet', 'Heartfelt love of'], ['meet', 'True friend of'], ['jeet', 'Victorious peace of']]
  },
  'Traditional Sanskrit': {
    Boy: [['esh', 'Sacred lord of'], ['ansh', 'Luminous ray of'], ['dev', 'Divine guardian of'], ['endra', 'Celestial ruler of'], ['nath', 'Noble protector of'], ['it', 'Blessed with']],
    Girl: [['ika', 'Graceful embodiment of'], ['ini', 'Luminous goddess of'], ['ita', 'Blessed with'], ['श्री', 'Auspicious grace of'], ['vi', 'Radiant spirit of'], ['ya', 'Worthy of']],
    Neutral: [['am', 'Sacred essence of'], ['an', 'Enlightened soul of'], ['ya', 'Harmonious flow of'], ['ir', 'Celestial light of'], ['in', 'Grounded in'], ['a', 'Serene reflection of']]
  },
  'Modern': {
    Boy: [['aan', 'Modern spirit of'], ['av', 'Peaceful melody of'], ['in', 'Strong foundation of'], ['an', 'Vibrant energy of'], ['ik', 'Radiant path of'], ['esh', 'Shining star of']],
    Girl: [['ia', 'Luminous grace of'], ['ana', 'Blossoming light of'], ['ira', 'Serene ocean of'], ['vi', 'Radiant joy of'], ['ya', 'Pure harmony of'], ['ika', 'Graceful song of']],
    Neutral: [['in', 'Balanced spirit of'], ['an', 'Radiant flow of'], ['ia', 'Bright harmony of'], ['av', 'Tranquil melody of'], ['en', 'Peaceful light of'], ['is', 'Shining promise of']]
  },
  'Islamic / Arabic': {
    Boy: [['aan', 'Noble stature of'], ['ir', 'Radiant bearer of'], ['ad', 'Generous guardian of'], ['im', 'Steadfast protector of'], ['al', 'Majestic glory of'], ['an', 'Peaceful blessing of']],
    Girl: [['iya', 'Exalted grace of'], ['ah', 'Sacred garden of'], ['ina', 'Blooming flower of'], ['ara', 'Luminous star of'], ['at', 'Miraculous blessing of'], ['een', 'Serene beauty of']],
    Neutral: [['an', 'Peaceful sanctuary of'], ['oor', 'Celestial light of'], ['ar', 'Shining star of'], ['at', 'Sacred blessing of'], ['in', 'Faithful heart of'], ['is', 'Gentle companion of']]
  },
  'Nature Inspired': {
    Boy: [['an', 'Rooted in the earth and'], ['av', 'Flowing river of'], ['ir', 'Warm sunlight and'], ['aj', 'Born of sacred lotus and'], ['esh', 'Guardian of forests and'], ['in', 'Mountain peak of']],
    Girl: [['ika', 'Blooming woodland flower of'], ['ani', 'Nurturing earth and'], ['ia', 'Morning dewdrop of'], ['ini', 'Sacred river stream of'], ['ara', 'Starlit sky and'], ['vi', 'Fresh spring breeze of']],
    Neutral: [['an', 'Tranquil forest grove of'], ['in', 'Ocean breeze and'], ['av', 'Gentle rain and'], ['ir', 'Clear mountain stream of'], ['ia', 'Blossoming earth and'], ['en', 'Evergreen sanctuary of']]
  },
  'Global / Western': {
    Boy: [['ian', 'Shining sky-bearer of'], ['an', 'Steadfast protector of'], ['en', 'Courageous guardian of'], ['on', 'Noble leader of'], ['is', 'Faithful friend of'], ['er', 'Bright bringer of']],
    Girl: [['iana', 'Luminous grace of'], ['ella', 'Radiant star of'], ['ina', 'Serene blossom of'], ['ia', 'Melodious song of'], ['ora', 'Golden dawn of'], ['lyn', 'Tranquil lake of']],
    Neutral: [['an', 'Harmonious spirit of'], ['en', 'Serene light of'], ['in', 'Pure wisdom of'], ['is', 'Celestial promise of'], ['on', 'Grounded strength of'], ['ia', 'Bright horizon of']]
  }
};

export const BABY_NAMES_CATALOG: BabyNameEntry[] = Object.entries(SEED_BY_STYLE).flatMap(
  ([styleKey, list]) => {
    const style = styleKey as BabyNameEntry['style'];
    return list.map(([name, meaning, gender, themes]) => ({
      name,
      meaning,
      origin: STYLE_ORIGIN_LABEL[style],
      gender,
      style,
      themes
    }));
  }
);

/**
 * Normalizes theme keywords into matching tags
 */
function extractThemeKeywords(rawKeywords?: string): string[] {
  if (!rawKeywords || !rawKeywords.trim()) return [];
  return rawKeywords
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['and', 'the', 'for', 'with'].includes(w));
}

/**
 * Curates up to 6 authentic baby names from the catalog that strictly follow
 * ALL user criteria: Gender, Origin/Style, Starting Letter, and Meaning/Theme.
 */
export function curateNamesFromCatalog(criteria: NameFilterCriteria): { name: string; meaning: string; origin: string }[] {
  const { gender, origin, startingLetter, keywords, excludeNames = [] } = criteria;
  const letter = (startingLetter || '').trim().toUpperCase().slice(0, 1);
  const themeWords = extractThemeKeywords(keywords);
  const excludeSet = new Set(excludeNames.map(n => n.toLowerCase()));
  const targetStyle = (origin in SEED_BY_STYLE ? origin : 'Modern') as BabyNameEntry['style'];
  const targetGender = (gender === 'Boy' || gender === 'Girl' || gender === 'Neutral' ? gender : 'Neutral') as 'Boy' | 'Girl' | 'Neutral';

  // Step 1: Filter base catalog strictly by Origin/Style and Starting Letter
  let candidates = BABY_NAMES_CATALOG.filter(entry => {
    if (entry.style !== targetStyle) return false;
    if (letter && !entry.name.toUpperCase().startsWith(letter)) return false;
    return true;
  });

  // Step 2: Filter on Gender (exact gender first, or include Neutral)
  const exactGender = candidates.filter(entry => entry.gender === targetGender);
  const withNeutral = candidates.filter(entry => entry.gender === targetGender || entry.gender === 'Neutral');
  if (exactGender.length >= 6) {
    candidates = exactGender;
  } else if (withNeutral.length >= 6) {
    candidates = withNeutral;
  } else {
    candidates = withNeutral;
  }

  // Step 3: Score and sort real catalog matches first by Meaning / Theme keywords
  const filterFresh = (list: BabyNameEntry[]) => {
    const fresh = list.filter(c => !excludeSet.has(c.name.toLowerCase()));
    return fresh.length >= 4 ? fresh : list;
  };

  candidates = filterFresh(candidates);

  const scoreCandidate = (entry: BabyNameEntry, isSynthesized = false) => {
    let score = (isSynthesized ? 0 : 25) + Math.random() * 0.4;
    if (entry.gender === targetGender) score += 4;
    if (entry.style === targetStyle) score += 3;

    if (themeWords.length > 0) {
      const haystack = `${entry.meaning} ${entry.themes.join(' ')}`.toLowerCase();
      for (const word of themeWords) {
        if (haystack.includes(word)) {
          score += 5;
        }
      }
    }
    return score;
  };

  const scored: { entry: BabyNameEntry; score: number }[] = candidates.map(entry => ({
    entry,
    score: scoreCandidate(entry, false)
  }));

  // Step 4: Only if real catalog entries for this exact letter + style + gender are fewer than 6,
  // top up the remaining slots using authentic phonetic combinations for that letter.
  if (letter && LETTER_PHONETIC_ROOTS[letter] && scored.length < 6) {
    const [rootPrefix, rootMeaning] = LETTER_PHONETIC_ROOTS[letter];
    const suffixes = STYLE_SUFFIXES[targetStyle][targetGender];
    for (const [suffix, suffixMeaning] of suffixes) {
      const cleanSuffix = suffix.replace(/[^\x00-\x7F]/g, 'a');
      const fullName = `${rootPrefix}${cleanSuffix}`;
      if (!scored.some(s => s.entry.name.toLowerCase() === fullName.toLowerCase())) {
        const synthEntry: BabyNameEntry = {
          name: fullName,
          meaning: `${suffixMeaning} ${rootMeaning}`,
          origin: STYLE_ORIGIN_LABEL[targetStyle],
          gender: targetGender,
          style: targetStyle,
          themes: ['light', 'grace', 'peace', 'strength']
        };
        scored.push({
          entry: synthEntry,
          score: scoreCandidate(synthEntry, true)
        });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);

  // Deduplicate by name
  const seen = new Set<string>();
  const results: { name: string; meaning: string; origin: string }[] = [];
  for (const { entry } of scored) {
    const key = entry.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      results.push({
        name: entry.name,
        meaning: entry.meaning,
        origin: entry.origin
      });
      if (results.length >= 6) break;
    }
  }

  return results;
}
