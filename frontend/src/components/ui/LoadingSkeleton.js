import React from 'react';
import clsx from 'clsx';

const LoadingSkeleton = ({ className, ...props }) => {
  return (
    <div
      className={clsx(
        'animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded-xl',
        className
      )}
      {...props}
    />
  );
};

const SkeletonCard = () => (
  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-soft">
    <LoadingSkeleton className="h-6 w-3/4 mb-3" />
    <LoadingSkeleton className="h-4 w-full mb-2" />
    <LoadingSkeleton className="h-4 w-5/6" />
  </div>
);

const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <LoadingSkeleton
        key={i}
        className={clsx(
          'h-4',
          i === lines - 1 ? 'w-3/4' : 'w-full'
        )}
      />
    ))}
  </div>
);

LoadingSkeleton.Card = SkeletonCard;
LoadingSkeleton.Text = SkeletonText;

export default LoadingSkeleton;
