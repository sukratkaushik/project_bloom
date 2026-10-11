import React, { useState, useEffect } from 'react';
import { syncEngine } from '../../syncEngine';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Heart, 
  Pencil, 
  Plus, 
  Sparkles, 
  Share2, 
  Lock, 
  Radio, 
  CheckCircle2, 
  RefreshCw,
  Eye,
  Edit3
} from 'lucide-react';
import { usePlanner } from '../../store';
import { Paywall } from '../Paywall';
import { DEV_TASKS, MED_TASKS, PREP_TASKS, FIN_TASKS, DEADLINE_TASKS, VACC_TASKS, POSTPARTUM_TASKS } from '../../data';
import { PartnerModal } from '../mobile/PartnerModal';
import { triggerHaptic } from '../../utils/nativeBridge';

export const PartnerSync: React.FC = () => {
  const { state, updateState } = usePlanner();
  const [hostId, setHostId] = useState<string>('');
  const [partnerIdInput, setPartnerIdInput] = useState('');
  const [status, setStatus] = useState<string>('Disconnected');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'invite' | 'join'>('invite');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  useEffect(() => {
    syncEngine.onStatusChange = (newStatus: string) => {
      setStatus(newStatus);
    };

    syncEngine.onStateReceived = (newState: any) => {
      updateState(newState);
    };

    return () => {
      syncEngine.onStatusChange = undefined;
      syncEngine.onStateReceived = undefined;
    };
  }, [updateState]);

  useEffect(() => {
    // Whenever our local state changes, broadcast it to the partner
    if (status.includes('Connected')) {
      syncEngine.broadcastState(state);
    }
  }, [state, status]);

  const handleHost = () => {
    triggerHaptic('medium');
    syncEngine.initHost((id) => setHostId(id));
  };

  const handleConnect = () => {
    if (partnerIdInput.trim()) {
      triggerHaptic('medium');
      syncEngine.connectToPartner(partnerIdInput.trim());
    }
  };

  const handleDisconnect = () => {
    triggerHaptic('warning');
    syncEngine.disconnect();
    setHostId('');
    setPartnerIdInput('');
  };

  const copyToClipboard = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(hostId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ALL_SECTIONS = [
    {
      id: 'tracking',
      title: 'Daily Tracking',
      desc: 'Share kicks, contractions, vitals, mood & fluids',
      items: [
        { key: 'kickcounter', label: 'Kick Counter', desc: 'Real-time fetal movement counts' },
        { key: 'contractions', label: 'Contraction Timer', desc: 'Labor surges and 5-1-1 tracking' },
        { key: 'vitals', label: 'Vitals & BP', desc: 'Blood pressure, weight & sugar logs' },
        { key: 'mood', label: 'Mood & Energy', desc: 'Daily emotional check-ins' },
        { key: 'hydration', label: 'Hydration', desc: 'Water intake logs' },
        { key: 'nutrition', label: 'Supplements & Diet', desc: 'Prenatal vitamins & meal logs' },
        { key: 'symptoms', label: 'Symptom Logger', desc: 'Nausea, fatigue & cramps' },
      ]
    },
    {
      id: 'smart_tools',
      title: 'Smart Guidance',
      desc: 'Shared baby names, AI chats & meal scans',
      items: [
        { key: 'babynames', label: 'Baby Names Finder', desc: 'Shortlisted & favorite names' },
        { key: 'askourpregnancy', label: 'Bloom AI Guidance', desc: 'Obstetric AI chat history' },
        { key: 'foodscanner', label: 'AI Food Guide', desc: 'Scanned meals and nutrient breakdowns' }
      ]
    },
    {
      id: 'milestones',
      title: 'Milestones & Planning',
      desc: 'Week-by-week timelines, nursery gear & budget',
      items: [
        { key: 'dev', label: 'Fetal Development', desc: 'Organogenesis progress', tasks: Object.values(DEV_TASKS).flat() },
        { key: 'prep', label: 'Nursery & Baby Prep', desc: 'Baby clothes & nursery checklist', tasks: Object.values(PREP_TASKS).flat() },
        { key: 'finance', label: 'Delivery Cost Planner', desc: 'Hospital delivery budget & insurance', tasks: FIN_TASKS },
        { key: 'deadlines', label: 'Scan Deadlines', desc: 'Ultrasound dates & visits', tasks: DEADLINE_TASKS },
      ]
    },
    {
      id: 'medical_gov',
      title: 'Medical & Govt Schemes',
      desc: 'Doctor appointments, vaccines & maternity welfare',
      items: [
        { key: 'medical', label: 'Vaccines & Schedule', desc: 'Tdap, tetanus & lab tests', tasks: Object.values(MED_TASKS).flat() },
        { key: 'schemes', label: 'Govt Maternity Schemes', desc: 'PMMVY & JSY benefit milestones', tasks: VACC_TASKS }
      ]
    },
    {
      id: 'labor_postpartum',
      title: 'Labor & Postpartum',
      desc: 'Hospital bag, birth preferences & recovery',
      items: [
        { key: 'readiness', label: 'Labor Readiness', desc: 'Bishop score & cervical prep' },
        { key: 'hospitalbag', label: 'Hospital Bag Checklist', desc: 'Items packed for hospital delivery' },
        { key: 'birthplan', label: 'Birth Plan Builder', desc: 'Birth choices & support person role' },
        { key: 'postpartum', label: 'Postpartum Healing', desc: 'Fourth trimester recovery & care', tasks: POSTPARTUM_TASKS },
      ]
    },
    {
      id: 'notes_journal',
      title: 'Bump Journal & Notes',
      desc: 'Private diary entries & doctor questions',
      items: [
        { key: 'notes', label: 'Bump Journal', desc: 'Personal ultrasound notes & feelings' },
      ]
    }
  ];

  const handleToggleTaskExclusion = (taskId: string) => {
    triggerHaptic('selection');
    const perms = (state.syncPermissions || {}) as Record<string, any>;
    const excluded = perms.excludedTaskIds || [];

    let newExcluded;
    if (excluded.includes(taskId)) {
      newExcluded = excluded.filter(id => id !== taskId);
    } else {
      newExcluded = [...excluded, taskId];
    }

    updateState({
      syncPermissions: { ...perms, excludedTaskIds: newExcluded } as any
    });
  };

  const isConnected = status.includes('Connected');
  const isPending = status.includes('Waiting') || status.includes('Connecting') || status.includes('Initializing');
  const syncMode = state.syncPermissions?.mode || 'read';

  return (
    <Paywall featureName="PartnerSync">
      <div className="space-y-4 animate-in fade-in duration-200 max-w-lg mx-auto pb-10">
        
        {/* 1. Sleek Brand Header Hero */}
        <div className="bg-gradient-to-br from-cream via-cream/50 to-tulsi-light/30 border border-border/80 rounded-3xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-sage-pale text-sage-dark flex items-center justify-center border border-sage/20 shrink-0">
                <Users size={20} />
              </div>
              <div>
                <h2 className="font-serif text-[22px] font-medium text-charcoal leading-tight">
                  Partner Sync
                </h2>
                <p className="text-[11.5px] text-medium font-sans">
                  Two devices, one shared journey
                </p>
              </div>
            </div>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              isConnected
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                : isPending
                ? 'bg-amber-100 text-amber-900 border border-amber-300/60'
                : 'bg-white/80 text-medium border border-border/70'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : isPending ? 'bg-amber-500 animate-pulse' : 'bg-stone-300'}`} />
              <span>{isConnected ? 'Active' : isPending ? 'Connecting' : 'Standby'}</span>
            </span>
          </div>

          <p className="text-[12.5px] text-charcoal/85 leading-relaxed font-sans">
            Connect securely with your partner to share baby kicks, doctor appointments, scan memories, and birth plans in real time.
          </p>

          <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-[11px] text-sage-dark font-medium">
            <ShieldCheck size={14} className="shrink-0 text-sage" />
            <span>End-to-End Encrypted • Peer-to-peer WebRTC • 100% Private</span>
          </div>
        </div>

        {/* 2. Partner Profile Card */}
        <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <Heart size={18} className="fill-rose-500/20" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-charcoal text-[14px] truncate">
                  {state.partner?.name || 'Partner Profile'}
                </span>
                {state.partner?.relationship && (
                  <span className="text-[10px] font-bold text-sage-dark bg-sage-pale px-2 py-0.5 rounded-full shrink-0">
                    {state.partner.relationship}
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-medium truncate mt-0.5">
                {state.partner?.phone 
                  ? `WhatsApp: ${state.partner.phone}` 
                  : state.partner?.name 
                  ? 'Ready to pair via sync code' 
                  : 'Add your spouse or birth partner'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsPartnerModalOpen(true);
            }}
            className="px-3 py-1.5 bg-cream hover:bg-black/5 text-charcoal font-semibold text-[11.5px] rounded-xl border border-border/80 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {state.partner?.name ? (
              <>
                <Pencil size={12} />
                <span>Edit</span>
              </>
            ) : (
              <>
                <Plus size={13} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>

        {/* 3. Interactive Connection Hub */}
        {isConnected ? (
          /* Connected State Card */
          <div className="bg-white border border-emerald-200/80 rounded-3xl p-5 shadow-2xs text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h3 className="font-serif text-[18px] font-medium text-charcoal">
                Securely Connected
              </h3>
              <p className="text-[12.5px] text-medium mt-1 max-w-xs mx-auto">
                Sync is actively streaming. Any milestone, kick, or symptom updated on either phone will reflect instantly.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDisconnect}
              className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[13px] font-semibold transition-all cursor-pointer shadow-2xs"
            >
              Disconnect Session
            </button>
          </div>
        ) : (
          /* Pairing Tabs: Invite vs Join */
          <div className="bg-white border border-border/80 rounded-3xl p-5 shadow-2xs space-y-4">
            {/* Segmented Switcher */}
            <div className="flex bg-cream/70 p-1 rounded-2xl border border-border/60">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('invite');
                }}
                className={`flex-1 py-2 rounded-xl text-[12.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'invite'
                    ? 'bg-white text-charcoal shadow-2xs'
                    : 'text-medium hover:text-charcoal'
                }`}
              >
                <Share2 size={14} />
                <span>Share My Code</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('join');
                }}
                className={`flex-1 py-2 rounded-xl text-[12.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'join'
                    ? 'bg-white text-charcoal shadow-2xs'
                    : 'text-medium hover:text-charcoal'
                }`}
              >
                <Lock size={14} />
                <span>Enter Code</span>
              </button>
            </div>

            {/* Tab 1: Share My Code */}
            {activeTab === 'invite' && (
              <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                <div className="text-center space-y-1">
                  <h4 className="font-serif text-[16px] text-charcoal font-medium">
                    Generate Your Pairing Code
                  </h4>
                  <p className="text-[12px] text-medium leading-relaxed">
                    Create a private connection channel and share the code with your partner.
                  </p>
                </div>

                {hostId ? (
                  <div className="space-y-3 bg-cream/40 p-4 rounded-2xl border border-border/70">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-sage-dark block text-center">
                      Your Unique Sync Code
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white border border-border/80 rounded-xl px-3 py-2.5 font-mono text-[14px] text-charcoal text-center tracking-wider font-semibold select-all">
                        {hostId}
                      </div>
                      <button
                        type="button"
                        onClick={copyToClipboard}
                        className="px-3.5 py-2.5 bg-sage text-white rounded-xl hover:bg-sage-dark transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                        title="Copy code"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>

                    {state.partner?.phone && (
                      <a
                        href={`https://wa.me/${state.partner.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                          `Hi ${state.partner.name || 'there'}! 🌸 Here is my partner sync code for Our Pregnancy: ${hostId}\n\nOpen your app, go to Partner Sync, enter this code, and our pregnancy milestones and tasks will sync in real time! 💕`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[12.5px] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <MessageCircle size={15} />
                        <span>Send Code to {state.partner.name} on WhatsApp</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="w-full py-2 text-rose-600 hover:text-rose-700 text-[12px] font-semibold transition-colors cursor-pointer"
                    >
                      Cancel / Stop Hosting
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleHost}
                      className="w-full py-3.5 bg-sage hover:bg-sage-dark text-white rounded-xl font-semibold text-[14px] shadow-sm hover:shadow active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles size={16} />
                      <span>Generate Sync Code</span>
                    </button>
                    <p className="text-[11px] text-light text-center">
                      Safe & private. No central cloud servers store your real-time sync packets.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Enter Partner's Code */}
            {activeTab === 'join' && (
              <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                <div className="text-center space-y-1">
                  <h4 className="font-serif text-[16px] text-charcoal font-medium">
                    Join Your Partner's Session
                  </h4>
                  <p className="text-[12px] text-medium leading-relaxed">
                    Paste the 6-letter sync code shared by your partner below to link both devices.
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={partnerIdInput}
                    onChange={(e) => setPartnerIdInput(e.target.value)}
                    placeholder="e.g. bloom-p2p-abc123"
                    className="w-full px-4 py-3 bg-white border border-border/80 rounded-xl font-mono text-[14px] text-charcoal text-center tracking-wider focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all placeholder:text-muted/60"
                  />

                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={!partnerIdInput.trim() || isPending}
                    className="w-full py-3.5 bg-charcoal hover:bg-charcoal/90 text-white rounded-xl font-semibold text-[14px] shadow-sm hover:shadow active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Users size={16} />
                        <span>Connect to Partner</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Sharing Preferences ("What to Share") */}
        <div className="bg-white border border-border/80 rounded-3xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-[18px] text-charcoal font-medium">
                Sharing Preferences
              </h3>
              <p className="text-[12px] text-medium mt-0.5">
                Control what data is mirrored to your partner's device
              </p>
            </div>

            <span className="text-[11px] font-bold text-sage-dark bg-sage-pale px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
              {syncMode === 'read' ? 'View Only' : 'Full Access'}
            </span>
          </div>

          {/* Access Mode Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-cream/60 rounded-2xl border border-border/70">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                const perms = state.syncPermissions || {};
                updateState({ syncPermissions: { ...perms, mode: 'read' } as any });
              }}
              className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
                syncMode === 'read'
                  ? 'bg-white border border-sage shadow-2xs text-charcoal'
                  : 'text-medium hover:text-charcoal'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-[12.5px]">
                <Eye size={14} className={syncMode === 'read' ? 'text-sage' : 'text-light'} />
                <span>Read-Only</span>
              </div>
              <p className="text-[10.5px] text-medium mt-1 leading-tight">
                Partner can view synced logs, but cannot edit.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                const perms = state.syncPermissions || {};
                updateState({ syncPermissions: { ...perms, mode: 'edit' } as any });
              }}
              className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
                syncMode === 'edit'
                  ? 'bg-white border border-sage shadow-2xs text-charcoal'
                  : 'text-medium hover:text-charcoal'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-[12.5px]">
                <Edit3 size={14} className={syncMode === 'edit' ? 'text-sage' : 'text-light'} />
                <span>Full Access</span>
              </div>
              <p className="text-[10.5px] text-medium mt-1 leading-tight">
                Partner can freely interact and update tasks.
              </p>
            </button>
          </div>

          {/* Category Cards with Sleek Toggle Pills */}
          <div className="space-y-3 pt-1">
            {ALL_SECTIONS.map((section) => (
              <div key={section.id} className="border border-border/70 rounded-2xl overflow-hidden bg-cream/20">
                {/* Section Header */}
                <div className="px-3.5 py-2.5 bg-cream/50 border-b border-border/50 flex items-center justify-between">
                  <div>
                    <h5 className="font-serif text-[13.5px] font-bold text-charcoal">
                      {section.title}
                    </h5>
                    <p className="text-[11px] text-medium">
                      {section.desc}
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-border/40">
                  {section.items.map((item) => {
                    const isChecked = state.syncPermissions ? (state.syncPermissions as any)[item.key] !== false : true;
                    const isExpanded = expandedCategory === item.key;

                    return (
                      <div key={item.key} className="p-3 bg-white hover:bg-cream/20 transition-colors">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-charcoal text-[13px] block leading-tight">
                              {item.label}
                            </span>
                            <span className="text-[11px] text-medium block leading-tight mt-0.5">
                              {item.desc}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Sleek Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic('selection');
                                const perms = state.syncPermissions || {};
                                updateState({
                                  syncPermissions: { ...perms, [item.key]: !isChecked } as any
                                });
                              }}
                              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                isChecked ? 'bg-sage' : 'bg-stone-300'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full bg-white shadow-2xs absolute top-1 transition-transform ${
                                  isChecked ? 'right-1' : 'left-1'
                                }`}
                              />
                            </button>

                            {/* Task Breakdown Button if applicable */}
                            {item.tasks && isChecked && (
                              <button
                                type="button"
                                onClick={() => {
                                  triggerHaptic('light');
                                  setExpandedCategory(isExpanded ? null : item.key);
                                }}
                                className="p-1 text-medium hover:text-charcoal rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                                title="Expand granular tasks"
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Granular Task Drawer */}
                        {item.tasks && isChecked && isExpanded && (
                          <div className="mt-2.5 pt-2 border-t border-border/50 space-y-1.5 max-h-48 overflow-y-auto pl-1 pr-1 custom-scrollbar">
                            <span className="text-[10px] uppercase font-bold text-light tracking-wider block mb-1">
                              Individual task exclusions:
                            </span>
                            {(item.tasks as any[]).map((t) => {
                              const isExcluded = (state.syncPermissions?.excludedTaskIds || []).includes(t.id);
                              return (
                                <label
                                  key={t.id}
                                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-cream/40 cursor-pointer text-[11.5px]"
                                >
                                  <span className={`truncate flex-1 ${isExcluded ? 'line-through text-muted' : 'text-charcoal'}`}>
                                    {t.text || t.title || 'Task'}
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={!isExcluded}
                                    onChange={() => handleToggleTaskExclusion(t.id)}
                                    className="w-3.5 h-3.5 rounded text-sage accent-sage border-border focus:ring-sage"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Partner Modal */}
      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        initialPartner={state.partner}
        onSave={(partnerData) => {
          updateState({
            partner: partnerData,
            birthPlan: {
              ...state.birthPlan,
              personalDetails: {
                ...state.birthPlan?.personalDetails,
                partnerName: partnerData.name
              }
            }
          });
        }}
        onRemove={() => {
          updateState({ partner: null });
        }}
      />
    </Paywall>
  );
};
