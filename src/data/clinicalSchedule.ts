export type MilestoneCategory = 'scan' | 'lab' | 'vaccine';
export type MilestoneStatus = 'completed' | 'upcoming' | 'scheduled';

export interface ClinicalMilestone {
  id: string;
  title: string;
  period: string;
  category: MilestoneCategory;
  categoryLabel: string;
  status: MilestoneStatus;
  date: string;
  facility?: string;
  prepTip: string;
  details: string;
  weekStart: number;
  weekEnd: number;
}

export const CLINICAL_MILESTONES: ClinicalMilestone[] = [
  // --- Ultrasounds & Scans ---
  {
    id: 'dating',
    title: 'Dating & Viability Scan',
    period: 'Wk 7–9',
    category: 'scan',
    categoryLabel: 'Ultrasound',
    status: 'completed',
    date: '12 Jun • Cloudnine Hospital',
    facility: 'Cloudnine Hospital',
    prepTip: 'Full bladder required for transabdominal view.',
    details: 'Confirms intrauterine gestational sac, fetal cardiac activity & EDD calculation.',
    weekStart: 7,
    weekEnd: 9,
  },
  {
    id: 'nt',
    title: 'NT Scan & Dual Marker',
    period: 'Wk 11–13',
    category: 'scan',
    categoryLabel: 'Ultrasound & Blood',
    status: 'completed',
    date: '18 Jul • Cloudnine Hospital',
    facility: 'Cloudnine Hospital',
    prepTip: 'Fasting not required; drink normal water.',
    details: 'Nuchal translucency measurement paired with PAPP-A & free beta-hCG blood test for chromosomal screening.',
    weekStart: 11,
    weekEnd: 13,
  },
  {
    id: 'tiffa',
    title: 'Level II TIFFA Anomaly Ultrasound',
    period: 'Wk 18–20',
    category: 'scan',
    categoryLabel: 'Targeted Anomaly Scan',
    status: 'upcoming',
    date: 'Wed, 23 Sep • 10:30 AM',
    facility: 'Cloudnine Hospital • OPD Room 204',
    prepTip: 'Light meal allowed; drink 500ml water 1 hour prior.',
    details: 'Comprehensive organogenesis scan assessing fetal heart chambers, brain ventricles, kidneys, limbs & spine.',
    weekStart: 18,
    weekEnd: 20,
  },
  {
    id: 'ogtt_scan',
    title: 'Routine Growth Scan & OGTT',
    period: 'Wk 24–28',
    category: 'scan',
    categoryLabel: 'Growth & Metabolic',
    status: 'scheduled',
    date: 'Planned for Week 26 • Mid-October',
    facility: 'Cloudnine Hospital',
    prepTip: '8-hour overnight fasting required for glucose test.',
    details: 'Monitors interval fetal growth trajectory, amniotic fluid volume (AFI) & placental maturity.',
    weekStart: 24,
    weekEnd: 28,
  },
  {
    id: 'doppler',
    title: 'Fetal Growth & Umbilical Doppler',
    period: 'Wk 32',
    category: 'scan',
    categoryLabel: 'Color Doppler',
    status: 'scheduled',
    date: 'Planned for Week 32 • Late November',
    facility: 'Cloudnine Hospital',
    prepTip: 'Normal fluid intake; comfortable clothing.',
    details: 'Evaluates uterine & umbilical artery blood flow indices to ensure placental perfusion.',
    weekStart: 32,
    weekEnd: 32,
  },
  {
    id: 'nst_scan',
    title: 'Non-Stress Test (NST) & Biophysical Profile',
    period: 'Wk 36–38',
    category: 'scan',
    categoryLabel: 'Fetal Wellbeing',
    status: 'scheduled',
    date: 'Planned for Week 36 • Late December',
    facility: 'Cloudnine Hospital',
    prepTip: 'Have a snack 30 mins prior to stimulate fetal movement.',
    details: 'Cardiotocography (CTG) monitoring fetal heart rate response to fetal movements and uterine contractions.',
    weekStart: 36,
    weekEnd: 38,
  },

  // --- Maternal Screenings & Lab Tests ---
  {
    id: 'baseline_blood',
    title: 'First Trimester Comprehensive Panel',
    period: 'Wk 8–10',
    category: 'lab',
    categoryLabel: 'Blood & Serology',
    status: 'completed',
    date: '15 Jun • PathCare Labs',
    facility: 'PathCare Labs',
    prepTip: 'Morning fasting blood draw.',
    details: 'Complete Blood Count (CBC), Blood Group & Rh factor, TSH Thyroid, HbA1c, Rubella, HIV, HBsAg & VDRL.',
    weekStart: 8,
    weekEnd: 10,
  },
  {
    id: 'quad_marker',
    title: 'Quadruple Marker Blood Screen',
    period: 'Wk 15–20',
    category: 'lab',
    categoryLabel: 'Genetic Screen',
    status: 'completed',
    date: '22 Aug • PathCare Labs',
    facility: 'PathCare Labs',
    prepTip: 'Requires recent ultrasound report for gestational dating.',
    details: 'Measures AFP, hCG, Estriol (uE3), and Inhibin-A to assess neural tube defect & chromosomal risks.',
    weekStart: 15,
    weekEnd: 20,
  },
  {
    id: 'ogtt_lab',
    title: 'OGTT 75g Glucose Tolerance Test',
    period: 'Wk 24–28',
    category: 'lab',
    categoryLabel: 'Metabolic Lab',
    status: 'scheduled',
    date: 'Planned with Wk 26 Growth Visit',
    facility: 'Cloudnine OPD Lab',
    prepTip: 'Fasting 8-12 hours required. Test takes ~2 hours with 3 blood draws.',
    details: 'Gold standard screening for Gestational Diabetes Mellitus (GDM) per DIPSI/FOGSI guidelines.',
    weekStart: 24,
    weekEnd: 28,
  },
  {
    id: 'gbs_swab',
    title: 'Group B Strep (GBS) Screening',
    period: 'Wk 35–37',
    category: 'lab',
    categoryLabel: 'Microbiology Swab',
    status: 'scheduled',
    date: 'Planned for Week 36',
    facility: 'Cloudnine Hospital',
    prepTip: 'Routine painless vagino-rectal swab by your OB-GYN.',
    details: 'Screens for GBS colonization to guide IV antibiotic prophylaxis during labor.',
    weekStart: 35,
    weekEnd: 37,
  },

  // --- Prenatal Vaccinations ---
  {
    id: 'tt1',
    title: 'Tetanus Toxoid 1 (TT-1 / Td-1)',
    period: 'Wk 16–20',
    category: 'vaccine',
    categoryLabel: 'Immunization',
    status: 'completed',
    date: '15 Aug • Cloudnine OPD',
    facility: 'Cloudnine OPD',
    prepTip: 'Intramuscular injection in deltoid arm muscle.',
    details: 'First dose of maternal immunization protecting against maternal and neonatal tetanus.',
    weekStart: 16,
    weekEnd: 20,
  },
  {
    id: 'tt2',
    title: 'Tetanus Toxoid 2 (TT-2 / Td-2 Booster)',
    period: 'Wk 20–24',
    category: 'vaccine',
    categoryLabel: 'Immunization',
    status: 'upcoming',
    date: 'Planned for late September',
    facility: 'Cloudnine OPD',
    prepTip: 'Administered 4 weeks after TT-1.',
    details: 'Booster dose completing fundamental maternal antitoxin titers for delivery.',
    weekStart: 20,
    weekEnd: 24,
  },
  {
    id: 'tdap',
    title: 'Tdap Maternal Immunization',
    period: 'Wk 27–36',
    category: 'vaccine',
    categoryLabel: 'Immunization',
    status: 'scheduled',
    date: 'Planned for Week 28',
    facility: 'Cloudnine OPD',
    prepTip: 'Best administered between 27 and 32 weeks for maximal transplacental antibody transfer.',
    details: 'Protects the newborn against whooping cough (Pertussis) during the first 2 critical months of life.',
    weekStart: 27,
    weekEnd: 36,
  },
  {
    id: 'flu',
    title: 'Annual Inactivated Influenza Vaccine',
    period: 'Any Trimester',
    category: 'vaccine',
    categoryLabel: 'Immunization',
    status: 'completed',
    date: '10 Jun • Cloudnine OPD',
    facility: 'Cloudnine OPD',
    prepTip: 'Single dose annual shot safe in all trimesters.',
    details: 'Prevents severe maternal respiratory complications and conveys passive immunity to baby.',
    weekStart: 1,
    weekEnd: 40,
  },
];

