import React, { useState, useEffect, useMemo } from 'react';
import { usePlanner } from '../../store';
import { triggerHaptic } from '../../utils/nativeBridge';
import { 
  Plane, 
  Car, 
  Train, 
  Compass, 
  MapPin, 
  Square, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Stethoscope, 
  Info, 
  ShieldCheck, 
  Mountain, 
  Palmtree, 
  AlertTriangle, 
  CheckCircle2, 
  HeartPulse, 
  Sparkles, 
  Building2, 
  RefreshCw,
  CheckSquare,
  Share2,
  Users,
  User,
  Phone,
  CloudSun,
  Droplets,
  Sun,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Thermometer,
  Navigation,
  ShieldAlert
} from 'lucide-react';

type GestationalStage = 't1' | 't2' | 't3_early' | 't3_late';
type TravelMethod = 'flying' | 'driving' | 'train' | 'cruise';
type EnvironmentRisk = 'standard' | 'altitude' | 'tropical' | 'remote';

interface ChecklistItem {
  id: string;
  text: string;
  category: 'docs' | 'packing' | 'enroute';
  checked: boolean;
  isCustom?: boolean;
  assignedTo?: 'me' | 'partner';
}

interface DestinationCareData {
  city: string;
  region: string;
  originCity?: string;
  weather: {
    temp: string;
    condition: string;
    humidity: string;
    uv: string;
    maternalAdvice: string;
  };
  medical: {
    emergencyLine: string;
    dispatchProtocol?: string;
    recommendedHospital: string;
    hospitalNotes: string;
    localPhrase: {
      original: string;
      meaning: string;
      language: string;
    };
  };
  isLiveLocation?: boolean;
}

const POPULAR_DESTINATIONS: Record<string, DestinationCareData> = {
  rome: {
    city: 'Rome',
    region: 'Italy',
    weather: {
      temp: '22°C (72°F)',
      condition: 'Sunny & Mild',
      humidity: '54%',
      uv: 'Moderate (UV 5)',
      maternalAdvice: 'Historic cobblestones increase foot & pelvic strain; wear cushioned supportive sneakers. Carry cold water; Roman public fountains (nasoni) offer cold, safe potable water.'
    },
    medical: {
      emergencyLine: '112',
      recommendedHospital: 'Ospedale Fatebenefratelli (Isola Tiberina)',
      hospitalNotes: 'Top-tier Level III maternity triage and neonatal intensive care in central Rome.',
      localPhrase: {
        original: 'Sono incinta e ho bisogno di assistenza ostetrica urgente.',
        meaning: 'I am pregnant and need urgent obstetric emergency care.',
        language: 'Italian'
      }
    }
  },
  paris: {
    city: 'Paris',
    region: 'France',
    weather: {
      temp: '19°C (66°F)',
      condition: 'Pleasant & Mild',
      humidity: '58%',
      uv: 'Low-Moderate (UV 4)',
      maternalAdvice: 'Historic metro stations involve long flights of stairs. In 2nd/3rd trimester, prefer surface buses or taxis. Stay hydrated and schedule afternoon rest.'
    },
    medical: {
      emergencyLine: '112 (or 15 for SAMU)',
      recommendedHospital: 'Hôpital Cochin - Maternité Port-Royal',
      hospitalNotes: 'Leading Parisian Level III perinatal center with 24/7 obstetric emergency service.',
      localPhrase: {
        original: "Je suis enceinte et j'ai besoin d'une assistance obstétrique d'urgence.",
        meaning: 'I am pregnant and need urgent obstetric emergency care.',
        language: 'French'
      }
    }
  },
  hawaii: {
    city: 'Honolulu / Hawaii',
    region: 'USA',
    weather: {
      temp: '28°C (82°F)',
      condition: 'Warm & Tropical',
      humidity: '68%',
      uv: 'Very High (UV 9)',
      maternalAdvice: 'Intense tropical sun accelerates dehydration and melasma. Drink 300ml water/hr, apply broad-spectrum mineral sunscreen, and avoid midday direct sun (11am–2pm).'
    },
    medical: {
      emergencyLine: '911',
      recommendedHospital: 'Kapiʻolani Medical Center for Women & Children',
      hospitalNotes: "Hawaii's premier Level III regional perinatal health center and high-risk maternity triage.",
      localPhrase: {
        original: 'I am pregnant and experiencing pregnancy-related complications.',
        meaning: 'Please direct me to the maternal emergency triage.',
        language: 'English'
      }
    }
  },
  goa: {
    city: 'Goa',
    region: 'India',
    weather: {
      temp: '29°C (84°F)',
      condition: 'Tropical Coastal',
      humidity: '76%',
      uv: 'High (UV 8)',
      maternalAdvice: 'High humidity increases electrolyte loss. Drink sealed bottled water only; avoid street ice and unpeeled fruits. Keep oral electrolyte rehydration packets handy.'
    },
    medical: {
      emergencyLine: '108 or 112',
      recommendedHospital: 'Manipal Hospital Dona Paula / Goa Medical College (Bambolim)',
      hospitalNotes: 'Full multi-specialty tertiary care with 24/7 obstetrics and neonatal care.',
      localPhrase: {
        original: 'मैं गर्भवती हूँ और मुझे तुरंत प्रसूति डॉक्टर की सहायता चाहिए।',
        meaning: 'I am pregnant and need immediate obstetric emergency care.',
        language: 'Hindi'
      }
    }
  },
  london: {
    city: 'London',
    region: 'United Kingdom',
    weather: {
      temp: '18°C (64°F)',
      condition: 'Temperate & Cool',
      humidity: '62%',
      uv: 'Moderate (UV 3)',
      maternalAdvice: 'Extensive walking across stations and parks. Wear 15–20 mmHg compression socks and carry an umbrella or lightweight layers.'
    },
    medical: {
      emergencyLine: '999 or 112',
      recommendedHospital: "St Thomas' Hospital (Westminster Bridge)",
      hospitalNotes: 'World-renowned tertiary maternity unit right across Westminster with full perinatal support.',
      localPhrase: {
        original: 'I am pregnant and experiencing acute obstetric symptoms.',
        meaning: 'Requesting maternal triage assessment.',
        language: 'English'
      }
    }
  },
  bali: {
    city: 'Bali',
    region: 'Indonesia',
    weather: {
      temp: '30°C (86°F)',
      condition: 'Tropical Warm',
      humidity: '80%',
      uv: 'Extreme (UV 10)',
      maternalAdvice: 'Protect against mosquito-borne illness with EPA-safe DEET or Picaridin. Strict bottled water only for drinking and teeth brushing to avoid gastrointestinal infection.'
    },
    medical: {
      emergencyLine: '112 or 118',
      recommendedHospital: 'BIMC Hospital Nusa Dua / RSUP Prof. Ngoerah (Sanglah)',
      hospitalNotes: 'International standard emergency medical facility with English-speaking specialists.',
      localPhrase: {
        original: 'Saya sedang hamil dan membutuhkan perawatan medis darurat.',
        meaning: 'I am pregnant and require urgent medical care.',
        language: 'Indonesian'
      }
    }
  },
  alps: {
    city: 'Alps / Zurich',
    region: 'Switzerland',
    weather: {
      temp: '16°C (61°F)',
      condition: 'Alpine Breezy',
      humidity: '50%',
      uv: 'High (UV 6)',
      maternalAdvice: 'High elevation (>2,000m) causes physiological hyperventilation and higher water loss. Take gentle rest days, avoid rapid cable car climbs above 2,500m, and hydrate well.'
    },
    medical: {
      emergencyLine: '112 or 144',
      recommendedHospital: 'University Hospital Zurich (USZ) Frauenklinik',
      hospitalNotes: 'Leading Swiss university maternal medical clinic with Level III perinatal center.',
      localPhrase: {
        original: 'Ich bin schwanger und benötige sofortige geburtshilfliche Hilfe.',
        meaning: 'I am pregnant and need immediate obstetric emergency help.',
        language: 'German'
      }
    }
  },
  tokyo: {
    city: 'Tokyo',
    region: 'Japan',
    weather: {
      temp: '21°C (70°F)',
      condition: 'Clear & Mild',
      humidity: '56%',
      uv: 'Moderate (UV 4)',
      maternalAdvice: 'Collect a "Maternity Mark" keychain at railway station information counters to access reserved priority seating easily on trains.'
    },
    medical: {
      emergencyLine: '119 or 112',
      recommendedHospital: 'Aiiku Hospital / Sanno Hospital (Minato-ku)',
      hospitalNotes: 'Prestigious maternity hospitals with English-fluent obstetricians and 24/7 triage.',
      localPhrase: {
        original: '妊娠中で、緊急の産科受診が必要です。',
        meaning: 'I am pregnant and need urgent obstetric consultation.',
        language: 'Japanese'
      }
    }
  },
  barcelona: {
    city: 'Barcelona',
    region: 'Spain',
    weather: {
      temp: '23°C (73°F)',
      condition: 'Sunny Mediterranean',
      humidity: '55%',
      uv: 'High (UV 6)',
      maternalAdvice: 'Warm Mediterranean sun. Embrace afternoon siesta hours for maternal rest and avoid peak midday heat.'
    },
    medical: {
      emergencyLine: '112',
      recommendedHospital: 'Hospital Sant Joan de Déu / Hospital Clínic de Barcelona',
      hospitalNotes: 'Premier maternal-infant university hospital with comprehensive Level III NICU.',
      localPhrase: {
        original: 'Estoy embarazada y necesito atención médica obstétrica urgente.',
        meaning: 'I am pregnant and need urgent obstetric emergency medical attention.',
        language: 'Spanish'
      }
    }
  },
  newyork: {
    city: 'New York City',
    region: 'USA',
    weather: {
      temp: '20°C (68°F)',
      condition: 'Breezy Metropolitan',
      humidity: '50%',
      uv: 'Moderate (UV 5)',
      maternalAdvice: 'Heavy walking environment. Wear comfortable sneakers, carry electrolyte fluids, and utilize subway elevators when available.'
    },
    medical: {
      emergencyLine: '911',
      recommendedHospital: 'NewYork-Presbyterian / Weill Cornell Medical Center',
      hospitalNotes: 'Level IV Regional Perinatal Center with world-class maternal-fetal medicine triage.',
      localPhrase: {
        original: 'I am pregnant and experiencing pregnancy-related emergency symptoms.',
        meaning: 'Emergency medical triage required.',
        language: 'English'
      }
    }
  }
};

