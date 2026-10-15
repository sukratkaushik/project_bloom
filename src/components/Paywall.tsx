import React, { useState } from 'react';
import { usePlanner } from '../store';
import { 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  Gift, 
  Users, 
  Calendar, 
  HeartHandshake, 
  Stethoscope, 
  UtensilsCrossed, 
  FileText, 
  CheckCircle2, 
  Smartphone,
  Check,
  LockOpen
} from 'lucide-react';
import { navigate } from '../utils/navigation';
import { triggerHaptic } from '../utils/nativeBridge';

interface PaywallProps {
  children: React.ReactNode;
  featureName: 'AskOurPregnancy' | 'FoodScanner' | 'MaternalCare' | 'GovernmentSchemes' | 'Postpartum' | 'PartnerSync' | 'EhrExports';
}

interface FeatureConfig {
  tier: 'standard' | 'premium';
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  perks: {
    icon: React.ElementType;
    title: string;
    desc: string;
  }[];
  includedSummary: string;
}

const FEATURE_CONFIGS: Record<PaywallProps['featureName'], FeatureConfig> = {
  PartnerSync: {
    tier: 'premium',
    badge: 'Bloom PRO • Partner Companion',
    title: 'Sync Your Journey Together',
    subtitle: 'Keep your partner connected to every movement, appointment, and milestone in real time.',
    icon: Users,
    perks: [
      {
        icon: Smartphone,
        title: 'Real-Time Kick & Vitals Alerts',
        desc: 'Instant notifications on your partner’s device when baby moves or health logs update.'
      },
      {
        icon: Calendar,
        title: 'Shared Doctor Scans & Milestones',
        desc: 'Keep both parents aligned on ultrasound visits, trimester labs, and hospital bags.'
      },
      {
        icon: ShieldCheck,
        title: 'Zero-Knowledge P2P Encryption',
        desc: 'Direct peer-to-peer sync with private encryption. Your memories never touch third parties.'
      }
    ],
    includedSummary: 'Includes 24/7 Ask OPIN AI, Food Safety Scanner & Doctor EHR Vault'
  },
  AskOurPregnancy: {
    tier: 'premium',
    badge: 'Bloom PRO • 24/7 AI Companion',
    title: 'Warm, Empathetic Maternal Guidance',
    subtitle: 'Ask about symptoms, trimester changes, cravings, or hospital prep anytime, day or night.',
    icon: Bot,
    perks: [
      {
        icon: Sparkles,
        title: 'Unlimited Trimester Consultations',
        desc: 'Instant compassionate guidance tailored specifically to your gestational week and symptoms.'
      },
      {
        icon: ShieldCheck,
        title: 'Medically-Grounded Safety Standards',
        desc: 'Curated against verified obstetric protocols, Indian clinical guidelines, and maternal health research.'
      },
      {
        icon: HeartHandshake,
        title: 'Personalized to Your Profile',
        desc: 'Context-aware responses factoring in your trimester, diet preferences, and medical history.'
      }
    ],
    includedSummary: 'Includes Food Scanner, Doctor EHR Vault & Real-Time Partner Sync'
  },
  FoodScanner: {
    tier: 'premium',
    badge: 'Bloom PRO • AI Nutrition Scanner',
    title: 'Nourish Safely, Every Meal',
    subtitle: 'Scan meals, restaurant dishes, and packaged snacks for pregnancy-safe ingredients.',
    icon: UtensilsCrossed,
    perks: [
      {
        icon: ShieldCheck,
        title: 'Instant Hazard & Heat Detection',
        desc: 'Detects unpasteurized dairy, raw sprouts, high-mercury fish, and high-heat Ayurvedic spices.'
      },
      {
        icon: Sparkles,
        title: 'Trimester-Specific Nutrient Balancing',
        desc: 'Highlights critical iron, calcium, folate, and protein density in every Indian food item.'
      },
      {
        icon: CheckCircle2,
        title: 'Wholesome Craving Swaps',
        desc: 'Safe, satisfying alternatives for street foods, sweets, and spicy cravings.'
      }
    ],
    includedSummary: 'Includes 24/7 Ask OPIN AI, Doctor EHR Vault & Real-Time Partner Sync'
  },
  GovernmentSchemes: {
    tier: 'standard',
    badge: 'Bloom Standard • Maternal Welfare',
    title: 'Claim Your Full Maternity Benefits',
    subtitle: 'Step-by-step guidance to claim financial assistance under JSY, PMMVY, and state schemes.',
    icon: FileText,
    perks: [
      {
        icon: Sparkles,
        title: 'Up to ₹6,000+ Direct DBT Assistance',
        desc: 'Full eligibility calculators and document checklists for Indian central and state programs.'
      },
      {
        icon: Calendar,
        title: 'Anganwadi & Hospital Filing Guide',
        desc: 'Clear guidance for MCP card registration, ASHA worker coordination, and bank DBT setup.'
      },
      {
        icon: ShieldCheck,
        title: '100% Free & Transparent Process',
        desc: 'Official direct government routes with zero middleman commissions.'
      }
    ],
    includedSummary: 'Also includes Partner Sync, Postpartum Care & Clinical Maternal Pack'
  },
  Postpartum: {
    tier: 'standard',
    badge: 'Bloom Standard • Fourth Trimester',
    title: 'Gentle Postpartum Recovery',
    subtitle: 'Dedicated physical healing, lactation tracking, and maternal mental wellness screening.',
    icon: HeartHandshake,
    perks: [
      {
        icon: CheckCircle2,
        title: 'Physical Recovery Timeline',
        desc: 'Lochia monitoring, perineal & C-section incision care, and gentle pelvic floor recovery.'
      },
      {
        icon: Sparkles,
        title: 'Validated EPDS Wellbeing Checks',
        desc: 'Clinically validated screening for postpartum blues and emotional support resources.'
      },
      {
        icon: Calendar,
        title: 'Newborn Milestones & Feeds',
        desc: 'Diaper tallies, feeding logs, and pediatrician vaccination schedule alignment.'
      }
    ],
    includedSummary: 'Also includes Partner Sync, Government Maternity Schemes & Maternal Care Pack'
  },
  MaternalCare: {
    tier: 'standard',
    badge: 'Bloom Standard • Clinical Pack',
    title: 'Essential Clinical Checklists',
    subtitle: 'Trimester-by-trimester medical milestones, lab tests, and doctor discussion guides.',
    icon: Stethoscope,
    perks: [
      {
        icon: Stethoscope,
        title: 'Ultrasound & Scan Preparation',
        desc: 'NT, Anomaly/TIFFA, Doppler, and Growth ultrasound guidelines and questions for your doctor.'
      },
      {
        icon: ShieldCheck,
        title: 'Critical Clinical Red Flags',
        desc: 'Early warning checklists for BP elevation, gestational diabetes, and unusual swelling.'
      },
      {
        icon: Calendar,
        title: 'Doctor Visit Notes & Milestones',
        desc: 'Keep every obstetrician consultation organized and actionable in one calm place.'
      }
    ],
    includedSummary: 'Also includes Partner Sync, Government Maternity Benefits & Postpartum Care'
  },
  EhrExports: {
    tier: 'premium',
    badge: 'Bloom PRO • Health Vault',
    title: 'Doctor-Ready Medical Records',
    subtitle: 'Generate comprehensive FHIR R4 clinical exports and hospital admission health summaries.',
    icon: FileText,
    perks: [
      {
        icon: FileText,
        title: 'One-Tap Clinical PDF Export',
        desc: 'Formatted obstetric summaries ready to print or WhatsApp to your gynecologist.'
      },
      {
        icon: ShieldCheck,
        title: 'Hospital Admission Readiness',
        desc: 'Instant emergency card with blood group, allergies, vitals trends, and emergency contacts.'
      },
      {
        icon: Sparkles,
        title: 'ABDM & FHIR Compliant Records',
        desc: 'Structured digital health records matching national Ayushman Bharat health standards.'
      }
    ],
    includedSummary: 'Includes 24/7 Ask OPIN AI, Food Safety Scanner & Real-Time Partner Sync'
  }
};

