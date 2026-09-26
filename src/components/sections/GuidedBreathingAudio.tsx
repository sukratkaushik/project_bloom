import React, { useState, useEffect, useRef, useId } from 'react';
import { 
  Wind, Music, Play, Pause, RotateCcw, Volume2, 
  VolumeX, Clock, Sparkles, CheckCircle2, ShieldCheck, 
  Heart, Download, Info, Moon, Sun, ArrowLeft
} from 'lucide-react';
import { triggerHaptic } from '../../utils/nativeBridge';

type BreathingTechniqueId = 'anulom-vilom' | '4-7-8' | 'box' | 'labor-wave';

interface BreathingTechnique {
  id: BreathingTechniqueId;
  name: string;
  sanskritName?: string;
  tagline: string;
  purpose: string;
  bestFor: string;
  phases: { name: string; durationSec: number; cue: string }[];
}

const BREATHING_TECHNIQUES: BreathingTechnique[] = [
  {
    id: 'anulom-vilom',
    name: 'Anulom Vilom (Nadi Shodhana)',
    sanskritName: 'अनुलोम विलोम प्राणायाम',
    tagline: 'Balanced Alternate Flow',
    purpose: 'Harmonizes the autonomic nervous system, cools body heat, and stabilizes prenatal blood pressure.',
    bestFor: 'Morning vitality, reducing pregnancy palpitations, and emotional grounding.',
    phases: [
      { name: 'Inhale', durationSec: 4, cue: 'Gentle inhale through left nostril...' },
      { name: 'Retain', durationSec: 4, cue: 'Soft pause, calm heart...' },
      { name: 'Exhale', durationSec: 4, cue: 'Slow exhale through right nostril...' },
    ]
  },
  {
    id: '4-7-8',
    name: '4-7-8 Restful Sleep Breath',
    tagline: 'Deep Parasympathetic Relaxation',
    purpose: 'Acts as a natural nervous system sedative to quiet night thoughts and soothe restlessness.',
    bestFor: 'Pregnancy insomnia, third-trimester restlessness, and bedtime relaxation.',
    phases: [
      { name: 'Inhale', durationSec: 4, cue: 'Breathe in quietly through your nose...' },
      { name: 'Hold', durationSec: 7, cue: 'Gently hold, relax your shoulders...' },
      { name: 'Exhale', durationSec: 8, cue: 'Release whooshing breath fully through mouth...' },
    ]
  },
  {
    id: 'box',
    name: 'Sama Vritti (Box Breathing)',
    sanskritName: 'समवृत्ति प्राणायाम',
    tagline: 'Equal Flow Clarity',
    purpose: 'Regulates heart rate variability and brings instant clinical composure.',
    bestFor: 'Before ultrasound scans, OPD doctor checkups, or sudden moments of worry.',
    phases: [
      { name: 'Inhale', durationSec: 4, cue: 'Slow, steady inhale into belly...' },
      { name: 'Hold Full', durationSec: 4, cue: 'Gentle stillness, belly relaxed...' },
      { name: 'Exhale', durationSec: 4, cue: 'Smooth, even exhale...' },
      { name: 'Hold Empty', durationSec: 4, cue: 'Soft pause before next breath...' },
    ]
  },
  {
    id: 'labor-wave',
    name: 'Labor Surge Wave Breath',
    tagline: 'Contraction & Braxton Hicks Ease',
    purpose: 'Maximizes maternal oxygenation and prevents hyperventilation during uterine surges.',
    bestFor: 'Braxton Hicks practice, early labor waves, and hip tension release.',
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
  category: 'Garbh Sanskar' | 'Yoga & Soundscape' | 'Sleep & Rest';
  durationDesc: string;
  synthType: 'tanpura' | 'singingbowl' | 'affirmation' | 'rain';
  description: string;
}

const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'garbh-kalyan',
    title: 'Garbh Sanskar: Kalyan Raga Drone',
    subtitle: 'Vedic acoustic resonance for fetal serenity',
    category: 'Garbh Sanskar',
    durationDesc: 'Infinite procedural drone',
    synthType: 'tanpura',
    description: 'Ancient evening Kalyan raga harmonics with deep Indian tanpura drone. Studies show fetal auditory perception responds positively to low, warm harmonic frequencies.'
  },
  {
    id: 'prenatal-bowl',
    title: 'Tibetan Singing Bowl & 432 Hz Harmony',
    subtitle: 'Pelvic ease & restorative frequency',
    category: 'Yoga & Soundscape',
    durationDesc: 'Cyclic harmonic bell & warm pad',
    synthType: 'singingbowl',
    description: 'Resonant acoustic chimes tuned to 432 Hz, relieving lower back tension and promoting deep pelvic floor relaxation during prenatal stretches.'
  },
  {
    id: 'womb-connection',
    title: 'Maternal Alpha-Wave Connection',
    subtitle: 'Heart-to-womb bonding resonance',
    category: 'Garbh Sanskar',
    durationDesc: 'Gentle harmonic pulse (10 Hz alpha)',
    synthType: 'affirmation',
    description: 'Soft harmonic oscillations designed to gently induce relaxing alpha brainwaves, creating a serene mental cocoon for mother and developing baby.'
  },
  {
    id: 'monsoon-rain',
    title: 'Trimester 3 Monsoon Rain & Pink Noise',
    subtitle: 'Restorative sleep soundscape',
    category: 'Sleep & Rest',
    durationDesc: 'Continuous soothing rainfall',
    synthType: 'rain',
    description: 'Acoustically smoothed pink noise resembling a gentle Indian monsoon shower. Masks ambient household noises and calms restless night awakenings.'
  }
];

