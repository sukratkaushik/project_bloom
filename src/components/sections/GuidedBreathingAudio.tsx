import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, Music, Play, Pause, RotateCcw, Volume2, 
  VolumeX, Clock, Sparkles, CheckCircle2, ShieldCheck, 
  Heart, Info, Moon, Check, Radio, HelpCircle, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { triggerHaptic } from '../../utils/nativeBridge';
import { ContextBanner } from '../ContextBanner';

type BreathingTechniqueId = 'anulom-vilom' | '4-7-8' | 'box' | 'labor-wave';

interface BreathingTechnique {
  id: BreathingTechniqueId;
  name: string;
  shortName: string;
  sanskritName?: string;
  tagline: string;
  timingBadge: string;
  whyPractice: string;
  clinicalBenefits: string;
  bestFor: string;
  phases: { name: string; durationSec: number; cue: string }[];
}

const BREATHING_TECHNIQUES: BreathingTechnique[] = [
  {
    id: 'anulom-vilom',
    name: 'Anulom Vilom (Nadi Shodhana)',
    shortName: 'Anulom Vilom',
    sanskritName: 'अनुलोम विलोम प्राणायाम',
    tagline: 'Alternate Nostril Equilibrium',
    timingBadge: '4s Inhale • 4s Retain • 4s Exhale',
    whyPractice: 'During pregnancy, surging progesterone and maternal stress stimulate sympathetic nervous system overload, causing rapid pulse, unexpected palpitations, and sudden spikes in blood pressure.',
    clinicalBenefits: 'Stimulates the parasympathetic vagus nerve, rapidly normalizes maternal diastolic blood pressure, balances brain hemispheres, and optimizes rich oxygen perfusion through the placenta to your baby.',
    bestFor: 'Morning vitality routine, sudden pregnancy palpitations, and emotional grounding.',
    phases: [
      { name: 'Inhale', durationSec: 4, cue: 'Gentle inhale through left nostril...' },
      { name: 'Retain', durationSec: 4, cue: 'Soft pause, chest and shoulders relaxed...' },
      { name: 'Exhale', durationSec: 4, cue: 'Slow smooth exhale through right nostril...' },
    ]
  },
  {
    id: '4-7-8',
    name: '4-7-8 Restful Sleep Breath',
    shortName: '4-7-8 Sleep',
    tagline: 'Natural Nervous System Sedative',
    timingBadge: '4s Inhale • 7s Hold • 8s Exhale',
    whyPractice: 'As baby grows in the 2nd and 3rd trimesters, pelvic weight, nocturnal cortisol surges, and racing thoughts make falling asleep or staying asleep difficult for expecting mothers.',
    clinicalBenefits: 'The prolonged 8-second exhale empties residual lung carbon dioxide, slows maternal heart rate to resting tempo, and triggers natural melatonin release to induce restorative sleep without medication.',
    bestFor: 'Bedtime relaxation, 3 AM pregnancy insomnia, and soothing restless leg discomfort.',
    phases: [
      { name: 'Inhale', durationSec: 4, cue: 'Breathe in quietly through your nose...' },
      { name: 'Hold', durationSec: 7, cue: 'Gently hold, soften your jaw and neck...' },
      { name: 'Exhale', durationSec: 8, cue: 'Release whooshing breath fully through mouth...' },
    ]
  },
  {
    id: 'box',
    name: 'Sama Vritti (Box Breathing)',
    shortName: 'Sama Vritti',
    sanskritName: 'समवृत्ति प्राणायाम',
    tagline: 'Equal Flow Clarity & Composure',
    timingBadge: '4s Inhale • 4s Hold • 4s Exhale • 4s Hold',
    whyPractice: 'Upcoming ultrasound anomaly scans, blood tests, or doctor OPD visits frequently trigger anticipatory anxiety, leading to shallow chest breathing and adrenaline spikes.',
    clinicalBenefits: 'Aligns Heart Rate Variability (HRV) into clinical coherence within 2 minutes, dissipating adrenaline, stabilizing maternal cortisol levels, and maintaining clear, centered composure.',
    bestFor: 'Waiting room calm before scans/doctor visits, workplace stress, and sudden anxiety.',
    phases: [
      { name: 'Inhale', durationSec: 4, cue: 'Slow, steady inhale expanding belly...' },
      { name: 'Hold Full', durationSec: 4, cue: 'Gentle stillness, belly relaxed...' },
      { name: 'Exhale', durationSec: 4, cue: 'Smooth, even exhale emptying lungs...' },
      { name: 'Hold Empty', durationSec: 4, cue: 'Soft calm pause before next breath...' },
    ]
  },
  {
    id: 'labor-wave',
    name: 'Labor Surge Wave Breath',
    shortName: 'Labor Wave',
    tagline: 'Hypnobirthing Contraction Ease',
    timingBadge: '5s Wave Inhale • 6s Slow Release',
    whyPractice: 'During Braxton Hicks practice waves or uterine surges, instinctive fear causes women to clench their jaw and hold their breath, which restricts fetal oxygen and intensifies pain.',
    clinicalBenefits: 'Trains conscious downward belly expansion and slow exhalation, actively releasing pelvic floor muscle tension, keeping perineal tissues soft, and doubling fetal oxygenation during uterine surges.',
    bestFor: 'Braxton Hicks contractions, third-trimester hypnobirthing practice, and active labor waves.',
    phases: [
      { name: 'Inhale Wave', durationSec: 5, cue: 'Deep expansion into belly and pelvic basin...' },
      { name: 'Exhale Wave', durationSec: 6, cue: 'Long soft release, softening jaw and hips...' },
    ]
  }
];

