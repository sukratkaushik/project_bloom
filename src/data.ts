import { Task, Decision, BudgetItem } from './types';

export const DEV_TASKS: Record<string, Task[]> = {
  t1: [
    { id:'d1', text:'Telling your partner or closest support person', crit:false },
    { id:'d2', text:'Hearing the heartbeat for the first time', crit:false },
    { id:'d3', text:'First ultrasound — seeing baby on screen', crit:false },
    { id:'d4', text:'Sharing the news with close family', crit:false },
    { id:'d5', text:'Booking your first antenatal appointment', crit:false },
  ],
  t2: [
    { id:'d6', text:'Celebrating the 20-week halfway milestone', crit:false },
    { id:'d7', text:'Feeling baby move for the very first time', crit:false },
    { id:'d8', text:'Taking your first bump photo', crit:false },
    { id:'d9', text:'Sharing your news publicly', crit:false },
    { id:'d10', text:'Partner or support person feeling baby kick', crit:false },
  ],
  t3: [
    { id:'d11', text:'Finishing your birth plan together', crit:false },
    { id:'d12', text:'Last date night / couple time before baby', crit:false },
    { id:'d13', text:'Writing a letter to your baby', crit:false },
    { id:'d14', text:'Final day of work before leave', crit:false },
  ]
};

export const MED_TASKS: Record<string, Task[]> = {
  t1: [
    { id:'m1', text:'Book booking / first antenatal appointment (8–10 weeks)', crit:true },
    { id:'m2', text:'Dating ultrasound (8–12 weeks)', crit:true },
    { id:'m3', text:'Nuchal translucency / combined first trimester screening (11–13 weeks)', crit:true },
    { id:'m4', text:'Blood group, full blood count, and rubella immunity check', crit:true },
    { id:'m5', text:'HIV, hepatitis B, and syphilis screening', crit:true },
    { id:'m6', text:'Start prenatal vitamins (folic acid, iodine, iron if advised)', crit:true },
    { id:'m7', text:'NIPT / cell-free DNA screening if desired (from 10 weeks)', crit:false },
    { id:'m8', text:'Review all existing medications with your care team', crit:true },
    { id:'m9', text:'Dental check-up — gum health is linked to pregnancy outcomes', crit:false },
    { id:'m10', text:'Discuss mental health history with your midwife or OB', crit:false },
    { id:'m11', text:'CVS (chorionic villus sampling) if indicated by results', crit:false, flags:['highRisk'] },
    { id:'m12', text:'Additional monitoring appointments (high-risk protocol)', crit:true, flags:['highRisk'] },
    { id:'m13', text:'Specialist referral (MFM / maternal-fetal medicine)', crit:true, flags:['highRisk','multiples'] },
    { id:'m14', text:'IVF clinic graduation to OB / midwife care', crit:true, flags:['ivf'] },
  ],
  t2: [
    { id:'m15', text:'Anatomy / morphology scan (18–20 weeks)', crit:true },
    { id:'m16', text:'Glucose challenge test — gestational diabetes screening (24–28 weeks)', crit:true },
    { id:'m17', text:'Routine antenatal check-ups every 4 weeks', crit:true },
    { id:'m18', text:'Iron levels check (anaemia is common)', crit:true },
    { id:'m19', text:'Amniocentesis if recommended by your care team', crit:false },
    { id:'m20', text:'Pelvic floor physiotherapy assessment', crit:false },
    { id:'m21', text:'Additional growth scans (every 4 weeks for multiples)', crit:true, flags:['multiples'] },
    { id:'m22', text:'Cervical length scan if indicated', crit:true, flags:['highRisk','multiples'] },
    { id:'m23', text:'Mental health check-in with your GP', crit:false, flags:['mentalHealth'] },
  ],
  t3: [
    { id:'m24', text:'Antenatal check-ups every 2 weeks from week 36, then weekly', crit:true },
    { id:'m25', text:'Group B Streptococcus (GBS) swab (35–37 weeks)', crit:true },
    { id:'m26', text:'Growth ultrasound if indicated', crit:false },
    { id:'m27', text:'Discuss birth plan with your OB or midwife', crit:true },
    { id:'m28', text:'Pre-register at your hospital or birth centre', crit:true },
    { id:'m29', text:'Postpartum depression screening discussion', crit:false },
    { id:'m30', text:'More frequent monitoring appointments (fortnightly from T2)', crit:true, flags:['highRisk','multiples'] },
    { id:'m31', text:'Discuss planned caesarean timing if relevant', crit:true, flags:['highRisk','multiples'] },
    { id:'m32', text:'Perinatal mental health referral if needed', crit:true, flags:['mentalHealth'] },
  ]
};