export interface UpcomingMilestoneInfo {
  title: string;
  period: string;
  daysAway: string;
  date: string;
  prep: string;
  desc: string;
  category: MilestoneCategory;
  categoryLabel: string;
  facility: string;
}

/**
 * Derives the single authoritative upcoming clinical checkup based on current week.
 * Perfectly synced across Today and Care tabs.
 */
export function getAuthoritativeNextMilestone(currentWeek: number): UpcomingMilestoneInfo {
  if (currentWeek <= 13) {
    return {
      title: 'NT Scan & Dual Marker Blood Screen',
      period: 'Wk 11–13',
      daysAway: 'In 4 Days',
      date: 'Wed, 23 Sep • 10:30 AM',
      prep: 'Normal fluid intake; light breakfast allowed.',
      desc: 'Nuchal translucency ultrasound & genetic risk assessment.',
      category: 'scan',
      categoryLabel: 'Ultrasound & Blood',
      facility: 'Cloudnine Hospital • OPD Room 204',
    };
  } else if (currentWeek <= 22) {
    return {
      title: 'Level II TIFFA Anomaly Ultrasound',
      period: 'Wk 18–20',
      daysAway: 'In 5 Days',
      date: 'Wed, 23 Sep • 10:30 AM',
      prep: 'Drink 500ml water 1 hr prior; light meal allowed.',
      desc: 'Detailed anatomical scan assessing fetal organs & spine.',
      category: 'scan',
      categoryLabel: 'Targeted Anomaly Scan',
      facility: 'Cloudnine Hospital • OPD Room 204',
    };
  } else if (currentWeek <= 28) {
    return {
      title: 'Routine Growth Scan & OGTT',
      period: 'Wk 24–28',
      daysAway: 'In 6 Days',
      date: 'Wed, 23 Sep • 10:30 AM',
      prep: 'Fast 8 hours prior to the glucose test.',
      desc: 'Gestational diabetes evaluation & maternal hemoglobin test.',
      category: 'scan',
      categoryLabel: 'Growth & Metabolic',
      facility: 'Cloudnine Hospital • OPD Room 204',
    };
  } else if (currentWeek <= 34) {
    return {
      title: 'Fetal Growth & Umbilical Doppler',
      period: 'Wk 32',
      daysAway: 'In 4 Days',
      date: 'Wed, 23 Sep • 10:30 AM',
      prep: 'Hydrate well; wear comfortable two-piece clothing.',
      desc: 'Amniotic fluid index (AFI) check & placental blood flow indices.',
      category: 'scan',
      categoryLabel: 'Color Doppler',
      facility: 'Cloudnine Hospital • OPD Room 204',
    };
  } else {
    return {
      title: 'Non-Stress Test (NST) & Group B Strep',
      period: 'Wk 36–40',
      daysAway: 'In 2 Days',
      date: 'Wed, 23 Sep • 10:30 AM',
      prep: 'Have a snack 30 mins prior to stimulate fetal movement.',
      desc: 'Cardiotocography check & labor readiness review.',
      category: 'scan',
      categoryLabel: 'Fetal Wellbeing',
      facility: 'Cloudnine Hospital • OPD Room 204',
    };
  }
}