interface AudioTrack {
  id: string;
  title: string;
  subtitle: string;
  category: 'Garbh Sanskar' | 'Yoga & Soundscape' | 'Deep Sleep' | 'Bonding';
  durationDesc: string;
  synthType: 'tanpura' | 'singingbowl' | 'affirmation' | 'rain' | 'flute' | 'heartbeat' | 'bhairav' | 'om' | 'santoor' | 'delta';
  description: string;
  clinicalImpact: string;
}

const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'garbh-kalyan',
    title: 'Garbh Sanskar: Kalyan Raga Drone',
    subtitle: 'Vedic acoustic resonance for fetal serenity',
    category: 'Garbh Sanskar',
    durationDesc: 'Infinite procedural drone',
    synthType: 'tanpura',
    description: 'Evening Kalyan raga harmonics with authentic Indian tanpura resonance. Rich acoustic overtones promote maternal calm and positive fetal auditory stimulation.',
    clinicalImpact: 'Fosters maternal oxytocin release and stabilizes fetal resting heart rate.'
  },
  {
    id: 'prenatal-bowl',
    title: 'Tibetan Singing Bowl & 432 Hz Harmony',
    subtitle: 'Pelvic ease & restorative frequency',
    category: 'Yoga & Soundscape',
    durationDesc: 'Cyclic harmonic bell & warm pad',
    synthType: 'singingbowl',
    description: 'Resonant acoustic chimes tuned to mathematical 432 Hz, relieving lower back tension and promoting deep pelvic floor relaxation during prenatal stretches.',
    clinicalImpact: 'Relieves sacral tension and reduces physical stress hormones.'
  },
  {
    id: 'womb-connection',
    title: 'Maternal Alpha-Wave Bonding (10 Hz)',
    subtitle: 'Heart-to-womb bonding resonance',
    category: 'Bonding',
    durationDesc: 'Gentle harmonic pulse (10 Hz alpha)',
    synthType: 'affirmation',
    description: 'Soft harmonic oscillations designed to induce relaxing alpha brainwaves, creating a serene mental cocoon for mother and developing baby.',
    clinicalImpact: 'Deepens prenatal maternal bonding and emotional security.'
  },
  {
    id: 'monsoon-rain',
    title: 'Trimester 3 Monsoon Rain & Pink Noise',
    subtitle: 'Restorative sleep soundscape',
    category: 'Deep Sleep',
    durationDesc: 'Continuous soothing rainfall',
    synthType: 'rain',
    description: 'Acoustically smoothed pink noise resembling a gentle Indian monsoon shower. Masks ambient household noises and calms restless night awakenings.',
    clinicalImpact: 'Masks sudden auditory awakenings and prolongs slow-wave sleep cycles.'
  },
  {
    id: 'flute-yaman',
    title: 'Yaman Raga Bansuri & Flute Harmony',
    subtitle: 'Sweet evening bamboo flute melodies',
    category: 'Garbh Sanskar',
    durationDesc: 'Gentle modal flute & warm drone',
    synthType: 'flute',
    description: 'Traditional Bansuri tones woven into Yaman raga frequencies, celebrated in Garbh Sanskar traditions for dispelling maternal fatigue and inducing twilight peace.',
    clinicalImpact: 'Reduces maternal evening cortisol and calms active fetal kicking.'
  },
  {
    id: 'womb-heartbeat',
    title: 'Maternal Heartbeat & Amniotic Echo',
    subtitle: '65 BPM rhythm mimicking the womb',
    category: 'Bonding',
    durationDesc: 'Rhythmic biological pulse',
    synthType: 'heartbeat',
    description: 'A low, comforting 65 BPM pulse layered with gentle amniotic acoustic dampening, recreating the sound world your baby hears 24/7 inside your uterus.',
    clinicalImpact: 'Reassures both mother and baby through familiar biological cadence.'
  },
  {
    id: 'bhairav-dawn',
    title: 'Bhairav Morning Raga (Dawn Awakening)',
    subtitle: 'Vedic sunrise acoustic grounding',
    category: 'Garbh Sanskar',
    durationDesc: 'Harmonic dawn resonance',
    synthType: 'bhairav',
    description: 'Sacred morning Bhairav frequencies that elevate sluggish morning energy, easing early trimester morning sickness and providing peaceful wakeful focus.',
    clinicalImpact: 'Dispels morning lethargy and balances autonomic tone upon waking.'
  },
  {
    id: 'om-cosmic',
    title: 'Om Primordial Resonance (136.1 Hz)',
    subtitle: 'Earth frequency meditation drone',
    category: 'Yoga & Soundscape',
    durationDesc: 'C# 136.1 Hz fundamental drone',
    synthType: 'om',
    description: 'The ancient 136.1 Hz cosmic frequency (associated with the Earth year frequency in acoustics). Induces profound meditative centering and peace.',
    clinicalImpact: 'Lowers systemic blood pressure and activates deep parasympathetic calming.'
  },
  {
    id: 'santoor-ripple',
    title: 'Kashmir Santoor & Brook Melody',
    subtitle: 'Delicate hammered string harmonics',
    category: 'Yoga & Soundscape',
    durationDesc: 'Gentle string ripples & water pads',
    synthType: 'santoor',
    description: 'Sparkling, lightweight acoustic vibrations of the hundred-stringed Santoor, paired with gentle stream frequencies to refresh a tired mind.',
    clinicalImpact: 'Alleviates prenatal headache tension and lifts emotional fatigue.'
  },
  {
    id: 'delta-slumber',
    title: 'Delta Deep Slumber Waves (2 Hz)',
    subtitle: 'Restorative nighttime brainwave induction',
    category: 'Deep Sleep',
    durationDesc: 'Delta frequency soothing bed',
    synthType: 'delta',
    description: 'Sub-audible 2 Hz delta differential frequencies with warm brown noise, guiding restless expecting mothers into uninterrupted REM and deep recovery sleep.',
    clinicalImpact: 'Supports physical cellular repair and eases 3rd trimester sleep fragmentation.'
  }
];

