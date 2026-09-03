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

interface FeedbackItem {
  id: string;
  type: string;
  message: string;
  userEmail: string;
  createdAt: number;
}

export const AdminPanel: React.FC = () => {
  const { state } = usePlanner();
  const [activeTab, setActiveTab] = useState<'users' | 'feedbacks'>('users');
  
  // Users state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'premium' | 'standard' | 'free' | 'admin'>('all');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedbacks state
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

  // Selected user for modal / plan assign
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [planOption, setPlanOption] = useState<'free' | 'standard' | 'premium'>('premium');
  const [durationMonths, setDurationMonths] = useState<number | null>(null); // null = lifetime
  const [sendEmailNotification, setSendEmailNotification] = useState<boolean>(true);

  const isAdmin = state.isAdmin || auth.currentUser?.email === 'sukrat.kaushik@gmail.com' || auth.currentUser?.email === 'sukrat.kaushik@ourpregnancy.in';

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
    }
  }, [isAdmin]);

  const handleApplyPlan = async () => {
    if (!selectedUser) return;
    setUpdatingUid(selectedUser.uid);
    try {
      await updateUserSubscription(selectedUser.uid, planOption, durationMonths);
      
      let emailSuccessText = "";
      if (sendEmailNotification && selectedUser.email && (planOption === 'standard' || planOption === 'premium')) {
        try {
          const emailRes = await sendPlanChangeEmail(
            selectedUser.email,
            selectedUser.displayName,
            planOption,
            durationMonths
          );
          if (emailRes.success) {
            emailSuccessText = " & email notification sent";
          }
        } catch (e) {
          console.warn("Could not dispatch plan email:", e);
        }
      }

      showToast(`Updated plan for ${selectedUser.displayName || selectedUser.email || selectedUser.uid} to ${planOption.toUpperCase()}${emailSuccessText}!`);
      
      // Update local state
      setUsers(prev => prev.map(u => {
        if (u.uid === selectedUser.uid) {
          return {
            ...u,
            planTier: planOption,
            planExpiry: durationMonths ? Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000 : null,
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
    const isOwner = targetUser.email === 'sukrat.kaushik@gmail.com' || targetUser.email === 'sukrat.kaushik@ourpregnancy.in';
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

  const isSelectedUserOwner = selectedUser?.email === 'sukrat.kaushik@gmail.com' || selectedUser?.email === 'sukrat.kaushik@ourpregnancy.in';

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

  // Metric counts
  const premiumCount = users.filter(u => u.planTier === 'premium' || u.role === 'admin' || u.email === 'sukrat.kaushik@gmail.com' || u.email === 'sukrat.kaushik@ourpregnancy.in').length;
  const standardCount = users.filter(u => u.planTier === 'standard' && u.email !== 'sukrat.kaushik@gmail.com' && u.email !== 'sukrat.kaushik@ourpregnancy.in' && u.role !== 'admin').length;
  const freeCount = users.length - premiumCount - standardCount;
  const adminCount = users.filter(u => u.role === 'admin' || u.email === 'sukrat.kaushik@gmail.com' || u.email === 'sukrat.kaushik@ourpregnancy.in').length;

  const filteredUsers = users.filter(u => {
    const isOwner = u.email === 'sukrat.kaushik@gmail.com' || u.email === 'sukrat.kaushik@ourpregnancy.in';
    const effectivePlan = isOwner ? 'premium' : (u.planTier || 'free');

    // Filter by tier chips
    if (filterTier === 'premium' && effectivePlan !== 'premium') return false;
    if (filterTier === 'standard' && effectivePlan !== 'standard') return false;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="font-serif text-[clamp(24px,3.5vw,32px)] text-charcoal dark:text-white font-semibold tracking-tight whitespace-nowrap">
            Admin Suite
          </h1>
          <p className="text-medium text-[13.5px] mt-1">
            Manage user subscriptions, grant instant tier access, and review community feedbacks.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 dark:bg-charcoal/40 p-1 rounded-xl border border-border shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white dark:bg-[#1E293B] text-charcoal dark:text-white shadow-xs'
                : 'text-medium hover:text-charcoal'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users & Plans ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'feedbacks'
                ? 'bg-white dark:bg-[#1E293B] text-charcoal dark:text-white shadow-xs'
                : 'text-medium hover:text-charcoal'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedbacks ({feedbacks.length})</span>
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
        <div className="space-y-4">
          {/* Quick Filter Chips & Refresh */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'all', label: `All (${users.length})` },
                { key: 'premium', label: `✨ Premium (${premiumCount})` },
                { key: 'standard', label: `🌿 Standard (${standardCount})` },
                { key: 'free', label: `Free (${freeCount})` },
                { key: 'admin', label: `👑 Admins (${adminCount})` },
              ].map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => setFilterTier(chip.key as any)}
                  className={`px-3 py-1 text-[12px] font-bold rounded-full transition-all cursor-pointer ${
                    filterTier === chip.key
                      ? 'bg-charcoal text-white dark:bg-white dark:text-charcoal shadow-xs'
                      : 'bg-white dark:bg-[#1E293B] text-medium hover:text-charcoal dark:hover:text-white border border-border'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-white dark:bg-[#1E293B] hover:bg-gray-50 border border-border rounded-xl text-charcoal dark:text-white cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-light pointer-events-none" />
            <input
              type="text"
              placeholder="Search user by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#1E293B] border border-border rounded-xl text-sm focus:outline-none focus:border-sage shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-light hover:text-charcoal text-sm cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-border shadow-xs overflow-hidden">
            {loadingUsers ? (
              <div className="p-12 text-center text-medium flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-sage" />
                <span>Loading users database...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-medium">
                No users found {searchQuery ? `matching "${searchQuery}"` : 'in this category'}.
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                      const isOwnerUser = user.email === 'sukrat.kaushik@gmail.com';
                      const effectivePlan = isOwnerUser ? 'premium' : (user.planTier || 'free');
                      const isExpired = user.planExpiry ? user.planExpiry < Date.now() : false;
                      const initials = getInitials(user.displayName, user.email);

                      return (
                        <tr key={user.uid} className="hover:bg-cream/50 dark:hover:bg-white/5 transition-colors group">
                          {/* User Details */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              {/* Avatar monogram */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                                isOwnerUser || user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                  : effectivePlan === 'premium'
                                  ? 'bg-gold-pale text-gold-dark border border-gold/30'
                                  : effectivePlan === 'standard'
                                  ? 'bg-sage-pale text-sage-dark border border-sage/30'
                                  : 'bg-gray-100 dark:bg-charcoal/30 text-charcoal/80 dark:text-white/80'
                              }`}>
                                {initials}
                              </div>

                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-charcoal dark:text-white truncate max-w-[150px] sm:max-w-[200px]" title={user.displayName || ''}>
                                    {user.displayName || 'Unnamed User'}
                                  </span>
                                  {user.emailVerified === false && (
                                    <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded font-semibold shrink-0">
                                      Unverified
                                    </span>
                                  )}
                                </div>
                                <span className="text-light text-[11.5px] truncate max-w-[160px] sm:max-w-[200px]" title={user.email || user.uid}>
                                  {user.email || user.uid}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Plan Tier Pill (Interactive Clickable Badge) */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setPlanOption((user.planTier as any) || 'premium');
                                setDurationMonths(user.planExpiry ? 3 : null);
                              }}
                              title="Click to change plan"
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold cursor-pointer transition-all shadow-2xs hover:scale-105 active:scale-95 ${
                                effectivePlan === 'premium'
                                  ? 'bg-gold-pale text-gold-dark border border-gold/40 hover:bg-gold/20'
                                  : effectivePlan === 'standard'
                                  ? 'bg-sage-pale text-sage-dark border border-sage/40 hover:bg-sage/20'
                                  : 'bg-gray-100 dark:bg-white/10 text-charcoal/80 dark:text-white/80 border border-border hover:border-gray-400'
                              }`}
                            >
                              {effectivePlan === 'premium' && <Sparkles className="w-3 h-3 text-gold-dark" />}
                              {effectivePlan === 'standard' && <span>🌿</span>}
                              <span>{effectivePlan === 'premium' ? 'Premium' : effectivePlan === 'standard' ? 'Standard' : 'Free'}</span>
                              <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                            </button>
                          </td>

                          {/* Expiry */}
                          <td className="py-3 px-4 text-medium text-[12px] whitespace-nowrap">
                            {isOwnerUser ? (
                              <span className="text-sage-dark dark:text-sage font-semibold">Lifetime (Owner)</span>
                            ) : user.planExpiry ? (
                              isExpired ? (
                                <span className="text-critical font-semibold">Expired</span>
                              ) : (
                                <span className="font-medium text-charcoal/80 dark:text-white/80">
                                  {formatDateDDMMYY(user.planExpiry)}
                                </span>
                              )
                            ) : effectivePlan !== 'free' ? (
                              <span className="text-sage-dark dark:text-sage font-semibold">Lifetime</span>
                            ) : (
                              <span className="text-light">—</span>
                            )}
                          </td>

                          {/* Joined Date */}
                          <td className="py-3 px-4 text-light text-[12px] whitespace-nowrap">
                            {formatDateDDMMYY(user.createdAt)}
                          </td>

                          {/* Admin Role Toggle Icon */}
                          <td className="py-3 px-4 text-center">
                            {isOwnerUser ? (
                              <span title="Primary Owner" className="text-purple-600 text-[16px] cursor-default">
                                👑
                              </span>
                            ) : (
                              <button
                                onClick={() => handleToggleAdminRole(user)}
                                disabled={updatingUid === user.uid}
                                title={user.role === 'admin' ? "Admin active (Click to revoke)" : "Click to grant Admin privileges"}
                                className={`p-1.5 rounded-lg text-[14px] cursor-pointer transition-all ${
                                  user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-700 border border-purple-300 shadow-2xs hover:bg-purple-200'
                                    : 'opacity-30 hover:opacity-100 hover:bg-purple-50 text-purple-700'
                                }`}
                              >
                                👑
                              </button>
                            )}
                          </td>

                          {/* Actions Column: Delete User */}
                          <td className="py-3 px-4 text-center">
                            {isOwnerUser || user.email === 'sukrat.kaushik@gmail.com' ? (
                              <span className="text-[11px] text-light italic">—</span>
                            ) : (
                              <button
                                onClick={() => setUserToDelete(user)}
                                title="Delete user and all data"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPlanOption('free')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    planOption === 'free'
                      ? 'border-charcoal dark:border-white bg-gray-100 dark:bg-white/10 font-bold'
                      : 'border-border hover:border-gray-300'
                  }`}
                >
                  <span className="text-[13px] block">Free Starter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanOption('standard')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    planOption === 'standard'
                      ? 'border-sage bg-sage-pale text-sage-dark font-bold'
                      : 'border-border hover:border-sage'
                  }`}
                >
                  <span className="text-[13px] block">🌿 Standard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanOption('premium')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    planOption === 'premium'
                      ? 'border-gold bg-gold-pale text-gold-dark font-bold'
                      : 'border-border hover:border-gold'
                  }`}
                >
                  <span className="text-[13px] block">✨ Premium</span>
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
