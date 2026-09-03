import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-8 sm:h-9 max-h-[36px]',
    md: 'h-12 sm:h-14 max-h-[56px]', // enlarged ~1.4x from 36px
    lg: 'h-16 sm:h-18 max-h-[72px]',
    xl: 'h-20 sm:h-24 max-h-[96px]',
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`} id="induscrubs-logo">
      <img
        src="https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/fondo169blancotransparente.webp"
        alt="INDUSCRUBS — Uniformes Médicos"
        className={`w-auto object-contain ${sizeClasses[size] || sizeClasses.md}`}
        loading="lazy"
      />
    </div>
  );
};

