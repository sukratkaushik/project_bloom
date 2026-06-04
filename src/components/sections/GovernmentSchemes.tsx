import React from 'react';
import { Building, ExternalLink, HeartHandshake } from 'lucide-react';

const SCHEMES = [
  {
    id: 'pmsma',
    name: 'PM Surakshit Matritva Abhiyan (PMSMA)',
    badge: 'FREE SERVICE',
    badgeColor: 'bg-sage text-white',
    benefit: 'Free antenatal check-up every month on the 9th at government health facilities. Includes BP, weight, blood tests, urine test, ultrasound.',
    who: 'All pregnant women',
    how: 'Just visit nearest PHC/CHC/District Hospital on 9th of any month. No registration needed.',
    icon: '🏥'
  },
  {
    id: 'jsy',
    name: 'Janani Suraksha Yojana (JSY)',
    badge: '₹1,400 CASH',
    badgeColor: 'bg-green-100 text-green-800 border-[1.5px] border-green-200',
    benefit: '₹1,400 (rural) or ₹1,000 (urban) cash benefit for institutional delivery at government hospital',
    who: 'BPL (Below Poverty Line), SC/ST women. All women in low-performing states (UP, Bihar, MP, Rajasthan, Jharkhand, Odisha, Uttarakhand, J&K, Chhattisgarh).',
    how: 'Register at nearest PHC or with your ASHA worker during pregnancy.',
    icon: '💰'
  },
  {
    id: 'pmmvy',
    name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    badge: '₹5,000 CASH',
    badgeColor: 'bg-green-100 text-green-800 border-[1.5px] border-green-200',
    benefit: '₹5,000 in 3 instalments for first live birth (₹1,000 on pregnancy registration, ₹2,000 after 6 months ANC, ₹2,000 after delivery + first vaccination)',
    who: 'All pregnant women for first live birth, aged 19+',
    how: 'Register at Anganwadi centre or PHC with Aadhaar, bank account, and MCP card.',
    icon: '🎁'
  },
  {
    id: 'jssk',
    name: 'Janani Shishu Suraksha Karyakram (JSSK)',
    badge: 'FREE DELIVERY',
    badgeColor: 'bg-sage text-white',
    benefit: 'Completely free delivery (including C-section), medicines, diagnostics, blood transfusion, diet, transport at government hospitals. Zero out-of-pocket expense.',
    who: 'All pregnant women delivering at government facilities',
    how: 'Just go to government hospital — entitlement is automatic.',
    icon: '🆓'
  },
  {
    id: 'pmjay',
    name: 'Pradhan Mantri Jan Arogya Yojana (PMJAY / Ayushman Bharat)',
    badge: 'UP TO ₹5 LAKH',
    badgeColor: 'bg-blue-100 text-blue-800 border-[1.5px] border-blue-200',
    benefit: 'Health insurance cover up to ₹5 lakh per family per year for hospitalisation including maternity care, C-section, NICU care.',
    who: 'Families in SECC database (Socio-Economic Caste Census). Check eligibility at pmjay.gov.in.',
    how: 'Visit nearest Ayushman Mitra or Empanelled hospital with Aadhaar.',
    icon: '🛡️'
  },
  {
    id: 'icds',
    name: 'Integrated Child Development Services (ICDS)',
    badge: 'FREE NUTRITION',
    badgeColor: 'bg-orange-100 text-orange-800 border-[1.5px] border-orange-200',
    benefit: 'Free supplementary nutrition, health check-ups, immunisation, and nutrition counselling for pregnant and lactating women.',
    who: 'All pregnant and lactating women',
    how: 'Register at nearest Anganwadi centre in your area.',
    icon: '🥗'
  }
];

const LINKS = [
  { label: 'Check JSY eligibility', url: 'https://nhm.gov.in', domain: 'nhm.gov.in' },
  { label: 'PMMVY registration', url: 'https://pmmvy.wcd.gov.in', domain: 'pmmvy.wcd.gov.in' },
  { label: 'PMJAY eligibility', url: 'https://pmjay.gov.in', domain: 'pmjay.gov.in' },
  { label: 'Find Anganwadi', url: 'https://wcd.nic.in', domain: 'wcd.nic.in' },
];

import { Paywall } from '../Paywall';

export const GovernmentSchemes: React.FC = () => {
  return (
    <Paywall featureName="GovernmentSchemes">
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <Building className="w-8 h-8 text-sage" />
          <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal text-charcoal">Government Schemes</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SCHEMES.map(scheme => (
            <div key={scheme.id} className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm overflow-hidden flex flex-col group hover:border-sage transition-colors">
              <div className="p-5 border-b border-border bg-gray-50/50 flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="text-[24px]">{scheme.icon}</div>
                  <div>
                    <h3 className="font-bold text-charcoal text-[15px] leading-tight mb-1">{scheme.name}</h3>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block ${scheme.badgeColor}`}>
                      {scheme.badge}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1">
                <div>
                  <dt className="text-[11px] font-bold text-light uppercase tracking-wider mb-1">Benefit</dt>
                  <dd className="text-[14px] text-charcoal">{scheme.benefit}</dd>
                </div>

                <div className="bg-sage-pale/20 p-3 rounded-lg border border-sage-pale">
                  <dt className="text-[11px] font-bold text-sage uppercase tracking-wider mb-0.5">Who Qualifies?</dt>
                  <dd className="text-[13px] text-charcoal/90">{scheme.who}</dd>
                </div>

                <div>
                  <dt className="text-[11px] font-bold text-light uppercase tracking-wider mb-1">How to Apply</dt>
                  <dd className="text-[13px] text-medium">{scheme.how}</dd>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-sage border border-sage-dark rounded-[16px] p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4 text-white text-center sm:text-left mt-8">
          <div className="bg-white/20 p-3 rounded-full shrink-0">
            <HeartHandshake className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="font-serif text-[22px] mb-2">Your ASHA Worker is your best resource</h3>
            <p className="text-[15px] opacity-90 leading-relaxed max-w-3xl">
              Every village and urban ward has an ASHA (Accredited Social Health Activist) who can help you access all these schemes, accompany you to hospital for delivery, and answer your questions. Ask at your nearest PHC to find your ASHA worker.
            </p>
          </div>
        </div>

        <div className="bg-white border-[1.5px] border-border rounded-[16px] shadow-sm p-6 mt-6">
          <h3 className="font-semibold text-charcoal text-[15px] mb-4">Important Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {LINKS.map(link => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col p-3 border border-border rounded-lg hover:bg-gray-50 hover:border-sage transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-[14px] text-charcoal">{link.label}</span>
                  <ExternalLink className="w-4 h-4 text-medium group-hover:text-sage" />
                </div>
                <span className="text-[12px] text-medium">{link.domain}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </Paywall>
  );
};