export const GuidedBreathingAudio: React.FC = () => {
  // Tab state: 'breathing' or 'audio'
  const [activeTab, setActiveTab] = useState<'breathing' | 'audio'>('breathing');

  // Breathing State
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<BreathingTechniqueId>('anulom-vilom');
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
  const [isCachedOffline, setIsCachedOffline] = useState(true);

  // Audio synthesis Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<{ [key: string]: any }>({});
  const timerIntervalRef = useRef<any>(null);

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
        // Indian Tanpura chord: C#3 (138.59 Hz), G#3 (207.65 Hz), C#4 (277.18 Hz)
        const freqs = [138.59, 207.65, 277.18, 415.30];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800 + idx * 200, ctx.currentTime);

          // Subtle natural detuning & beating
          osc.detune.setValueAtTime((idx - 1.5) * 4, ctx.currentTime);

          gain.gain.setValueAtTime(0.15 / (idx + 1), ctx.currentTime);

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

          // LFO for singing bowl acoustic vibration
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
    if (isPlayingAudio) {
      startSynthesis(track.synthType);
    }
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
          // Advance phase
          const nextPhaseIdx = (currentPhaseIndex + 1) % currentTechnique.phases.length;
          setCurrentPhaseIndex(nextPhaseIdx);
          triggerHaptic('light');

          // If finished a full cycle
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
    if (!isBreathingActive) {
      setIsBreathingActive(true);
    } else {
      setIsBreathingActive(false);
    }
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

  // Calculate breathing circle visual scale
  const isHolding = currentPhase.name.toLowerCase().includes('hold') || currentPhase.name.toLowerCase().includes('retain');
  const isInhaling = currentPhase.name.toLowerCase().includes('in');
  const totalPhaseSec = currentPhase.durationSec;
  const progressRatio = Math.max(0, Math.min(1, (totalPhaseSec - phaseSecondsRemaining) / totalPhaseSec));

  let circleScale = 1.0;
  if (isInhaling) {
    circleScale = 1.0 + progressRatio * 0.35;
  } else if (isHolding) {
    circleScale = 1.35;
  } else {
    circleScale = 1.35 - progressRatio * 0.35;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sandalwood-pale via-rose-50/50 to-sage-pale/40 border border-sage-soft/30 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-sage-dark text-white flex items-center justify-center shadow-sm">
              <Wind size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-semibold text-earth-dark flex items-center gap-2">
                Pranayama & Garbh Sanskar
              </h1>
              <p className="text-xs text-earth-subtle mt-0.5">
                Mindful maternal breathing & offline acoustic bonding for you and your baby
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-medium">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>100% Offline</span>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex p-1 mt-6 bg-earth-light/60 rounded-2xl border border-earth-soft">
          <button
            onClick={() => { triggerHaptic('light'); setActiveTab('breathing'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'breathing'
                ? 'bg-white text-earth-dark shadow-sm'
                : 'text-earth-muted hover:text-earth-dark'
            }`}
          >
            <Wind size={16} />
            <span>Guided Breathing</span>
          </button>
          <button
            onClick={() => { triggerHaptic('light'); setActiveTab('audio'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'audio'
                ? 'bg-white text-earth-dark shadow-sm'
                : 'text-earth-muted hover:text-earth-dark'
            }`}
          >
            <Music size={16} />
            <span>Garbh Sanskar Audio</span>
          </button>
        </div>
      </div>

      {/* TAB 1: GUIDED BREATHING */}
      {activeTab === 'breathing' && (
        <div className="space-y-6">
          {/* Technique Selector Pill Carousel */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {BREATHING_TECHNIQUES.map((tech) => {
              const isSelected = tech.id === selectedTechniqueId;
              return (
                <button
                  key={tech.id}
                  onClick={() => handleSelectTechnique(tech.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-medium whitespace-nowrap transition-all flex flex-col items-start gap-0.5 border ${
                    isSelected
                      ? 'bg-sage-dark text-white border-sage-dark shadow-sm'
                      : 'bg-white text-earth-muted border-earth-soft hover:bg-earth-pale'
                  }`}
                >
                  <span className="font-semibold">{tech.name.split(' ')[0]}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-sage-light' : 'text-earth-subtle'}`}>
                    {tech.tagline}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Technique Card Info */}
          <div className="bg-white border border-earth-soft rounded-2xl p-4 shadow-sm text-xs text-earth-muted flex items-start gap-3">
            <Info size={16} className="text-sage-dark shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-earth-dark">
                {currentTechnique.name} {currentTechnique.sanskritName && `(${currentTechnique.sanskritName})`}
              </p>
              <p className="mt-1 leading-relaxed">{currentTechnique.purpose}</p>
              <p className="mt-1 text-emerald-700 font-medium">🌸 Best for: {currentTechnique.bestFor}</p>
            </div>
          </div>

          {/* Central Animated Breathing Lotus / Visualizer */}
          <div className="relative bg-gradient-to-b from-white to-sandalwood-pale/30 border border-sage-soft/40 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[360px] shadow-sm overflow-hidden">
            {/* Soft Ambient Halo */}
            <div 
              className="absolute w-72 h-72 rounded-full bg-sage-soft/20 blur-2xl transition-all duration-1000 pointer-events-none"
              style={{ transform: `scale(${circleScale * 1.1})` }}
            />

            {/* Pulsating Lotus Circle */}
            <div 
              className="relative w-56 h-56 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ease-out border-2 shadow-inner"
              style={{
                transform: `scale(${circleScale})`,
                borderColor: isInhaling ? '#8FA89B' : isHolding ? '#E89C9E' : '#C5D0C9',
                backgroundColor: isInhaling ? 'rgba(235, 242, 238, 0.85)' : isHolding ? 'rgba(253, 242, 242, 0.85)' : 'rgba(253, 251, 247, 0.85)',
              }}
            >
              <div className="text-center px-4">
                <span className="text-xs uppercase tracking-widest font-bold text-sage-dark/80">
                  {currentPhase.name}
                </span>
                <div className="text-5xl font-serif font-bold text-earth-dark my-1">
                  {phaseSecondsRemaining}s
                </div>
                <p className="text-[11px] text-earth-subtle font-medium max-w-[140px] leading-tight mx-auto">
                  {currentPhase.cue}
                </p>
              </div>
            </div>

            {/* Cycle Progress Tracker */}
            <div className="mt-8 flex items-center gap-4 text-xs text-earth-muted">
              <span className="font-medium">
                Cycle: <strong className="text-earth-dark">{completedCycles}</strong> / {targetCycles}
              </span>
              <span className="text-earth-soft">•</span>
              <div className="flex gap-1">
                {[5, 8, 12, 16].map((num) => (
                  <button
                    key={num}
                    onClick={() => { triggerHaptic('light'); setTargetCycles(num); }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                      targetCycles === num
                        ? 'bg-sage-dark text-white'
                        : 'bg-earth-light text-earth-muted hover:bg-earth-soft'
                    }`}
                  >
                    {num}x
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={handleResetBreathing}
                className="p-3 rounded-full bg-earth-light text-earth-muted hover:text-earth-dark hover:bg-earth-soft transition-all"
                title="Reset session"
              >
                <RotateCcw size={18} />
              </button>

              <button
                onClick={handleToggleBreathing}
                className={`px-8 py-3.5 rounded-full font-serif font-semibold text-base shadow-md flex items-center gap-2.5 transition-all transform active:scale-95 ${
                  isBreathingActive
                    ? 'bg-earth-dark text-white hover:bg-black'
                    : 'bg-sage-dark text-white hover:bg-sage-dark/90'
                }`}
              >
                {isBreathingActive ? <Pause size={18} /> : <Play size={18} />}
                <span>{isBreathingActive ? 'Pause Session' : 'Begin Pranayama'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GARBH SANSKAR AUDIO */}
      {activeTab === 'audio' && (
        <div className="space-y-6">
          {/* Active Audio Player Deck */}
          <div className="bg-gradient-to-br from-earth-dark via-stone-900 to-sage-dark/90 text-white rounded-3xl p-6 shadow-md border border-stone-700">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-sandalwood-pale text-[10px] uppercase tracking-wider font-semibold">
                  {AUDIO_TRACKS.find(t => t.id === selectedTrackId)?.category}
                </span>
                <h3 className="text-xl font-serif font-bold text-white mt-2">
                  {AUDIO_TRACKS.find(t => t.id === selectedTrackId)?.title}
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  {AUDIO_TRACKS.find(t => t.id === selectedTrackId)?.subtitle}
                </p>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-sandalwood-pale">
                <Music size={20} className={isPlayingAudio ? 'animate-bounce' : ''} />
              </div>
            </div>

            {/* Sound Wave Animation Placeholder */}
            <div className="my-6 h-12 flex items-center justify-center gap-1.5 bg-black/20 rounded-2xl px-4 border border-white/5">
              {[40, 70, 30, 85, 60, 95, 45, 80, 65, 90, 50, 75, 35, 60, 90, 40].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full bg-sandalwood-pale/80 transition-all duration-300 ${
                    isPlayingAudio ? 'animate-pulse' : 'opacity-30'
                  }`}
                  style={{
                    height: isPlayingAudio ? `${Math.max(15, (h * (volume + 0.2)) % 100)}%` : '20%',
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>

            {/* Player Controls & Volume */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {/* Play / Pause button */}
                <button
                  onClick={handleToggleAudio}
                  className="px-6 py-3 rounded-full bg-sandalwood-pale text-earth-dark font-serif font-bold text-sm shadow-md flex items-center gap-2 hover:bg-white active:scale-95 transition-all"
                >
                  {isPlayingAudio ? <Pause size={18} /> : <Play size={18} />}
                  <span>{isPlayingAudio ? 'Pause Sound' : 'Play Soundscape'}</span>
                </button>

                {/* Sleep Timer Indicator */}
                {sleepTimerRemainingSeconds !== null && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-xs text-sandalwood-pale">
                    <Moon size={14} />
                    <span>
                      {Math.floor(sleepTimerRemainingSeconds / 60)}:
                      {String(sleepTimerRemainingSeconds % 60).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 pt-2">
                <button 
                  onClick={() => setVolume(v => v === 0 ? 0.7 : 0)}
                  className="text-stone-300 hover:text-white"
                >
                  {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-sandalwood-pale h-1.5 rounded-lg bg-stone-700 cursor-pointer"
                />
                <span className="text-[11px] text-stone-300 w-8 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>

            {/* Sleep Timer Selector */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-stone-400 flex items-center gap-1">
                <Clock size={13} />
                <span>Bedtime Sleep Timer:</span>
              </span>
              <div className="flex gap-1.5">
                {[5, 10, 15, 30].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleSetSleepTimer(mins)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      sleepTimerMinutes === mins
                        ? 'bg-sandalwood-pale text-earth-dark font-bold'
                        : 'bg-white/10 text-stone-300 hover:bg-white/20'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Track Catalog List */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-earth-muted px-1">
              Curated Prenatal Audio Collection (100% Offline)
            </h4>

            {AUDIO_TRACKS.map((track) => {
              const isSelected = track.id === selectedTrackId;
              return (
                <div
                  key={track.id}
                  onClick={() => handleSelectTrack(track)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-sage-pale/40 border-sage-soft shadow-sm'
                      : 'bg-white border-earth-soft hover:bg-earth-pale'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-sage-dark text-white' : 'bg-earth-light text-earth-muted'
                    }`}>
                      <Music size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-earth-dark">{track.title}</span>
                        {isSelected && isPlayingAudio && (
                          <span className="px-2 py-0.5 rounded-full bg-sage-dark text-white text-[9px] font-bold animate-pulse">
                            PLAYING
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-earth-subtle mt-0.5">{track.description}</p>
                      <span className="inline-block mt-2 text-[10px] font-medium text-sage-dark bg-sage-soft/30 px-2 py-0.5 rounded-md">
                        {track.durationDesc}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 size={11} className="text-emerald-600" />
                      <span>Saved</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cultural Garbh Sanskar Note */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
            <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">The Wisdom of Garbh Sanskar:</strong>
              <p className="mt-1">
                From the 18th week of gestation, your baby's inner ear bones and cochlea are fully formed. Listening to steady acoustic frequencies and peaceful Indian ragas releases maternal endorphins and oxytocin, directly nourishing your baby's developing nervous system.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