const checkAccess = (tier: 'free' | 'standard' | 'premium' | undefined, feature: string, isAdmin: boolean = false) => {
  if (isAdmin) return true;
  if (tier === 'premium' || tier === 'standard') return true;

  // In the 2-Tier model (Free vs Bloom PRO):
  // MaternalCare, GovernmentSchemes, and Postpartum are 100% FREE for all mothers!
  // Only Bloom PRO features require a premium subscription:
  const proFeatures = ['AskOurPregnancy', 'FoodScanner', 'EhrExports', 'PartnerSync'];
  if (!proFeatures.includes(feature)) {
    return true; // 100% Free
  }
  return false;
};

export const Paywall: React.FC<PaywallProps> = ({ children, featureName }) => {
  const { state, updateState } = usePlanner();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<number>(3); // 3 months default for best value

  const planTier = state.planTier || (state.isPremium ? 'premium' : 'free');
  const hasAccess = checkAccess(planTier, featureName, state.isAdmin);

  if (hasAccess) {
    return <>{children}</>;
  }

  const config = FEATURE_CONFIGS[featureName];
  const isPremiumFeature = config.tier === 'premium';
  const HeroIcon = config.icon;

  // 2-Tier Pricing: Original regular price ₹999/month, 50% OFF promotional offer for initial 3 months (₹499/mo)
  const originalMonthlyPrice = 999;
  const promoMonthlyPrice = 499;

  let originalTotalPrice = originalMonthlyPrice * selectedMonths;
  let finalTotalPrice = promoMonthlyPrice * selectedMonths;
  if (selectedMonths === 9) {
    // 9 Months (Full Journey) special: ₹3,999 (~₹444/mo)
    finalTotalPrice = 3999;
  }
  const discountAmount = originalTotalPrice - finalTotalPrice;
  const perMonthPrice = Math.round(finalTotalPrice / selectedMonths);

  const durationOptions = [
    {
      months: 1,
      title: '1 Month',
      subtitle: `₹${promoMonthlyPrice}/mo`,
      badge: '50% OFF',
      tag: null,
      highlight: false
    },
    {
      months: 3,
      title: '3 Months',
      subtitle: `₹${promoMonthlyPrice}/mo`,
      badge: '50% OFF (Launch Offer)',
      tag: 'Most Popular',
      highlight: true
    },
    {
      months: 9,
      title: 'Full Journey',
      subtitle: `₹${Math.round(3999 / 9)}/mo`,
      badge: 'Save ₹4,992 (55% OFF)',
      tag: 'Best Value',
      highlight: false
    }
  ];

  const handleSelectMonths = (m: number) => {
    triggerHaptic('selection');
    setSelectedMonths(m);
  };

  const handlePayment = () => {
    triggerHaptic('medium');
    setIsProcessing(true);
    navigate(`/checkout?plan=${config.tier}&months=${selectedMonths}`);
  };

  const handleActivateVip = () => {
    triggerHaptic('success');
    updateState({ 
      isPremium: true, 
      planTier: isPremiumFeature ? 'premium' : 'standard' 
    });
  };

  return (
    <div className="animate-in fade-in duration-300 pb-10 space-y-5 max-w-xl mx-auto">
      {/* Top Hero Card */}
      <div className="bg-white border border-border/80 rounded-2xl shadow-2xs overflow-hidden">
        {/* Soft Header Banner */}
        <div className={`p-5 sm:p-6 border-b border-border/60 ${
          isPremiumFeature 
            ? 'bg-gradient-to-br from-amber-50/80 via-cream/40 to-white' 
            : 'bg-gradient-to-br from-tulsi-light/50 via-cream/30 to-white'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-semibold tracking-wide uppercase border ${
              isPremiumFeature
                ? 'bg-amber-100/70 text-amber-900 border-amber-300/40'
                : 'bg-tulsi-light text-sage-dark border-sage/20'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.badge}</span>
            </span>

            <span className="text-[11px] font-medium text-muted bg-white/80 px-2.5 py-0.5 rounded-full border border-border/60">
              One-Time Pass
            </span>
          </div>

          <div className="flex items-start gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
              isPremiumFeature
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-tulsi-light text-sage-dark border-sage/25'
            }`}>
              <HeroIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-[22px] sm:text-[24px] font-medium text-charcoal leading-snug">
                {config.title}
              </h2>
              <p className="text-[13px] text-medium mt-1 leading-relaxed">
                {config.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Feature Perks List */}
        <div className="p-5 sm:p-6 space-y-3 bg-white">
          <span className="text-[11px] uppercase tracking-wider font-bold text-medium block">
            What's included in this pack
          </span>

          <div className="space-y-2.5">
            {config.perks.map((perk, idx) => {
              const PerkIcon = perk.icon;
              return (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-cream/35 border border-border/70"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isPremiumFeature
                      ? 'bg-amber-100/70 text-amber-800'
                      : 'bg-tulsi-light text-sage-dark'
                  }`}>
                    <PerkIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-[13px] font-semibold text-charcoal leading-snug">
                      {perk.title}
                    </h4>
                    <p className="text-[12px] text-medium leading-relaxed">
                      {perk.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11.5px] text-medium/80 italic pt-1 text-center sm:text-left">
            ✨ {config.includedSummary}
          </p>
        </div>
      </div>

      {/* Pricing & Duration Selection Card */}
      <div className="bg-white border border-border/80 rounded-2xl shadow-2xs p-5 sm:p-6 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-serif text-[18px] text-charcoal font-medium">Choose Duration</h3>
            <span className="text-[11.5px] text-muted">No auto-renewals</span>
          </div>
          <p className="text-[12px] text-medium">Select the timeframe that matches your gestational trimester.</p>
        </div>

        {/* 3 Duration Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {durationOptions.map((opt) => {
            const isSelected = selectedMonths === opt.months;
            return (
              <button
                key={opt.months}
                type="button"
                onClick={() => handleSelectMonths(opt.months)}
                className={`relative flex flex-col items-center text-center p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? isPremiumFeature
                      ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/20 shadow-2xs'
                      : 'bg-tulsi-light/60 border-sage ring-2 ring-sage/20 shadow-2xs'
                    : 'bg-cream/30 border-border/80 hover:bg-cream/60'
                }`}
              >
                {opt.tag && (
                  <span className={`absolute -top-2.5 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider text-white shadow-2xs whitespace-nowrap ${
                    isPremiumFeature ? 'bg-amber-600' : 'bg-sage'
                  }`}>
                    {opt.tag}
                  </span>
                )}

                <span className={`text-[13px] font-semibold block leading-tight ${
                  isSelected ? 'text-charcoal' : 'text-charcoal/80'
                }`}>
                  {opt.title}
                </span>

                <span className={`text-[11.5px] font-medium mt-1 block ${
                  isSelected ? 'text-sage-dark' : 'text-medium'
                }`}>
                  {opt.subtitle}
                </span>

                {opt.badge && (
                  <span className={`text-[10px] mt-1.5 font-semibold px-1.5 py-0.2 rounded ${
                    isSelected 
                      ? 'bg-white text-sage-dark border border-sage/20' 
                      : 'bg-border/60 text-medium'
                  }`}>
                    {opt.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Total Price Display */}
        <div className="bg-cream/40 rounded-xl p-4 border border-border/70 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                🎉 50% OFF Initial Offer
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-[28px] font-bold text-charcoal">
                ₹{finalTotalPrice}
              </span>
              <span className="text-[14px] line-through text-muted font-normal">
                ₹{originalTotalPrice}
              </span>
            </div>
            <span className="text-[12px] text-medium block">
              {selectedMonths} {selectedMonths === 1 ? 'Month' : 'Months'} full access ({`₹${perMonthPrice}/mo`}) • Regular ₹999/mo
            </span>
          </div>

          <span className="text-[11.5px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Save ₹{discountAmount}
          </span>
        </div>

        {/* Primary Upgrade CTA Button */}
        <button
          type="button"
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-3.5 rounded-2xl font-semibold text-[15px] shadow-sm hover:shadow active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
            isPremiumFeature
              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
              : 'bg-sage hover:bg-sage-dark text-white shadow-sage/20'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LockOpen className="w-4.5 h-4.5" />
          )}
          <span>Unlock {isPremiumFeature ? 'Bloom Premium' : 'Bloom Standard Care'}</span>
        </button>

        {/* Demo / Tester VIP Pass Card */}
        <div className="p-3.5 bg-gradient-to-br from-tulsi-light/40 via-cream/30 to-white border border-sage/20 rounded-xl text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-sage-dark font-medium text-[12.5px]">
            <Sparkles className="w-3.5 h-3.5 text-sage" />
            <span>Evaluating or Reviewing Project Bloom?</span>
          </div>
          <p className="text-[11.5px] text-medium leading-relaxed">
            Activate the complimentary Beta VIP Pass (OPIN30) for instant preview on this device.
          </p>
          <button
            type="button"
            onClick={handleActivateVip}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-tulsi-light/60 border border-sage/30 text-sage-dark font-semibold text-[12px] rounded-lg shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5 text-sage" />
            <span>Activate Free VIP Pass →</span>
          </button>
        </div>

        <p className="text-[11px] text-light text-center">
          One-time payment • No auto-debit renewals • 100% private, on-device encrypted storage
        </p>
      </div>
    </div>
  );
};
