import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

interface FeedbackItem {
  id: string;
  type: string;
  message: string;
  userEmail: string;
  createdAt: number;
}

export const AdminFeedbacks: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const isMasterAdmin = auth.currentUser?.email === 'sukrat.kaushik@gmail.com' || auth.currentUser?.email === 'sukrat.kaushik@ourpregnancy.in';

  useEffect(() => {
    const fetchFeedbacks = async () => {
      // Security check in UI
      if (!isMasterAdmin) {
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetched: FeedbackItem[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as FeedbackItem);
        });
        setFeedbacks(fetched);
      } catch (err) {
        console.error("Failed to fetch feedbacks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [isMasterAdmin]);

  if (loading) {
    return <div className="text-medium p-4">Loading feedbacks...</div>;
  }

  if (!isMasterAdmin) {
    return <div className="text-critical p-4">Unauthorized access.</div>;
  }

  return (
    <div className="animate-in fade-in duration-300 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[28px]">👑</span>
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal text-charcoal tracking-tight">Admin: Feedbacks</h1>
      </div>

      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="p-8 text-center text-medium bg-gray-50 border border-border rounded-xl">
            No feedback submitted yet.
          </div>
        ) : (
          feedbacks.map((item) => (
            <div key={item.id} className="p-5 bg-white border border-border rounded-[16px] shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider ${
                    item.type === 'bug' ? 'bg-amber-100 text-amber-800' :
                    item.type === 'feature' ? 'bg-sage-pale text-sage-dark' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-[13px] font-medium text-charcoal">{item.userEmail}</span>
                </div>
                <span className="text-[12px] text-medium">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="mt-2 text-[14px] text-charcoal whitespace-pre-wrap leading-relaxed">
                {item.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
