import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-12 w-full rounded-2xl bg-cream-dark/40 dark:bg-charcoal/20 border border-border/50" />

      {/* Main Content Card Skeleton */}
      <div className="bg-white dark:bg-[#1E293B] border border-border/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage-pale/40 dark:bg-sage/10" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded-md bg-cream-dark/50 dark:bg-charcoal/30" />
            <div className="h-3.5 w-72 rounded-md bg-cream-dark/30 dark:bg-charcoal/20" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="h-28 w-full rounded-xl bg-cream/50 dark:bg-charcoal/10 border border-border/40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-32 rounded-xl bg-cream/40 dark:bg-charcoal/10 border border-border/40" />
            <div className="h-32 rounded-xl bg-cream/40 dark:bg-charcoal/10 border border-border/40" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