export const VACC_TASKS: Task[] = [
  { id:'v1', text:'Influenza (flu) vaccine — safe and recommended throughout pregnancy', crit:true },
  { id:'v2', text:'Whooping cough (Tdap) booster — ideally 28–32 weeks — protects newborn', crit:true },
  { id:'v3', text:'COVID-19 booster if due (discuss timing with your care team)', crit:false },
  { id:'v4', text:'Confirm partner and support people are up to date on pertussis', crit:false },
];

export const PREP_TASKS: Record<string, Task[]> = {
  t1: [
    { id:'p1', text:'Register with a midwife or OB', crit:true, partner:true },
    { id:'p2', text:'Research birth setting options (hospital, birth centre, home)', crit:false },
    { id:'p3', text:'Tell your employer, or plan when you will', crit:false, partner:true, excludeWork:['notworking'] },
    { id:'p4', text:'Review health insurance for pregnancy and birth cover', crit:true, partner:true },
    { id:'p5', text:'Identify a GP for baby after birth', crit:false },
    { id:'p6', text:'Research childcare options — many waitlists are 12–18 months', crit:true, timing:'Start now — don\'t leave this' },
    { id:'p7', text:'Read up on your parental leave entitlements', crit:true, partner:true, excludeWork:['notworking'] },
    { id:'p8', text:'If self-employed: plan income coverage during leave', crit:true, onlyWork:['selfemployed'] },
    { id:'p9', text:'Join a first-trimester or "pregnant in [city]" online community', crit:false, onlyPreg:['first'] },
  ],
  t2: [
    { id:'p10', text:'Enrol in antenatal / childbirth education classes (book early — they fill fast)', crit:false, timing:'Book by week 20', partner:true },
    { id:'p11', text:'Start planning the nursery — furniture takes 6–12 weeks to arrive', crit:false, timing:'Weeks 18–22' },
    { id:'p12', text:'Create a baby registry or wish list', crit:false, partner:true },
    { id:'p13', text:'Research and test-drive prams', crit:false },
    { id:'p14', text:'Research and purchase or borrow a car seat', crit:true },
    { id:'p15', text:'Book a breastfeeding class or connect with a lactation consultant', crit:false },
    { id:'p16', text:'Take a baby CPR / first aid course', crit:false, partner:true },
    { id:'p17', text:'Update your will and nominate guardians for baby', crit:false, partner:true },
    { id:'p18', text:'Arrange childcare place deposit / confirmation', crit:true, timing:'Based on your return-to-work date', excludeWork:['notworking'] },
    { id:'p19', text:'Prepare older children — books, conversations, hospital visit plan', crit:false, onlyPreg:['subsequent'] },
    { id:'p20', text:'Second trimester mental health check-in — how are you feeling?', crit:false, flags:['mentalHealth'] },
    { id:'p21', text:'Research twin-specific equipment (double pram, two car seats, etc.)', crit:true, flags:['multiples'] },
  ],
  t3: [
    { id:'p22', text:'Pack your hospital / birth bag (ready by week 36)', crit:true },
    { id:'p23', text:'Install car seat and have it safety-checked', crit:true },
    { id:'p24', text:'Set up bassinet / sleeping space in your room (safe sleep reviewed)', crit:true },
    { id:'p25', text:'Prepare freezer meals or arrange meal support for first 2 weeks', crit:false, partner:true },
    { id:'p26', text:'Wash and prepare newborn clothes and bedding', crit:false },
    { id:'p27', text:'Download hospital parking, entry instructions, and contact numbers', crit:false },
    { id:'p28', text:'Arrange pet care for when you go to hospital', crit:false, partner:true },
    { id:'p29', text:'Plan care for older children during labour and birth', crit:true, partner:true, onlyPreg:['subsequent'] },
    { id:'p30', text:'Confirm your birth support team knows your birth plan', crit:true, partner:true },
    { id:'p31', text:'Finalise postpartum support plan — who is helping and when', crit:true, partner:true },
    { id:'p32', text:'Flexible working / WFH conversation with employer if relevant', crit:false, onlyWork:['employed','remote'] },
    { id:'p33', text:'Set up a quiet space to work or rest at home post-leave', crit:false, onlyWork:['remote','selfemployed'] },
  ]
};

