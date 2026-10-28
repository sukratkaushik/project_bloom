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
  Calendar, 
  Mail, 
  Check, 
  Clock, 
  Lock,
  RefreshCw,
  Edit3,
  ChevronDown,
  UserCheck,
  Shield,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { 
  getLocalMonetizationConfig, 
  saveLocalMonetizationConfig, 
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

export const AdminPanel: React.FC = () => {
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
      showToast(`User ${userToDelete.displayName || userToDelete.email} and all data permanently deleted.`);
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
        if (cfg) setMonetizationConfig(cfg);
      }).catch(e => console.warn('Could not load monetization config:', e));
    }
  }, [isAdmin]);

  const handleSaveMonetization = async () => {
    setIsSavingMonetization(true);
    try {
      await syncMonetizationConfigToCloud(monetizationConfig);
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
            emailSuccessText = " & email notification sent";
          } else {
            emailSuccessText = ` (email failed: ${emailRes.error || 'delivery error'})`;
          }
        } catch (e: any) {
          console.warn("Could not dispatch plan email:", e);
          emailSuccessText = ` (email error: ${e?.message || 'failed'})`;
        }
      }

      const planLabel = planOption === 'premium' ? 'PRO PLAN' : 'FREE PLAN';
      showToast(`Updated plan for ${selectedUser.displayName || selectedUser.email || selectedUser.uid} to ${planLabel}${emailSuccessText}!`);
      
      // Update local state
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
      showToast("Error updating user plan. Check console.");
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleToggleAdminRole = async (targetUser: UserProfile) => {
    const isOwner = isSuperAdminEmail(targetUser.email);
    if (isOwner) return;

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change ${targetUser.email || targetUser.displayName}'s role to ${newRole.toUpperCase()}?`)) {
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

  const isSelectedUserOwner = isSuperAdminEmail(selectedUser?.email);

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
      <div className="p-8 bg-critical-bg border border-critical/30 rounded-2xl text-critical flex items-center gap-4">
        <ShieldAlert className="w-8 h-8 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-[18px]">Access Denied</h3>
          <p className="text-sm">You do not have administrative privileges to view this section.</p>
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

    // Filter by tier chips
    if (filterTier === 'pro' && effectivePlan !== 'pro') return false;
    if (filterTier === 'free' && effectivePlan !== 'free') return false;
    if (filterTier === 'admin' && u.role !== 'admin' && !isOwner) return false;

    // Filter by search query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-in fade-in duration-300 max-w-5xl space-y-5">
      {/* Header & Sleek Single-Line Tab Switcher */}
      <div className="flex flex-col gap-3 pb-3 border-b border-border/80">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="font-serif text-[22px] sm:text-[28px] text-charcoal dark:text-white font-bold tracking-tight">
              Admin Suite
            </h1>
            <p className="text-medium text-xs sm:text-[13px] mt-0.5">
              Manage user subscriptions, tier access, and monetization limits.
            </p>
          </div>
        </div>

        {/* Modern Segmented Tab Switcher (Strictly Single-Line, zero text-wrapping) */}
        <div className="flex bg-[#F2EDE5] dark:bg-charcoal/50 p-1 rounded-xl border border-border/70 w-full overflow-x-auto no-scrollbar gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white dark:bg-[#1E293B] text-charcoal dark:text-white shadow-2xs'
                : 'text-medium hover:text-charcoal'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Users</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'users' ? 'bg-sage-pale text-sage-dark' : 'bg-black/5 text-medium'
            }`}>
              {users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feedbacks')}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'feedbacks'
                ? 'bg-white dark:bg-[#1E293B] text-charcoal dark:text-white shadow-2xs'
                : 'text-medium hover:text-charcoal'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span>Feedback</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'feedbacks' ? 'bg-sage-pale text-sage-dark' : 'bg-black/5 text-medium'
            }`}>
              {feedbacks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('monetization')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'monetization'
                ? 'bg-white dark:bg-[#1E293B] text-charcoal dark:text-white shadow-2xs'
                : 'text-medium hover:text-charcoal'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Pricing & Limits</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-8 right-8 z-[200] bg-charcoal text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold animate-in slide-in-from-bottom-5 border border-white/20">
          <CheckCircle className="w-5 h-5 text-sage shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TAB 1: USERS & PLANS */}
      {activeTab === 'users' && (
        <div className="space-y-3.5">
          {/* Integrated Search Bar + Refresh Icon Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light pointer-events-none" />
              <input
                type="text"
                placeholder="Search user by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-[#1E293B] border border-border/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-sage shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-light hover:text-charcoal text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={loadingUsers}
              title="Refresh users database"
              className="p-2.5 bg-white dark:bg-[#1E293B] hover:bg-cream border border-border/80 rounded-xl text-charcoal dark:text-white cursor-pointer transition-all shadow-2xs shrink-0 disabled:opacity-50 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin text-sage' : ''}`} />
            </button>
          </div>

          {/* Quick Filter Chips (Single-Line Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
            {[
              { key: 'all', label: 'All', count: users.length },
              { key: 'pro', label: 'Pro', icon: '✨', count: proCount },
              { key: 'free', label: 'Free', count: freeCount },
              { key: 'admin', label: 'Admins', icon: '👑', count: adminCount },
            ].map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => setFilterTier(chip.key as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  filterTier === chip.key
                    ? 'bg-charcoal text-white dark:bg-white dark:text-charcoal shadow-2xs'
                    : 'bg-white dark:bg-[#1E293B] text-medium hover:text-charcoal border border-border/80'
                }`}
              >
                {chip.icon && <span>{chip.icon}</span>}
                <span>{chip.label}</span>
                <span className="opacity-70 text-[10.5px]">({chip.count})</span>
              </button>
            ))}
          </div>

          {/* Users List Container */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-border/80 shadow-2xs overflow-hidden">
            {loadingUsers ? (
              <div className="p-10 text-center text-medium flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-sage" />
                <span className="text-xs">Loading users database...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-10 text-center text-medium text-xs">
                No users found {searchQuery ? `matching "${searchQuery}"` : 'in this category'}.
              </div>
            ) : (
              <>
                {/* 1. MOBILE RESPONSIVE CARDS (strictly single-line, zero clipping, beautiful touch targets) */}
                <div className="md:hidden divide-y divide-border/60">
                  {filteredUsers.map((user) => {
                    const isOwnerUser = isSuperAdminEmail(user.email);
                    const isProUser = isOwnerUser || user.planTier === 'premium' || (user.planTier as string) === 'pro' || user.role === 'admin';
                    const isExpired = user.planExpiry ? user.planExpiry < Date.now() : false;
                    const initials = getInitials(user.displayName, user.email);

                    return (
                      <div key={user.uid} className="p-3 flex items-center justify-between gap-2.5 hover:bg-cream/40 transition-colors">
                        {/* Avatar & User Details */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            isOwnerUser || user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 border border-purple-300'
                              : isProUser
                              ? 'bg-gold-pale text-gold-dark border border-gold/40'
                              : 'bg-gray-100 text-charcoal/80 border border-border/70'
                          }`}>
                            {initials}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-charcoal dark:text-white text-[12.5px] truncate">
                                {user.displayName || 'Unnamed User'}
                              </span>
                              {isOwnerUser && (
                                <span className="text-[9px] bg-purple-100 text-purple-700 px-1 rounded font-bold shrink-0">
                                  Owner
                                </span>
                              )}
                              {user.emailVerified === false && (
                                <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-medium shrink-0">
                                  Unverified
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-light truncate flex items-center gap-1 mt-0.5">
                              <span className="truncate">{user.email || user.uid}</span>
                              {isOwnerUser ? (
                                <>
                                  <span>•</span>
                                  <span className="text-sage-dark font-medium shrink-0">Lifetime</span>
                                </>
                              ) : user.planExpiry ? (
                                <>
                                  <span>•</span>
                                  <span className={`shrink-0 ${isExpired ? 'text-critical font-medium' : ''}`}>
                                    {isExpired ? 'Expired' : formatDateDDMMYY(user.planExpiry)}
                                  </span>
                                </>
                              ) : isProUser ? (
                                <>
                                  <span>•</span>
                                  <span className="text-sage-dark font-medium shrink-0">Lifetime</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* Right: Single-Line Plan Pill + Quick Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(user);
                              setPlanOption(isProUser ? 'premium' : 'free');
                              setDurationMonths(user.planExpiry ? 3 : null);
                            }}
                            className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11.5px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-3xs active:scale-95 ${
                              isProUser
                                ? 'bg-gold-pale text-gold-dark border border-gold/40 hover:bg-gold/20'
                                : 'bg-gray-100 text-charcoal/80 border border-border/80 hover:bg-gray-200/60'
                            }`}
                          >
                            <span>{isProUser ? '✨ Pro' : 'Free'}</span>
                            <ChevronDown size={11} className="opacity-60" />
                          </button>

                          {/* Admin toggle icon */}
                          {!isOwnerUser && (
                            <button
                              type="button"
                              onClick={() => handleToggleAdminRole(user)}
                              disabled={updatingUid === user.uid}
                              title={user.role === 'admin' ? "Revoke Admin" : "Grant Admin"}
                              className={`p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                                user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                  : 'text-gray-300 hover:text-purple-600'
                              }`}
                            >
                              👑
                            </button>
                          )}

                          {/* Delete button */}
                          {!isOwnerUser && !isSuperAdminEmail(user.email) && (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(user)}
                              title="Delete user"
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. DESKTOP EXPANSIVE TABLE (spacious, clean single-line pills, wide headers) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-[13px] border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-gray-50/70 dark:bg-charcoal/20 text-light text-[11px] uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Plan</th>
                        <th className="py-3 px-4">Expiry</th>
                        <th className="py-3 px-4">Joined</th>
                        <th className="py-3 px-4 text-center">Admin</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map((user) => {
                        const isOwnerUser = isSuperAdminEmail(user.email);
                        const isProUser = isOwnerUser || user.planTier === 'premium' || (user.planTier as string) === 'pro' || user.role === 'admin';
                        const isExpired = user.planExpiry ? user.planExpiry < Date.now() : false;
                        const initials = getInitials(user.displayName, user.email);

                        return (
                          <tr key={user.uid} className="hover:bg-cream/40 dark:hover:bg-white/5 transition-colors group">
                            {/* User Details */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                                  isOwnerUser || user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                    : isProUser
                                    ? 'bg-gold-pale text-gold-dark border border-gold/30'
                                    : 'bg-gray-100 dark:bg-charcoal/30 text-charcoal/80 dark:text-white/80'
                                }`}>
                                  {initials}
                                </div>

                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-charcoal dark:text-white truncate max-w-[200px]" title={user.displayName || ''}>
                                      {user.displayName || 'Unnamed User'}
                                    </span>
                                    {isOwnerUser && (
                                      <span className="text-[9px] bg-purple-100 text-purple-700 px-1 rounded font-bold shrink-0">
                                        Owner
                                      </span>
                                    )}
                                    {user.emailVerified === false && (
                                      <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded font-semibold shrink-0">
                                        Unverified
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-light text-[11.5px] truncate max-w-[220px]" title={user.email || user.uid}>
                                    {user.email || user.uid}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Plan Tier Pill (Strictly Single-Line) */}
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setPlanOption(isProUser ? 'premium' : 'free');
                                  setDurationMonths(user.planExpiry ? 3 : null);
                                }}
                                title="Click to change plan"
                                className={`whitespace-nowrap inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all shadow-3xs hover:scale-105 active:scale-95 ${
                                  isProUser
                                    ? 'bg-gold-pale text-gold-dark border border-gold/40 hover:bg-gold/20'
                                    : 'bg-gray-100 dark:bg-white/10 text-charcoal/80 dark:text-white/80 border border-border hover:border-gray-400'
                                }`}
                              >
                                <span>{isProUser ? '✨ Pro' : 'Free'}</span>
                                <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                              </button>
                            </td>

                            {/* Expiry */}
                            <td className="py-3 px-4 text-medium text-xs whitespace-nowrap">
                              {isOwnerUser ? (
                                <span className="text-sage-dark dark:text-sage font-semibold">Lifetime</span>
                              ) : user.planExpiry ? (
                                isExpired ? (
                                  <span className="text-critical font-semibold">Expired</span>
                                ) : (
                                  <span className="font-medium text-charcoal/80 dark:text-white/80">
                                    {formatDateDDMMYY(user.planExpiry)}
                                  </span>
                                )
                              ) : isProUser ? (
                                <span className="text-sage-dark dark:text-sage font-semibold">Lifetime</span>
                              ) : (
                                <span className="text-light">—</span>
                              )}
                            </td>

                            {/* Joined Date */}
                            <td className="py-3 px-4 text-light text-xs whitespace-nowrap">
                              {formatDateDDMMYY(user.createdAt)}
                            </td>

                            {/* Admin Role Toggle Icon */}
                            <td className="py-3 px-4 text-center">
                              {isOwnerUser ? (
                                <span title="Primary Owner" className="text-purple-600 text-sm cursor-default">
                                  👑
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleAdminRole(user)}
                                  disabled={updatingUid === user.uid}
                                  title={user.role === 'admin' ? "Admin active (Click to revoke)" : "Click to grant Admin privileges"}
                                  className={`p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                                    user.role === 'admin'
                                      ? 'bg-purple-100 text-purple-700 border border-purple-300 shadow-3xs hover:bg-purple-200'
                                      : 'opacity-25 hover:opacity-100 hover:bg-purple-50 text-purple-700'
                                  }`}
                                >
                                  👑
                                </button>
                              )}
                            </td>

                            {/* Actions Column: Delete User */}
                            <td className="py-3 px-4 text-center">
                              {isOwnerUser || isSuperAdminEmail(user.email) ? (
                                <span className="text-xs text-light italic">—</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setUserToDelete(user)}
                                  title="Delete user and all data"
                                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FEEDBACKS */}
      {activeTab === 'feedbacks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-charcoal dark:text-white font-semibold">User Feedback & Inquiries</h3>
            <button
              onClick={fetchFeedbacks}
              disabled={loadingFeedbacks}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-white dark:bg-[#1E293B] border border-border rounded-xl text-charcoal dark:text-white cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingFeedbacks ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loadingFeedbacks ? (
            <div className="p-8 text-center text-medium flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-sage" />
              <span>Loading feedbacks...</span>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="p-8 text-center text-medium bg-white dark:bg-[#1E293B] border border-border rounded-2xl">
              No feedbacks submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((item) => (
                <div key={item.id} className="p-4 bg-white dark:bg-[#1E293B] border border-border rounded-2xl shadow-2xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md uppercase tracking-wider ${
                        item.type === 'bug' ? 'bg-amber-100 text-amber-800' :
                        item.type === 'feature' ? 'bg-sage-pale text-sage-dark' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[13px] font-semibold text-charcoal">{item.userEmail}</span>
                    </div>
                    <span className="text-[11.5px] text-light">
                      {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className="text-[13.5px] text-charcoal leading-relaxed whitespace-pre-wrap">
                    {item.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MOBILE MONETIZATION (IOS & ANDROID) */}
      {activeTab === 'monetization' && (
        <div className="space-y-6">
          {/* Card 1: Mobile In-App Paywall Master Toggles (iOS & Android) */}
          <div className="bg-white dark:bg-[#1E293B] border border-border rounded-2xl p-6 shadow-2xs space-y-5">
            {/* iOS Toggle */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-5 border-b border-border/70">
              <div>
                <h3 className="font-serif text-lg text-charcoal dark:text-white font-bold flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span>iOS App Store Subscription Paywall</span>
                </h3>
                <p className="text-[13px] text-medium mt-1">
                  Enforces Apple StoreKit 2 In-App Purchase (${monetizationConfig.introPriceUsd.toFixed(2)}/mo) for Pro features (AI Food Scanner, Report OCR, Ask AI, Partner Sync).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  monetizationConfig.isIosPaywallActive 
                    ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {monetizationConfig.isIosPaywallActive ? `Active Paywall ($${monetizationConfig.introPriceUsd.toFixed(2)}/mo)` : 'Free Launch Mode'}
                </span>

                <button
                  type="button"
                  onClick={() => setMonetizationConfig(prev => ({ ...prev, isIosPaywallActive: !prev.isIosPaywallActive }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    monetizationConfig.isIosPaywallActive ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      monetizationConfig.isIosPaywallActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Android Toggle */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-serif text-lg text-charcoal dark:text-white font-bold flex items-center gap-2">
                  <Crown className="w-5 h-5 text-emerald-600" />
                  <span>Android Google Play Subscription Paywall</span>
                </h3>
                <p className="text-[13px] text-medium mt-1">
                  Enforces Google Play Billing Subscription (${monetizationConfig.introPriceUsd.toFixed(2)}/mo) via RevenueCat for Android users (`in.ourpregnancy.bloom`).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  monetizationConfig.isAndroidPaywallActive 
                    ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {monetizationConfig.isAndroidPaywallActive ? `Active Paywall ($${monetizationConfig.introPriceUsd.toFixed(2)}/mo)` : 'Free Launch Mode'}
                </span>

                <button
                  type="button"
                  onClick={() => setMonetizationConfig(prev => ({ ...prev, isAndroidPaywallActive: !prev.isAndroidPaywallActive }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    monetizationConfig.isAndroidPaywallActive ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      monetizationConfig.isAndroidPaywallActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[12.5px] text-amber-950 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>App Store &amp; Google Play Compliance:</strong> When enabled, iOS and Android users see their native store paywall (Apple StoreKit 2 or Google Play Billing) with automatic &quot;Restore Purchases&quot; and store subscription management links. If disabled for a platform, users on that platform enjoy free access.
              </div>
            </div>
          </div>

          {/* Card 2: Pricing & Promotion Settings */}
          <div className="bg-white dark:bg-[#1E293B] border border-border rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-lg text-charcoal dark:text-white font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Pricing & Launch Promotion</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[12px] font-bold text-light uppercase tracking-wider block mb-1.5">
                  Promotional Price ($/mo)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.99"
                  value={monetizationConfig.introPriceUsd}
                  onChange={(e) => setMonetizationConfig(prev => ({ ...prev, introPriceUsd: parseFloat(e.target.value) || 2.99 }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-charcoal text-charcoal dark:text-white text-[14px] font-bold"
                />
                <span className="text-[11px] text-light mt-1 block">Default: $2.99 (First 3 mos)</span>
              </div>

              <div>
                <label className="text-[12px] font-bold text-light uppercase tracking-wider block mb-1.5">
                  Regular Price ($/mo)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1.99"
                  value={monetizationConfig.regularPriceUsd}
                  onChange={(e) => setMonetizationConfig(prev => ({ ...prev, regularPriceUsd: parseFloat(e.target.value) || 9.99 }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-charcoal text-charcoal dark:text-white text-[14px] font-bold"
                />
                <span className="text-[11px] text-light mt-1 block">Strikethrough: $9.99</span>
              </div>

              <div>
                <label className="text-[12px] font-bold text-light uppercase tracking-wider block mb-1.5">
                  Discount Badge (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={monetizationConfig.discountPercentage}
                  onChange={(e) => setMonetizationConfig(prev => ({ ...prev, discountPercentage: parseInt(e.target.value, 10) || 70 }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-charcoal text-charcoal dark:text-white text-[14px] font-bold"
                />
                <span className="text-[11px] text-light mt-1 block">Displayed on paywall badge</span>
              </div>
            </div>
          </div>

          {/* Card 3: Fair Use Daily Limits (Abuse Protection) */}
          <div className="bg-white dark:bg-[#1E293B] border border-border rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-lg text-charcoal dark:text-white font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>Fair Use Protection (Anti-Abuse Daily Limits)</span>
            </h3>
            <p className="text-[13px] text-medium">
              Protects your Gemini API budget from bots and scrapers. Normal mothers scan 2-5 times/day and will never hit these caps.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[12px] font-bold text-light uppercase tracking-wider block mb-1.5">
                  Max Food Scans / Day
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={monetizationConfig.dailyFoodScanLimit}
                  onChange={(e) => setMonetizationConfig(prev => ({ ...prev, dailyFoodScanLimit: parseInt(e.target.value, 10) || 25 }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-charcoal text-charcoal dark:text-white text-[14px] font-bold"
                />
                <span className="text-[11px] text-light mt-1 block">Recommended: 25 / day</span>
              </div>

              <div>
                <label className="text-[12px] font-bold text-light uppercase tracking-wider block mb-1.5">
                  Max AI Chat / Day
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={monetizationConfig.dailyAiChatLimit}
                  onChange={(e) => setMonetizationConfig(prev => ({ ...prev, dailyAiChatLimit: parseInt(e.target.value, 10) || 60 }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-charcoal text-charcoal dark:text-white text-[14px] font-bold"
                />
                <span className="text-[11px] text-light mt-1 block">Recommended: 60 / day</span>
              </div>

              <div>
                <label className="text-[12px] font-bold text-light uppercase tracking-wider block mb-1.5">
                  Max Reports / Day
                </label>
                <input
                  type="number"
                  min="2"
                  max="100"
                  value={monetizationConfig.dailyReportLimit}
                  onChange={(e) => setMonetizationConfig(prev => ({ ...prev, dailyReportLimit: parseInt(e.target.value, 10) || 10 }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-gray-50 dark:bg-charcoal text-charcoal dark:text-white text-[14px] font-bold"
                />
                <span className="text-[11px] text-light mt-1 block">Recommended: 10 / day</span>
              </div>
            </div>
          </div>

          {/* Unit Economics Calculator */}
          <div className="bg-gradient-to-br from-emerald-50 via-cream to-white border border-emerald-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="font-semibold text-emerald-900 text-[14px] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Unit Economics & Profit Margin (iOS & Android)</span>
              </h4>
              <span className="text-[11px] text-emerald-800 font-medium">
                15% service fee for first $1M/yr (Google Play 15% Tier & Apple Small Business)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1">
              <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                <span className="text-[11px] text-light uppercase font-bold block">User Price</span>
                <span className="text-[17px] font-bold text-charcoal font-sans">${monetizationConfig.introPriceUsd.toFixed(2)}/mo</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                <span className="text-[11px] text-light uppercase font-bold block">Store Fee (15% Tier)</span>
                <span className="text-[17px] font-bold text-rose-700 font-sans">-${(monetizationConfig.introPriceUsd * 0.15).toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                <span className="text-[11px] text-light uppercase font-bold block">Avg Gemini Cost</span>
                <span className="text-[17px] font-bold text-amber-700 font-sans">~$0.04</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-800 uppercase font-bold block">Your Net Profit</span>
                <span className="text-[17px] font-bold text-emerald-700 font-sans">+${(monetizationConfig.introPriceUsd * 0.85 - 0.04).toFixed(2)}/mo</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveMonetization}
              disabled={isSavingMonetization}
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl flex items-center gap-2 text-[14px] shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSavingMonetization ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-amber-400" />}
              <span>Save & Apply Monetization Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* PLAN CHANGE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[150] bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-border space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif text-2xl text-charcoal dark:text-white font-bold">Assign Subscription</h3>
                <p className="text-light text-[13px] mt-0.5 truncate max-w-[280px]">
                  {selectedUser.displayName || 'User'} ({selectedUser.email || selectedUser.uid})
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 text-light hover:text-charcoal dark:hover:text-white cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            {/* Select Plan Tier */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-light uppercase tracking-wider">Select Tier</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPlanOption('free')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    planOption === 'free'
                      ? 'border-charcoal dark:border-white bg-gray-100 dark:bg-white/10 font-bold text-charcoal dark:text-white'
                      : 'border-border hover:border-gray-300 text-charcoal dark:text-white'
                  }`}
                >
                  <span className="text-[13px] block">Free Plan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanOption('premium')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    planOption === 'premium'
                      ? 'border-gold bg-gold-pale text-gold-dark font-bold'
                      : 'border-border hover:border-gold text-charcoal dark:text-white'
                  }`}
                >
                  <span className="text-[13px] block">👑 Pro Plan</span>
                </button>
              </div>
            </div>

            {/* Select Duration */}
            {planOption !== 'free' && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-light uppercase tracking-wider">Duration</label>
                <div className="grid grid-cols-3 gap-2 text-[12px]">
                  {[
                    { label: '1 Month', val: 1 },
                    { label: '3 Months', val: 3 },
                    { label: '6 Months', val: 6 },
                    { label: '12 Months', val: 12 },
                    { label: 'Lifetime / Perpetual', val: null },
                  ].map((dur) => (
                    <button
                      key={String(dur.val)}
                      type="button"
                      onClick={() => setDurationMonths(dur.val)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
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
              <label className="flex items-center gap-2.5 p-3 bg-cream dark:bg-[#0F172A] border border-border rounded-xl cursor-pointer text-[12.5px] text-charcoal dark:text-white">
                <input
                  type="checkbox"
                  checked={sendEmailNotification}
                  onChange={(e) => setSendEmailNotification(e.target.checked)}
                  className="w-4 h-4 rounded text-sage focus:ring-sage"
                />
                <span className="flex items-center gap-1.5 font-medium truncate">
                  <Mail className="w-3.5 h-3.5 text-sage shrink-0" />
                  <span className="truncate">Send warm invitation email to <strong>{selectedUser.email}</strong></span>
                </span>
              </label>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-charcoal dark:text-white hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyPlan}
                disabled={updatingUid === selectedUser.uid}
                className="flex-1 py-2.5 bg-sage hover:bg-sage-dark text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-colors disabled:opacity-50"
              >
                {updatingUid === selectedUser.uid ? 'Saving...' : 'Confirm Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4">
            <div className="flex items-center gap-3 text-critical">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-[18px] text-charcoal">Delete User Account</h3>
                <p className="text-[12px] text-light">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50/70 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 rounded-xl space-y-2 text-[12.5px] text-charcoal">
              <p>
                Are you sure you want to permanently delete <strong className="text-red-700 dark:text-red-400">{userToDelete.displayName || userToDelete.email}</strong>?
              </p>
              <p className="text-[11.5px] text-light">
                This will completely remove:
              </p>
              <ul className="list-disc list-inside text-[11.5px] text-light space-y-0.5 pl-1">
                <li>Firebase Authentication login credentials</li>
                <li>User profile and pregnancy configurations</li>
                <li>All pregnancy tracking history (kicks, vitals, logs)</li>
                <li>All submitted feedback records</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-charcoal dark:text-white hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} /> Delete Permanently
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
