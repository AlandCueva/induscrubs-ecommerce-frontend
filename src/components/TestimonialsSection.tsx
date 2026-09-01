import React from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  avatarUrl?: string;
  initials?: string;
  metadata: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'CHRISTIAN JRM',
    avatarUrl:
      'https://lh3.googleusercontent.com/a-/ALV-UjW8t-puKdhj9UWwuoA9OWXUkpsvP_GgfWdhRVU1RkzTcCvp3CaT=w90-h90-p-rp-mo-br100',
    metadata: '4 reseñas · 5 fotos · hace 1 año',
  },
  {
    name: 'DANGOPAKU',
    avatarUrl:
      'https://lh3.googleusercontent.com/a-/ALV-UjWotAhbr6pTpxzg2zJT5EOuiNpXJzWI8jV5EaxT1S7XVOdU2d3Y=w90-h90-p-rp-mo-ba12-br100',
    metadata: 'Local Guide · 35 reseñas · 16 fotos · hace 3 años',
  },
  {
    name: 'Mishel Vizuete',
    initials: 'MV',
    metadata: 'Local Guide · 8 reseñas · 27 fotos · hace 10 meses',
  },
  {
    name: 'Daniel Riofrío',
    initials: 'DR',
    metadata: '2 reseñas · hace 2 años',
  },
  {
    name: 'Erik Rosas',
    initials: 'ER',
    metadata: '2 reseñas · 1 foto · hace 3 años',
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section
      id="testimonios"
      className="relative w-full py-8 sm:py-10 md:py-12 bg-[#F7F9FB] border-y border-[#DDE3EA] overflow-hidden select-none"
    >
      <style>{`
        @keyframes testimonialsMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .testimonials-track {
          display: flex;
          width: max-content;
          animation: testimonialsMarquee 32s linear infinite;
        }
        .testimonials-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Side gradient fades for smooth visual entry/exit */}
      <div
        className="pointer-events-none absolute left-0 inset-y-0 w-8 md:w-16 z-10"
        style={{
          background: 'linear-gradient(to right, #F7F9FB 0%, rgba(247, 249, 251, 0) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute right-0 inset-y-0 w-8 md:w-16 z-10"
        style={{
          background: 'linear-gradient(to left, #F7F9FB 0%, rgba(247, 249, 251, 0) 100%)',
        }}
      />

      {/* Infinite scrolling track */}
      <div className="w-full overflow-hidden flex items-center">
        <div className="testimonials-track items-center">
          {/* Quadrupled array for seamless infinite right-to-left loop */}
          {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map(
            (item, index) => (
              <div
                key={index}
                className="w-[300px] sm:w-[340px] md:w-[360px] bg-[#FFFFFF] rounded-[6px] border border-[#DDE3EA] p-5 shadow-xs shrink-0 flex items-start gap-4 mx-2.5 sm:mx-3 transition-shadow hover:shadow-sm"
              >
                {/* Avatar */}
                {item.avatarUrl ? (
                  <img
                    src={item.avatarUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#DDE3EA]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#2C63AE] text-[#FFFFFF] font-bold text-sm sm:text-base flex items-center justify-center shrink-0">
                    {item.initials}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-[#16232F] truncate"
                    style={{
                      fontFamily: "'Inter Variable', Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: '20px',
                      lineHeight: '1.05',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {item.name}
                  </h3>

                  {/* 5 Filled Stars in Site Accent Color #2C63AE */}
                  <div
                    className="flex items-center gap-1 my-1.5"
                    aria-label="5 de 5 estrellas"
                  >
                    {[...Array(5)].map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        className="w-4 h-4 fill-[#2C63AE] text-[#2C63AE]"
                      />
                    ))}
                  </div>

                  {/* Plain gray metadata line */}
                  <p className="text-xs text-[#5B6B7A] tracking-normal truncate">
                    {item.metadata}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};
