import React, { useEffect, useState } from 'react';
import { db, auth, getAllUsersForAdmin, updateUserSubscription, setUserRole, sendPlanChangeEmail, deleteUserByAdminCallable, UserProfile } from '../../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { usePlanner } from '../../store';
import { 
  Users, 
  Crown, 
  MessageSquare, 
  Search, 
  CheckCircle, 
  ShieldAlert, 
  Sparkles, 
  Mail, 
  Check, 
  RefreshCw,
  ChevronDown,
  Shield,
  Trash2,
  AlertTriangle,
  Smartphone
} from 'lucide-react';
import { 
  getLocalMonetizationConfig, 
  syncMonetizationConfigToCloud, 
  loadMonetizationConfigFromCloud, 
  IosMonetizationConfig 
} from '../../utils/monetizationConfig';
import { isSuperAdminEmail } from '../../utils/adminConfig';

interface FeedbackItem {
  id: string;
  type: string;
  message: string;
  userEmail: string;
  createdAt: number;
}

interface AdminPanelProps {
  isMobileModal?: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isMobileModal = false }) => {
  const { state } = usePlanner();
  const [activeTab, setActiveTab] = useState<'users' | 'feedbacks' | 'monetization'>('users');
  
  // Users state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'pro' | 'free' | 'admin'>('all');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedbacks state
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

  // Monetization state
  const [monetizationConfig, setMonetizationConfig] = useState<IosMonetizationConfig>(() => getLocalMonetizationConfig());
  const [isSavingMonetization, setIsSavingMonetization] = useState(false);

  // String input buffers for smooth editing without aggressive number parsing
  const [introPriceInput, setIntroPriceInput] = useState<string>(() => String(monetizationConfig.introPriceUsd));
  const [regularPriceInput, setRegularPriceInput] = useState<string>(() => String(monetizationConfig.regularPriceUsd));
  const [foodScansInput, setFoodScansInput] = useState<string>(() => String(monetizationConfig.dailyFoodScanLimit));
  const [aiChatInput, setAiChatInput] = useState<string>(() => String(monetizationConfig.dailyAiChatLimit));
  const [reportsInput, setReportsInput] = useState<string>(() => String(monetizationConfig.dailyReportLimit));

  // Selected user for modal / plan assign
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [planOption, setPlanOption] = useState<'free' | 'premium'>('premium');
  const [durationMonths, setDurationMonths] = useState<number | null>(null); // null = lifetime
  const [sendEmailNotification, setSendEmailNotification] = useState<boolean>(true);

  const isAdmin = state.isAdmin || isSuperAdminEmail(auth.currentUser?.email);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const fetched = await getAllUsersForAdmin();
      setUsers(fetched);
    } catch (err) {
      console.error("Failed to load users for admin:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUserByAdminCallable(userToDelete.uid);
      setUsers((prev) => prev.filter((u) => u.uid !== userToDelete.uid));
      showToast(`User ${userToDelete.displayName || userToDelete.email} permanently deleted.`);
      setUserToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      showToast(`Error: ${err.message || 'Could not delete user'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchFeedbacks = async () => {
    if (!isAdmin) return;
    setLoadingFeedbacks(true);
    try {
      const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetched: FeedbackItem[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as FeedbackItem);
      });
      setFeedbacks(fetched);
    } catch (err) {
      console.error("Failed to fetch feedbacks:", err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchFeedbacks();
      loadMonetizationConfigFromCloud().then(cfg => {
        if (cfg) {
          setMonetizationConfig(cfg);
          setIntroPriceInput(String(cfg.introPriceUsd));
          setRegularPriceInput(String(cfg.regularPriceUsd));
          setFoodScansInput(String(cfg.dailyFoodScanLimit));
          setAiChatInput(String(cfg.dailyAiChatLimit));
          setReportsInput(String(cfg.dailyReportLimit));
        }
      }).catch(e => console.warn('Could not load monetization config:', e));
    }
  }, [isAdmin]);

  // Normalizes comma to dot for European / German keypad inputs (e.g. "2,99" -> "2.99")
  const parseLocaleFloat = (str: string): number => {
    if (!str) return NaN;
    const normalized = str.trim().replace(',', '.');
    return parseFloat(normalized);
  };

  const handleIntroPriceChange = (val: string) => {
    setIntroPriceInput(val);
    const intro = parseLocaleFloat(val);
    const reg = parseLocaleFloat(regularPriceInput);
    if (!isNaN(intro) && intro > 0) {
      const regular = (!isNaN(reg) && reg > 0) ? reg : monetizationConfig.regularPriceUsd;
      const discount = regular > intro ? Math.round(((regular - intro) / regular) * 100) : 0;
      setMonetizationConfig(prev => ({
        ...prev,
        introPriceUsd: intro,
        discountPercentage: discount
      }));
    }
  };

  const handleRegularPriceChange = (val: string) => {
    setRegularPriceInput(val);
    const reg = parseLocaleFloat(val);
    const intro = parseLocaleFloat(introPriceInput);
    if (!isNaN(reg) && reg > 0) {
      const promotional = (!isNaN(intro) && intro > 0) ? intro : monetizationConfig.introPriceUsd;
      const discount = reg > promotional ? Math.round(((reg - promotional) / reg) * 100) : 0;
      setMonetizationConfig(prev => ({
        ...prev,
        regularPriceUsd: reg,
        discountPercentage: discount
      }));
    }
  };

  const handleIntroPriceBlur = () => {
    const num = parseLocaleFloat(introPriceInput);
    if (isNaN(num) || num <= 0) {
      setIntroPriceInput("2.99");
      handleIntroPriceChange("2.99");
    } else {
      setIntroPriceInput(String(num));
    }
  };

  const handleRegularPriceBlur = () => {
    const num = parseLocaleFloat(regularPriceInput);
    if (isNaN(num) || num <= 0) {
      setRegularPriceInput("9.99");
      handleRegularPriceChange("9.99");
    } else {
      setRegularPriceInput(String(num));
    }
  };

  const handleFoodScansChange = (val: string) => {
    setFoodScansInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setMonetizationConfig(prev => ({ ...prev, dailyFoodScanLimit: num }));
    }
  };

  const handleAiChatChange = (val: string) => {
    setAiChatInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setMonetizationConfig(prev => ({ ...prev, dailyAiChatLimit: num }));
    }
  };

  const handleReportsChange = (val: string) => {
    setReportsInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setMonetizationConfig(prev => ({ ...prev, dailyReportLimit: num }));
    }
  };

  const handleSaveMonetization = async () => {
    setIsSavingMonetization(true);
    try {
      const parsedIntro = parseLocaleFloat(introPriceInput);
      const parsedRegular = parseLocaleFloat(regularPriceInput);
      const finalIntro = !isNaN(parsedIntro) && parsedIntro > 0 ? parsedIntro : monetizationConfig.introPriceUsd;
      const finalRegular = !isNaN(parsedRegular) && parsedRegular > 0 ? parsedRegular : monetizationConfig.regularPriceUsd;
      const finalDiscount = finalRegular > finalIntro ? Math.round(((finalRegular - finalIntro) / finalRegular) * 100) : monetizationConfig.discountPercentage;
      const finalFood = parseInt(foodScansInput, 10) || monetizationConfig.dailyFoodScanLimit;
      const finalChat = parseInt(aiChatInput, 10) || monetizationConfig.dailyAiChatLimit;
      const finalReport = parseInt(reportsInput, 10) || monetizationConfig.dailyReportLimit;

      const toSave: IosMonetizationConfig = {
        ...monetizationConfig,
        introPriceUsd: finalIntro,
        regularPriceUsd: finalRegular,
        discountPercentage: finalDiscount,
        dailyFoodScanLimit: finalFood,
        dailyAiChatLimit: finalChat,
        dailyReportLimit: finalReport,
      };

      setMonetizationConfig(toSave);
      setIntroPriceInput(String(finalIntro));
      setRegularPriceInput(String(finalRegular));
      await syncMonetizationConfigToCloud(toSave);
      showToast('Mobile Monetization (iOS & Android) settings updated and live!');
    } catch (err: any) {
      showToast(`Saved locally: ${err?.message || 'Updated'}`);
    } finally {
      setIsSavingMonetization(false);
    }
  };

  const handleApplyPlan = async () => {
    if (!selectedUser) return;
    setUpdatingUid(selectedUser.uid);
    try {
      await updateUserSubscription(selectedUser.uid, planOption, durationMonths);
      
      let emailSuccessText = "";
      if (sendEmailNotification && selectedUser.email && planOption === 'premium') {
        try {
          const emailRes = await sendPlanChangeEmail(
            selectedUser.email,
            selectedUser.displayName,
            'premium',
            durationMonths
          );
          if (emailRes.success) {
            emailSuccessText = " & email sent";
          } else {
            emailSuccessText = ` (email failed: ${emailRes.error || 'delivery error'})`;
          }
        } catch (e: any) {
          console.warn("Could not dispatch plan email:", e);
          emailSuccessText = ` (email error: ${e?.message || 'failed'})`;
        }
      }

      const planLabel = planOption === 'premium' ? 'PRO' : 'FREE';
      showToast(`Updated ${selectedUser.displayName || selectedUser.email || selectedUser.uid} to ${planLabel}${emailSuccessText}!`);
      
      setUsers(prev => prev.map(u => {
        if (u.uid === selectedUser.uid) {
          return {
            ...u,
            planTier: planOption,
            planExpiry: planOption === 'premium' && durationMonths ? Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000 : null,
          };
        }
        return u;
      }));
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to update plan:", err);
      showToast("Error updating user plan.");
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleToggleAdminRole = async (targetUser: UserProfile) => {
    const isOwner = isSuperAdminEmail(targetUser.email);
    if (isOwner) return;

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${targetUser.email || targetUser.displayName}'s role to ${newRole.toUpperCase()}?`)) {
      return;
    }
    setUpdatingUid(targetUser.uid);
    try {
      await setUserRole(targetUser.uid, newRole);
      showToast(`Updated role for ${targetUser.email || targetUser.displayName} to ${newRole.toUpperCase()}`);
      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error("Failed to update role:", err);
      showToast("Error updating user role.");
    } finally {
      setUpdatingUid(null);
    }
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const formatDateDDMMYY = (timestamp?: number | null): string => {
    if (!timestamp) return '—';
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '—';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  if (!isAdmin) {
    return (
      <div className="p-6 bg-critical-bg border border-critical/30 rounded-2xl text-critical flex items-center gap-3.5">
        <ShieldAlert className="w-7 h-7 shrink-0" />
        <div>
          <h3 className="font-bold text-[16px]">Access Denied</h3>
          <p className="text-xs">You do not have administrative privileges to view this section.</p>
        </div>
      </div>
    );
  }

  // Metric counts (2-Tier model: Pro vs Free)
  const proCount = users.filter(u => u.planTier === 'premium' || (u.planTier as string) === 'pro' || u.role === 'admin' || isSuperAdminEmail(u.email)).length;
  const freeCount = users.length - proCount;
  const adminCount = users.filter(u => u.role === 'admin' || isSuperAdminEmail(u.email)).length;

  const filteredUsers = users.filter(u => {
    const isOwner = isSuperAdminEmail(u.email);
    const effectivePlan: 'pro' | 'free' = isOwner ? 'pro' : ((u.planTier === 'premium' || (u.planTier as string) === 'pro') ? 'pro' : 'free');

    if (filterTier === 'pro' && effectivePlan !== 'pro') return false;
    if (filterTier === 'free' && effectivePlan !== 'free') return false;
    if (filterTier === 'admin' && u.role !== 'admin' && !isOwner) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-in fade-in duration-200 max-w-4xl mx-auto space-y-4">
      {/* Desktop Header (Hidden inside mobile modal since MobileShell has native top bar) */}
      {!isMobileModal && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <h1 className="font-serif text-[24px] sm:text-[28px] text-charcoal dark:text-white font-semibold tracking-tight leading-tight">
              Admin Suite
            </h1>
            <p className="text-medium text-[13px] mt-0.5">
              Manage subscriptions, instant tier access, and mobile store paywalls.
            </p>
          </div>
        </div>
      )}

      {/* Sleek Single-Row 3-Tab Segmented Control */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#F3EFE6] dark:bg-charcoal/50 rounded-2xl border border-border/80 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[12.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-white dark:bg-[#1E293B] text-charcoal dark:text-white shadow-xs'
              : 'text-medium hover:text-charcoal dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0 text-sage-dark" />
          <span>Users</span>
          <span className={`text-[10.5px] px-1.5 py-0.2 rounded-full font-extrabold ${
            activeTab === 'users'
              ? 'bg-sage/15 text-sage-dark'
              : 'bg-charcoal/8 text-medium'
          }`}>
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('feedbacks')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[12.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'feedbacks'
              ? 'bg-white dark:bg-[#1E293B] text-charcoal dark:text-white shadow-xs'
              : 'text-medium hover:text-charcoal dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 shrink-0 text-sage-dark" />
          <span>Feedback</span>
          <span className={`text-[10.5px] px-1.5 py-0.2 rounded-full font-extrabold ${
            activeTab === 'feedbacks'
              ? 'bg-sage/15 text-sage-dark'
              : 'bg-charcoal/8 text-medium'
          }`}>
            {feedbacks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('monetization')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[12.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'monetization'
              ? 'bg-white dark:bg-[#1E293B] text-charcoal dark:text-white shadow-xs'
              : 'text-medium hover:text-charcoal dark:hover:text-white'
          }`}
        >
          <Crown className="w-3.5 h-3.5 shrink-0 text-amber-500" />
          <span>Monetization</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-8 sm:max-w-sm z-[200] bg-charcoal text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-[13px] font-semibold animate-in slide-in-from-bottom-5 border border-white/15">
          <CheckCircle className="w-4 h-4 text-sage shrink-0" />
          <span className="truncate">{toastMsg}</span>
        </div>
      )}

      {/* TAB 1: USERS & PLANS */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {/* Search Input + Inline Refresh Button (Single Row) */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-light pointer-events-none" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-[#1E293B] border border-border rounded-xl text-[13px] text-charcoal dark:text-white placeholder:text-light focus:outline-none focus:border-sage shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-light hover:text-charcoal text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={loadingUsers}
              title="Refresh users"
              aria-label="Refresh users"
              className="h-[40px] px-3 bg-white dark:bg-[#1E293B] hover:bg-cream/60 border border-border rounded-xl text-charcoal dark:text-white flex items-center justify-center gap-1.5 text-[12px] font-semibold shrink-0 cursor-pointer transition-all shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sage-dark ${loadingUsers ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Single-Row Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { key: 'all', label: 'All', count: users.length },
              { key: 'pro', label: '👑 Pro', count: proCount },
              { key: 'free', label: 'Free', count: freeCount },
              { key: 'admin', label: '🛡 Admins', count: adminCount },
            ].map((chip) => {
              const active = filterTier === chip.key;
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setFilterTier(chip.key as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-full whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    active
                      ? 'bg-charcoal text-white dark:bg-white dark:text-charcoal shadow-2xs'
                      : 'bg-white dark:bg-[#1E293B] text-medium hover:text-charcoal border border-border/90'
                  }`}
                >
                  <span>{chip.label}</span>
                  <span className={`text-[11px] ${active ? 'text-white/80 dark:text-charcoal/70' : 'text-light'}`}>
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sleek Single-Row User List Card */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-border shadow-2xs overflow-hidden">
            {loadingUsers ? (
              <div className="p-10 text-center text-medium text-[13px] flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-sage" />
                <span>Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-10 text-center text-medium text-[13px]">
                No users found {searchQuery ? `matching "${searchQuery}"` : 'in this filter'}.
              </div>
            ) : (
              <div className="divide-y divide-border/70">
                {filteredUsers.map((user) => {
                  const isOwnerUser = isSuperAdminEmail(user.email);
                  const isProUser = isOwnerUser || user.planTier === 'premium' || (user.planTier as string) === 'pro' || user.role === 'admin';
                  const isExpired = user.planExpiry ? user.planExpiry < Date.now() : false;
                  const initials = getInitials(user.displayName, user.email);

                  const expiryLabel = isOwnerUser
                    ? 'Owner'
                    : user.planExpiry
                    ? isExpired
                      ? 'Expired'
                      : `Exp ${formatDateDDMMYY(user.planExpiry)}`
                    : isProUser
                    ? 'Lifetime'
                    : null;

                  return (
                    <div
                      key={user.uid}
                      className="flex items-center justify-between gap-2.5 px-3.5 sm:px-4 py-3 hover:bg-cream/40 dark:hover:bg-white/5 transition-colors"
                    >
                      {/* Left: Avatar + Single-line Name & Email */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11.5px] font-bold shrink-0 ${
                          isOwnerUser || user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300/80'
                            : isProUser
                            ? 'bg-amber-50 text-amber-900 border border-amber-300/70'
                            : 'bg-[#F4EFE6] dark:bg-charcoal/40 text-charcoal/80 dark:text-white/80 border border-border/60'
                        }`}>
                          {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-semibold text-[13.5px] text-charcoal dark:text-white truncate">
                              {user.displayName || 'Unnamed Mother'}
                            </span>
                            {expiryLabel && (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold whitespace-nowrap shrink-0 ${
                                isExpired
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : isOwnerUser
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                              }`}>
                                {expiryLabel}
                              </span>
                            )}
                          </div>
                          <div className="text-light text-[11.5px] truncate">
                            {user.email || user.uid}
                          </div>
                        </div>
                      </div>

                      {/* Right: Single-Line Plan Pill + Compact Admin & Delete Icons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(user);
                            setPlanOption(isProUser ? 'premium' : 'free');
                            setDurationMonths(user.planExpiry ? 3 : null);
                          }}
                          title="Change subscription tier"
                          className={`inline-flex items-center justify-center gap-1 h-7 px-2.5 rounded-full text-[11.5px] font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all active:scale-95 ${
                            isProUser
                              ? 'bg-amber-100/80 text-amber-900 border border-amber-300/80 hover:bg-amber-200/70'
                              : 'bg-[#F4EFE6] dark:bg-white/10 text-charcoal/80 dark:text-white/80 border border-border hover:border-charcoal/30'
                          }`}
                        >
                          {isProUser && <Sparkles className="w-3 h-3 text-amber-700 shrink-0" />}
                          <span>{isProUser ? 'Pro' : 'Free'}</span>
                          <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
                        </button>

                        {/* Admin Role Toggle */}
                        {isOwnerUser ? (
                          <span
                            title="Primary Owner"
                            className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200/70 flex items-center justify-center text-[12px] shrink-0 select-none"
                          >
                            👑
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleAdminRole(user)}
                            disabled={updatingUid === user.uid}
                            title={user.role === 'admin' ? 'Revoke Admin' : 'Grant Admin'}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] shrink-0 cursor-pointer transition-all ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : 'text-light hover:text-purple-700 hover:bg-purple-50 border border-transparent'
                            }`}
                          >
                            👑
                          </button>
                        )}

                        {/* Delete User Button */}
                        {!isOwnerUser && (
                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            title="Delete user"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-light hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FEEDBACKS */}
      {activeTab === 'feedbacks' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <h3 className="font-serif text-[16px] text-charcoal dark:text-white font-semibold whitespace-nowrap">
              Community Feedback ({feedbacks.length})
            </h3>
            <button
              type="button"
              onClick={fetchFeedbacks}
              disabled={loadingFeedbacks}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-white dark:bg-[#1E293B] border border-border rounded-xl text-charcoal dark:text-white whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sage-dark ${loadingFeedbacks ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loadingFeedbacks ? (
            <div className="p-10 text-center text-medium text-[13px] flex items-center justify-center gap-2 bg-white dark:bg-[#1E293B] border border-border rounded-2xl">
              <RefreshCw className="w-4 h-4 animate-spin text-sage" />
              <span>Loading feedbacks...</span>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="p-10 text-center text-medium text-[13px] bg-white dark:bg-[#1E293B] border border-border rounded-2xl">
              No feedbacks submitted yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {feedbacks.map((item) => (
                <div key={item.id} className="p-4 bg-white dark:bg-[#1E293B] border border-border rounded-2xl shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0 ${
                        item.type === 'bug' ? 'bg-amber-100 text-amber-800' :
                        item.type === 'feature' ? 'bg-sage-pale text-sage-dark' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[12.5px] font-semibold text-charcoal dark:text-white truncate">
                        {item.userEmail}
                      </span>
                    </div>
                    <span className="text-[11px] text-light whitespace-nowrap shrink-0">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[13px] text-charcoal dark:text-white/90 leading-relaxed whitespace-pre-wrap">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MOBILE MONETIZATION (IOS & ANDROID) */}
      {activeTab === 'monetization' && (
        <div className="space-y-3.5">
          {/* Card 1: Compact Single-Row Store Paywall Master Toggles */}
          <div className="bg-white dark:bg-[#1E293B] border border-border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Smartphone className="w-4 h-4 text-sage-dark shrink-0" />
                <h3 className="font-serif text-[16px] text-charcoal dark:text-white font-bold truncate">
                  Mobile Store Paywalls
                </h3>
              </div>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 border border-amber-300/60 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                ${monetizationConfig.introPriceUsd.toFixed(2)}/mo Pro Pass
              </span>
            </div>

            <div className="divide-y divide-border/70 border border-border/80 rounded-xl bg-[#FDFBF7] dark:bg-charcoal/30 overflow-hidden">
              {/* iOS Row */}
              <div className="flex items-center justify-between gap-3 p-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[13.5px] text-charcoal dark:text-white whitespace-nowrap">
                      iOS App Store
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full whitespace-nowrap ${
                      monetizationConfig.isIosPaywallActive
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {monetizationConfig.isIosPaywallActive ? 'Paywall Active' : 'Free Mode'}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-medium truncate mt-0.5">
                    Apple StoreKit 2 • RevenueCat In-App Purchase
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMonetizationConfig(prev => ({ ...prev, isIosPaywallActive: !prev.isIosPaywallActive }))}
                  aria-label="Toggle iOS Paywall"
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    monetizationConfig.isIosPaywallActive ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      monetizationConfig.isIosPaywallActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Android Row */}
              <div className="flex items-center justify-between gap-3 p-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[13.5px] text-charcoal dark:text-white whitespace-nowrap">
                      Android Google Play
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full whitespace-nowrap ${
                      monetizationConfig.isAndroidPaywallActive
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {monetizationConfig.isAndroidPaywallActive ? 'Paywall Active' : 'Free Mode'}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-medium truncate mt-0.5">
                    Google Play Billing • RevenueCat Subscription
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMonetizationConfig(prev => ({ ...prev, isAndroidPaywallActive: !prev.isAndroidPaywallActive }))}
                  aria-label="Toggle Android Paywall"
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    monetizationConfig.isAndroidPaywallActive ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      monetizationConfig.isAndroidPaywallActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Pricing & Launch Promotion (Single 3-Col Row) */}
          <div className="bg-white dark:bg-[#1E293B] border border-border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-serif text-[16px] text-charcoal dark:text-white font-bold flex items-center gap-2 whitespace-nowrap">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Pricing & Launch Offer</span>
              </h3>
              <span className="text-[11px] text-light whitespace-nowrap">First 3 months intro</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10.5px] font-bold text-light uppercase tracking-wider block mb-1 truncate">
                  Promo ($/mo)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="2.99"
                  value={introPriceInput}
                  onChange={(e) => handleIntroPriceChange(e.target.value)}
                  onBlur={handleIntroPriceBlur}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-[#FDFBF7] dark:bg-charcoal text-charcoal dark:text-white text-[16px] font-bold focus:outline-none focus:border-sage shadow-3xs"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-light uppercase tracking-wider block mb-1 truncate">
                  Regular ($/mo)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="9.99"
                  value={regularPriceInput}
                  onChange={(e) => handleRegularPriceChange(e.target.value)}
                  onBlur={handleRegularPriceBlur}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-[#FDFBF7] dark:bg-charcoal text-charcoal dark:text-white text-[16px] font-bold focus:outline-none focus:border-sage shadow-3xs"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-light uppercase tracking-wider block mb-1 truncate">
                  Discount (Auto)
                </label>
                <div className="w-full px-2.5 py-2 rounded-xl border border-amber-300/80 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-[15px] font-bold flex items-center justify-center gap-1 shadow-3xs select-none">
                  <span>{monetizationConfig.discountPercentage}%</span>
                  <span className="text-[9.5px] uppercase tracking-wider font-semibold opacity-75">OFF</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Fair Use Daily Caps (Single 3-Col Row) */}
          <div className="bg-white dark:bg-[#1E293B] border border-border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-serif text-[16px] text-charcoal dark:text-white font-bold flex items-center gap-2 whitespace-nowrap">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Fair Use Daily Caps</span>
              </h3>
              <span className="text-[11px] text-light whitespace-nowrap">Anti-abuse protection</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10.5px] font-bold text-light uppercase tracking-wider block mb-1 truncate">
                  Food Scans
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={foodScansInput}
                  onChange={(e) => handleFoodScansChange(e.target.value)}
                  onBlur={() => {
                    if (!parseInt(foodScansInput, 10)) {
                      setFoodScansInput("25");
                      handleFoodScansChange("25");
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-[#FDFBF7] dark:bg-charcoal text-charcoal dark:text-white text-[16px] font-bold focus:outline-none focus:border-sage shadow-3xs"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-light uppercase tracking-wider block mb-1 truncate">
                  AI Chats
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={aiChatInput}
                  onChange={(e) => handleAiChatChange(e.target.value)}
                  onBlur={() => {
                    if (!parseInt(aiChatInput, 10)) {
                      setAiChatInput("60");
                      handleAiChatChange("60");
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-[#FDFBF7] dark:bg-charcoal text-charcoal dark:text-white text-[16px] font-bold focus:outline-none focus:border-sage shadow-3xs"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-light uppercase tracking-wider block mb-1 truncate">
                  Lab Reports
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={reportsInput}
                  onChange={(e) => handleReportsChange(e.target.value)}
                  onBlur={() => {
                    if (!parseInt(reportsInput, 10)) {
                      setReportsInput("10");
                      handleReportsChange("10");
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-[#FDFBF7] dark:bg-charcoal text-charcoal dark:text-white text-[16px] font-bold focus:outline-none focus:border-sage shadow-3xs"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Unit Economics Calculator */}
          <div className="bg-gradient-to-br from-emerald-50/90 via-cream/60 to-white border border-emerald-200/80 rounded-2xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-emerald-950 text-[13.5px] flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unit Economics (15% Store Tier)</span>
              </h4>
              <span className="text-[10.5px] text-emerald-800 font-medium whitespace-nowrap">
                Apple &amp; Google Play
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-white rounded-xl border border-emerald-100">
                <span className="text-[10px] text-light uppercase font-bold block truncate">Price</span>
                <span className="text-[14px] sm:text-[15px] font-bold text-charcoal font-sans">${monetizationConfig.introPriceUsd.toFixed(2)}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-emerald-100">
                <span className="text-[10px] text-light uppercase font-bold block truncate">Store 15%</span>
                <span className="text-[14px] sm:text-[15px] font-bold text-rose-700 font-sans">-${(monetizationConfig.introPriceUsd * 0.15).toFixed(2)}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-emerald-100">
                <span className="text-[10px] text-light uppercase font-bold block truncate">AI Cost</span>
                <span className="text-[14px] sm:text-[15px] font-bold text-amber-700 font-sans">~$0.04</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block truncate">Net Profit</span>
                <span className="text-[14px] sm:text-[15px] font-bold text-emerald-700 font-sans">+${(monetizationConfig.introPriceUsd * 0.85 - 0.04).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveMonetization}
            disabled={isSavingMonetization}
            className="w-full py-3 bg-charcoal hover:bg-neutral-800 active:scale-[0.99] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-[14px] shadow-sm cursor-pointer transition-all disabled:opacity-50"
          >
            {isSavingMonetization ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-amber-400" />}
            <span>Save & Apply Monetization Settings</span>
          </button>
        </div>
      )}

      {/* PLAN CHANGE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[150] bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-border space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <h3 className="font-serif text-xl text-charcoal dark:text-white font-bold">Assign Subscription</h3>
                <p className="text-light text-[12px] mt-0.5 truncate">
                  {selectedUser.displayName || 'Mother'} • {selectedUser.email || selectedUser.uid}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 text-light hover:text-charcoal dark:hover:text-white cursor-pointer text-base"
              >
                ✕
              </button>
            </div>

            {/* Select Plan Tier */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold text-light uppercase tracking-wider">Select Tier</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlanOption('free')}
                  className={`py-2.5 px-3 rounded-xl border text-center text-[13px] whitespace-nowrap transition-all cursor-pointer ${
                    planOption === 'free'
                      ? 'border-charcoal dark:border-white bg-gray-100 dark:bg-white/10 font-bold text-charcoal dark:text-white'
                      : 'border-border hover:border-gray-300 text-charcoal dark:text-white'
                  }`}
                >
                  Free Plan
                </button>

                <button
                  type="button"
                  onClick={() => setPlanOption('premium')}
                  className={`py-2.5 px-3 rounded-xl border text-center text-[13px] whitespace-nowrap transition-all cursor-pointer ${
                    planOption === 'premium'
                      ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold'
                      : 'border-border hover:border-amber-300 text-charcoal dark:text-white'
                  }`}
                >
                  👑 Pro Plan
                </button>
              </div>
            </div>

            {/* Select Duration */}
            {planOption !== 'free' && (
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-bold text-light uppercase tracking-wider">Duration</label>
                <div className="grid grid-cols-3 gap-2 text-[12px]">
                  {[
                    { label: '1 Mo', val: 1 },
                    { label: '3 Mos', val: 3 },
                    { label: '6 Mos', val: 6 },
                    { label: '12 Mos', val: 12 },
                    { label: 'Lifetime Access', val: null },
                  ].map((dur) => (
                    <button
                      key={String(dur.val)}
                      type="button"
                      onClick={() => setDurationMonths(dur.val)}
                      className={`py-2 px-2 rounded-xl border text-center whitespace-nowrap transition-all cursor-pointer ${
                        durationMonths === dur.val
                          ? 'border-sage-dark bg-sage/20 font-bold text-sage-dark'
                          : 'border-border hover:border-sage'
                      } ${dur.val === null ? 'col-span-2' : ''}`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Email Notification Option */}
            {planOption !== 'free' && selectedUser.email && (
              <label className="flex items-center gap-2.5 p-2.5 bg-cream dark:bg-[#0F172A] border border-border rounded-xl cursor-pointer text-[12px] text-charcoal dark:text-white">
                <input
                  type="checkbox"
                  checked={sendEmailNotification}
                  onChange={(e) => setSendEmailNotification(e.target.checked)}
                  className="w-4 h-4 rounded text-sage focus:ring-sage shrink-0"
                />
                <span className="flex items-center gap-1.5 font-medium truncate">
                  <Mail className="w-3.5 h-3.5 text-sage shrink-0" />
                  <span className="truncate">Notify <strong>{selectedUser.email}</strong></span>
                </span>
              </label>
            )}

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-2.5 border border-border rounded-xl text-[13px] font-semibold text-charcoal dark:text-white hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyPlan}
                disabled={updatingUid === selectedUser.uid}
                className="flex-1 py-2.5 bg-sage hover:bg-sage-dark text-white rounded-xl text-[13px] font-bold shadow-sm cursor-pointer transition-colors disabled:opacity-50"
              >
                {updatingUid === selectedUser.uid ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-border space-y-4">
            <div className="flex items-center gap-3 text-critical">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-[17px] text-charcoal dark:text-white">Delete User Account</h3>
                <p className="text-[11.5px] text-light">Permanent action • Cannot be undone</p>
              </div>
            </div>

            <div className="p-3 bg-red-50/70 dark:bg-red-950/20 border border-red-200/80 rounded-xl text-[12px] text-charcoal dark:text-white space-y-1">
              <p>
                Permanently delete <strong className="text-red-700 dark:text-red-400">{userToDelete.displayName || userToDelete.email}</strong> and all pregnancy logs, vitals, and authentication records?
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 border border-border rounded-xl text-[13px] font-semibold text-charcoal dark:text-white hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[13px] font-bold shadow-sm cursor-pointer transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
