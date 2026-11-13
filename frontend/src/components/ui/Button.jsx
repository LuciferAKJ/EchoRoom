import React from 'react';

/**
 * Reusable Button component adhering to EchoRoom's calm editorial design system.
 * Supports variants: 'primary' | 'secondary' | 'ghost' | 'danger'
 * Supports sizes: 'sm' | 'md' | 'lg'
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 select-none rounded-lg focus:outline-none focus:ring-2 focus:ring-echo-lavender/30 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-echo-lavender text-echo-bg hover:bg-echo-lavenderDark shadow-sm font-semibold',
    secondary: 'bg-echo-surface border border-echo-border text-echo-text hover:bg-echo-hover hover:border-echo-muted/40',
    ghost: 'text-echo-muted hover:text-echo-text hover:bg-echo-surface/60',
    danger: 'bg-echo-rose/20 text-echo-rose border border-echo-rose/30 hover:bg-echo-rose/30',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      ) : Icon ? (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;

