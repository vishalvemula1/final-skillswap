import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Card = ({
  children,
  variant = 'default',
  hover = true,
  className,
  onClick,
  ...props
}) => {
  const baseStyles = 'rounded-2xl p-6 transition-smooth';

  const variants = {
    default: 'bg-white dark:bg-neutral-800 shadow-soft hover:shadow-soft-lg',
    neumorphic: 'neumorphic',
    glass: 'glass shadow-soft',
    flat: 'bg-neutral-100 dark:bg-neutral-800',
  };

  const CardComponent = onClick ? motion.button : motion.div;

  return (
    <CardComponent
      whileHover={hover ? { y: -4 } : {}}
      className={clsx(
        baseStyles,
        variants[variant],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default Card;
