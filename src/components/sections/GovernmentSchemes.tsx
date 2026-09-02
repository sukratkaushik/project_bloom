import React, { useState, useEffect, useMemo } from 'react';
import { Building, ExternalLink, HeartHandshake, MapPin, ShieldCheck, Sparkles, Filter, Scale, Briefcase, Baby, HeartPulse, Clock, FileText } from 'lucide-react';
import { Paywall } from '../Paywall';

export interface Scheme {
  id: string;
  name: string;
  scope: 'national' | string; // 'national' or state name
  badge: string;
  badgeColor: string;
  benefit: string;
  who: string;
  how: string;
  icon: string;
  link?: { label: string; url: string; domain: string };
}

export const INDIAN_STATES_AND_UTS = [
  'National',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

export const SCHEMES_DATABASE: Scheme[] = [
  // ================= NATIONAL (CENTRAL GOVT) SCHEMES =================
  {
    id: 'pmsma',
    name: 'PM Surakshit Matritva Abhiyan (PMSMA)',
    scope: 'national',
    badge: 'FREE SERVICE',
    badgeColor: 'bg-sage text-white',
    benefit: 'Free comprehensive antenatal check-up on the 9th of every month at government health facilities. Includes BP, weight, blood & urine tests, ultrasound, and high-risk pregnancy screening.',
    who: 'All pregnant women in 2nd and 3rd trimesters.',
    how: 'Visit your nearest PHC, CHC, or District Hospital on the 9th of any month. No advance registration needed.',
    icon: '🏥',
    link: { label: 'PMSMA Portal', url: 'https://pmsma.mohfw.gov.in', domain: 'pmsma.mohfw.gov.in' }
  },
  {
    id: 'pmmvy',
    name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    scope: 'national',
    badge: '₹5,000 CASH',
    badgeColor: 'bg-green-100 text-green-800 border-[1.5px] border-green-200',
    benefit: '₹5,000 direct cash benefit for first child (₹3,000 at ANC registration + ₹2,000 after child birth & first immunization cycle). Additional ₹6,000 for second child if girl.',
    who: 'Pregnant women aged 19+ (excluding regular government employees).',
    how: 'Register at your local Anganwadi Centre or through PMMVY Citizen Portal with Aadhaar and MCP card.',
    icon: '🎁',
    link: { label: 'PMMVY Official Portal', url: 'https://pmmvy.wcd.gov.in', domain: 'pmmvy.wcd.gov.in' }
  },
  {
    id: 'jsy',
    name: 'Janani Suraksha Yojana (JSY)',
    scope: 'national',
    badge: '₹1,400 CASH',
    badgeColor: 'bg-green-100 text-green-800 border-[1.5px] border-green-200',
    benefit: '₹1,400 (rural) or ₹1,000 (urban) direct cash assistance for institutional delivery in public health facilities.',
    who: 'BPL, SC/ST mothers. Universal for all pregnant women delivering in government hospitals across low-performing states (UP, Bihar, MP, Rajasthan, Odisha, Jharkhand, Chhattisgarh, Uttarakhand, J&K, Assam).',
    how: 'Register with your local ASHA worker or primary health center during pregnancy.',
    icon: '💰',
    link: { label: 'NHM JSY Details', url: 'https://nhm.gov.in', domain: 'nhm.gov.in' }
  },
  {
    id: 'jssk',
    name: 'Janani Shishu Suraksha Karyakram (JSSK)',
    scope: 'national',
    badge: '100% FREE DELIVERY',
    badgeColor: 'bg-sage text-white',
    benefit: 'Completely cashless and free delivery (including C-Section), medicines, lab tests, blood transfusions, food during hospital stay, and free drop-back transport for mother and infant.',
    who: 'All pregnant women delivering at public health institutions, and sick newborns up to 1 year of age.',
    how: 'Direct entitlement at all government hospitals and PHCs across India. Zero out-of-pocket payment.',
    icon: '🆓',
    link: { label: 'JSSK Guidelines', url: 'https://nhm.gov.in', domain: 'nhm.gov.in' }
  },
  {
    id: 'pmjay',
    name: 'Ayushman Bharat (PM-JAY)',
    scope: 'national',
    badge: 'UP TO ₹5 LAKH',
    badgeColor: 'bg-blue-100 text-blue-800 border-[1.5px] border-blue-200',
    benefit: 'Annual cashless health insurance coverage up to ₹5,00,000 per family for secondary & tertiary hospitalization, including high-risk C-sections and neonatal ICU (NICU) care.',
    who: 'Eligible families under SECC / PMJAY database across India.',
    how: 'Check eligibility on pmjay.gov.in or visit nearest Ayushman Mitra at any empanelled hospital with Aadhaar.',
    icon: '🛡️',
    link: { label: 'PMJAY Beneficiary Portal', url: 'https://beneficiary.nha.gov.in', domain: 'nha.gov.in' }
  },
  {
    id: 'icds',
    name: 'Integrated Child Development Services (ICDS / Poshan Abhiyaan)',
    scope: 'national',
    badge: 'FREE NUTRITION',
    badgeColor: 'bg-orange-100 text-orange-800 border-[1.5px] border-orange-200',
    benefit: 'Take-Home Rations (THR), hot nutritious meals, IFA (Iron Folic Acid) & calcium tablets, growth monitoring, and maternal nutrition counselling.',
    who: 'All pregnant women and lactating mothers.',
    how: 'Register at your local village/ward Anganwadi Centre.',
    icon: '🥗',
    link: { label: 'Poshan Tracker', url: 'https://www.poshantracker.in', domain: 'poshantracker.in' }
  },

  // ================= TAMIL NADU =================
  {
    id: 'tn-mrmbs',
    name: 'Dr. Muthulakshmi Reddy Maternity Benefit Scheme (MRMBS)',
    scope: 'Tamil Nadu',
    badge: '₹18,000 + NUTRITION KIT',
    badgeColor: 'bg-purple-100 text-purple-800 border-[1.5px] border-purple-200',
    benefit: 'Financial assistance of ₹14,000 in 5 cash instalments plus 2 Amma Maternity Nutrition Kits worth ₹4,000 containing health mix, IFA syrup, dates, protein powder, and towels.',
    who: 'Pregnant women aged 19+ delivering in government hospitals in Tamil Nadu (up to 2 deliveries).',
    how: 'Register in PICME (Pregnancy and Infant Cohort Monitoring and Evaluation) portal via Village Health Nurse (VHN) before 12 weeks.',
    icon: '🌸',
    link: { label: 'PICME Portal TN', url: 'https://picme.tn.gov.in', domain: 'picme.tn.gov.in' }
  },
  {
    id: 'tn-babykit',
    name: 'Amma Baby Care Kit Scheme',
    scope: 'Tamil Nadu',
    badge: 'FREE BABY KIT (16 ITEMS)',
    badgeColor: 'bg-sage text-white',
    benefit: 'Free premium kit containing 16 essential baby items: baby dress, towel, bed, mosquito net, napkin, baby oil (100ml), baby shampoo, soap with box, nail clipper, rattle toy, and maternal hand sanitizer.',
    who: 'All mothers delivering in Tamil Nadu government hospitals.',
    how: 'Delivered directly to mother at hospital discharge after delivery.',
    icon: '👶'
  },

  // ================= TELANGANA =================
  {
    id: 'tg-kcrkit',
    name: 'KCR Kit Scheme',
    scope: 'Telangana',
    badge: '₹12,000-₹13,000 + BABY KIT',
    badgeColor: 'bg-purple-100 text-purple-800 border-[1.5px] border-purple-200',
    benefit: 'Financial aid of ₹12,000 for boy child / ₹13,000 for girl child in 4 instalments + KCR Kit with 16 essentials (soaps, baby oil, bed, clothes, mosquito net, powder, toys).',
    who: 'Pregnant women delivering in government hospitals in Telangana (up to 2 live births).',
    how: 'Register with ANM/ASHA worker or PHC during early pregnancy with Aadhaar.',
    icon: '🎁',
    link: { label: 'Telangana MCH Portal', url: 'https://mchkit.telangana.gov.in', domain: 'mchkit.telangana.gov.in' }
  },
  {
    id: 'tg-arogya',
    name: 'Arogya Lakshmi Scheme',
    scope: 'Telangana',
    badge: 'DAILY NUTRITIOUS MEAL',
    badgeColor: 'bg-orange-100 text-orange-800 border-[1.5px] border-orange-200',
    benefit: 'One full hot nutritious meal every day (rice, dal/sambar, vegetable curry, 1 boiled egg, 200ml milk) at Anganwadi centers + IFA supplements.',
    who: 'All pregnant and lactating women in Telangana.',
    how: 'Enroll at nearest Anganwadi center in your locality.',
    icon: '🍲'
  },

  // ================= ANDHRA PRADESH =================
  {
    id: 'ap-sampoorna',
    name: 'YSR Sampoorna Poshana / Poshana Plus',
    scope: 'Andhra Pradesh',
    badge: 'FREE NUTRITION KIT & MEAL',
    badgeColor: 'bg-orange-100 text-orange-800 border-[1.5px] border-orange-200',
    benefit: 'Monthly nutritious food basket with eggs, milk, peanut-jaggery chikki, ragi flour, dried dates, plus daily hot cooked meals at Anganwadi centers.',
    who: 'All pregnant and lactating mothers across rural, urban, and tribal AP.',
    how: 'Register at nearest Anganwadi centre with Aadhaar and pregnancy card.',
    icon: '🥛',
    link: { label: 'AP WDCW Portal', url: 'https://wdcw.ap.gov.in', domain: 'wdcw.ap.gov.in' }
  },

  // ================= KARNATAKA =================
  {
    id: 'ka-mathru-poorna',
    name: 'Mathru Poorna Scheme',
    scope: 'Karnataka',
    badge: 'DAILY HOT NOURISHING MEAL',
    badgeColor: 'bg-orange-100 text-orange-800 border-[1.5px] border-orange-200',
    benefit: 'Provides one full cooked nutritious meal every day (rice, dal/sambar, green leafy vegetables, 1 boiled egg or sprouted gram, 200ml milk, and chikki) for 15 months (pregnancy through 6 months postpartum).',
    who: 'All pregnant women and lactating mothers in Karnataka.',
    how: 'Register at local Anganwadi Centre.',
    icon: '🍱',
    link: { label: 'Karnataka DWCD Portal', url: 'https://dwcd.karnataka.gov.in', domain: 'dwcd.karnataka.gov.in' }
  },
  {
    id: 'ka-prasuti-araike',
    name: 'Prasuti Araike Scheme',
    scope: 'Karnataka',
    badge: '₹2,000 CASH AID',
    badgeColor: 'bg-green-100 text-green-800 border-[1.5px] border-green-200',
    benefit: 'Cash incentive of ₹2,000 given in instalments for undergoing ANC check-ups and institutional delivery in government hospitals.',
    who: 'BPL and rural pregnant women in Karnataka.',
    how: 'Register with ASHA worker or at Government Taluk/District Hospital.',
    icon: '💵'
  },

  // ================= MAHARASHTRA =================
  {
    id: 'mh-babykit',
    name: 'Baby Care Kit Scheme (Maharashtra)',
    scope: 'Maharashtra',
    badge: '₹2,000 BABY KIT',
    badgeColor: 'bg-purple-100 text-purple-800 border-[1.5px] border-purple-200',
    benefit: 'Comprehensive baby care kit worth ₹2,000 containing baby clothing, towel, plastic diaper mat, digital thermometer, baby oil, body wash, mosquito net, and baby blanket.',
    who: 'Mothers having their first child delivered in public health centers in Maharashtra.',
    how: 'Provided directly at the government hospital at time of discharge.',
    icon: '🧸'
  },
  {
    id: 'mh-matritva',
    name: 'Matritva Anudan Yojana',
    scope: 'Maharashtra',
    badge: 'NUTRITION CASH AID',
    badgeColor: 'bg-green-100 text-green-800 border-[1.5px] border-green-200',
    benefit: 'Financial aid and counseling to ensure complete antenatal care, institutional delivery, and full infant immunizations for tribal and economically weaker mothers.',
    who: 'Eligible pregnant women in rural & tribal regions of Maharashtra.',
    how: 'Apply through local Gram Panchayat / PHC.',
    icon: '🌿'
  },

  // ================= DELHI =================
  {
    id: 'dl-ladli',
    name: 'Delhi Ladli Scheme',
    scope: 'Delhi',
    badge: 'UP TO ₹11,000 SAVINGS',
    badgeColor: 'bg-purple-100 text-purple-800 border-[1.5px] border-purple-200',
    benefit: '₹11,000 deposited in the name of the girl child if born in hospital (₹10,000 if born at home), followed by milestone educational savings deposits of ₹5,000 at key school stages.',
    who: 'Residents of Delhi (3+ years residency) with annual family income up to ₹1,00,000 on birth of girl child.',
    how: 'Apply through Women and Child Development Department (WCD) Delhi or nearby SB-eDistrict portal.',
    icon: '👧',
    link: { label: 'Delhi WCD Portal', url: 'https://wcd.delhi.gov.in', domain: 'wcd.delhi.gov.in' }
  },

  // ================= UTTAR PRADESH =================
  {
    id: 'up-sumangala',
    name: 'Mukhya Mantri Kanya Sumangala Yojana',
    scope: 'Uttar Pradesh',
    badge: '₹15,000 IN 6 PHASES',
    badgeColor: 'bg-purple-100 text-purple-800 border-[1.5px] border-purple-200',
    benefit: 'Conditional cash transfer of ₹15,000: ₹2,000 on birth of girl child, ₹1,000 on full immunization, ₹2,000 on Class 1 admission, and higher tranches for secondary and degree education.',
    who: 'Families resident of UP with annual income up to ₹3 Lakh (max 2 daughters per family).',
    how: 'Apply online at mksy.up.gov.in or via CSC center.',
    icon: '✨',
    link: { label: 'UP Sumangala Portal', url: 'https://mksy.up.gov.in/women_welfare/', domain: 'mksy.up.gov.in' }
  },
  {
    id: 'up-matritva',
    name: 'UP Matritva Shishu Evam Balika Madad Yojana',
    scope: 'Uttar Pradesh',
    badge: '₹20,000-₹25,000 AID',
    badgeColor: 'bg-green-100 text-green-800 border-[1.5px] border-green-200',
    benefit: 'Financial aid of ₹20,000 for birth of boy child or ₹25,000 for birth of girl child, plus 3 months minimum wage equivalent to mothers.',
    who: 'Registered construction workers under the UP Building & Other Construction Workers Board (BOCW).',
    how: 'Apply on the UP BOCW portal or nearest Labor Office with worker registration card.',
    icon: '🏗️',
    link: { label: 'UP BOCW Portal', url: 'https://website.upbocw.in/', domain: 'upbocw.in' }
  },

  // ================= RAJASTHAN =================
  {
    id: 'rj-igmpy',
    name: 'Indira Gandhi Matritva Poshan Yojana (IGMPY)',
    scope: 'Rajasthan',
    badge: '₹6,000 CASH (2ND CHILD)',
    badgeColor: 'bg-green-100 text-green-800 border-[1.5px] border-green-200',
    benefit: '₹6,000 cash assistance paid in 5 stages upon the birth of the 2nd child (pregnant registration, ANC, institutional birth, immunizations, and family planning adoption) to reduce child malnutrition.',
    who: 'All pregnant women expecting their second child in Rajasthan.',
    how: 'Register at nearest Anganwadi centre or via Jan Aadhaar portal.',
    icon: '🤱',
    link: { label: 'Jan Aadhaar Portal', url: 'https://janaadhaar.rajasthan.gov.in', domain: 'janaadhaar.rajasthan.gov.in' }
  },
  {
    id: 'rj-rajshree',
    name: 'Mukhyamantri Rajshree Yojana',
    scope: 'Rajasthan',
    badge: 'UP TO ₹50,000 FINANCIAL AID',
    badgeColor: 'bg-purple-100 text-purple-800 border-[1.5px] border-purple-200',
    benefit: '₹2,500 at birth in government hospital + ₹2,500 on 1-year vaccination, followed by educational milestone payouts up to ₹50,000.',
    who: 'Girl children born in institutional health facilities in Rajasthan.',
    how: 'Registered automatically at government hospital using Jan Aadhaar card.',
    icon: '👑'
  },

  // ================= ODISHA =================
  {
    id: 'od-mamata',
    name: 'MAMATA Scheme',
    scope: 'Odisha',
    badge: '₹5,000 CASH AID',
    badgeColor: 'bg-green-100 text-green-800 border-[1.5px] border-green-200',
    benefit: 'Conditional cash transfer of ₹5,000 transferred in two instalments (₹3,000 in 2nd trimester after ANC + ₹2,000 after 10-month child vaccination & exclusive breastfeeding).',
    who: 'All pregnant women aged 19+ in Odisha for first 2 live births (excluding government employees).',
    how: 'Enroll at your local Anganwadi Centre through the AWW/ASHA worker.',
    icon: '🌺',
    link: { label: 'MAMATA Odisha Portal', url: 'https://wcd.odisha.gov.in', domain: 'wcd.odisha.gov.in' }
  },

  // ================= WEST BENGAL =================
  {
    id: 'wb-matrimaa',
    name: 'Matri Maa & Janani Suraksha Top-up',
    scope: 'West Bengal',
    badge: 'FREE DROP-BACK & NUTRITION',
    badgeColor: 'bg-sage text-white',
    benefit: 'Dedicated 102 Matri Yaan ambulance transport service for pregnant women to and from hospital, completely free institutional delivery, and comprehensive postnatal kits.',
    who: 'All pregnant women across West Bengal.',
    how: 'Dial 102 toll-free ambulance during labor or coordinate through ASHA/ANM worker.',
    icon: '🚑',
    link: { label: 'WB Health Portal', url: 'https://www.wbhealth.gov.in', domain: 'wbhealth.gov.in' }
  },
  {
    id: 'wb-kanyashree',
    name: 'Kanyashree Prakalpa',
    scope: 'West Bengal',
    badge: 'ANNUAL SCHOLARSHIP & SAVINGS',
    badgeColor: 'bg-purple-100 text-purple-800 border-[1.5px] border-purple-200',
    benefit: 'Annual scholarship of ₹1,000 (K1) and one-time grant of ₹25,000 (K2) to protect, nurture, and educate girl children.',
    who: 'Unmarried girl children in West Bengal.',
    how: 'Apply through local educational institutions and WCD portal.',
    icon: '👧',
    link: { label: 'Kanyashree Official Portal', url: 'https://kanyashree.wb.gov.in', domain: 'kanyashree.wb.gov.in' }
  },

  // ================= BIHAR =================
  {
    id: 'br-kanya-utthan',
    name: 'Mukhyamantri Kanya Utthan Yojana',
    scope: 'Bihar',
    badge: '₹2,000 + VACCINE CASH',
    badgeColor: 'bg-purple-100 text-purple-800 border-[1.5px] border-purple-200',
    benefit: '₹2,000 direct bank transfer on birth of girl child + ₹1,000 upon 1-year immunization completion, totaling up to ₹54,100 through graduation.',
    who: 'All girl children born in Bihar (up to 2 girls per household).',
    how: 'Register on the e-Kalyan Bihar portal or through Anganwadi Sevika.',
    icon: '🎀',
    link: { label: 'Medhasoft Bihar Portal', url: 'https://medhasoft.bihar.gov.in/', domain: 'medhasoft.bihar.gov.in' }
  },

  // ================= MADHYA PRADESH =================
  {
    id: 'mp-prasooti',
    name: 'Mukhyamantri Shramik Sewa Prasooti Sahayata Yojana',
    scope: 'Madhya Pradesh',
    badge: '₹16,000 CASH BENEFIT',
    badgeColor: 'bg-green-100 text-green-800 border-[1.5px] border-green-200',
    benefit: 'Total cash benefit of ₹16,000: ₹4,000 during the last trimester for nutritious diet + ₹12,000 post institutional delivery for infant care.',
    who: 'Pregnant women registered under Sambal Yojana / Unorganized Workers Board.',
    how: 'Submit pregnancy registration and Sambal Card at nearest government hospital or PHC.',
    icon: '🌾',
    link: { label: 'MP Sambal Portal', url: 'https://sambal.mp.gov.in', domain: 'sambal.mp.gov.in' }
  },
  {
    id: 'mp-ladli-laxmi',
    name: 'Ladli Laxmi Yojana 2.0',
    scope: 'Madhya Pradesh',
    badge: '₹1,43,000 ASSURANCE',
    badgeColor: 'bg-purple-100 text-purple-800 border-[1.5px] border-purple-200',
    benefit: 'Assurance certificate issued upon birth of girl child, with milestone educational payouts and final ₹1,00,000 lump sum at age 21.',
    who: 'Native families of MP on birth of girl child.',
    how: 'Register on ladlilaxmi.mp.gov.in through local Anganwadi.',
    icon: '⭐',
    link: { label: 'Ladli Laxmi Portal', url: 'https://ladlilaxmi.mp.gov.in', domain: 'ladlilaxmi.mp.gov.in' }
  },

  // ================= GUJARAT =================
  {
    id: 'gj-kpsy',
    name: 'Kasturba Poshan Sahay Yojana (KPSY)',
    scope: 'Gujarat',
    badge: '₹6,000 CASH SUPPORT',
    badgeColor: 'bg-green-100 text-green-800 border-[1.5px] border-green-200',
    benefit: 'Financial aid of ₹6,000 in 3 instalments (₹2,000 at 1st trimester ANC registration, ₹2,000 after institutional delivery, ₹2,000 after primary child vaccination).',
    who: 'BPL pregnant women in Gujarat for first two live deliveries.',
    how: 'Register at nearest Sub-Centre / PHC using BPL ration card and Techo portal.',
    icon: '🌻',
    link: { label: 'Gujarat Health Portal', url: 'https://gujhealth.gujarat.gov.in', domain: 'gujhealth.gujarat.gov.in' }
  },
  {
    id: 'gj-chiranjeevi',
    name: 'Chiranjeevi Yojana',
    scope: 'Gujarat',
    badge: 'FREE PRIVATE HOSPITAL DELIVERY',
    badgeColor: 'bg-sage text-white',
    benefit: 'Completely free delivery and emergency obstetric care (including C-sections) at empanelled private nursing homes and hospitals for vulnerable mothers.',
    who: 'BPL and APL tribal pregnant women in Gujarat.',
    how: 'Show BPL card / Mamta card at any empanelled private maternity hospital.',
    icon: '🏥'
  },

  // ================= KERALA =================
  {
    id: 'kl-thalolam',
    name: 'Thalolam & Snehasparsham Schemes',
    scope: 'Kerala',
    badge: 'FREE PEDIATRIC & MATERNAL AID',
    badgeColor: 'bg-blue-100 text-blue-800 border-[1.5px] border-blue-200',
    benefit: 'Complete financial assistance and free super-specialty treatment for newborns with congenital diseases or complications, plus monthly maternal support.',
    who: 'Children under 18 and mothers in Kerala requiring specialized medical support.',
    how: 'Apply through Social Security Mission Kerala at government medical college hospitals.',
    icon: '🌿',
    link: { label: 'Kerala Social Security', url: 'https://socialsecuritymission.gov.in', domain: 'socialsecuritymission.gov.in' }
  },

  // ================= ASSAM =================
  {
    id: 'as-mamoni',
    name: 'Mamoni Scheme (Assam)',
    scope: 'Assam',
    badge: '₹5,000 NUTRITION CASH',
    badgeColor: 'bg-green-100 text-green-800 border-[1.5px] border-green-200',
    benefit: '₹5,000 in two instalments for pregnant women who complete mandatory periodic ANC check-ups to encourage nutrition and institutional care.',
    who: 'All pregnant women in Assam undergoing ANC at public health centers.',
    how: 'Register with ASHA / ANM worker at local PHC.',
    icon: '🍃',
    link: { label: 'NHM Assam Portal', url: 'https://nhm.assam.gov.in', domain: 'nhm.assam.gov.in' }
  },

  // ================= HARYANA =================
  {
    id: 'hr-matrushakti',
    name: 'Mukhyamantri Matru Shakti & Aapki Beti Hamari Beti',
    scope: 'Haryana',
    badge: '₹21,000 ONE-TIME GRANT',
    badgeColor: 'bg-purple-100 text-purple-800 border-[1.5px] border-purple-200',
    benefit: 'One-time financial deposit of ₹21,000 upon the birth of first/second daughter with interest accumulation for education and healthcare.',
    who: 'Families in Haryana upon birth of girl child.',
    how: 'Apply on Saral Haryana portal with Parivar Pehchan Patra (PPP).',
    icon: '🏵️',
    link: { label: 'Saral Haryana', url: 'https://saralharyana.gov.in', domain: 'saralharyana.gov.in' }
  },

  // ================= CHHATTISGARH =================
  {
    id: 'cg-kaushalya',
    name: 'Kaushalya Matritva Yojana',
    scope: 'Chhattisgarh',
    badge: '₹5,000 ON 2ND DAUGHTER',
    badgeColor: 'bg-green-100 text-green-800 border-[1.5px] border-green-200',
    benefit: '₹5,000 one-time direct bank transfer on the birth of a second girl child to support maternal health and girl child nutrition.',
    who: 'Permanent resident mothers of Chhattisgarh.',
    how: 'Apply via Anganwadi or District Women & Child Development Department.',
    icon: '🌾'
  },

  // ================= PUNJAB =================
  {
    id: 'pb-mata-kaushalya',
    name: 'Mata Kaushalya Kalyan Yojana',
    scope: 'Punjab',
    badge: '₹1,000 INSTITUTIONAL AID',
    badgeColor: 'bg-green-100 text-green-800 border-[1.5px] border-green-200',
    benefit: 'Cash incentive of ₹1,000 for every pregnant woman who chooses institutional delivery in government hospitals in Punjab.',
    who: 'All pregnant women delivering in government health facilities in Punjab.',
    how: 'Entitlement processed directly at hospital discharge.',
    icon: '🌻',
    link: { label: 'NHM Punjab Portal', url: 'https://nhm.punjab.gov.in', domain: 'nhm.punjab.gov.in' }
  },

  // ================= JHARKHAND =================
  {
    id: 'jh-janani',
    name: 'Mukhyamantri Janani Shishu Swasthya Abhiyan',
    scope: 'Jharkhand',
    badge: 'FREE CARE & TRANSPORT',
    badgeColor: 'bg-sage text-white',
    benefit: 'Free ambulance transport, free hospital stay, medicines, diagnostic tests, and supplementary nutrition kits for mother and newborn.',
    who: 'All pregnant mothers in Jharkhand.',
    how: 'Call 108 for free transport or register at PHC/CHC.',
    icon: '🌲',
    link: { label: 'JRHMS Jharkhand Portal', url: 'https://jrhms.jharkhand.gov.in', domain: 'jrhms.jharkhand.gov.in' }
  }
];

export interface LegalBenefit {
  id: string;
  title: string;
  iconName: 'briefcase' | 'shield' | 'heart' | 'baby' | 'clock' | 'scale';
  benefit: string;
  legalSource: {
    actName: string;
    section: string;
    url: string;
    authority: string;
  };
  keyProtection: string;
}

export const LEGAL_MATERNITY_BENEFITS: LegalBenefit[] = [
  {
    id: 'paid-leave',
    title: '26 Weeks Fully Paid Maternity Leave',
    iconName: 'briefcase',
    benefit: 'Legally guarantees 26 weeks (6.5 months) of fully paid absence from work for up to 2 surviving children (12 weeks for 3+ children). Up to 8 weeks can be availed before the expected date of delivery, and the remainder postpartum, paid at 100% average daily wages with zero deduction.',
    legalSource: {
      actName: 'Maternity Benefit (Amendment) Act, 2017',
      section: 'Section 5(3)',
      url: 'https://www.labour.gov.in',
      authority: 'Ministry of Labour & Employment, Govt. of India'
    },
    keyProtection: 'Mandatory across all private companies, IT firms, factories, startups, and establishments employing 10+ persons. Only requirement is 80 days of service in the preceding 12 months.'
  },
  {
    id: 'dismissal-protection',
    title: 'Absolute Immunity from Dismissal or Termination',
    iconName: 'shield',
    benefit: 'Provides complete statutory job security throughout pregnancy and the leave period. Employers are strictly barred from terminating, discharging, demoting, or altering terms of employment to the disadvantage of a pregnant employee.',
    legalSource: {
      actName: 'Maternity Benefit Act, 1961',
      section: 'Section 12',
      url: 'https://www.labour.gov.in',
      authority: 'Ministry of Labour & Employment, Govt. of India'
    },
    keyProtection: 'It is a cognizable, punishable criminal offense for an employer to terminate employment on grounds of pregnancy. By Supreme Court precedent, this protection applies equally to contractual, temporary, and daily-wage employees.'
  },
  {
    id: 'arduous-work',
    title: 'Exemption from Heavy, Standing, or Hazardous Duties',
    iconName: 'heart',
    benefit: 'Expectant mothers have the statutory right to request reassignment away from strenuous tasks. Employers must legally excuse them from long hours of standing, heavy lifting, or exposure to toxic chemicals, machinery, and radiation.',
    legalSource: {
      actName: 'Maternity Benefit Act, 1961',
      section: 'Section 4(3)',
      url: 'https://www.labour.gov.in',
      authority: 'Ministry of Labour & Employment, Govt. of India'
    },
    keyProtection: 'Prohibits assigning any work during the 1 month preceding 6 weeks before delivery that could cause physical strain, harm fetal development, or increase the risk of miscarriage.'
  },
  {
    id: 'creche-nursing',
    title: 'Mandatory Nursing Breaks & Crèche Access',
    iconName: 'baby',
    benefit: 'Working mothers are entitled to 2 paid nursing breaks during each workday until the infant attains 15 months of age. Establishments with 50+ staff must maintain an accessible crèche within 500 meters.',
    legalSource: {
      actName: 'Maternity Benefit (Amendment) Act, 2017',
      section: 'Section 11 & 11A',
      url: 'https://www.labour.gov.in',
      authority: 'Ministry of Labour & Employment, Govt. of India'
    },
    keyProtection: 'Mothers are legally entitled to 4 visits per day to the crèche (including rest intervals), with zero loss of salary or work penalties.'
  },
  {
    id: 'miscarriage-leave',
    title: 'Paid Recovery Leave for Miscarriage or Complications',
    iconName: 'clock',
    benefit: 'Provides 6 weeks of fully paid leave immediately following a miscarriage or Medical Termination of Pregnancy (MTP). For pregnancy-induced illness or premature birth complications, an additional 1 month of paid leave can be claimed.',
    legalSource: {
      actName: 'Maternity Benefit Act, 1961',
      section: 'Section 9 & Section 10',
      url: 'https://www.labour.gov.in',
      authority: 'Ministry of Labour & Employment, Govt. of India'
    },
    keyProtection: 'Granted immediately upon submission of a registered doctor’s certificate. Protects women from wage loss and physical exploitation during medical bereavement.'
  },
  {
    id: 'universal-nutrition',
    title: 'Universal Free Nutrition & Cash Grants',
    iconName: 'scale',
    benefit: 'Statutory guarantee for all pregnant and lactating women (non-govt employees) to receive free daily hot cooked meals and Take-Home Rations via Anganwadi centres throughout pregnancy and 6 months postpartum, plus minimum ₹6,000 direct cash benefit (PMMVY/JSY).',
    legalSource: {
      actName: 'National Food Security Act (NFSA), 2013',
      section: 'Section 4',
      url: 'https://nfsa.gov.in',
      authority: 'Department of Food & Public Distribution, Govt. of India'
    },
    keyProtection: 'Enforceable under Article 21 (Right to Life) and Article 42 (Maternity Relief) of the Constitution of India; independent of employment sector.'
  }
];

export interface GovernmentSchemesProps {
  initialSearchQuery?: string;
  initialState?: string;
}

export const GovernmentSchemes: React.FC<GovernmentSchemesProps> = ({ initialSearchQuery = '', initialState }) => {
  const [selectedState, setSelectedState] = useState<string>(() => {
    return initialState || localStorage.getItem('op_selected_scheme_state') || 'National';
  });
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);

  useEffect(() => {
    localStorage.setItem('op_selected_scheme_state', selectedState);
  }, [selectedState]);

  // Filter and sort schemes according to user's dropdown choice & optional search query
  const filteredSchemes = useMemo(() => {
    const list = SCHEMES_DATABASE.filter(scheme => {
      // 1. State / Scope filter:
      // If "National": only show scope === 'national'
      // If specific state: show scope === 'national' OR scope === selectedState
      const matchesScope = selectedState === 'National'
        ? scheme.scope === 'national'
        : (scheme.scope === 'national' || scheme.scope.toLowerCase() === selectedState.toLowerCase());

      if (!matchesScope) return false;

      // 2. Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        scheme.name.toLowerCase().includes(q) ||
        scheme.benefit.toLowerCase().includes(q) ||
        scheme.who.toLowerCase().includes(q) ||
        scheme.badge.toLowerCase().includes(q) ||
        scheme.scope.toLowerCase().includes(q)
      );
    });

    // 3. Priority Sort: Show State-specific schemes at the very TOP, followed by Central Govt schemes
    return list.sort((a, b) => {
      const aIsState = a.scope.toLowerCase() === selectedState.toLowerCase() && selectedState !== 'National';
      const bIsState = b.scope.toLowerCase() === selectedState.toLowerCase() && selectedState !== 'National';
      if (aIsState && !bIsState) return -1;
      if (!aIsState && bIsState) return 1;
      return 0;
    });
  }, [selectedState, searchQuery]);

  const nationalCount = filteredSchemes.filter(s => s.scope === 'national').length;
  const stateCount = filteredSchemes.filter(s => s.scope !== 'national').length;

  return (
    <Paywall featureName="GovernmentSchemes">
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sage/15 text-sage flex items-center justify-center shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-[clamp(26px,4vw,36px)] font-normal text-charcoal leading-tight">
                Maternity & Health Schemes
              </h1>
              <p className="text-[13.5px] text-medium">
                Official Indian Central & State Government benefits for pregnancy, delivery, and newborn care.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border-[1.5px] border-border rounded-[16px] p-4 sm:p-5 shadow-sm space-y-4">
          <div className="max-w-md">
            {/* State Selector Dropdown */}
            <label className="block text-[11px] font-bold uppercase tracking-wider text-light mb-1.5 flex items-center gap-1.5">
              <MapPin size={13} className="text-sage" /> Select Your State / Region
            </label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-cream/70 border-[1.5px] border-border rounded-[10px] px-3.5 py-2.5 text-[14px] font-medium text-charcoal focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all cursor-pointer appearance-none"
              >
                <option value="National">🇮🇳 National (All-India Central Schemes)</option>
                <optgroup label="── States & Union Territories ──">
                  {INDIAN_STATES_AND_UTS.filter(s => s !== 'National').map(state => (
                    <option key={state} value={state}>
                      📍 {state}
                    </option>
                  ))}
                </optgroup>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-light">
                ▼
              </div>
            </div>
          </div>

          {/* Active Filter Summary */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/70 text-[12.5px]">
            <div className="flex items-center gap-2 text-charcoal">
              <span className="font-medium">
                Showing <strong className="text-sage-dark font-bold">{filteredSchemes.length}</strong> schemes
              </span>
              {selectedState !== 'National' ? (
                <span className="text-light">
                  ({nationalCount} Central Govt + {stateCount} {selectedState} State)
                </span>
              ) : (
                <span className="text-light">
                  (All Central Government Schemes)
                </span>
              )}
            </div>

            {selectedState !== 'National' && (
              <button
                onClick={() => setSelectedState('National')}
                className="text-[11.5px] text-sage-dark font-medium hover:underline flex items-center gap-1"
              >
                Reset to National only
              </button>
            )}
          </div>
        </div>

        {/* Schemes Grid */}
        {filteredSchemes.length === 0 ? (
          <div className="bg-white border border-border rounded-[16px] p-12 text-center shadow-sm">
            <div className="w-14 h-14 bg-sage-pale rounded-full flex items-center justify-center mx-auto mb-3 text-sage">
              <Building size={26} />
            </div>
            <h3 className="font-serif text-[18px] text-charcoal mb-1">No matching schemes found</h3>
            <p className="text-[13.5px] text-medium max-w-md mx-auto mb-4">
              We couldn't find any schemes for {selectedState}.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedState('National'); }}
              className="px-4 py-2 bg-sage text-white rounded-[10px] text-[13px] font-semibold hover:bg-sage-dark transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSchemes.map(scheme => (
              <div
                key={scheme.id}
                className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm overflow-hidden flex flex-col group hover:border-sage hover:shadow-md transition-all duration-200"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-border bg-gray-50/60 flex items-start justify-between gap-4">
                  <div className="flex gap-3.5">
                    <div className="text-[28px] shrink-0">{scheme.icon}</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        {scheme.scope === 'national' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            🇮🇳 Central Govt
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            🏛️ State Scheme • {scheme.scope}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${scheme.badgeColor}`}>
                          {scheme.badge}
                        </span>
                      </div>
                      <h3 className="font-bold text-charcoal text-[15.5px] leading-snug">
                        {scheme.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <div>
                      <dt className="text-[10.5px] font-bold text-light uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Sparkles size={12} className="text-sage" /> Benefit
                      </dt>
                      <dd className="text-[13.5px] text-charcoal leading-relaxed">{scheme.benefit}</dd>
                    </div>

                    <div className="bg-sage-pale/25 p-3 rounded-[10px] border border-sage-pale">
                      <dt className="text-[10.5px] font-bold text-sage uppercase tracking-wider mb-0.5 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-sage" /> Who Qualifies?
                      </dt>
                      <dd className="text-[12.5px] text-charcoal/90 leading-relaxed">{scheme.who}</dd>
                    </div>

                    <div>
                      <dt className="text-[10.5px] font-bold text-light uppercase tracking-wider mb-1">How to Apply</dt>
                      <dd className="text-[12.5px] text-medium leading-relaxed">{scheme.how}</dd>
                    </div>
                  </div>

                  {scheme.link && (
                    <div className="pt-3 border-t border-border/70 flex justify-end">
                      <a
                        href={scheme.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-sage-dark hover:underline"
                      >
                        {scheme.link.label} <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ASHA Info Card */}
        <div className="bg-sage border border-sage-dark rounded-[16px] p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4 text-white text-center sm:text-left mt-8">
          <div className="bg-white/20 p-3 rounded-full shrink-0">
            <HeartHandshake className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="font-serif text-[22px] mb-2">Your ASHA & Anganwadi Worker is your best guide</h3>
            <p className="text-[14.5px] opacity-90 leading-relaxed max-w-3xl">
              Every village and urban ward across India has dedicated ASHA (Accredited Social Health Activist) and Anganwadi workers. They help you register for Central (PMMVY, JSY) and State-specific maternity kits, assist with your MCP health card, and accompany you to the hospital for delivery.
            </p>
          </div>
        </div>

        {/* Official Portals Footer */}
        <div className="bg-white dark:bg-[#1E293B] border-[1.5px] border-border dark:border-white/10 rounded-[16px] shadow-sm p-6 mt-6">
          <h3 className="font-semibold text-charcoal dark:text-white text-[15px] mb-4">Official Central Government Portals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'PMMVY Official Registration', url: 'https://pmmvy.wcd.gov.in', domain: 'pmmvy.wcd.gov.in' },
              { label: 'National Health Mission (JSY/JSSK)', url: 'https://nhm.gov.in', domain: 'nhm.gov.in' },
              { label: 'Ayushman Bharat (PM-JAY)', url: 'https://pmjay.gov.in', domain: 'pmjay.gov.in' },
              { label: 'Ministry of Women & Child Dev.', url: 'https://wcd.nic.in', domain: 'wcd.nic.in' },
            ].map(link => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col p-3 border border-border dark:border-white/10 rounded-[10px] hover:bg-cream/50 dark:hover:bg-white/5 hover:border-sage transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-[13.5px] text-charcoal dark:text-white group-hover:text-sage-dark dark:group-hover:text-sage-light">{link.label}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-medium dark:text-gray-400 group-hover:text-sage" />
                </div>
                <span className="text-[11.5px] text-medium dark:text-gray-400">{link.domain}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Statutory Legal Rights & Workplace Protections */}
        <div className="bg-white dark:bg-[#1E293B] border-[1.5px] border-border dark:border-white/10 rounded-[20px] shadow-sm p-6 sm:p-8 mt-8 space-y-6">
          <div className="flex items-center gap-3.5 border-b border-border/70 dark:border-white/10 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-sage/15 dark:bg-sage/25 text-sage dark:text-sage-pale flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-[clamp(20px,3vw,26px)] font-semibold text-charcoal dark:text-white leading-tight">
                Legal Rights &amp; Workplace Protections for Pregnant Women
              </h3>
              <p className="text-[13.5px] text-medium dark:text-gray-300">
                Mandatory paid leave, dismissal immunity, and healthcare protections enacted under Indian law.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {LEGAL_MATERNITY_BENEFITS.map((item) => {
              const IconComp = {
                briefcase: Briefcase,
                shield: ShieldCheck,
                heart: HeartPulse,
                baby: Baby,
                clock: Clock,
                scale: Scale
              }[item.iconName];

              return (
                <div
                  key={item.id}
                  className="bg-cream/40 dark:bg-white/[0.03] border-[1.5px] border-border dark:border-white/10 rounded-[18px] p-6 sm:p-7 flex flex-col justify-between hover:border-sage dark:hover:border-sage/50 hover:shadow-sm transition-all group w-full"
                >
                  <div className="space-y-4">
                    {/* Header: Icon & Full-width Title */}
                    <div className="flex items-center gap-3.5 pb-3 border-b border-border/60 dark:border-white/10">
                      <div className="w-11 h-11 rounded-xl bg-sage/15 dark:bg-sage/25 text-sage dark:text-sage-pale flex items-center justify-center shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <h4 className="font-serif text-[19px] sm:text-[21px] font-semibold text-charcoal dark:text-white group-hover:text-sage dark:group-hover:text-sage-pale transition-colors leading-snug">
                        {item.title}
                      </h4>
                    </div>

                    {/* Benefit Provided by Government */}
                    <div className="pt-1">
                      <dt className="text-[11px] font-bold text-light dark:text-gray-400 uppercase tracking-wider mb-1">
                        Benefit Provided by Government
                      </dt>
                      <dd className="text-[14px] text-charcoal dark:text-gray-200 leading-relaxed">
                        {item.benefit}
                      </dd>
                    </div>

                    {/* Key Protection Callout */}
                    <div className="bg-sage-pale/25 dark:bg-sage/10 p-4 rounded-[14px] border border-sage-pale dark:border-sage/25 flex items-start gap-3.5">
                      <ShieldCheck className="w-5 h-5 text-sage dark:text-sage-pale shrink-0 mt-0.5" />
                      <div>
                        <dt className="text-[11px] font-bold text-sage dark:text-sage-pale uppercase tracking-wider mb-0.5">
                          Key Legal Protection
                        </dt>
                        <dd className="text-[13px] text-charcoal/90 dark:text-gray-200 leading-relaxed font-medium">
                          {item.keyProtection}
                        </dd>
                      </div>
                    </div>
                  </div>

                  {/* Legal Source Hyperlink Bar */}
                  <div className="pt-4 mt-4 border-t border-border/70 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12.5px]">
                    <div className="flex items-center gap-2">
                      <span className="text-light dark:text-gray-400 text-[11.5px] font-medium">
                        Legal Source:
                      </span>
                      <a
                        href={item.legalSource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-sage-dark dark:text-sage-pale hover:underline"
                      >
                        {item.legalSource.actName} ({item.legalSource.section}) <ExternalLink size={12} />
                      </a>
                    </div>
                    <span className="text-[11.5px] text-light dark:text-gray-400 italic">
                      {item.legalSource.authority}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legal Enforcement Note */}
          <div className="p-4 sm:p-5 bg-cream/70 dark:bg-white/[0.04] border border-border dark:border-white/10 rounded-[14px] flex items-start gap-3.5 text-[13px] text-medium dark:text-gray-300">
            <div className="p-2 rounded-lg bg-sage/15 dark:bg-sage/25 text-sage dark:text-sage-pale shrink-0 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <p className="leading-relaxed">
              <strong className="text-charcoal dark:text-white font-semibold">Enforcement &amp; Redressal:</strong>{' '}
              These statutory entitlements are enacted by the Parliament of India and are non-negotiable. If an employer denies paid maternity leave, terminates employment during pregnancy, or refuses required health adjustments, formal complaints can be filed with the{' '}
              <strong className="text-charcoal dark:text-white">Office of the State Labour Commissioner</strong>, the{' '}
              <strong className="text-charcoal dark:text-white">Chief Labour Commissioner (Central)</strong>, or the{' '}
              <strong className="text-charcoal dark:text-white">National Commission for Women (NCW)</strong>.
            </p>
          </div>
        </div>
      </div>
    </Paywall>
  );
};
