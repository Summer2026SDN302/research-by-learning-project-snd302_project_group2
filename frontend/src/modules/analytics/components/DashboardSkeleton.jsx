const DashboardSkeleton = ({ variant = "card" }) => {
  if (variant === "chart") {
    return (
      <div className="h-72 rounded-xl bg-surface-container animate-pulse border border-outline-variant" />
    );
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-surface-container" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-surface-container rounded" />
          <div className="h-6 w-32 bg-surface-container rounded" />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
