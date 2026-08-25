import React, { useEffect, useState } from 'react';
import { db, auth, getAllUsersForAdmin, updateUserSubscription, setUserRole, sendPlanChangeEmail, UserProfile } from '../../firebase';
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
  RefreshCw
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
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Feedbacks state
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

  // Selected user for modal / plan assign
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [planOption, setPlanOption] = useState<'free' | 'standard' | 'premium'>('premium');
  const [durationMonths, setDurationMonths] = useState<number | null>(null); // null = lifetime
  const [sendEmailNotification, setSendEmailNotification] = useState<boolean>(true);

  const isAdmin = state.isAdmin || auth.currentUser?.email === 'sukrat.kaushik@gmail.com';

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
      // If upgraded to standard or premium and user has email, send welcome email
      if (sendEmailNotification && selectedUser.email && (planOption === 'standard' || planOption === 'premium')) {
        try {
          const emailRes = await sendPlanChangeEmail(
            selectedUser.email,
            selectedUser.displayName,
            planOption,
            durationMonths
          );
          if (emailRes.success) {
            emailSuccessText = " & email sent";
          }
        } catch (e) {
          console.warn("Could not dispatch plan email:", e);
        }
      }

      showToast(`Updated plan for ${selectedUser.email || selectedUser.uid} to ${planOption.toUpperCase()}${emailSuccessText}!`);
      
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
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change ${targetUser.email}'s role to ${newRole.toUpperCase()}?`)) {
      return;
    }
    setUpdatingUid(targetUser.uid);
    try {
      await setUserRole(targetUser.uid, newRole);
      showToast(`Updated role for ${targetUser.email} to ${newRole.toUpperCase()}`);
      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error("Failed to update role:", err);
      showToast("Error updating user role.");
    } finally {
      setUpdatingUid(null);
    }
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

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  const premiumCount = users.filter(u => u.planTier === 'premium' || u.role === 'admin' || u.email === 'sukrat.kaushik@gmail.com').length;
  const standardCount = users.filter(u => u.planTier === 'standard').length;
  const freeCount = users.length - premiumCount - standardCount;

  return (
    <div className="animate-in fade-in duration-300 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[28px]">👑</span>
            <h1 className="font-serif text-[clamp(26px,4vw,36px)] text-charcoal font-semibold tracking-tight">
              Admin Suite
            </h1>
            <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider">
              Owner Mode
            </span>
          </div>
          <p className="text-medium text-[14px] mt-1">
            Manage user subscriptions, grant tier access, and review community feedbacks.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 dark:bg-charcoal/40 p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white dark:bg-[#1E293B] text-charcoal dark:text-white shadow-sm'
                : 'text-medium hover:text-charcoal'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Plans ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'feedbacks'
                ? 'bg-white dark:bg-[#1E293B] text-charcoal dark:text-white shadow-sm'
                : 'text-medium hover:text-charcoal'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Feedbacks ({feedbacks.length})</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-8 right-8 z-[200] bg-charcoal text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold animate-in slide-in-from-bottom-5 border border-white/20">
          <CheckCircle className="w-5 h-5 text-sage" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TAB 1: USERS & PLANS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-border shadow-xs flex flex-col">
              <span className="text-light text-[12px] uppercase font-bold tracking-wider">Total Users</span>
              <span className="text-2xl font-serif text-charcoal dark:text-white font-bold mt-1">{users.length}</span>
            </div>
            <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gold/30 shadow-xs flex flex-col">
              <span className="text-gold text-[12px] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Premium
              </span>
              <span className="text-2xl font-serif text-charcoal dark:text-white font-bold mt-1">{premiumCount}</span>
            </div>
            <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-sage/30 shadow-xs flex flex-col">
              <span className="text-sage text-[12px] uppercase font-bold tracking-wider">Standard</span>
              <span className="text-2xl font-serif text-charcoal dark:text-white font-bold mt-1">{standardCount}</span>
            </div>
            <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-border shadow-xs flex flex-col">
              <span className="text-medium text-[12px] uppercase font-bold tracking-wider">Free Starter</span>
              <span className="text-2xl font-serif text-charcoal dark:text-white font-bold mt-1">{freeCount}</span>
            </div>
          </div>

          {/* Search & Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-border">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-light" />
              <input
                type="text"
                placeholder="Search user by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-cream dark:bg-[#0F172A] border border-border rounded-xl text-sm focus:outline-none focus:border-sage"
              />
            </div>

            <button
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold bg-cream dark:bg-[#0F172A] hover:bg-gray-100 border border-border rounded-xl text-charcoal dark:text-white cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
              <span>Refresh List</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-border shadow-xs overflow-hidden">
            {loadingUsers ? (
              <div className="p-12 text-center text-medium">Loading user database...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-medium">No users found matching "{searchQuery}".</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/50 dark:bg-charcoal/20 text-light text-[11px] uppercase font-bold tracking-wider">
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Plan Tier</th>
                      <th className="py-3.5 px-4">Expiry</th>
                      <th className="py-3.5 px-4">Joined</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user) => {
                      const isOwnerUser = user.email === 'sukrat.kaushik@gmail.com';
                      const effectivePlan = isOwnerUser ? 'premium' : (user.planTier || 'free');
                      const isExpired = user.planExpiry ? user.planExpiry < Date.now() : false;

                      return (
                        <tr key={user.uid} className="hover:bg-cream/50 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-charcoal dark:text-white">
                                {user.displayName || 'Unnamed User'}
                              </span>
                              <span className="text-light text-[12px]">{user.email || user.uid}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {user.role === 'admin' || isOwnerUser ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-300">
                                👑 Admin
                              </span>
                            ) : (
                              <span className="text-medium text-[12px]">User</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {effectivePlan === 'premium' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold-pale text-gold-dark border border-gold/30">
                                <Sparkles className="w-3 h-3" /> Premium
                              </span>
                            ) : effectivePlan === 'standard' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sage-pale text-sage-dark border border-sage/30">
                                Standard
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-charcoal/70">
                                Free
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-medium text-[12px]">
                            {isOwnerUser ? (
                              <span className="text-sage-dark font-medium">Lifetime (Owner)</span>
                            ) : user.planExpiry ? (
                              isExpired ? (
                                <span className="text-critical font-medium">Expired</span>
                              ) : (
                                <span>{new Date(user.planExpiry).toLocaleDateString()}</span>
                              )
                            ) : effectivePlan !== 'free' ? (
                              <span className="text-sage-dark font-medium">Lifetime</span>
                            ) : (
                              <span className="text-light">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-light text-[12px]">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setPlanOption((user.planTier as any) || 'premium');
                                }}
                                disabled={updatingUid === user.uid}
                                className="px-3 py-1.5 bg-sage hover:bg-sage-dark text-white rounded-lg text-[12px] font-bold shadow-xs cursor-pointer transition-colors"
                              >
                                Change Plan
                              </button>

                              {!isOwnerUser && (
                                <button
                                  onClick={() => handleToggleAdminRole(user)}
                                  disabled={updatingUid === user.uid}
                                  title="Toggle Admin role"
                                  className="p-1.5 hover:bg-purple-100 rounded-lg text-purple-700 cursor-pointer transition-colors"
                                >
                                  👑
                                </button>
                              )}
                            </div>
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
            <h3 className="font-serif text-xl text-charcoal dark:text-white">User Feedback & Inquiries</h3>
            <button
              onClick={fetchFeedbacks}
              disabled={loadingFeedbacks}
              className="flex items-center gap-2 px-3.5 py-1.5 text-[12px] font-semibold bg-white dark:bg-[#1E293B] border border-border rounded-xl text-charcoal dark:text-white cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingFeedbacks ? 'animate-spin' : ''}`} />
              <span>Refresh Feedbacks</span>
            </button>
          </div>

          {loadingFeedbacks ? (
            <div className="p-8 text-center text-medium">Loading feedbacks...</div>
          ) : feedbacks.length === 0 ? (
            <div className="p-8 text-center text-medium bg-white dark:bg-[#1E293B] border border-border rounded-2xl">
              No feedbacks submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((item) => (
                <div key={item.id} className="p-5 bg-white dark:bg-[#1E293B] border border-border rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md uppercase tracking-wider ${
                        item.type === 'bug' ? 'bg-amber-100 text-amber-800' :
                        item.type === 'feature' ? 'bg-sage-pale text-sage-dark' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[13px] font-semibold text-charcoal dark:text-white">{item.userEmail}</span>
                    </div>
                    <span className="text-[11.5px] text-light">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[14px] text-charcoal/90 dark:text-white/90 leading-relaxed whitespace-pre-wrap">
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
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-border space-y-6 animate-in zoom-in-95">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif text-2xl text-charcoal dark:text-white font-bold">Assign Subscription Plan</h3>
                <p className="text-light text-[13px] mt-0.5">
                  {selectedUser.displayName || 'User'} ({selectedUser.email || selectedUser.uid})
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 text-light hover:text-charcoal cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            {/* Select Plan Tier */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-light uppercase tracking-wider">Select Tier</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPlanOption('free')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    planOption === 'free'
                      ? 'border-charcoal bg-gray-100 dark:bg-white/10 font-bold'
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
                  <span className="text-[13px] block">Standard</span>
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
                  <span className="text-[13px] block">👑 Premium</span>
                </button>
              </div>
            </div>

            {/* Select Duration */}
            {planOption !== 'free' && (
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-light uppercase tracking-wider">Duration</label>
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
                <span className="flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-sage" />
                  <span>Send warm invitation email to <strong>{selectedUser.email}</strong></span>
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
    </div>
  );
};
