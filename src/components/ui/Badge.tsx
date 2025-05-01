import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  className = '' 
}) => {
  const variantClasses = {
    default: 'bg-gray-700 text-gray-200',
    primary: 'bg-indigo-900 text-indigo-200',
    secondary: 'bg-emerald-900 text-emerald-200',
    success: 'bg-green-900 text-green-200',
    warning: 'bg-amber-900 text-amber-200',
    danger: 'bg-rose-900 text-rose-200'
  };

  return (
    <span 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;