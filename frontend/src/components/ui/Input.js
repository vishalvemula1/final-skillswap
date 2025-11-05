import React from 'react';
import clsx from 'clsx';

const Input = React.forwardRef(({
  label,
  error,
  icon,
  className,
  ...props
}, ref) => {
  const baseStyles = 'w-full py-2 rounded-xl border-2 transition-smooth bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100';
  const paddingStyles = icon ? 'pl-10 pr-4' : 'px-4';
  const normalStyles = 'border-neutral-200 dark:border-neutral-700 focus:border-brand-500 dark:focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';
  const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/20';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            baseStyles,
            paddingStyles,
            error ? errorStyles : normalStyles,
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
