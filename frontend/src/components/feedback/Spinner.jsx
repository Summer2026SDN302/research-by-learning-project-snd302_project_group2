/**
 * Spinner
 *
 * Reusable inline spinner. Renders a circular spinning indicator.
 * Use inside buttons or small UI slots where LoadingOverlay is too heavy.
 *
 * Props:
 *   size  {string}  – 'sm' | 'md' | 'lg'  (default: 'md')
 *
 * Usage:
 *   <Spinner />              – medium spinner
 *   <Spinner size="sm" />   – small spinner inside button
 *   <Spinner size="lg" />   – large spinner for section load
 */

/** Maps size prop to width/height class and border thickness */
const SIZE_CONFIG = {
  sm: { box: "w-4 h-4", border: "border-2" },
  md: { box: "w-6 h-6", border: "border-2" },
  lg: { box: "w-10 h-10", border: "border-4" },
};

const Spinner = ({ size = "md" }) => {
  const { box, border } = SIZE_CONFIG[size] ?? SIZE_CONFIG.md;

  return (
    <div className={`relative shrink-0 ${box}`}>
      {/* Track – static background circle */}
      <div
        className={`absolute inset-0 rounded-full ${border} border-surface-container-high`}
      />
      {/* Indicator – spinning arc */}
      <div
        className={`absolute inset-0 rounded-full ${border} border-transparent border-t-primary animate-spin`}
      />
    </div>
  );
};

export default Spinner;