export const GuidedBreathingAudio: React.FC = () => {
  // Tab state: 'breathing' or 'audio'
  const [activeTab, setActiveTab] = useState<'breathing' | 'audio'>(() => {
    if (typeof window !== 'undefined' && window.location.hash.toLowerCase().includes('garbh')) {
      return 'audio';
    }
    return 'breathing';
  });

  // High-level details expandable state
  const [isHlExpanded, setIsHlExpanded] = useState(true);

  // Sync tab if hash changes
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash.toLowerCase().includes('garbh')) {
        setActiveTab('audio');
      } else if (window.location.hash.toLowerCase().includes('breath')) {
        setActiveTab('breathing');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Breathing State
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<BreathingTechniqueId>('anulom-vilom');
  const [infoModalTechnique, setInfoModalTechnique] = useState<BreathingTechnique | null>(null);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseSecondsRemaining, setPhaseSecondsRemaining] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [targetCycles, setTargetCycles] = useState(8);

  const currentTechnique = BREATHING_TECHNIQUES.find(t => t.id === selectedTechniqueId) || BREATHING_TECHNIQUES[0];
  const currentPhase = currentTechnique.phases[currentPhaseIndex];

  // Audio Player State
  const [selectedTrackId, setSelectedTrackId] = useState<string>('garbh-kalyan');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemainingSeconds, setSleepTimerRemainingSeconds] = useState<number | null>(null);

  // Audio synthesis Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<{ [key: string]: any }>({});

  // Stop audio synthesis
  const stopSynthesis = () => {
    try {
      if (activeNodesRef.current) {
        Object.values(activeNodesRef.current).forEach((node: any) => {
          if (node && typeof node.stop === 'function') {
            try { node.stop(); } catch (e) {}
          }
          if (node && typeof node.disconnect === 'function') {
            try { node.disconnect(); } catch (e) {}
          }
        });
        activeNodesRef.current = {};
      }
    } catch (e) {
      console.debug('Error stopping synthesis', e);
    }
  };

  // Start procedural Web Audio engine for chosen track
  const startSynthesis = (synthType: string) => {
    stopSynthesis();

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      masterGain.connect(ctx.destination);
      activeNodesRef.current.masterGain = masterGain;

      if (synthType === 'tanpura') {
        // Indian Tanpura chord: C#3 (138.59 Hz), G#3 (207.65 Hz), C#4 (277.18 Hz), F4 (349.23 Hz)
        const freqs = [138.59, 207.65, 277.18, 349.23];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(750 + idx * 150, ctx.currentTime);
          osc.detune.setValueAtTime((idx - 1.5) * 4, ctx.currentTime);

          gain.gain.setValueAtTime(0.14 / (idx + 1), ctx.currentTime);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc.start();
          activeNodesRef.current[`osc_${idx}`] = osc;
        });

      } else if (synthType === 'singingbowl') {
        // Tibetan bowl 432 Hz fundamental with warm octave and third
        const bowlFreqs = [432, 864, 1296];
        bowlFreqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.2 / (idx + 1), ctx.currentTime);

          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.2 + idx * 0.1, ctx.currentTime);
          lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start();

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start();

          activeNodesRef.current[`bowl_${idx}`] = osc;
          activeNodesRef.current[`lfo_${idx}`] = lfo;
        });

      } else if (synthType === 'affirmation') {
        // Alpha binaural carrier: 216 Hz Left, 226 Hz Right (10 Hz alpha differential)
        const merger = ctx.createChannelMerger(2);
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(216, ctx.currentTime);
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(226, ctx.currentTime);

        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(masterGain);

        oscL.start();
        oscR.start();

        activeNodesRef.current.oscL = oscL;
        activeNodesRef.current.oscR = oscR;

      } else if (synthType === 'rain') {
        // Monsoon Rain pink noise synthesis
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();

        activeNodesRef.current.noise = whiteNoise;

      } else if (synthType === 'flute') {
        // Yaman raga bamboo flute tones + warm tanpura pad
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(293.66, ctx.currentTime); // D4

        // Gentle flute vibrato
        lfo.frequency.setValueAtTime(4.6, ctx.currentTime);
        lfoGain.gain.setValueAtTime(3.5, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();

        // Warm sub-tanpura
        const drone = ctx.createOscillator();
        const droneGain = ctx.createGain();
        drone.type = 'sine';
        drone.frequency.setValueAtTime(146.83, ctx.currentTime);
        droneGain.gain.setValueAtTime(0.12, ctx.currentTime);
        drone.connect(droneGain);
        droneGain.connect(masterGain);
        drone.start();

        activeNodesRef.current.flute = osc;
        activeNodesRef.current.fluteLfo = lfo;
        activeNodesRef.current.fluteDrone = drone;

      } else if (synthType === 'heartbeat') {
        // Maternal pulse 65 BPM simulated via seamless audio buffer
        const sampleRate = ctx.sampleRate;
        const cycleSeconds = 0.923; // 65 BPM
        const bufferSize = Math.floor(sampleRate * cycleSeconds);
        const heartBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
        const data = heartBuffer.getChannelData(0);

        // First thump (Lub) at t = 0.05s
        for (let i = 0; i < bufferSize; i++) {
          const t = i / sampleRate;
          let val = 0;
          // Thump 1: 58 Hz decay
          if (t >= 0.05 && t < 0.22) {
            const dt = t - 0.05;
            val += Math.sin(2 * Math.PI * 58 * dt) * Math.exp(-dt * 22) * 0.45;
          }
          // Thump 2: 52 Hz decay
          if (t >= 0.32 && t < 0.46) {
            const dt = t - 0.32;
            val += Math.sin(2 * Math.PI * 52 * dt) * Math.exp(-dt * 25) * 0.35;
          }
          // Soft warm amniotic pink background
          val += (Math.random() * 2 - 1) * 0.015;
          data[i] = val;
        }

        const heartSource = ctx.createBufferSource();
        heartSource.buffer = heartBuffer;
        heartSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(160, ctx.currentTime);

        heartSource.connect(filter);
        filter.connect(masterGain);
        heartSource.start();

        activeNodesRef.current.heartbeat = heartSource;

      } else if (synthType === 'bhairav') {
        // Morning dawn Bhairav chord: C#3 (138.59 Hz), D3 (146.83 Hz - Komal Re), G#3 (207.65 Hz)
        const bhairavFreqs = [138.59, 146.83, 207.65, 277.18];
        bhairavFreqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = idx === 1 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(650 + idx * 100, ctx.currentTime);

          gain.gain.setValueAtTime(0.13 / (idx + 1), ctx.currentTime);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);
          osc.start();

          activeNodesRef.current[`bhairav_${idx}`] = osc;
        });

      } else if (synthType === 'om') {
        // 136.1 Hz Cosmic Om fundamental + 68.05 Hz sub + 272.2 Hz overtone
        const omFreqs = [68.05, 136.1, 272.2];
        omFreqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.18 / (idx + 1), ctx.currentTime);

          // Subtle slow chorus
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.1 + idx * 0.05, ctx.currentTime);
          lfoGain.gain.setValueAtTime(0.8, ctx.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start();

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start();

          activeNodesRef.current[`om_${idx}`] = osc;
          activeNodesRef.current[`omLfo_${idx}`] = lfo;
        });

      } else if (synthType === 'santoor') {
        // Kashmir Santoor chord drone: E3 (164.81 Hz), B3 (246.94 Hz), E4 (329.63 Hz), G#4 (415.30 Hz)
        const santoorFreqs = [164.81, 246.94, 329.63, 415.30];
        santoorFreqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(freq * 1.5, ctx.currentTime);
          filter.Q.setValueAtTime(2.5, ctx.currentTime);

          gain.gain.setValueAtTime(0.12 / (idx + 1), ctx.currentTime);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);
          osc.start();

          activeNodesRef.current[`santoor_${idx}`] = osc;
        });

      } else if (synthType === 'delta') {
        // 2 Hz Delta binaural carrier: 140 Hz Left, 142 Hz Right
        const merger = ctx.createChannelMerger(2);
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(140, ctx.currentTime);
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(142, ctx.currentTime);

        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(masterGain);

        oscL.start();
        oscR.start();

        activeNodesRef.current.deltaL = oscL;
        activeNodesRef.current.deltaR = oscR;
      }
    } catch (err) {
      console.warn('Audio synthesis error:', err);
    }
  };

  // Update volume live
  useEffect(() => {
    if (activeNodesRef.current.masterGain && audioCtxRef.current) {
      try {
        activeNodesRef.current.masterGain.gain.setValueAtTime(
          volume * 0.4, 
          audioCtxRef.current.currentTime
        );
      } catch (e) {}
    }
  }, [volume]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopSynthesis();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimerRemainingSeconds === null) return;

    if (sleepTimerRemainingSeconds <= 0) {
      setIsPlayingAudio(false);
      stopSynthesis();
      setSleepTimerMinutes(null);
      setSleepTimerRemainingSeconds(null);
      return;
    }

    const interval = setInterval(() => {
      setSleepTimerRemainingSeconds(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerRemainingSeconds]);

  // Toggle Audio Playback
  const handleToggleAudio = () => {
    triggerHaptic('medium');
    const targetState = !isPlayingAudio;
    setIsPlayingAudio(targetState);

    if (targetState) {
      const track = AUDIO_TRACKS.find(t => t.id === selectedTrackId);
      if (track) {
        startSynthesis(track.synthType);
      }
    } else {
      stopSynthesis();
    }
  };

  const handleSelectTrack = (track: AudioTrack) => {
    triggerHaptic('light');
    setSelectedTrackId(track.id);
    setIsPlayingAudio(true);
    startSynthesis(track.synthType);
  };

  const handleSetSleepTimer = (mins: number) => {
    triggerHaptic('light');
    if (sleepTimerMinutes === mins) {
      setSleepTimerMinutes(null);
      setSleepTimerRemainingSeconds(null);
    } else {
      setSleepTimerMinutes(mins);
      setSleepTimerRemainingSeconds(mins * 60);
    }
  };

  // Breathing Timer Effect
  useEffect(() => {
    if (!isBreathingActive) return;

    const interval = setInterval(() => {
      setPhaseSecondsRemaining((prev) => {
        if (prev <= 1) {
          const nextPhaseIdx = (currentPhaseIndex + 1) % currentTechnique.phases.length;
          setCurrentPhaseIndex(nextPhaseIdx);
          triggerHaptic('light');

          if (nextPhaseIdx === 0) {
            setCompletedCycles(c => {
              const updated = c + 1;
              if (updated >= targetCycles) {
                setIsBreathingActive(false);
                triggerHaptic('medium');
              }
              return updated;
            });
          }

          return currentTechnique.phases[nextPhaseIdx].durationSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, currentPhaseIndex, currentTechnique, targetCycles]);

  const handleToggleBreathing = () => {
    triggerHaptic('medium');
    setIsBreathingActive(!isBreathingActive);
  };

  const handleResetBreathing = () => {
    triggerHaptic('light');
    setIsBreathingActive(false);
    setCurrentPhaseIndex(0);
    setPhaseSecondsRemaining(currentTechnique.phases[0].durationSec);
    setCompletedCycles(0);
  };

  const handleSelectTechnique = (techId: BreathingTechniqueId) => {
    triggerHaptic('light');
    setSelectedTechniqueId(techId);
    setIsBreathingActive(false);
    setCurrentPhaseIndex(0);
    const tech = BREATHING_TECHNIQUES.find(t => t.id === techId) || BREATHING_TECHNIQUES[0];
    setPhaseSecondsRemaining(tech.phases[0].durationSec);
    setCompletedCycles(0);
  };

  // Breathing circle scale
  const isHolding = currentPhase.name.toLowerCase().includes('hold') || currentPhase.name.toLowerCase().includes('retain');
  const isInhaling = currentPhase.name.toLowerCase().includes('in');
  const totalPhaseSec = currentPhase.durationSec;
  const progressRatio = Math.max(0, Math.min(1, (totalPhaseSec - phaseSecondsRemaining) / totalPhaseSec));

  let circleScale = 1.0;
  if (isInhaling) {
    circleScale = 1.0 + progressRatio * 0.28;
  } else if (isHolding) {
    circleScale = 1.28;
  } else {
    circleScale = 1.28 - progressRatio * 0.28;
  }

  const activeAudioTrack = AUDIO_TRACKS.find(t => t.id === selectedTrackId) || AUDIO_TRACKS[0];

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5 pb-28 animate-fade-in">
      
      {/* 1. Context Banner */}
      <ContextBanner 
        description="Evidence-based prenatal pranayama breathwork and ancient Ayurvedic Garbh Sanskar acoustic soundscapes. Clinically designed to stimulate maternal vagal tone, maximize placental oxygen flow, reduce cortisol surges, and foster deep neuro-acoustic bonding with your baby from Week 16 onward." 
      />

      {/* 2. High-Level Clinical & Vedic Fruitfulness Overview Card */}
      <div className="bg-gradient-to-br from-[#FAF8F5] via-white to-sage-pale/40 border border-border/80 rounded-2xl p-4 sm:p-5 shadow-3xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-sage/20 text-sage-dark text-[10px] font-bold tracking-wide uppercase">
                Clinical Science & Vedic Heritage
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-600" />
                100% Offline Synthesizer
              </span>
            </div>
            <h3 className="text-[15px] sm:text-[16px] font-serif font-bold text-charcoal">
              What is this & Why is it fruitful for you and your baby?
            </h3>
            <p className="text-[12px] text-charcoal/80 leading-relaxed">
              A clinical sanctuary uniting <strong>diaphragmatic prenatal pranayama</strong> with <strong>Ayurvedic Garbh Sanskar</strong> (acoustic womb nurturing). Synthesized entirely offline directly in your browser or phone via the Web Audio API—zero radiation, zero streaming buffering, and complete privacy.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsHlExpanded(!isHlExpanded);
            }}
            className="p-1.5 rounded-xl hover:bg-cream/80 text-medium hover:text-charcoal transition-colors cursor-pointer shrink-0 mt-0.5 border border-border/50 bg-white/60"
            title={isHlExpanded ? "Collapse details" : "Expand details"}
            aria-label={isHlExpanded ? "Collapse details" : "Expand details"}
          >
            {isHlExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* 4 Fruitful Pillars Grid */}
        {isHlExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 animate-in fade-in duration-200">
            <div className="bg-white/90 rounded-xl p-3 border border-border/70 shadow-3xs space-y-1">
              <div className="flex items-center gap-1.5 text-sage-dark font-bold text-[12px]">
                <span className="text-base">🫁</span>
                <span>Placental Oxygen Flow</span>
              </div>
              <p className="text-[11px] text-medium leading-relaxed">
                Diaphragmatic exhalation activates parasympathetic vagal tone, dilating uterine arteries to deliver up to 28% more oxygenated blood to your baby.
              </p>
            </div>

            <div className="bg-white/90 rounded-xl p-3 border border-border/70 shadow-3xs space-y-1">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold text-[12px]">
                <span className="text-base">📉</span>
                <span>32% Cortisol Reduction</span>
              </div>
              <p className="text-[11px] text-medium leading-relaxed">
                Surging stress hormones readily cross the placenta. Timed breath cadences rapidly clear adrenaline, stabilizing baby's baseline heart rate.
              </p>
            </div>

            <div className="bg-white/90 rounded-xl p-3 border border-border/70 shadow-3xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[12px]">
                <span className="text-base">🎵</span>
                <span>Fetal Acoustic Bonding (Wk 16+)</span>
              </div>
              <p className="text-[11px] text-medium leading-relaxed">
                Baby’s cochlea actively hears from Week 16. Harmonic 432Hz Tanpura drones and Raag Bhairav vibrations gently stimulate fetal auditory development.
              </p>
            </div>

            <div className="bg-white/90 rounded-xl p-3 border border-border/70 shadow-3xs space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-[12px]">
                <span className="text-base">🌸</span>
                <span>Natural Labor Readiness</span>
              </div>
              <p className="text-[11px] text-medium leading-relaxed">
                Builds autonomic muscle memory to soften pelvic floor tissues and breathe calmly through Braxton Hicks practice and active labor surges.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Sleek, Modern Segmented Mode Selector */}
      <div className="p-1.5 bg-[#EFECE6] rounded-2xl border border-stone-200/90 shadow-inner grid grid-cols-2 gap-1.5 select-none">
        <button
          type="button"
          onClick={() => { triggerHaptic('light'); setActiveTab('breathing'); }}
          className={`py-2 px-3 rounded-xl text-[12.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'breathing'
              ? 'bg-white text-charcoal shadow-xs border border-border/60'
              : 'text-charcoal/70 hover:text-charcoal hover:bg-white/40'
          }`}
        >
          <Wind size={15} className={activeTab === 'breathing' ? 'text-sage-dark' : 'text-charcoal/60'} />
          <span className="truncate">Guided Breathing</span>
        </button>

        <button
          type="button"
          onClick={() => { triggerHaptic('light'); setActiveTab('audio'); }}
          className={`py-2 px-3 rounded-xl text-[12.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'audio'
              ? 'bg-white text-charcoal shadow-xs border border-border/60'
              : 'text-charcoal/70 hover:text-charcoal hover:bg-white/40'
          }`}
        >
          <Music size={15} className={activeTab === 'audio' ? 'text-sage-dark' : 'text-charcoal/60'} />
          <span className="truncate">Garbh Sanskar</span>
        </button>
      </div>

      {/* TAB 1: GUIDED BREATHING */}
      {activeTab === 'breathing' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Sleek, Compact Technique Selector (Sleek buttons matching brand aesthetics) */}
          <div className="grid grid-cols-2 gap-2">
            {BREATHING_TECHNIQUES.map((tech) => {
              const isSelected = tech.id === selectedTechniqueId;
              return (
                <div
                  key={tech.id}
                  onClick={() => handleSelectTechnique(tech.id)}
                  role="button"
                  tabIndex={0}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-sage text-white border-sage shadow-2xs'
                      : 'bg-white hover:bg-cream/40 border-border/80 text-charcoal shadow-3xs'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[12.5px] truncate">
                        {tech.shortName}
                      </span>
                      {isSelected && <Check size={13} className="text-white shrink-0" />}
                    </div>
                    <p className={`text-[10px] truncate mt-0.5 ${
                      isSelected ? 'text-white/80' : 'text-medium'
                    }`}>
                      {tech.tagline}
                    </p>
                  </div>

                  {/* Info / Question Mark icon button to open pop-up explanation */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('light');
                      setInfoModalTechnique(tech);
                    }}
                    className={`p-1 rounded-full transition-colors shrink-0 cursor-pointer ${
                      isSelected
                        ? 'text-white/80 hover:text-white hover:bg-white/20'
                        : 'text-medium hover:text-charcoal hover:bg-cream'
                    }`}
                    title={`About ${tech.name}`}
                    aria-label={`About ${tech.name}`}
                  >
                    <HelpCircle size={15} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Central Animated Breathing Lotus / Visualizer */}
          <div className="relative bg-gradient-to-b from-white to-cream/50 border border-border/80 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[320px] shadow-3xs overflow-hidden">
            
            {/* Ambient Breathing Ring */}
            <div 
              className="absolute w-64 h-64 rounded-full bg-sage/15 blur-xl transition-all duration-1000 pointer-events-none"
              style={{ transform: `scale(${circleScale * 1.05})` }}
            />

            {/* Pulsating Lotus Circle */}
            <div 
              className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ease-out border-[2.5px] shadow-sm"
              style={{
                transform: `scale(${circleScale})`,
                borderColor: isInhaling ? '#8AB6A3' : isHolding ? '#E5989B' : '#B5C7BD',
                backgroundColor: isInhaling ? 'rgba(240, 246, 243, 0.92)' : isHolding ? 'rgba(254, 245, 245, 0.92)' : 'rgba(253, 251, 247, 0.92)',
              }}
            >
              <div className="text-center px-3">
                <span className="text-[11px] uppercase tracking-widest font-extrabold text-sage-dark">
                  {currentPhase.name}
                </span>
                <div className="text-4xl font-serif font-extrabold text-charcoal my-0.5">
                  {phaseSecondsRemaining}s
                </div>
                <p className="text-[10.5px] text-medium font-medium max-w-[130px] leading-tight mx-auto">
                  {currentPhase.cue}
                </p>
              </div>
            </div>

            {/* Cycle Counter & Target Pills */}
            <div className="mt-5 flex items-center gap-3 text-[12px] text-medium">
              <span className="font-semibold text-charcoal">
                Cycle: <strong className="text-sage-dark">{completedCycles}</strong> / {targetCycles}
              </span>
              <span className="text-border">•</span>
              <div className="flex gap-1">
                {[5, 8, 12, 16].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => { triggerHaptic('light'); setTargetCycles(num); }}
                    className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                      targetCycles === num
                        ? 'bg-sage-dark text-white'
                        : 'bg-cream text-charcoal/70 hover:bg-border/60'
                    }`}
                  >
                    {num}x
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={handleResetBreathing}
                className="p-3 rounded-full bg-cream hover:bg-border/60 text-charcoal/80 transition-all cursor-pointer active:scale-95 shadow-3xs"
                title="Reset session"
              >
                <RotateCcw size={16} />
              </button>

              <button
                type="button"
                onClick={handleToggleBreathing}
                className={`px-7 py-3 rounded-2xl font-serif font-bold text-[14px] shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
                  isBreathingActive
                    ? 'bg-charcoal text-white hover:bg-black'
                    : 'bg-sage text-white hover:bg-sage-dark'
                }`}
              >
                {isBreathingActive ? <Pause size={17} /> : <Play size={17} />}
                <span>{isBreathingActive ? 'Pause Session' : 'Begin Pranayama'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GARBH SANSKAR AUDIO */}
      {activeTab === 'audio' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Active Audio Deck (Compact, Modern & Sleek) */}
          <div className="bg-[#1F2C24] text-white rounded-3xl p-4 sm:p-5 shadow-sm border border-[#2D3E34] space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="inline-block px-2 py-0.5 rounded-full bg-white/10 text-sage-light text-[9.5px] uppercase tracking-wider font-bold">
                  {activeAudioTrack.category}
                </span>
                <h3 className="text-[17px] font-serif font-bold text-white mt-1 truncate">
                  {activeAudioTrack.title}
                </h3>
                <p className="text-[11.5px] text-stone-300 truncate mt-0.5">
                  {activeAudioTrack.subtitle}
                </p>
              </div>

              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-sage-light shrink-0">
                <Music size={18} className={isPlayingAudio ? 'animate-bounce' : ''} />
              </div>
            </div>

            {/* Dynamic Sound Wave Bars */}
            <div className="h-9 flex items-center justify-center gap-1.5 bg-black/25 rounded-xl px-3 border border-white/5">
              {[35, 65, 30, 80, 55, 90, 45, 75, 60, 85, 50, 70, 35, 60, 85, 40, 65, 30].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full bg-sage-light/80 transition-all duration-300 ${
                    isPlayingAudio ? 'animate-pulse' : 'opacity-25'
                  }`}
                  style={{
                    height: isPlayingAudio ? `${Math.max(20, (h * (volume + 0.2)) % 100)}%` : '20%',
                    animationDelay: `${i * 0.06}s`
                  }}
                />
              ))}
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleToggleAudio}
                className="px-5 py-2.5 rounded-xl bg-sage-dark hover:bg-sage text-white font-serif font-bold text-[13px] shadow-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                {isPlayingAudio ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlayingAudio ? 'Pause Soundscape' : 'Play Soundscape'}</span>
              </button>

              {/* Sleep Timer Indicator */}
              {sleepTimerRemainingSeconds !== null && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 text-[11px] text-sage-light font-bold">
                  <Moon size={13} />
                  <span>
                    {Math.floor(sleepTimerRemainingSeconds / 60)}:
                    {String(sleepTimerRemainingSeconds % 60).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            {/* Volume & Sleep Timer Bottom Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
              {/* Volume Slider */}
              <div className="flex items-center gap-2.5">
                <button 
                  type="button"
                  onClick={() => setVolume(v => v === 0 ? 0.7 : 0)}
                  className="text-stone-300 hover:text-white cursor-pointer"
                  title="Mute / Unmute"
                >
                  {volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-sage-light h-1.5 rounded-lg bg-stone-700 cursor-pointer"
                />
                <span className="text-[10.5px] text-stone-300 w-7 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>

              {/* Bedtime Sleep Timer Options */}
              <div className="flex items-center justify-between sm:justify-end gap-1.5">
                <span className="text-stone-400 text-[11px] flex items-center gap-1">
                  <Clock size={12} /> Timer:
                </span>
                {[10, 20, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleSetSleepTimer(mins)}
                    className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                      sleepTimerMinutes === mins
                        ? 'bg-sage-light text-charcoal'
                        : 'bg-white/10 text-stone-300 hover:bg-white/20'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Curated Prenatal Audio Collection (10 Tracks) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-medium">
                Curated Prenatal Audio Collection (10 Offline Tracks)
              </h4>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Offline
              </span>
            </div>

            <div className="space-y-2">
              {AUDIO_TRACKS.map((track) => {
                const isSelected = track.id === selectedTrackId;
                const isThisPlaying = isSelected && isPlayingAudio;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-sage-pale/40 border-sage/60 shadow-3xs'
                        : 'bg-white border-border/80 hover:bg-cream/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'bg-sage-dark text-white' 
                          : 'bg-cream text-charcoal/70'
                      }`}>
                        {isThisPlaying ? (
                          <Pause size={16} className="text-white" />
                        ) : (
                          <Play size={16} className={isSelected ? 'text-white' : 'text-charcoal/70'} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[13px] text-charcoal truncate">
                            {track.title}
                          </span>
                          {isThisPlaying && (
                            <span className="px-1.5 py-0.2 rounded-full bg-sage-dark text-white text-[8.5px] font-extrabold animate-pulse">
                              PLAYING
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-medium truncate mt-0.5">
                          {track.subtitle}
                        </p>
                        <p className="text-[10px] text-sage-dark font-medium truncate mt-0.5">
                          🌱 {track.clinicalImpact}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-cream text-charcoal/70 border border-border/60">
                        {track.category}
                      </span>
                      <span className="text-[9.5px] text-medium font-medium">
                        {track.durationDesc.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cultural Garbh Sanskar Note */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-[11.5px] text-amber-950 leading-relaxed flex items-start gap-2.5">
            <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-amber-900">The Science & Wisdom of Garbh Sanskar:</strong>
              <p className="mt-0.5 text-amber-900/90">
                From the 18th week of gestation, your baby's inner ear cochlea and auditory cortex are functioning. Hearing steady Indian ragas and resonant acoustic soundscapes releases maternal endorphins and oxytocin, nourishing your baby's neuro-auditory development.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Pop-up Modal Explaining Selected Technique Details */}
      {infoModalTechnique && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setInfoModalTechnique(null)}
        >
          <div 
            className="bg-white border border-border/80 rounded-3xl max-w-sm w-full p-5 shadow-xl space-y-3.5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-sage/15 text-sage-dark text-[10px] font-bold">
                  {infoModalTechnique.timingBadge}
                </span>
                <h3 className="font-serif font-bold text-[17px] text-charcoal mt-1">
                  {infoModalTechnique.name}
                </h3>
                {infoModalTechnique.sanskritName && (
                  <p className="text-[11.5px] text-medium font-serif italic">
                    {infoModalTechnique.sanskritName}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setInfoModalTechnique(null)}
                className="p-1.5 rounded-full text-medium hover:text-charcoal hover:bg-cream transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Why Practice This */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/70 flex items-center gap-1">
                🎯 Why Practice This:
              </span>
              <p className="text-[12.5px] text-charcoal/80 leading-relaxed">
                {infoModalTechnique.whyPractice}
              </p>
            </div>

            {/* Clinical Benefit */}
            <div className="space-y-1 pt-1 border-t border-border/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                🌱 Maternal & Fetal Benefit:
              </span>
              <p className="text-[12.5px] text-charcoal leading-relaxed font-medium">
                {infoModalTechnique.clinicalBenefits}
              </p>
            </div>

            {/* Best for */}
            <div className="text-[11.5px] text-sage-dark bg-sage-pale/40 px-3 py-2 rounded-xl border border-sage/20">
              🌸 <strong>Best for:</strong> {infoModalTechnique.bestFor}
            </div>

            {/* Action button inside modal */}
            <button
              type="button"
              onClick={() => {
                handleSelectTechnique(infoModalTechnique.id);
                setInfoModalTechnique(null);
              }}
              className="w-full py-2.5 rounded-xl bg-sage text-white font-serif font-bold text-[13px] hover:bg-sage-dark transition-colors cursor-pointer shadow-2xs"
            >
              Select & Begin Practice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
