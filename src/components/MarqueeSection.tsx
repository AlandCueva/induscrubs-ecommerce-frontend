import React from 'react';

const PHRASES = [
  'Cada guardia importa. Cada turno cuenta.',
  'Cuidas vidas. Nosotros cuidamos tu comodidad.',
  'Turnos largos, vocación más grande.',
  'El cansancio se va. Lo que hiciste, queda.',
  'Gracias por sostener el sistema, turno tras turno.',
];

export const MarqueeSection: React.FC = () => {
  return (
    <section className="relative w-full bg-[#84B8FF] overflow-hidden py-7 md:py-9 select-none">
      {/* Top vertical gradient fade blending background into white section above */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-4 md:h-6 z-10"
        style={{
          background: 'linear-gradient(to bottom, #FFFFFF 0%, rgba(132, 184, 255, 0) 100%)',
        }}
      />

      {/* Bottom vertical gradient fade blending background into white section below */}
      <div
        className="pointer-events-none absolute bottom-0 inset-x-0 h-4 md:h-6 z-10"
        style={{
          background: 'linear-gradient(to top, #FFFFFF 0%, rgba(132, 184, 255, 0) 100%)',
        }}
      />

      <style>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .marquee-content {
          display: flex;
          width: max-content;
          animation: marqueeScroll 28s linear infinite;
        }
      `}</style>

      {/* Infinite scrolling track */}
      <div className="w-full overflow-hidden flex items-center">
        <div className="marquee-content items-center whitespace-nowrap">
          {/* Double array ensures continuous 100% seamless infinite loop */}
          {[...PHRASES, ...PHRASES, ...PHRASES, ...PHRASES].map((phrase, index) => (
            <React.Fragment key={index}>
              <span
                className="text-white mx-4 md:mx-6 inline-block"
                style={{
                  fontFamily: "'Inter Variable', Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: '20px',
                  lineHeight: '105%',
                  letterSpacing: '-0.02em',
                }}
              >
                {phrase}
              </span>
              <span
                className="text-white/40 text-lg md:text-xl mx-2 inline-block"
                aria-hidden="true"
              >
                •
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
