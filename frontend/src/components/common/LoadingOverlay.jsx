import React from 'react';

/**
 * LoadingOverlay
 *
 * Props:
 *   show     {boolean}
 *   message  {string}
 *   fullPage {boolean}  – true: covers full viewport, false: covers parent (parent must be relative)
 */
const LoadingOverlay = ({ show = true, message = 'Loading...', fullPage = false }) => {
  if (!show) return null;

  return (
    <div
      className={`${
        fullPage ? 'fixed inset-0 z-[200]' : 'absolute inset-0 z-10'
      } flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm`}
    >
      <div className="flex flex-col items-center gap-4 bg-surface-container-lowest rounded-2xl px-10 py-8 shadow-elevated">
        {/* Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-surface-container-high" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-body-sm font-semibold text-on-surface-variant">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
