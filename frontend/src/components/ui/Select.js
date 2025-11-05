import React from 'react';
import clsx from 'clsx';

const Select = React.forwardRef(({
  label,
  error,
  children,
  className,
  ...props
}, ref) => {
  const baseStyles = 'w-full px-4 py-2 rounded-xl border-2 transition-smooth bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100';
  const normalStyles = 'border-neutral-200 dark:border-neutral-700 focus:border-brand-500 dark:focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';
  const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/20';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={clsx(
          baseStyles,
          error ? errorStyles : normalStyles,
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