export const SafeTravel: React.FC = () => {
  const { state } = usePlanner();
  const [activeTab, setActiveTab] = useState<'calculator' | 'checklist'>('calculator');
  const [gestationalStage, setGestationalStage] = useState<GestationalStage>('t2');
  const [travelMethod, setTravelMethod] = useState<TravelMethod>('flying');
  const [destinationInfo, setDestinationInfo] = useState('');
  const [environmentRisk, setEnvironmentRisk] = useState<EnvironmentRisk>('standard');
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedPhrase, setCopiedPhrase] = useState(false);

  interface LiveDeviceWeather {
    city: string;
    region: string;
    country: string;
    countryCode: string;
    temp: string;
    condition: string;
    humidity: string;
    uv: string;
    emergencyLine: string;
    hospital: string;
    advice: string;
    isLive: boolean;
  }

  const [deviceWeather, setDeviceWeather] = useState<LiveDeviceWeather | null>(() => {
    try {
      const cached = sessionStorage.getItem('bloom_device_weather_v1');
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return null;
  });
  const [isLocating, setIsLocating] = useState(false);

  // Automatically fetch mother's current local device city & real-time weather via GPS / IP
  const fetchLiveLocation = async (forceRefresh = false) => {
    if (deviceWeather && !forceRefresh) return;

    setIsLocating(true);
    try {
      let lat: number | null = null;
      let lon: number | null = null;
      let detectedCity = '';
      let detectedRegion = '';
      let detectedCountry = '';
      let detectedCountryCode = '';

      // Step 1: IP Geolocation (Instant, high accuracy for city/region, non-blocking, zero permission prompts)
      try {
        const ipRes = await fetch('https://ipwho.is/');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData && ipData.success) {
            detectedCity = ipData.city || '';
            detectedRegion = ipData.region || '';
            detectedCountry = ipData.country || '';
            detectedCountryCode = ipData.country_code || '';
            lat = ipData.latitude;
            lon = ipData.longitude;
          }
        }
      } catch (err) {
        console.warn('IP geolocation query unavailable:', err);
      }

      // Step 2: Fetch real-time weather from Open-Meteo
      if (lat !== null && lon !== null) {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,uv_index`
        );
        if (weatherRes.ok) {
          const wData = await weatherRes.json();
          const current = wData.current;
          if (current) {
            const tempC = Math.round(current.temperature_2m);
            const tempF = Math.round((tempC * 9) / 5 + 32);
            const code = current.weather_code ?? 0;
            const uvVal = current.uv_index ?? 0;
            const humidityVal = Math.round(current.relative_humidity_2m ?? 50);

            // Decode WMO weather code
            let condition = 'Mild & Clear';
            if (code === 0) condition = 'Clear Sky';
            else if (code <= 3) condition = 'Partly Cloudy';
            else if (code === 45 || code === 48) condition = 'Foggy & Misty';
            else if (code >= 51 && code <= 55) condition = 'Light Drizzle';
            else if (code >= 61 && code <= 65) condition = 'Rain Showers';
            else if (code >= 71 && code <= 77) condition = 'Snow Conditions';
            else if (code >= 80 && code <= 82) condition = 'Passing Showers';
            else if (code >= 95) condition = 'Thunderstorms';

            // UV index assessment
            let uvRating = `Moderate (UV ${Math.round(uvVal)})`;
            if (uvVal < 3) uvRating = `Low (UV ${Math.round(uvVal)})`;
            else if (uvVal >= 6 && uvVal < 8) uvRating = `High (UV ${Math.round(uvVal)})`;
            else if (uvVal >= 8) uvRating = `Very High (UV ${Math.round(uvVal)})`;

            // Clinically backed maternal climate advice based on live ambient environment
            let advice = 'Temperate outdoor weather. Maintain standard hydration (250ml/hour), wear comfortable flat shoes, and schedule routine rest.';
            if (tempC >= 28) {
              advice = 'High ambient heat accelerates maternal fluid loss. Drink sealed water, avoid direct midday sun (11 AM – 3 PM), and rest in air-conditioned spaces.';
            } else if (tempC <= 10) {
              advice = 'Cool weather conditions. Dress in breathable layers to preserve core warmth, wear non-slip footwear, and sip warm fluids.';
            } else if (code >= 51 && code <= 82) {
              advice = 'Wet terrain alert. Take slow, deliberate steps on wet surfaces to protect center-of-gravity balance and prevent slip injuries.';
            }

            // Local country emergency lines & medical facility
            const isInd = detectedCountryCode === 'IN' || /india/i.test(detectedCountry);
            const isUS = detectedCountryCode === 'US' || /united states|usa/i.test(detectedCountry);
            const isUK = detectedCountryCode === 'GB' || /united kingdom|uk|britain/i.test(detectedCountry);
            const emergencyLine = isInd ? '108 or 112' : isUS ? '911' : isUK ? '999 or 112' : '112';

            const finalCity = detectedCity || 'Your Location';
            const finalRegion = detectedRegion || detectedCountry || 'Live GPS';

            const payload: LiveDeviceWeather = {
              city: finalCity,
              region: finalRegion,
              country: detectedCountry || 'Live Location',
              countryCode: detectedCountryCode,
              temp: `${tempC}°C (${tempF}°F)`,
              condition,
              humidity: `${humidityVal}%`,
              uv: uvRating,
              emergencyLine,
              hospital: `Level III Maternity Clinic & Hospital • ${finalCity}`,
              advice,
              isLive: true,
            };

            setDeviceWeather(payload);
            try {
              sessionStorage.setItem('bloom_device_weather_v1', JSON.stringify(payload));
            } catch {
              // ignore
            }
            if (forceRefresh) {
              showToast(`Updated weather for ${finalCity}`);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Live location weather resolution error:', err);
    } finally {
      setIsLocating(false);
    }
  };

  // Automatically trigger live device location fetching on mount if destination is blank
  useEffect(() => {
    fetchLiveLocation(false);
  }, []);

  const partnerName = state.partner?.name || 'Partner';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculate current gestational week and default stage from store if available
  useEffect(() => {
    if (state.lmp) {
      const lmpDate = new Date(state.lmp);
      const today = new Date();
      const diffTime = Math.max(0, today.getTime() - lmpDate.getTime());
      const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
      setCurrentWeek(diffWeeks);

      if (diffWeeks >= 35) {
        setGestationalStage('t3_late');
      } else if (diffWeeks >= 28) {
        setGestationalStage('t3_early');
      } else if (diffWeeks >= 13) {
        setGestationalStage('t2');
      } else {
        setGestationalStage('t1');
      }
    }
  }, [state.lmp]);

  // Dynamic Base Checklist Generator
  const initialChecklist = useMemo<ChecklistItem[]>(() => {
    const list: ChecklistItem[] = [
      // Medical & Documents
      { id: 'doc_clearance', text: "OB/Midwife travel clearance letter with Estimated Due Date (EDD)", category: 'docs', checked: false, assignedTo: 'me' },
      { id: 'doc_records', text: "Printed physical copy of prenatal records, blood group, & recent scans", category: 'docs', checked: false, assignedTo: 'me' },
      { id: 'doc_insurance', text: "Travel insurance verified for pregnancy complications & emergency delivery", category: 'docs', checked: false, assignedTo: 'partner' },
      { id: 'doc_local_hospital', text: "Saved nearest Level III maternity hospital / NICU at destination", category: 'docs', checked: false, assignedTo: 'partner' },
      { id: 'doc_doctor_contact', text: "Stored primary OB/midwife phone & 24/7 maternity triage emergency line", category: 'docs', checked: false, assignedTo: 'partner' },

      // Essential Packing
      { id: 'pack_meds', text: "Daily prenatal vitamins & prescribed medications in carry-on bag", category: 'packing', checked: false, assignedTo: 'me' },
      { id: 'pack_compression', text: "Medical graduated compression socks (15–20 mmHg) to prevent swelling & DVT", category: 'packing', checked: false, assignedTo: 'me' },
      { id: 'pack_snacks', text: "Nutrient-dense snacks (almonds, crackers, dried fruit) for blood sugar stability", category: 'packing', checked: false, assignedTo: 'partner' },
      { id: 'pack_water', text: "Reusable large water bottle (aim for 250–300ml water per travel hour)", category: 'packing', checked: false, assignedTo: 'partner' },
      { id: 'pack_pillow', text: "Travel lumbar support cushion or neck pillow for spinal comfort", category: 'packing', checked: false, assignedTo: 'partner' },
      { id: 'pack_shoes', text: "Slip-on cushioned walking shoes (accommodating foot swelling)", category: 'packing', checked: false, assignedTo: 'me' },

      // En Route Guidelines
      { id: 'enroute_walk', text: "Stand, stretch calves, and walk 5–10 minutes every 60–90 minutes", category: 'enroute', checked: false, assignedTo: 'me' },
      { id: 'enroute_seatbelt', text: "Position seatbelt low across hips under your belly, shoulder strap between breasts", category: 'enroute', checked: false, assignedTo: 'me' },
      { id: 'enroute_pump', text: "Perform seated ankle rotations and calf flexes every 30 minutes", category: 'enroute', checked: false, assignedTo: 'me' },
    ];

    // Trimester-specific additions
    if (gestationalStage === 't1') {
      list.push(
        { id: 't1_nausea', text: "Anti-nausea supplies: ginger lozenges, vitamin B6, or acupressure wristbands", category: 'packing', checked: false, assignedTo: 'me' },
        { id: 't1_rest', text: "Schedule 1–2 rest hours daily to combat early pregnancy fatigue", category: 'enroute', checked: false, assignedTo: 'partner' }
      );
    } else if (gestationalStage === 't3_early' || gestationalStage === 't3_late') {
      list.push(
        { id: 't3_airline_form', text: "Airlines official MEDIF / Fit-to-Fly certificate signed within 10 days of travel", category: 'docs', checked: false, assignedTo: 'me' },
        { id: 't3_birth_plan', text: "Emergency birth plan summary & local maternity triage direct line printed", category: 'docs', checked: false, assignedTo: 'partner' },
        { id: 't3_maternity_belt', text: "Maternity belly support band for extended walking / transit standing", category: 'packing', checked: false, assignedTo: 'me' }
      );
    }

    // Method-specific additions
    if (travelMethod === 'flying') {
      list.push(
        { id: 'fly_aisle', text: "Reserve an aisle seat in advance for quick bathroom access and stretching", category: 'enroute', checked: false, assignedTo: 'partner' },
        { id: 'fly_cabin_mist', text: "Hydrating facial mist & saline nasal spray (cabin humidity is under 15%)", category: 'packing', checked: false, assignedTo: 'me' },
        { id: 'fly_policy', text: "Check specific airline gestational cutoffs (usually 36w single, 32w multiples)", category: 'docs', checked: false, assignedTo: 'partner' }
      );
    } else if (travelMethod === 'driving') {
      list.push(
        { id: 'drive_pitstops', text: "Pre-plan rest stop stops every 90 minutes along your travel route", category: 'enroute', checked: false, assignedTo: 'partner' },
        { id: 'drive_airbag', text: "Adjust passenger seat back at least 10 inches from the airbag", category: 'enroute', checked: false, assignedTo: 'partner' }
      );
    } else if (travelMethod === 'cruise') {
      list.push(
        { id: 'cruise_cutoff', text: "Confirm gestational age is under 24 weeks on embarkation date (strict cutoff)", category: 'docs', checked: false, assignedTo: 'partner' },
        { id: 'cruise_meds', text: "Pack pregnancy-safe seasickness remedies approved by your obstetrician", category: 'packing', checked: false, assignedTo: 'me' }
      );
    }

    // Environment-specific additions
    if (environmentRisk === 'tropical') {
      list.push(
        { id: 'env_repellent', text: "Pregnancy-safe insect repellent (DEET 20–30% or Picaridin) for Zika/Dengue protection", category: 'packing', checked: false, assignedTo: 'partner' },
        { id: 'env_water', text: "Use certified sealed bottled water; avoid ice or raw unpeeled produce", category: 'enroute', checked: false, assignedTo: 'partner' }
      );
    } else if (environmentRisk === 'altitude') {
      list.push(
        { id: 'env_altitude', text: "Plan 24-48 hours gradual acclimatization; avoid strenuous activity above 8,000 ft", category: 'enroute', checked: false, assignedTo: 'me' },
        { id: 'env_electrolytes', text: "Pregnancy-safe oral electrolyte rehydration packets", category: 'packing', checked: false, assignedTo: 'partner' }
      );
    } else if (environmentRisk === 'remote') {
      list.push(
        { id: 'env_evac', text: "Confirm emergency air evacuation coverage in medical travel insurance", category: 'docs', checked: false, assignedTo: 'partner' }
      );
    }

    return list;
  }, [gestationalStage, travelMethod, environmentRisk]);

  // Persistent checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('bloom_travel_checklist_v3') || localStorage.getItem('bloom_travel_checklist_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialChecklist;
      }
    }
    return initialChecklist;
  });

  const [newTodoText, setNewTodoText] = useState('');

  // Sync template changes while preserving checked state, assignment, and custom items
  useEffect(() => {
    setChecklist(prev => {
      const customItems = prev.filter(item => item.isCustom);
      const existingStatusMap = new Map(prev.map(i => [i.id, i.checked]));
      const existingAssignMap = new Map(prev.map(i => [i.id, i.assignedTo]));
      
      const mergedTemplate = initialChecklist.map(item => ({
        ...item,
        checked: existingStatusMap.get(item.id) ?? item.checked,
        assignedTo: existingAssignMap.get(item.id) ?? item.assignedTo ?? 'me',
      }));

      return [...mergedTemplate, ...customItems];
    });
  }, [initialChecklist]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('bloom_travel_checklist_v3', JSON.stringify(checklist));
  }, [checklist]);

  // Add Item to Checklist
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    triggerHaptic('light');
    const newItem: ChecklistItem = {
      id: 'custom_' + Date.now(),
      text: newTodoText.trim(),
      category: 'packing',
      checked: false,
      isCustom: true,
      assignedTo: 'me',
    };
    setChecklist(prev => [...prev, newItem]);
    setNewTodoText('');
    showToast('Task added to checklist');
  };

  // Toggle checklist check state
  const toggleCheck = (id: string) => {
    triggerHaptic('light');
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // Toggle partner assignment for any task
  const togglePartnerAssign = (id: string) => {
    triggerHaptic('medium');
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const next = item.assignedTo === 'partner' ? 'me' : 'partner';
        return { ...item, assignedTo: next };
      }
      return item;
    }));
  };

  // Delete checklist item (works for both standard and custom tasks)
  const handleDelete = (id: string) => {
    triggerHaptic('warning');
    setChecklist(prev => prev.filter(item => item.id !== id));
    showToast('Task deleted');
  };

  // Reset checklist to defaults
  const resetChecklist = () => {
    triggerHaptic('warning');
    if (window.confirm("Reset checklist to recommended defaults for your current trip configuration?")) {
      setChecklist(initialChecklist);
      showToast('Checklist reset to defaults');
    }
  };

  // Helper to format city names nicely (e.g. "new york" -> "New York", "delhi" -> "Delhi")
  const formatTitle = (str: string) => {
    return str
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  // Resolver for Destination Weather & Medical Care (Supports typing City OR Selecting Climate / Terrain)
  const destinationCare = useMemo<DestinationCareData>(() => {
    const query = destinationInfo.toLowerCase().trim();

    if (query) {
      for (const [key, data] of Object.entries(POPULAR_DESTINATIONS)) {
        if (query.includes(key) || data.city.toLowerCase().includes(query) || data.region.toLowerCase().includes(query)) {
          return data;
        }
      }

      // Dynamic resolver for any custom city typed
      const isUS = /usa|us|america|california|texas|florida|york|chicago|miami|hawaii/i.test(query);
      const isUK = /uk|britain|england|scotland|wales|edinburgh|london|manchester/i.test(query);
      const isIndia = /india|delhi|mumbai|bangalore|kerala|jaipur|goa|chennai|hyderabad|pune|kolkata|noida|gurgaon/i.test(query);

      const emergencyNum = isUS ? '911' : isIndia ? '108' : isUK ? '999' : '112';
      const dispatchProto = isUS
        ? 'Emergency 911 (24/7 Obstetric Dispatch)'
        : isIndia
        ? 'Maternal Ambulance 108 or National 112'
        : isUK
        ? 'Emergency 999 or European 112'
        : 'Emergency Dispatch 112';

      let envTemp = '23°C (73°F)';
      let envCond = 'Mild & Clear';
      let envHumidity = '55% Hum.';
      let envUv = 'UV 5 (Moderate)';
      let envAdvice = 'Maintain consistent hydration with at least 250–300ml fluids per travel hour. Schedule daily midday rest and wear supportive walking shoes.';

      if (environmentRisk === 'tropical') {
        envTemp = '29°C (84°F)';
        envCond = 'Tropical';
        envHumidity = '78% Hum.';
        envUv = 'UV 8 (High)';
        envAdvice = 'Tropical heat accelerates fluid loss. Drink sealed bottled water only, use pregnancy-safe insect repellent (DEET 20–30%), and stay in shaded or air-conditioned areas between 11 AM - 3 PM.';
      } else if (environmentRisk === 'altitude') {
        envTemp = '16°C (61°F)';
        envCond = 'Alpine Breezy';
        envHumidity = '45% Hum.';
        envUv = 'UV 7 (High)';
        envAdvice = 'Elevated altitude reduces atmospheric oxygen. Plan 24–48 hours of slow acclimation, avoid strenuous hikes, and supplement with pregnancy-safe electrolytes.';
      } else if (environmentRisk === 'remote') {
        envTemp = '25°C (77°F)';
        envCond = 'Island / Coast';
        envHumidity = '70% Hum.';
        envUv = 'UV 8 (High)';
        envAdvice = 'Ensure emergency medical evacuation coverage is included in your travel insurance. Confirm local maternity clinic proximity and keep physical prenatal records with you.';
      }

      const formattedCity = formatTitle(destinationInfo.trim());

      return {
        city: formattedCity,
        region: isIndia ? 'India' : isUS ? 'USA' : isUK ? 'UK' : 'Destination',
        originCity: deviceWeather?.city,
        weather: {
          temp: envTemp,
          condition: envCond,
          humidity: envHumidity,
          uv: envUv,
          maternalAdvice: envAdvice
        },
        medical: {
          emergencyLine: emergencyNum,
          dispatchProtocol: dispatchProto,
          recommendedHospital: `Level III Maternity Clinic & Hospital • ${formattedCity}`,
          hospitalNotes: 'Confirm 24/7 obstetric triage & neonatal intensive care (NICU) readiness before embarking.',
          localPhrase: {
            original: 'I am pregnant and need immediate emergency obstetric care.',
            meaning: 'Emergency obstetric triage request.',
            language: 'English'
          }
        }
      };
    }

    // Fallback when NO city is typed: Display Climate / Terrain Factor Health Brief!
    if (environmentRisk === 'tropical') {
      return {
        city: 'Tropical & Coastal',
        region: 'Warm & Humid Climate Advisory',
        weather: {
          temp: '29°C (84°F)',
          condition: 'Tropical',
          humidity: '78% Hum.',
          uv: 'UV 8 (High)',
          maternalAdvice: 'Tropical heat accelerates dehydration. Drink bottled water only, apply EPA-safe insect repellent (DEET 20–30%), and rest during peak sun.'
        },
        medical: {
          emergencyLine: '112',
          dispatchProtocol: 'Dial 112 (or Regional Emergency Medical Dispatch)',
          recommendedHospital: 'Nearest Regional Hospital with Maternity Triage',
          hospitalNotes: 'Verify proximity to 24/7 obstetric emergency facilities and adequate cooling.',
          localPhrase: {
            original: 'I am pregnant and need immediate emergency obstetric care.',
            meaning: 'Emergency obstetric triage request.',
            language: 'English'
          }
        }
      };
    } else if (environmentRisk === 'altitude') {
      return {
        city: 'High Altitude & Alpine',
        region: 'Alpine Mountain Region (>2,500m)',
        weather: {
          temp: '16°C (61°F)',
          condition: 'Alpine Breezy',
          humidity: '45% Hum.',
          uv: 'UV 7 (High)',
          maternalAdvice: 'Atmospheric oxygen drops at elevation. Plan 24–48h gentle acclimation, avoid strenuous hikes, and hydrate with electrolytes.'
        },
        medical: {
          emergencyLine: '112',
          dispatchProtocol: 'Dial 112 (EU/Global) or 144 (Alpine Mountain Rescue SOS)',
          recommendedHospital: 'Nearest Hospital with Level III Maternal & NICU Care',
          hospitalNotes: 'Check oxygen saturation and know the quickest descent route if dizziness occurs.',
          localPhrase: {
            original: 'I am pregnant and need immediate emergency obstetric care.',
            meaning: 'Emergency obstetric triage request.',
            language: 'English'
          }
        }
      };
    } else if (environmentRisk === 'remote') {
      return {
        city: 'Remote & Island',
        region: 'Coastal & Maritime Area',
        weather: {
          temp: '25°C (77°F)',
          condition: 'Island / Coast',
          humidity: '70% Hum.',
          uv: 'UV 8 (High)',
          maternalAdvice: 'Confirm medical evacuation insurance coverage. Keep digital and physical prenatal records on hand at all times.'
        },
        medical: {
          emergencyLine: '112',
          dispatchProtocol: 'Dial 112 or Marine Coast Guard (VHF Channel 16)',
          recommendedHospital: 'Nearest Surgical Maternity Clinic or Evac Facility',
          hospitalNotes: 'Confirm emergency airlift / fast boat transit capabilities to a tertiary hospital.',
          localPhrase: {
            original: 'I am pregnant and need immediate emergency obstetric care.',
            meaning: 'Emergency obstetric triage request.',
            language: 'English'
          }
        }
      };
    }

    // Default / Standard: Show Mother's Current Device Location & Real-Time Weather via GPS/IP!
    if (deviceWeather && deviceWeather.isLive) {
      const cleanDigits = (deviceWeather.emergencyLine || '112').replace(/[^\d+]/g, '').slice(0, 3) || '112';
      const isInd = deviceWeather.countryCode === 'IN';
      return {
        city: deviceWeather.city,
        region: deviceWeather.region,
        weather: {
          temp: deviceWeather.temp,
          condition: deviceWeather.condition,
          humidity: `${deviceWeather.humidity.replace(/\s*Hum\.?|\s*Humidity/i, '')} Hum.`,
          uv: deviceWeather.uv.startsWith('UV') ? deviceWeather.uv : deviceWeather.uv.includes('(') ? deviceWeather.uv : `UV: ${deviceWeather.uv}`,
          maternalAdvice: deviceWeather.advice,
        },
        medical: {
          emergencyLine: cleanDigits,
          dispatchProtocol: isInd
            ? 'Dial 108 (Maternal Ambulance) or 112'
            : `Dial ${cleanDigits} (24/7 Regional Emergency Triage)`,
          recommendedHospital: deviceWeather.hospital,
          hospitalNotes: '24/7 dedicated obstetric triage & neonatal intensive care (NICU) readiness near your current location.',
          localPhrase: {
            original: 'I am pregnant and need immediate emergency obstetric care.',
            meaning: 'Emergency obstetric triage request.',
            language: 'English',
          },
        },
        isLiveLocation: true,
      };
    }

    // If currently locating
    if (isLocating) {
      return {
        city: 'Locating...',
        region: 'Live GPS/IP',
        weather: {
          temp: 'Connecting...',
          condition: 'Live Forecast',
          humidity: '--%',
          uv: 'Calculating',
          maternalAdvice: 'Detecting your device location to provide real-time obstetric weather, hydration precautions, and local emergency triage contacts.',
        },
        medical: {
          emergencyLine: '112',
          dispatchProtocol: 'Dial 112 for local emergency dispatch',
          recommendedHospital: 'Nearest Level III Perinatal Hospital',
          hospitalNotes: 'Connecting to local obstetric emergency facilities.',
          localPhrase: {
            original: 'I am pregnant and need immediate emergency obstetric care.',
            meaning: 'Emergency obstetric triage request.',
            language: 'English',
          },
        },
        isLiveLocation: true,
      };
    }

    // Baseline fallback if offline/no connection
    return {
      city: 'Metropolitan Area',
      region: 'Urban',
      weather: {
        temp: '22°C (72°F)',
        condition: 'Mild & Sunny',
        humidity: '55% Hum.',
        uv: 'UV 5 (Moderate)',
        maternalAdvice: 'Urban travel involves heavy walking. Stay hydrated (250ml/hour), wear supportive flat shoes, and take midday rest.'
      },
      medical: {
        emergencyLine: '112',
        dispatchProtocol: 'Dial 112 for central emergency dispatch',
        recommendedHospital: 'Level III Tertiary Perinatal Hospital',
        hospitalNotes: 'Metropolitan hospitals have 24/7 dedicated obstetric emergency triage and NICU beds.',
        localPhrase: {
          original: 'I am pregnant and need immediate emergency obstetric care.',
          meaning: 'Emergency obstetric triage request.',
          language: 'English'
        }
      }
    };
  }, [destinationInfo, environmentRisk, deviceWeather, isLocating]);

  // Comprehensive Medical & Safety Assessment
  const getTravelAnalysis = () => {
    let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    let riskLabel = 'Low Risk • Travel Safe';
    let riskColor = 'bg-emerald-50 text-emerald-800 border-emerald-300/40 dark:bg-emerald-950/30 dark:text-emerald-300';

    let stageTitle = '';
    let stageDescription = '';
    let obAdvice = '';
    let carrierRules = '';
    let environmentAdvice = '';

    // Stage specifics
    switch (gestationalStage) {
      case 't1':
        stageTitle = '1st Trimester (Weeks 1–12 • Months 1–3)';
        stageDescription = 'Physiologically, early pregnancy carries highest vulnerability to fatigue, nausea, vomiting, and dizziness due to rapid hormonal surges (hCG and progesterone). While everyday travel does not cause miscarriage, emergency access is vital if spotting or cramping occurs.';
        obAdvice = 'Stay well-hydrated to reduce nausea. Keep meals small and frequent. Carry antiemetics or doctor-approved ginger supplements. Avoid getting exhausted.';
        carrierRules = 'Commercial airlines rarely have restrictions under 28 weeks. Full body airport scanners use non-ionizing millimeter wave technology and are safe for pregnancy.';
        riskLevel = 'low';
        riskLabel = 'Low Risk • Manage Fatigue & Nausea';
        riskColor = 'bg-emerald-50 text-emerald-800 border-emerald-300/40 dark:bg-emerald-950/30 dark:text-emerald-300';
        break;

      case 't2':
        stageTitle = '2nd Trimester (Weeks 13–27 • Months 4–6) — The "Golden Babymoon" Window';
        stageDescription = 'Clinically regarded by OB/GYNs worldwide as the optimal window for travel. Morning sickness has largely subsided, maternal energy is restored, and the risk of preterm labor or miscarriage is at its statistical lowest during your pregnancy.';
        obAdvice = 'Take advantage of this comfortable window! Maintain good posture, wear comfortable flat shoes, stay hydrated, and wear 15–20 mmHg compression socks on journeys exceeding 2 hours.';
        carrierRules = 'Unrestricted on nearly all airlines up to 28 weeks. Most cruise lines allow travel up to week 23 (entering week 24 is restricted).';
        riskLevel = 'low';
        riskLabel = 'Optimal Travel Window • Low Risk';
        riskColor = 'bg-emerald-50 text-emerald-800 border-emerald-300/40 dark:bg-emerald-950/30 dark:text-emerald-300';
        break;

      case 't3_early':
        stageTitle = 'Early 3rd Trimester (Weeks 28–34 • Months 7–8)';
        stageDescription = 'Your baby and uterus are growing rapidly. Blood volume is up 40–50%, significantly elevating the risk of Deep Vein Thrombosis (DVT) during prolonged sitting. Braxton Hicks contractions, pelvic girdle pain, and ankle edema become more prominent.';
        obAdvice = 'Frequent movement is mandatory: walk every 60–90 minutes. Never travel without a printed OB clearance letter and your prenatal records. Keep journeys under 4–5 hours if possible.';
        carrierRules = 'Airlines require a doctor-signed Fit-to-Fly certificate certifying single/multiple gestation and EDD within 10 days of flight. Most cruise lines strictly prohibit passengers 24+ weeks.';
        riskLevel = 'moderate';
        riskLabel = 'Moderate Risk • Strict Precautions Needed';
        riskColor = 'bg-amber-50 text-amber-800 border-amber-300/40 dark:bg-amber-950/30 dark:text-amber-300';
        break;

      case 't3_late':
        stageTitle = 'Late 3rd Trimester (Weeks 35–40+ • Month 9)';
        stageDescription = 'Spontaneous labor can begin at any time. Cervical ripening and lightening occur. Traveling far from your delivering hospital carries significant risk of unexpected delivery away from your primary care team.';
        obAdvice = 'Avoid non-essential long-distance travel. Stay within a 30-to-45-minute radius of your planned birth hospital. Keep your hospital go-bag packed in your car trunk.';
        carrierRules = 'Most commercial airlines strictly prohibit flying past 36 weeks for single pregnancies and past 32 weeks for multiple gestations. Cruise lines strictly ban 24+ weeks.';
        riskLevel = 'critical';
        riskLabel = 'High / Restricted • Stay Near Delivery Facility';
        riskColor = 'bg-rose-50 text-rose-800 border-rose-300/40 dark:bg-rose-950/30 dark:text-rose-300';
        break;
    }

    // Method Adjustments
    if (travelMethod === 'flying') {
      if (gestationalStage === 't3_late') {
        riskLevel = 'critical';
        riskLabel = 'Flying Prohibited by Airlines (36w+)';
        riskColor = 'bg-rose-50 text-rose-800 border-rose-300/40 dark:bg-rose-950/30 dark:text-rose-300';
      }
    } else if (travelMethod === 'cruise') {
      if (gestationalStage === 't3_early' || gestationalStage === 't3_late') {
        riskLevel = 'critical';
        riskLabel = 'Cruise Line Prohibited (24w+ Cutoff)';
        riskColor = 'bg-rose-50 text-rose-800 border-rose-300/40 dark:bg-rose-950/30 dark:text-rose-300';
        carrierRules = 'CRITICAL MARITIME POLICY: Virtually all major cruise lines (Royal Caribbean, Disney, Carnival, Norwegian, MSC) deny boarding to anyone entering their 24th week of pregnancy at any point during the cruise. Cruise ships do not have neonatal intensive care facilities.';
      }
    }

    // Environment Adjustments
    if (environmentRisk === 'tropical') {
      environmentAdvice = 'Tropical & Warm Climates: Check CDC advisories for Zika virus (which causes microcephaly and severe fetal brain defects), Dengue fever, and Malaria. Use EPA-registered pregnancy-safe insect repellent (DEET 20–30% or Picaridin). Drink only sealed bottled water and avoid unpasteurized dairy.';
      if (riskLevel === 'low') {
        riskLevel = 'moderate';
        riskLabel = 'Moderate • Vector & Water Caution';
        riskColor = 'bg-amber-50 text-amber-800 border-amber-300/40 dark:bg-amber-950/30 dark:text-amber-300';
      }
    } else if (environmentRisk === 'altitude') {
      environmentAdvice = 'High Altitude (>8,000 ft / 2,500m): Decreased atmospheric oxygen causes maternal hyperventilation and elevated heart rate. Avoid rapid ascents and intense mountain excursions. Acclimatize for 24-48 hours and hydrate aggressively with pregnancy-safe electrolytes.';
      if (riskLevel === 'low') {
        riskLevel = 'moderate';
        riskLabel = 'Moderate • Altitude & Oxygen Caution';
        riskColor = 'bg-amber-50 text-amber-800 border-amber-300/40 dark:bg-amber-950/30 dark:text-amber-300';
      }
    } else if (environmentRisk === 'remote') {
      environmentAdvice = 'Remote / Island Destinations: Verify that emergency obstetric care and surgical capabilities are available within 30 minutes. Ensure medical evacuation insurance covers pregnancy complications and newborn repatriation.';
      if (riskLevel === 'low') {
        riskLevel = 'moderate';
        riskLabel = 'Moderate • Medical Distance Caution';
        riskColor = 'bg-amber-50 text-amber-800 border-amber-300/40 dark:bg-amber-950/30 dark:text-amber-300';
      }
    }

    return {
      riskLevel,
      riskLabel,
      riskColor,
      stageTitle,
      stageDescription,
      obAdvice,
      carrierRules,
      environmentAdvice
    };
  };

  const analysis = getTravelAnalysis();

  // Progress metrics
  const completedCount = checklist.filter(c => c.checked).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const partnerAssignedCount = checklist.filter(c => c.assignedTo === 'partner').length;
  const partnerCompletedCount = checklist.filter(c => c.assignedTo === 'partner' && c.checked).length;

  // Share Travel Brief with Partner (Weather, Doctors, Emergency Contacts)
  const shareTravelBrief = () => {
    triggerHaptic('medium');
    const destName = destinationCare ? `${destinationCare.city} (${destinationCare.region})` : (destinationInfo || 'Our Babymoon');
    const weatherLine = destinationCare 
      ? `🌤️ Weather: ${destinationCare.weather.temp} • ${destinationCare.weather.condition} (Humidity: ${destinationCare.weather.humidity}, UV: ${destinationCare.weather.uv})\n` +
        `💡 Maternal Climate Advice: ${destinationCare.weather.maternalAdvice}\n\n`
      : '';
    const medicalLine = destinationCare
      ? `🏥 Local Emergency Medical Line: ${destinationCare.medical.emergencyLine}\n` +
        `🩺 Recommended Hospital: ${destinationCare.medical.recommendedHospital}\n` +
        `💬 Emergency Phrase: "${destinationCare.medical.localPhrase.original}" (${destinationCare.medical.localPhrase.meaning})\n\n`
      : '';

    const text = 
      `🌸 OurPregnancy Bloom — Safe Travel Brief for ${partnerName}\n` +
      `📍 Destination: ${destName}\n` +
      `🤰 Stage: ${analysis.stageTitle.split('(')[0].trim()} • Mode: ${travelMethod.toUpperCase()}\n` +
      `🛡️ Assessment: ${analysis.riskLabel}\n\n` +
      weatherLine +
      medicalLine +
      `🎒 Travel Checklist: ${completedCount}/${totalCount} completed (${progressPercent}% ready)\n` +
      `• ${partnerAssignedCount} items assigned to you!\n\n` +
      `Created with love on Bloom 💕`;

    if (navigator.share) {
      navigator.share({
        title: `Safe Travel Brief: ${destName}`,
        text: text,
      }).then(() => showToast('Shared travel brief with partner!'))
        .catch(() => {
          navigator.clipboard.writeText(text);
          showToast('Copied travel brief to clipboard!');
        });
    } else {
      navigator.clipboard.writeText(text);
      showToast('Copied travel brief to clipboard!');
    }
  };

  // Share Checklist with Partner
  const shareChecklist = () => {
    triggerHaptic('medium');
    const meItems = checklist.filter(i => i.assignedTo !== 'partner');
    const partnerItems = checklist.filter(i => i.assignedTo === 'partner');

    const text = 
      `🌸 OurPregnancy Bloom — Travel Checklist for ${partnerName}\n` +
      `📍 Destination: ${destinationInfo || 'Upcoming Trip'}\n` +
      `Overall Readiness: ${completedCount}/${totalCount} (${progressPercent}%)\n\n` +
      `👥 ASSIGNED TO ${partnerName.toUpperCase()} (${partnerCompletedCount}/${partnerAssignedCount} Done):\n` +
      partnerItems.map(i => `${i.checked ? '✅' : '☐'} ${i.text}`).join('\n') +
      `\n\n` +
      `👤 ASSIGNED TO ME (${meItems.filter(i => i.checked).length}/${meItems.length} Done):\n` +
      meItems.map(i => `${i.checked ? '✅' : '☐'} ${i.text}`).join('\n') +
      `\n\nSynced via Bloom Partner Sync 💕`;

    if (navigator.share) {
      navigator.share({
        title: `Travel Checklist for ${partnerName}`,
        text: text,
      }).then(() => showToast(`Shared checklist with ${partnerName}!`))
        .catch(() => {
          navigator.clipboard.writeText(text);
          showToast(`Copied checklist for ${partnerName}!`);
        });
    } else {
      navigator.clipboard.writeText(text);
      showToast(`Copied checklist for ${partnerName}!`);
    }
  };

  const copyPhraseToClipboard = (phrase: string) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(phrase);
    setCopiedPhrase(true);
    showToast('Emergency phrase copied to clipboard');
    setTimeout(() => setCopiedPhrase(false), 2000);
  };

  const openHospitalMapSearch = (city: string) => {
    triggerHaptic('light');
    const query = encodeURIComponent(`maternity hospital OB GYN emergency in ${city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[12px] font-semibold px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 border border-white/10 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-sage" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Context Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sage-pale/90 via-cream/80 to-blush-pale/90 dark:from-sage-pale/25 dark:to-blush-pale/25 rounded-2xl p-4 md:p-5 border border-border/70 dark:border-border/10 shadow-3xs">
        <div className="relative z-10 space-y-2">
          <p className="text-[12.5px] xs:text-[13px] text-charcoal/85 dark:text-white/85 leading-relaxed font-sans font-medium max-w-[620px]">
            Clinically backed safety evaluations for flights, road trips, and babymoons. Tailored to your gestational stage and destination.
          </p>
          
          {currentWeek && (
            <div className="pt-1 flex items-center gap-2 text-[11.5px] font-semibold text-sage-dark dark:text-sage border-t border-border/40 dark:border-border/10">
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              Synced to your profile: Week {currentWeek} of 40
            </div>
          )}
        </div>
      </div>

      {/* Sleek 2-Tab Segmented Switcher */}
      <div className="p-1 bg-cream/70 dark:bg-charcoal/30 rounded-2xl border border-border/70 dark:border-border/20 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('calculator');
          }}
          className={`h-9 rounded-xl font-bold text-[12.5px] transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'calculator' 
              ? 'bg-sage text-white shadow-2xs border border-sage' 
              : 'text-charcoal/70 dark:text-white/70 hover:text-charcoal dark:hover:text-white hover:bg-white/60 dark:hover:bg-charcoal/40'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Risk Calculator</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('checklist');
          }}
          className={`h-9 rounded-xl font-bold text-[12.5px] transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'checklist' 
              ? 'bg-sage text-white shadow-2xs border border-sage' 
              : 'text-charcoal/70 dark:text-white/70 hover:text-charcoal dark:hover:text-white hover:bg-white/60 dark:hover:bg-charcoal/40'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Travel Checklist ({completedCount}/{totalCount})</span>
        </button>
      </div>

      {/* TAB 1: RISK CALCULATOR & CLINICAL ASSESSMENT */}
      {activeTab === 'calculator' && (
        <div className="space-y-4">
          {/* Trip Configuration Card - Sleek, Compact & Modern */}
          <div className="premium-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 dark:border-border/10 pb-2.5">
              <h2 className="font-serif text-[16px] text-charcoal dark:text-white font-semibold flex items-center gap-2">
                <Compass className="w-4 h-4 text-sage" /> Your Trip Details
              </h2>
              <span className="text-[11px] font-bold text-sage dark:text-sage uppercase tracking-[1px]">
                Configurator
              </span>
            </div>

            {/* Sleek Gestational Stage Selector - 4 Compact Pills in 1 Line */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11.5px] font-bold uppercase tracking-[0.5px] text-charcoal/70 dark:text-white/70">
                <span>Select Gestational Stage</span>
                <span className="text-sage text-[11px] font-semibold lowercase">
                  {gestationalStage === 't1' ? 'Weeks 1–12' : gestationalStage === 't2' ? 'Weeks 13–27' : gestationalStage === 't3_early' ? 'Weeks 28–34' : 'Weeks 35–40+'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 p-1 bg-cream/70 dark:bg-charcoal/20 rounded-xl border border-border/60 dark:border-border/20">
                {[
                  { id: 't1', label: '1st Tri', sub: 'Wks 1–12' },
                  { id: 't2', label: '2nd Tri', sub: 'Wks 13–27' },
                  { id: 't3_early', label: '3rd Early', sub: 'Wks 28–34' },
                  { id: 't3_late', label: '3rd Late', sub: 'Wks 35–40+' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setGestationalStage(item.id as GestationalStage);
                    }}
                    className={`py-1.5 px-1 rounded-lg transition-all border-none cursor-pointer flex flex-col items-center justify-center text-center ${
                      gestationalStage === item.id
                        ? 'bg-sage text-white shadow-2xs font-bold'
                        : 'text-charcoal/70 dark:text-white/70 hover:text-charcoal hover:bg-white/60 dark:hover:bg-charcoal/40 font-medium'
                    }`}
                  >
                    <span className="text-[12px] font-bold leading-tight">{item.label}</span>
                    <span className={`text-[10px] ${gestationalStage === item.id ? 'text-white/90' : 'text-charcoal/50 dark:text-white/50'}`}>
                      {item.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sleek Travel Method Selector - 4 Compact Pills in 1 Line */}
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-bold uppercase tracking-[0.5px] text-charcoal/70 dark:text-white/70 block">
                Travel Method
              </label>

              <div className="grid grid-cols-4 gap-1 p-1 bg-cream/70 dark:bg-charcoal/20 rounded-xl border border-border/60 dark:border-border/20">
                {[
                  { id: 'flying', label: 'Flying', icon: Plane },
                  { id: 'driving', label: 'Driving', icon: Car },
                  { id: 'train', label: 'Train', icon: Train },
                  { id: 'cruise', label: 'Cruise', icon: Compass },
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = travelMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setTravelMethod(item.id as TravelMethod);
                      }}
                      className={`py-2 px-1 rounded-lg transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-sage text-white shadow-2xs font-bold'
                          : 'text-charcoal/70 dark:text-white/70 hover:text-charcoal hover:bg-white/60 dark:hover:bg-charcoal/40 font-medium'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[12px] font-bold leading-none">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Destination Input & Quick Suggestions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11.5px] font-bold uppercase tracking-[0.5px] text-charcoal/70 dark:text-white/70">
                  Destination & City
                </label>
                <span className="text-[11px] font-semibold text-sage">
                  Weather & Doctor Advisory
                </span>
              </div>
              
              <div className="relative flex items-center">
                <MapPin className="absolute left-3 w-3.5 h-3.5 text-sage" />
                <input
                  type="text"
                  value={destinationInfo}
                  onChange={(e) => setDestinationInfo(e.target.value)}
                  placeholder="Enter destination city (e.g. Rome, Tokyo)..."
                  className="w-full pl-9 pr-14 py-2.5 text-[13px] rounded-xl border border-border/80 dark:border-border/20 bg-white dark:bg-charcoal/15 text-charcoal dark:text-white placeholder:text-charcoal/40 dark:placeholder:text-white/40 focus:outline-none focus:border-sage font-medium"
                />
                <div className="absolute right-2.5 flex items-center gap-1">
                  {destinationInfo ? (
                    <button
                      type="button"
                      onClick={() => setDestinationInfo('')}
                      className="text-charcoal/40 dark:text-white/40 hover:text-charcoal text-[11px] bg-transparent border-none cursor-pointer px-1 py-0.5"
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fetchLiveLocation(true)}
                      disabled={isLocating}
                      className="text-sage hover:text-sage-dark dark:text-sage text-[11px] bg-transparent border-none cursor-pointer flex items-center gap-1 p-1 rounded-lg hover:bg-sage/10 transition-colors"
                      title="Refresh live device location & weather"
                    >
                      <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Environmental quick selection chips */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-charcoal/60 dark:text-white/60">
                    Climate / Terrain Factor
                  </label>
                  <span className="text-[10.5px] text-charcoal/50 dark:text-white/50">
                    Select terrain type
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'standard', label: 'Metropolitan', icon: Building2 },
                    { id: 'altitude', label: 'High Altitude', icon: Mountain },
                    { id: 'tropical', label: 'Tropical Area', icon: Palmtree },
                    { id: 'remote', label: 'Remote / Island', icon: Compass },
                  ].map(env => {
                    const Icon = env.icon;
                    const isSelected = environmentRisk === env.id;
                    return (
                      <button
                        key={env.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setEnvironmentRisk(prev => prev === env.id ? 'standard' : (env.id as EnvironmentRisk));
                        }}
                        className={`py-2 px-2 rounded-xl text-center transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'border-sage bg-sage/15 dark:bg-sage/20 text-sage-dark dark:text-sage font-bold shadow-2xs'
                            : 'border-border/50 dark:border-border/20 bg-white/70 dark:bg-charcoal/20 text-charcoal/70 dark:text-white/70 hover:border-sage/40 font-medium'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-sage shrink-0" />
                        <span className="text-[11.5px] font-bold leading-none truncate">
                          {env.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* DEDICATED DESTINATION & CLIMATE CARE CARD */}
            {destinationCare && (
              <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-sage/10 via-cream/50 to-sage-pale/20 dark:from-charcoal/40 dark:to-charcoal/20 border border-sage/30 space-y-3.5">
                {/* Header: City / Terrain & Share */}
                <div className="flex items-center justify-between gap-2 border-b border-sage/20 pb-2.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center text-sage shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="font-serif text-[15px] font-bold text-charcoal dark:text-white leading-tight">
                          {destinationCare.city}
                        </h3>
                        {destinationCare.isLiveLocation && (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Location
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] font-medium text-sage-dark dark:text-sage mt-0.5">
                        {destinationCare.isLiveLocation
                          ? `📍 ${destinationCare.region} • Live Weather & Care`
                          : `📍 ${destinationCare.region}`}
                      </p>
                    </div>
                  </div>

                  {/* Share With Partner Button */}
                  <button
                    type="button"
                    onClick={shareTravelBrief}
                    className="px-2.5 py-1.5 rounded-xl bg-sage text-white text-[11px] font-bold hover:bg-sage-dark transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer border-none shrink-0 whitespace-nowrap active:scale-95 mt-0.5"
                    title={`Share travel brief with ${partnerName}`}
                  >
                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Share Brief</span>
                  </button>
                </div>

                {/* Weather & Maternal Climate Health Advisory */}
                <div className="p-3 rounded-xl bg-white/80 dark:bg-charcoal/30 border border-border/50 dark:border-border/20 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-[12px] font-bold text-charcoal dark:text-white">
                    <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 shrink-0">
                      <CloudSun className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Weather Advisory</span>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold shrink-0 whitespace-nowrap">
                      {destinationCare.weather.temp}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[11px] text-charcoal/70 dark:text-white/70">
                    <div className="flex items-center gap-1 bg-cream/60 dark:bg-charcoal/20 p-1.5 rounded-lg min-w-0 justify-center text-center">
                      <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate text-[10px] font-semibold">{destinationCare.weather.condition}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-cream/60 dark:bg-charcoal/20 p-1.5 rounded-lg min-w-0 justify-center text-center">
                      <Droplets className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="truncate text-[10px] font-semibold">{destinationCare.weather.humidity}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-cream/60 dark:bg-charcoal/20 p-1.5 rounded-lg min-w-0 justify-center text-center">
                      <Thermometer className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate text-[10px] font-semibold">{destinationCare.weather.uv}</span>
                    </div>
                  </div>

                  <p className="text-[11.5px] text-charcoal/80 dark:text-white/80 leading-relaxed font-medium">
                    <span className="font-bold text-charcoal dark:text-white">Doctor's Climate Note: </span>
                    {destinationCare.weather.maternalAdvice}
                  </p>
                </div>

                {/* Local Doctors, Gyno & Emergency Care Access */}
                <div className="p-3 rounded-xl bg-white/80 dark:bg-charcoal/30 border border-border/50 dark:border-border/20 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 border-b border-border/30 dark:border-border/10 pb-2">
                    <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-[12px] shrink-0">
                      <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Medical & OB-GYN</span>
                    </div>
                    {(() => {
                      const rawLine = destinationCare.medical.emergencyLine || '112';
                      const primaryDigits = rawLine.split(/\s*(?:or|\/|\(|\s)/)[0].replace(/[^\d+]/g, '') || '112';
                      return (
                        <a
                          href={`tel:${primaryDigits}`}
                          className="h-7 px-3 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1.5 no-underline hover:bg-emerald-200 shrink-0 whitespace-nowrap transition-transform active:scale-95 shadow-2xs"
                          title={`Emergency call ${primaryDigits}`}
                        >
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>Call {primaryDigits}</span>
                        </a>
                      );
                    })()}
                  </div>

                  <div className="space-y-2 text-[12px]">
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-sage shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-charcoal dark:text-white leading-snug">
                          {destinationCare.medical.recommendedHospital}
                        </p>
                        <p className="text-[11px] text-charcoal/70 dark:text-white/70 font-medium leading-relaxed mt-0.5">
                          {destinationCare.medical.hospitalNotes}
                        </p>
                      </div>
                    </div>

                    {/* Dedicated Emergency Dispatch & Rescue Protocol Banner */}
                    {destinationCare.medical.dispatchProtocol && (
                      <div className="flex items-start gap-2 p-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/20 text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1 leading-snug">
                          <span className="font-bold text-emerald-900 dark:text-emerald-200">
                            Emergency Protocol:
                          </span>{' '}
                          <span className="text-emerald-800 dark:text-emerald-300 font-medium">
                            {destinationCare.medical.dispatchProtocol}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-0.5">
                      <button
                        type="button"
                        onClick={() => openHospitalMapSearch(destinationCare.city)}
                        className="text-[11px] font-bold text-sage dark:text-sage hover:text-sage-dark flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0 group"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        <span className="truncate">Find Nearby Maternity Hospitals on Maps</span>
                      </button>
                    </div>
                  </div>

                  {/* Emergency Obstetric Phrase Translation */}
                  <div className="p-2.5 rounded-lg bg-cream/70 dark:bg-charcoal/20 border border-border/40 text-[11.5px] space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[10.5px] font-bold uppercase tracking-[0.5px] text-charcoal/60 dark:text-white/60">
                      <span className="truncate">Emergency Care Phrase ({destinationCare.medical.localPhrase.language})</span>
                      <button
                        type="button"
                        onClick={() => copyPhraseToClipboard(destinationCare.medical.localPhrase.original)}
                        className="text-sage flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 hover:underline shrink-0 whitespace-nowrap"
                      >
                        {copiedPhrase ? <Check className="w-3 h-3 shrink-0" /> : <Copy className="w-3 h-3 shrink-0" />}
                        <span className="whitespace-nowrap">{copiedPhrase ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="font-serif italic text-charcoal dark:text-white font-medium leading-snug">
                      "{destinationCare.medical.localPhrase.original}"
                    </p>
                    <p className="text-[10.5px] text-charcoal/60 dark:text-white/60 truncate">
                      Meaning: {destinationCare.medical.localPhrase.meaning}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clinical Assessment & Clinical Advice Card */}
          <div className="premium-card p-4 sm:p-5 space-y-4">
            {/* Header with Risk Level Badge */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-border/40 dark:border-border/10 pb-3">
              <div>
                <h2 className="font-serif text-[17px] text-charcoal dark:text-white font-semibold flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-sage" /> Safety & Clinical Assessment
                </h2>
                <p className="text-[12px] text-charcoal/70 dark:text-white/70 font-medium">
                  {analysis.stageTitle} • {travelMethod.toUpperCase()}
                </p>
              </div>

              <div className={`px-3 py-1 rounded-full text-[11.5px] font-bold tracking-[0.5px] border self-start sm:self-auto ${analysis.riskColor}`}>
                {analysis.riskLabel}
              </div>
            </div>

            {/* Physiological Stage Overview */}
            <div className="p-3.5 rounded-[14px] bg-charcoal/5 dark:bg-charcoal/20 border border-border/50 dark:border-border/10 space-y-1.5">
              <div className="flex gap-2 items-start text-[13px] text-charcoal dark:text-white leading-relaxed font-medium">
                <Info className="w-4 h-4 text-sage shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Trimester Clinical Breakdown: </span>
                  {analysis.stageDescription}
                </div>
              </div>
            </div>

            {/* OB/Midwife Clinical Guidance */}
            <div className="space-y-3">
              <div className="flex gap-2.5 items-start">
                <Stethoscope className="w-4 h-4 text-sage shrink-0 mt-1" />
                <div>
                  <h4 className="text-[13px] font-bold text-charcoal dark:text-white">OB/Midwife Clinical Advice:</h4>
                  <p className="text-[12.5px] text-charcoal/80 dark:text-white/80 leading-relaxed font-medium mt-0.5">
                    {analysis.obAdvice}
                  </p>
                </div>
              </div>

              {/* Travel / Airline / Transit Rules */}
              <div className="flex gap-2.5 items-start border-t border-border/40 dark:border-border/10 pt-3">
                <ShieldCheck className="w-4 h-4 text-sage shrink-0 mt-1" />
                <div>
                  <h4 className="text-[13px] font-bold text-charcoal dark:text-white">Carrier Regulations & Clearances:</h4>
                  <p className="text-[12.5px] text-charcoal/80 dark:text-white/80 leading-relaxed font-medium mt-0.5">
                    {analysis.carrierRules}
                  </p>
                </div>
              </div>

              {/* Environmental / Destination Advisory */}
              {analysis.environmentAdvice && (
                <div className="flex gap-2.5 items-start border-t border-border/40 dark:border-border/10 pt-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-[13px] font-bold text-amber-700 dark:text-amber-300">
                      Destination Advisory {destinationInfo ? `(${destinationInfo})` : ''}:
                    </h4>
                    <p className="text-[12.5px] text-charcoal/80 dark:text-white/80 leading-relaxed font-medium mt-0.5">
                      {analysis.environmentAdvice}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Critical Red Flag Warning Signs Card */}
            <div className="p-3.5 rounded-[14px] bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
              <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 text-[12px] font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="leading-tight">When to Stop Travel & Seek Emergency Obstetric Care:</span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[11px] sm:text-[11.5px] text-rose-900/90 dark:text-rose-200/90 font-medium pl-1">
                <li className="flex items-center gap-1.5 min-w-0">
                  <span className="text-rose-500 font-bold shrink-0">•</span>
                  <span>Vaginal bleeding, spotting, or fluid leakage</span>
                </li>
                <li className="flex items-center gap-1.5 min-w-0">
                  <span className="text-rose-500 font-bold shrink-0">•</span>
                  <span>Regular contractions or severe pelvic pressure</span>
                </li>
                <li className="flex items-center gap-1.5 min-w-0">
                  <span className="text-rose-500 font-bold shrink-0">•</span>
                  <span>Unilateral calf pain or swelling (DVT alert)</span>
                </li>
                <li className="flex items-center gap-1.5 min-w-0">
                  <span className="text-rose-500 font-bold shrink-0">•</span>
                  <span>Severe headache, vision spots, or sudden swelling</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRAVEL CHECKLIST - STRAIGHTFORWARD, SLEEK, PARTNER SYNC & DELETE SUPPORT */}
      {activeTab === 'checklist' && (
        <div className="premium-card p-4 sm:p-5 space-y-4">
          {/* Header, Reset & Partner Share */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-border/40 dark:border-border/10 pb-3">
            <div>
              <h2 className="font-serif text-[17px] text-charcoal dark:text-white font-semibold flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-sage" /> Your Travel Checklist
              </h2>
              <p className="text-[12px] text-charcoal/70 dark:text-white/70 font-medium">
                Tailored for {analysis.stageTitle.split('(')[0].trim()} • {travelMethod.toUpperCase()}
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                type="button"
                onClick={shareChecklist}
                className="text-[11.5px] font-bold text-sage dark:text-sage hover:text-sage-dark bg-transparent border-none cursor-pointer flex items-center gap-1.5"
                title={`Share checklist with ${partnerName}`}
              >
                <Share2 className="w-3.5 h-3.5" /> Share with {partnerName}
              </button>

              <button
                type="button"
                onClick={resetChecklist}
                className="text-[11.5px] font-bold text-critical hover:text-red-700 bg-transparent border-none cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Progress Bar & Partner Summary */}
          <div className="p-3 rounded-[14px] bg-cream/70 dark:bg-charcoal/20 border border-border/60 dark:border-border/10 space-y-2">
            <div className="flex justify-between items-center text-[12px] font-bold text-charcoal dark:text-white">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sage" /> Readiness Progress
              </span>
              <span>{completedCount} of {totalCount} Completed ({progressPercent}%)</span>
            </div>
            
            <div className="w-full bg-border/40 dark:bg-charcoal/40 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-sage h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {partnerAssignedCount > 0 && (
              <div className="flex items-center justify-between text-[11px] text-sage-dark dark:text-sage font-medium pt-0.5">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sage" />
                  <span>Partner Sync: <strong>{partnerAssignedCount}</strong> tasks assigned to {partnerName}</span>
                </span>
                <span className="text-[10.5px] font-semibold opacity-90">
                  {partnerCompletedCount} of {partnerAssignedCount} done
                </span>
              </div>
            )}
          </div>

          {/* Straightforward Checklist Items List with Delete & Partner Assignment */}
          <div className="space-y-2 pt-0.5">
            {checklist.length > 0 ? (
              checklist.map((item) => {
                const isAssignedToPartner = item.assignedTo === 'partner';
                return (
                  <div 
                    key={item.id}
                    className={`flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-[12px] border transition-all ${
                      item.checked 
                        ? 'bg-sage-pale/40 dark:bg-sage/10 border-sage/30 opacity-80' 
                        : 'bg-white/80 dark:bg-charcoal/20 border-border/60 dark:border-border/20 hover:border-sage/50'
                    }`}
                  >
                    {/* Checkbox & Task Content Clickable Area */}
                    <div 
                      onClick={() => toggleCheck(item.id)}
                      className="flex items-start gap-2.5 sm:gap-3 flex-1 cursor-pointer select-none"
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCheck(item.id);
                        }}
                        className="text-sage focus:outline-none cursor-pointer p-0 bg-transparent border-none flex items-center justify-center shrink-0 mt-0.5"
                      >
                        {item.checked ? (
                          <CheckCircle2 className="w-5 h-5 text-sage fill-sage-pale/40 dark:fill-transparent" />
                        ) : (
                          <Square className="w-5 h-5 text-charcoal/30 dark:text-white/30" />
                        )}
                      </button>

                      {/* Task Text & Badges */}
                      <div className="flex-1 space-y-1">
                        <p className={`text-[13px] leading-relaxed font-sans font-medium text-charcoal dark:text-white ${
                          item.checked ? 'line-through opacity-60 text-charcoal/60 dark:text-white/60' : ''
                        }`}>
                          {item.text}
                        </p>

                        <div className="flex items-center gap-2 pt-0.5">
                          {/* Partner Assignment Pill */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePartnerAssign(item.id);
                            }}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all border cursor-pointer flex items-center gap-1 ${
                              isAssignedToPartner
                                ? 'bg-sage/20 text-sage-dark dark:text-sage border-sage/40 shadow-2xs'
                                : 'bg-charcoal/5 dark:bg-charcoal/20 text-charcoal/60 dark:text-white/60 border-border/40 hover:border-sage/40'
                            }`}
                            title={isAssignedToPartner ? `Assigned to ${partnerName} (click to reassign)` : `Assign to ${partnerName}`}
                          >
                            {isAssignedToPartner ? (
                              <>
                                <Users className="w-3 h-3 text-sage" />
                                <span>{partnerName}</span>
                              </>
                            ) : (
                              <>
                                <User className="w-3 h-3 text-charcoal/40 dark:text-white/40" />
                                <span>Me</span>
                              </>
                            )}
                          </button>

                          {item.isCustom && (
                            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold">
                              Custom
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete Task Button (Available for all tasks) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDelete(item.id);
                      }}
                      className="p-2 text-charcoal/35 dark:text-white/35 hover:text-critical hover:bg-critical-bg rounded-lg transition-all cursor-pointer border-none bg-transparent shrink-0 mt-0.5 active:scale-90"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-[12.5px] text-charcoal/60 dark:text-white/60 text-center py-6 italic border border-dashed border-border/60 rounded-[12px]">
                No items on your checklist. Tap "Reset" or add your custom item below!
              </div>
            )}
          </div>

          {/* Simple, Straightforward Add Custom Item Form */}
          <form onSubmit={handleAddTodo} className="pt-2 border-t border-border/40 dark:border-border/10 flex gap-2">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Add a travel packing item or task..."
              className="flex-1 px-3.5 py-2 text-[13px] rounded-xl border border-border/80 dark:border-border/20 bg-white dark:bg-charcoal/20 text-charcoal dark:text-white placeholder:text-charcoal/40 dark:placeholder:text-white/40 focus:outline-none focus:border-sage font-medium"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-sage text-white text-[12.5px] font-bold rounded-xl hover:bg-sage-dark transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 shadow-2xs active:scale-95 border-none"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
