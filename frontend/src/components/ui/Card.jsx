import React from 'react';

/**
 * Reusable Card component adhering to EchoRoom's quiet, midnight-toned card design.
 */
export const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={`echo-card ${hover ? 'echo-card-hover' : ''} ${paddings[padding] || paddings.md} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-3 flex items-start justify-between gap-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-base font-semibold text-echo-text tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-xs text-echo-muted leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`text-sm text-echo-text/90 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-3 border-t border-echo-border/50 flex items-center justify-between gap-2 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;

