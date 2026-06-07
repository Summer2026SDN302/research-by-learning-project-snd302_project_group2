import { Fragment } from 'react';

/**
 * PageHeader
 *
 * Props:
 *   breadcrumbs  {Array<{label, path?}>}  – e.g. [{label:'Admin'},{label:'Users'}]
 *   title        {string}
 *   subtitle     {string}
 *   action       {ReactNode}              – optional CTA button on the right
 */
const PageHeader = ({
  breadcrumbs = [],
  title = 'Page Title',
  subtitle = '',
  action = null,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-label-md text-on-surface-variant mb-2">
            {breadcrumbs.map((crumb, idx) => (
              <Fragment key={idx}>
                {idx > 0 && (
                  <span className="material-symbols-outlined text-[14px] text-outline-variant">
                    chevron_right
                  </span>
                )}
                <span
                  className={
                    idx === breadcrumbs.length - 1
                      ? 'text-primary font-bold'
                      : 'hover:text-on-surface cursor-pointer transition-colors'
                  }
                >
                  {crumb.label}
                </span>
              </Fragment>
            ))}
          </nav>
        )}

        {/* Title */}
        <h2 className="text-headline-lg font-bold text-on-surface">{title}</h2>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-body-sm text-on-surface-variant mt-1">{subtitle}</p>
        )}
      </div>

      {/* Action slot */}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
