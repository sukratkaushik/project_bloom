import React, { useState, useEffect } from 'react';  
import { syncEngine } from '../../syncEngine';  
import { ShieldCheck, Copy, Check, Users, ChevronDown, ChevronUp } from 'lucide-react';  
import { usePlanner } from '../../store';
import { DEV_TASKS, MED_TASKS, PREP_TASKS, FIN_TASKS, DEADLINE_TASKS, VACC_TASKS, POSTPARTUM_TASKS } from '../../data';

export const PartnerSync: React.FC = () => {  
 const { state, updateState } = usePlanner();  
 const [hostId, setHostId] = useState<string>('');  
 const [partnerIdInput, setPartnerIdInput] = useState('');  
 const [status, setStatus] = useState<string>('Disconnected');  
 const [copied, setCopied] = useState(false);
 const [expandedTaskCategory, setExpandedTaskCategory] = useState<string | null>(null);

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
   syncEngine.initHost((id) => setHostId(id));  
 };

 const handleConnect = () => {  
   if (partnerIdInput.trim()) {  
     syncEngine.connectToPartner(partnerIdInput.trim());  
   }  
 };

 const handleDisconnect = () => {  
    syncEngine.disconnect();  
    setHostId('');  
    setPartnerIdInput('');  
 };

 const copyToClipboard = () => {  
   navigator.clipboard.writeText(hostId);  
   setCopied(true);  
   setTimeout(() => setCopied(false), 2000);  
 };

 const ALL_SECTIONS = [
   {
     title: 'Global Sync Access',
     isGlobal: true,
     items: [
       { key: 'mode', label: 'Access Level', desc: 'Can Partner edit or just read?', isRadio: true }
     ]
   },
   {
     title: 'Daily Health & Tracking',
     items: [
       { key: 'kickcounter', label: 'Kick Counter', desc: 'Kick sessions history' },
       { key: 'contractions', label: 'Contraction Timer', desc: 'Contraction logs' },
       { key: 'vitals', label: 'Vitals', desc: 'Blood pressure & weight' },
       { key: 'mood', label: 'Mood Tracker', desc: 'Mood entries' },
       { key: 'hydration', label: 'Hydration', desc: 'Water intake logs' },
       { key: 'nutrition', label: 'Nutrition', desc: 'Meals and supplements' },
       { key: 'symptoms', label: 'Symptom Log', desc: 'Symptom history' },
     ]
   },
   {
     title: 'Smart Tools',
     items: [
       { key: 'babynames', label: 'Name Generator', desc: 'Favorite baby names' },
       { key: 'askbloom', label: 'AskBloom AI', desc: 'Allow partner to interact' },
       { key: 'foodscanner', label: 'Food Scanner', desc: 'Sharing logs' }
     ]
   },
   {
     title: 'Planning & Tasks',
     items: [
       { key: 'dev', label: 'Development', desc: 'Development tasks', tasks: Object.values(DEV_TASKS).flat() },
       { key: 'prep', label: 'Preparation', desc: 'Preparation tasks', tasks: Object.values(PREP_TASKS).flat() },
       { key: 'finance', label: 'Financial', desc: 'Budget estimates and actuals', tasks: FIN_TASKS },
       { key: 'deadlines', label: 'Deadlines', desc: 'Deadline tasks', tasks: DEADLINE_TASKS },
     ]
   },
   {
     title: 'Medical & Govt',
     items: [
       { key: 'medical', label: 'Medical', desc: 'Medical tasks', tasks: Object.values(MED_TASKS).flat() },
       { key: 'schemes', label: 'Vaccines', desc: 'Vaccination tasks', tasks: VACC_TASKS }
     ]
   },
   {
     title: 'Labor & Postpartum',
     items: [
       { key: 'readiness', label: 'Labor Readiness', desc: 'Labor predictions calculated' },
       { key: 'hospitalbag', label: 'Hospital Bag', desc: 'Items & completion status' },
       { key: 'birthplan', label: 'Birth Plan Builder', desc: 'Birth plan selections' },
       { key: 'decisions', label: 'Decisions', desc: 'Decision choices and notes' },
       { key: 'postpartum', label: 'Early Parenthood', desc: 'Postpartum tasks', tasks: POSTPARTUM_TASKS },
     ]
   },
   {
     title: 'Notes & Journal',
     items: [
       { key: 'notes', label: 'Notes & Journal', desc: 'Free text notes & questions' },
     ]
   }
 ];

 const handleToggleTaskExclusion = (taskId: string) => {
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

 const renderPermissions = () => {
   return ALL_SECTIONS.map(group => (
     <div key={group.title}>
       <h5 className="font-semibold text-[13px] text-sage mb-2 uppercase tracking-wide">{group.title}</h5>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
         {group.items.map(item => {
           const isChecked = state.syncPermissions ? (state.syncPermissions as any)[item.key] !== false : true;
           
           if (item.isRadio) {
             const currentMode = state.syncPermissions?.mode || 'read';
             return (
               <div key={item.key} className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row gap-3">
                 <label className={`flex-1 flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${currentMode === 'read' ? 'border-sage bg-sage/5' : 'border-border hover:bg-cream/50'}`}>
                   <input 
                     type="radio" 
                     name="syncMode"
                     checked={currentMode === 'read'}
                     onChange={() => {
                       const perms = state.syncPermissions || {};
                       updateState({ syncPermissions: { ...perms, mode: 'read' } as any });
                     }}
                     className="mt-1 w-4 h-4 text-sage border-border focus:ring-sage"
                   />
                   <div>
                     <div className="text-[14px] font-medium text-charcoal">Read-Only Access</div>
                     <div className="text-[12px] text-medium mt-0.5">Partner can view synced data, but cannot make changes.</div>
                   </div>
                 </label>
                 <label className={`flex-1 flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${currentMode === 'edit' ? 'border-sage bg-sage/5' : 'border-border hover:bg-cream/50'}`}>
                   <input 
                     type="radio" 
                     name="syncMode"
                     checked={currentMode === 'edit'}
                     onChange={() => {
                       const perms = state.syncPermissions || {};
                       updateState({ syncPermissions: { ...perms, mode: 'edit' } as any });
                     }}
                     className="mt-1 w-4 h-4 text-sage border-border focus:ring-sage"
                   />
                   <div>
                     <div className="text-[14px] font-medium text-charcoal">Edit Access</div>
                     <div className="text-[12px] text-medium mt-0.5">Partner can freely interact and modify synced data.</div>
                   </div>
                 </label>
               </div>
             );
           }

           return (
             <div key={item.key} className="flex flex-col border border-border rounded-xl transition-colors">
               <label className={`flex items-start gap-3 p-3 ${item.tasks && expandedTaskCategory === item.key ? 'bg-cream/50 border-b border-border' : 'hover:bg-cream/50 rounded-xl'} cursor-pointer`}>
                 <input 
                   type="checkbox" 
                   checked={isChecked}
                   onChange={() => {
                     const perms = state.syncPermissions || {};
                     updateState({
                       syncPermissions: { ...perms, [item.key]: !isChecked } as any
                     });
                   }}
                   className="mt-1 w-4 h-4 text-sage rounded border-border focus:ring-sage focus:ring-offset-0"
                 />
                 <div className="flex-1">
                   <div className="text-[14px] font-medium text-charcoal">{item.label}</div>
                   <div className="text-[12px] text-medium mt-0.5">{item.desc}</div>
                 </div>
                 {item.tasks && isChecked && (
                   <button 
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       setExpandedTaskCategory(expandedTaskCategory === item.key ? null : item.key);
                     }}
                     className="p-1 text-medium hover:bg-black/5 rounded-full mt-0.5"
                   >
                     {expandedTaskCategory === item.key ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                   </button>
                 )}
               </label>
               {item.tasks && isChecked && expandedTaskCategory === item.key && (
                 <div className="p-3 bg-gray-50/50 space-y-2 rounded-b-xl max-h-[160px] overflow-y-auto">
                   {(item.tasks as any[]).map(t => {
                     const isExcluded = (state.syncPermissions?.excludedTaskIds || []).includes(t.id);
                     return (
                       <label key={t.id} className="flex items-start gap-2 cursor-pointer hover:bg-black/5 p-1.5 rounded-lg">
                          <input 
                            type="checkbox" 
                            checked={!isExcluded}
                            onChange={() => handleToggleTaskExclusion(t.id)}
                            className="mt-0.5 w-3.5 h-3.5 text-sage rounded border-border focus:ring-sage"
                          />
                          <div className="text-[12px] text-charcoal leading-tight">{t.text || t.title || 'Task'}</div>
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
   ));
 };

 return (  
   <div className="animate-in fade-in duration-300 max-w-2xl mx-auto space-y-6">  
     <div className="flex items-center gap-3 mb-2">  
       <Users className="w-8 h-8 text-sage" />  
       <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal text-charcoal">Partner Sync</h1>  
     </div>  
      
     {!state.isCalmModeActive && (  
       <div className="bg-sage-pale/20 border border-sage/30 rounded-xl p-4 flex gap-4">  
         <ShieldCheck className="w-6 h-6 text-sage shrink-0" />  
         <div className="text-[14px] text-charcoal leading-relaxed">  
           <strong>End-to-End Encrypted.</strong> Partner Sync uses direct peer-to-peer WebRTC connections. Your data never touches a centralized database, ensuring total privacy.  
         </div>  
       </div>  
     )}

     <div className="bg-white border-[1.5px] border-border rounded-2xl p-6 sm:p-8 shadow-sm">
       <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">  
         <div>  
           <h3 className="font-semibold text-charcoal text-[17px]">Connection Status</h3>  
           <p className="text-[13px] text-medium mt-1">{status}</p>  
         </div>  
         <div className={`px-3 py-1.5 rounded-full text-[12px] font-semibold tracking-wide uppercase ${  
           status.includes('Connected') ? 'bg-sage text-white' :  
           status.includes('Waiting') || status.includes('Connecting') || status.includes('Initializing') ? 'bg-amber-400 text-amber-900' : 'bg-gray-100 text-medium'  
         }`}>  
           {status.includes('Connected') ? 'Active' : status.includes('Waiting') || status.includes('Connecting') || status.includes('Initializing') ? 'Pending' : 'Disconnected'}  
         </div>  
       </div>

       {status.includes('Connected') ? (  
           <div className="text-center py-6">  
               <ShieldCheck className="w-16 h-16 text-sage mx-auto mb-4 opacity-50" />  
               <h4 className="font-semibold text-charcoal text-[18px]">You are securely connected.</h4>  
               <p className="text-[14px] text-medium mt-2 max-w-sm mx-auto mb-6">Your selected data will now sync automatically between both devices.</p>  
               <button onClick={handleDisconnect} className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl font-medium text-[14px] transition-colors">  
                   Disconnect Session  
               </button>  
               
               {/* Permissions Settings visible during active sync */}
               <div className="mt-10 text-left border-t border-border pt-8">
                 <h4 className="font-semibold text-charcoal text-[15px] mb-4">Sharing Preferences</h4>
                 <div className="max-h-[500px] overflow-y-auto pr-2 space-y-6">
                   {renderPermissions()}
                 </div>
               </div>
           </div>  
       ) : (  
           <div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">  
               <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-border -translate-x-1/2" />  
                
               <div className="space-y-4">  
                 <h4 className="font-semibold text-charcoal text-[15px]">1. Generate Sync Code</h4>  
                 <p className="text-[13px] text-medium leading-relaxed">Create a secure WebRTC channel and share the code below with your partner.</p>  
                  
                 {hostId ? (  
                   <div className="mt-4">  
                     <label className="text-[11px] font-semibold tracking-wider text-light uppercase mb-1.5 block">Your Sync Code</label>  
                     <div className="flex gap-2">  
                         <input type="text" readOnly value={hostId} className="flex-1 p-3 bg-cream border border-border rounded-xl font-mono text-[13px] text-charcoal outline-none" />  
                         <button onClick={copyToClipboard} className="p-3 bg-sage-pale border border-sage text-sage rounded-xl hover:bg-sage hover:text-white transition-colors">  
                             {copied ? <Check size={18} /> : <Copy size={18} />}  
                         </button>  
                     </div>  
                   </div>  
                 ) : (  
                   <button onClick={handleHost} className="w-full py-3 bg-sage text-white font-medium text-[14px] rounded-xl hover:bg-sage-dark transition-colors mt-2">  
                     Start Hosting  
                   </button>  
                 )}  
               </div>
  
               <div className="space-y-4">  
                 <h4 className="font-semibold text-charcoal text-[15px]">2. Connect to Partner</h4>  
                 <p className="text-[13px] text-medium leading-relaxed">If your partner already generated a sync code, enter it below to join their session.</p>  
                  
                 <div className="mt-4">  
                   <label className="text-[11px] font-semibold tracking-wider text-light uppercase mb-1.5 block">Partner's Code</label>  
                   <input  
                     type="text"  
                     value={partnerIdInput}  
                     onChange={e => setPartnerIdInput(e.target.value)}  
                     placeholder="Enter partner code..."  
                     className="w-full p-3 border border-border rounded-xl font-mono text-[13px] text-charcoal focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all mb-3"  
                   />  
                   <button onClick={handleConnect} disabled={!partnerIdInput.trim() || status.includes('Connecting')} className="w-full py-3 bg-charcoal text-white font-medium text-[14px] rounded-xl hover:bg-black disabled:opacity-50 transition-colors">  
                     Connect  
                   </button>  
                 </div>  
               </div>  
             </div>
             
             {/* Pre-connection Permissions Settings */}
             <div className="mt-8 border-t border-border pt-8">
               <h4 className="font-semibold text-charcoal text-[15px] mb-4">What to share</h4>
               <p className="text-[13px] text-medium mb-4">Select categories you want to sync with your partner when connected.</p>
               <div className="max-h-[500px] overflow-y-auto pr-2 space-y-6">
                 {renderPermissions()}
               </div>
             </div>
           </div>
       )}  
     </div>    
   </div>  
 );  
};
