import React from 'react';

export type SectionDensity = 'editorial' | 'default' | 'dense';
export type SectionBg = 'white' | 'tint-1' | 'tint-2' | 'ink' | 'bordered';

interface SectionProps {
  id?: string;
  density?: SectionDensity;
  bg?: SectionBg;
  eyebrow?: string;
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  titleAs?: 'h1' | 'h2' | 'h3';
  headerAlign?: 'left' | 'center' | 'split';
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  badge?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  id,
  density = 'default',
  bg = 'white',
  eyebrow,
  title,
  subtitle,
  titleAs = 'h2',
  headerAlign = 'left',
  headerAction,
  children,
  className = '',
  containerClassName = '',
  badge,
}) => {
  // Density styles
  const densityStyles: Record<SectionDensity, string> = {
    editorial: 'py-[var(--density-editorial)]',
    default: 'py-[var(--density-default)]',
    dense: 'py-[var(--density-dense)]',
  };

  // Background styles strictly respecting color contrast rules
  const bgStyles: Record<SectionBg, string> = {
    white: 'bg-[#FFFFFF] text-[#16232F]',
    'tint-1': 'bg-[#F2F7FF] text-[#16232F] border-y border-[#DDE3EA]',
    'tint-2': 'bg-[#F7F9FB] text-[#16232F] border-y border-[#DDE3EA]',
    ink: 'bg-[#16232F] text-[#FFFFFF]',
    bordered: 'bg-[#FFFFFF] text-[#16232F] border-b border-[#DDE3EA]',
  };

  const HeadingTag = titleAs;

  const hasHeader = Boolean(eyebrow || title || subtitle || headerAction || badge);

  return (
    <section
      id={id}
      className={`relative w-full ${densityStyles[density]} ${bgStyles[bg]} ${className}`}
    >
      <div className={`max-container ${containerClassName}`}>
        {hasHeader && (
          <div
            className={`mb-8 md:mb-12 ${
              headerAlign === 'center'
                ? 'text-center mx-auto max-w-[800px]'
                : headerAlign === 'split'
                ? 'flex flex-col md:flex-row md:items-end justify-between gap-4'
                : 'max-w-[800px]'
            }`}
          >
            <div className={headerAlign === 'center' ? 'flex flex-col items-center' : ''}>
              {badge && <div className="mb-3">{badge}</div>}

              {eyebrow && (
                <p className="type-micro text-[#0B7A6E] mb-2 font-semibold tracking-wider">
                  {eyebrow}
                </p>
              )}

              {title && (
                <HeadingTag
                  className={`text-[#16232F] ${
                    titleAs === 'h1'
                      ? 'type-display'
                      : density === 'editorial'
                      ? 'type-display-md'
                      : 'type-title'
                  } ${bg === 'ink' ? '!text-[#FFFFFF]' : ''}`}
                >
                  {title}
                </HeadingTag>
              )}

              {subtitle && (
                <p
                  className={`type-body text-[#5B6B7A] mt-3 prose-measure ${
                    bg === 'ink' ? '!text-[#DDE3EA]' : ''
                  }`}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {headerAction && (
              <div className="shrink-0 mt-4 md:mt-0">
                {headerAction}
              </div>
            )}
          </div>
        )}

        {children}
      </div>
    </section>
  );
};
