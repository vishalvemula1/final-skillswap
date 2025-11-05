import React from 'react';
import clsx from 'clsx';

const Avatar = ({
  name,
  size = 'md',
  className,
  ...props
}) => {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getColorFromName = (name) => {
    if (!name) return 'bg-neutral-400';
    const colors = [
      'bg-brand-500',
      'bg-accent-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-red-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-3xl',
  };

  return (
    <div
      className={clsx(
        'inline-flex items-center justify-center rounded-full text-white font-semibold',
        sizes[size],
        getColorFromName(name),
        className
      )}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