export const FIN_TASKS: Task[] = [
  { id:'f1', text:'Review health insurance — maternity cover, excess, known-gap fees', crit:true, partner:true },
  { id:'f2', text:'Understand your parental leave entitlements (employer + government)', crit:true, partner:true },
  { id:'f3', text:'Calculate household income during leave — create a budget', crit:true, partner:true },
  { id:'f4', text:'Submit formal parental leave application to employer', crit:true, timing:'Usually 10–12 weeks before start', excludeWork:['notworking','selfemployed'] },
  { id:'f5', text:'Apply for government paid parental leave scheme', crit:true },
  { id:'f6', text:'Check partner / secondary carer entitlements and apply', crit:true, partner:true },
  { id:'f7', text:'Set up a dedicated savings account for baby costs', crit:false, partner:true },
  { id:'f8', text:'Update tax information and check for child benefit / family payments', crit:true },
  { id:'f9', text:'Review life insurance and income protection cover', crit:false, partner:true },
  { id:'f10', text:'Set up or update a will and power of attorney', crit:false, partner:true },
  { id:'f11', text:'Plan for business continuity and client handover', crit:true, onlyWork:['selfemployed'] },
  { id:'f12', text:'Research maternity pay calculation for shift / irregular hours', crit:true, onlyWork:['demanding'] },
];

export const POSTPARTUM_TASKS: Task[] = [
  { id:'pp1', text:'Book postpartum pelvic floor physio assessment (6 weeks)', crit:false },
  { id:'pp2', text:'Confirm your 6-week postnatal check-up with your GP', crit:true },
  { id:'pp3', text:'Know the signs of postpartum depression and anxiety', crit:true, partner:true },
  { id:'pp4', text:'Add baby to health insurance within required timeframe', crit:true },
  { id:'pp5', text:'Register baby\'s birth (legal requirement, usually within 60 days)', crit:true },
  { id:'pp6', text:'Organise newborn hearing screening if not done in hospital', crit:true },
  { id:'pp7', text:'Set up a feeding station (water, snacks, phone charger, pillow)', crit:false },
  { id:'pp8', text:'Brief family on how to help without overstepping', crit:false, partner:true },
  { id:'pp9', text:'Research lactation consultant or feeding support in your area', crit:false },
  { id:'pp10', text:'Identify a postpartum mental health support contact in advance', crit:false, flags:['mentalHealth'] },
];

