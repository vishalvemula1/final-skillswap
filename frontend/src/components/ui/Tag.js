import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import clsx from 'clsx';

const Tag = ({
  children,
  onRemove,
  variant = 'default',
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium';

  const variants = {
    default: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
    primary: 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300',
    accent: 'bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05 }}
      className={clsx(
        baseStyles,
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-smooth"
        >
          <X size={14} />
        </button>
      )}
    </motion.span>
  );
};

export default Tag;