export const DECISIONS: Decision[] = [
  {
    id:'dec1', title:'Birth Setting',
    desc:'Where would you like to give birth? Discuss options with your care team — each has criteria and availability considerations.',
    options:['Public hospital','Private hospital','Birth centre','Home birth','Undecided']
  },
  {
    id:'dec2', title:'Pain Relief Preferences',
    desc:'This is not a contract — it is a starting point for conversation. Your needs on the day may look very different, and that is completely fine.',
    options:['Epidural available','Natural / low-intervention','Gas and air (Entonox)','Open to all options','Undecided']
  },
  {
    id:'dec3', title:'Feeding Method',
    desc:'Both breastfeeding and formula feeding are valid choices. Support is available whichever path you choose. There is no judgement here.',
    options:['Breastfeeding (exclusive)','Breastfeeding + formula top-up','Formula from start','Combination','See how it goes']
  },
  {
    id:'dec4', title:'Birth Support People',
    desc:'Who would you like present during labour and birth? Note that some suites limit the number of support people.',
    options:['Partner only','Partner + doula','Partner + family member','Doula only','Solo / midwife-led']
  },
  {
    id:'dec5', title:'Cord Clamping',
    desc:'Delayed cord clamping (1–3 minutes) allows more blood to transfer to baby and is widely recommended. Worth confirming with your care team.',
    options:['Delayed clamping (preferred)','Immediate clamping','Partner to cut cord','Care team decides','Need more information']
  },
  {
    id:'dec6', title:'Skin-to-Skin After Birth',
    desc:'Immediate skin-to-skin contact supports bonding, temperature regulation, and breastfeeding. Can be done with either parent.',
    options:['Immediate with birthing parent','With partner if I cannot','When medically ready','Happy with care team\'s guidance','Undecided']
  },
  {
    id:'dec7', title:'Childcare Plan',
    desc:'Think about this early — high-quality childcare often has 12–18 month waitlists.',
    options:['Family / centre daycare','Nanny or au pair','Family member cares','One parent stays home','Not yet decided']
  },
  {
    id:'dec8', title:'Announcing the Pregnancy',
    desc:'There is no right or wrong time. Follow what feels right for you.',
    options:['After 12-week scan','After anatomy scan','Early — as it happens','Private / select people','Social media announcement']
  },
];

export const DEADLINE_TASKS: Task[] = [
  { id:'dl1', text:'Join childcare waiting lists', crit:true, weeksBeforeDue:30 },
  { id:'dl2', text:'Inform employer of pregnancy (informal conversation)', crit:true, weeksBeforeDue:28 },
  { id:'dl3', text:'Public pregnancy announcement (if sharing broadly)', crit:false, weeksBeforeDue:27 },
  { id:'dl4', text:'Book antenatal / childbirth classes (fill up 8–12 weeks out)', crit:false, weeksBeforeDue:22 },
  { id:'dl5', text:'Create and share baby registry', crit:false, weeksBeforeDue:20 },
  { id:'dl6', text:'Submit formal parental leave application to employer', crit:true, weeksBeforeDue:16 },
  { id:'dl7', text:'Order nursery furniture (6–12 week delivery lead times)', crit:false, weeksBeforeDue:16 },
  { id:'dl8', text:'Apply for government paid parental leave', crit:true, weeksBeforeDue:12 },
  { id:'dl9', text:'Pre-register at hospital or birth centre', crit:true, weeksBeforeDue:8 },
  { id:'dl10', text:'Confirm paediatrician / GP for newborn', crit:true, weeksBeforeDue:8 },
  { id:'dl11', text:'Finalise birth plan and share with care team', crit:true, weeksBeforeDue:5 },
  { id:'dl12', text:'Hospital bag packed and ready', crit:true, weeksBeforeDue:4 },
  { id:'dl13', text:'Car seat installed and safety-checked', crit:true, weeksBeforeDue:4 },
  { id:'dl14', text:'Safe sleep space set up and reviewed', crit:true, weeksBeforeDue:3 },
];

export const BUDGET_ITEMS: BudgetItem[] = [
  { id:'b1', label:'Pram / stroller' },
  { id:'b2', label:'Car seat (infant / convertible)' },
  { id:'b3', label:'Cot or bassinet + mattress' },
  { id:'b4', label:'Nursery furniture & décor' },
  { id:'b5', label:'Baby monitor' },
  { id:'b6', label:'Breast pump & feeding supplies' },
  { id:'b7', label:'Baby clothes (newborn–6 months)' },
  { id:'b8', label:'Nappies — first year estimate' },
  { id:'b9', label:'Antenatal / childbirth classes' },
  { id:'b10', label:'Hospital / birth costs (excess / gap)' },
  { id:'b11', label:'Childcare deposit or enrolment fee' },
  { id:'b12', label:'Postpartum support (doula, physio, lactation)' },
];
