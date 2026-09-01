import React from 'react';

export const CtaBannerSection: React.FC = () => {
  const handleScrollToBestSellers = () => {
    const el = document.getElementById('best-sellers');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="cta-banner"
      className="relative w-full h-[80dvh] min-h-[520px] overflow-hidden select-none flex items-center justify-center"
    >
      {/* Background Image: cover-fit */}
      <img
        src="https://ik.imagekit.io/fjlcsp6fz/Induscrubs/scrollsectioneffect/CTA%20Banner.jpeg"
        alt="Induscrubs Lifestyle"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="lazy"
      />

      {/* Dark overlay (#16232F at ~50% opacity, same treatment as Hero) */}
      <div className="absolute inset-0 bg-[#16232F]/50 z-0" aria-hidden="true" />

      {/* Centered Content Container */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-6 md:px-12 max-w-4xl mx-auto">
        {/* Main phrase: white text, 40px typography exception on desktop, responsive on mobile */}
        <h2
          className="text-white font-bold text-[24px] sm:text-[32px] md:text-[40px] leading-[105%] tracking-[-0.02em] max-w-3xl"
          style={{
            fontFamily: "'Inter Variable', Inter, sans-serif",
            fontWeight: 700,
            lineHeight: '105%',
            letterSpacing: '-0.02em',
          }}
        >
          Uniformes tan versátiles como quienes los usan. De la guardia que no termina, al día libre que por fin llega — para tu jornada completa, y tu vida completa.
        </h2>

        {/* Brand closer line: Induscrubs in white text at standard 20px */}
        <p
          className="text-white font-bold text-[20px] leading-[105%] tracking-[-0.02em] mt-6"
          style={{
            fontFamily: "'Inter Variable', Inter, sans-serif",
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '105%',
            letterSpacing: '-0.02em',
          }}
        >
          Induscrubs
        </p>

        {/* COMPRAR AHORA primary button */}
        <button
          type="button"
          onClick={handleScrollToBestSellers}
          className="mt-8 h-12 px-8 bg-[#84B8FF] hover:bg-[#6FA5ED] text-[#FFFFFF] rounded-[6px] transition-colors flex items-center justify-center shadow-md cursor-pointer"
          style={{
            fontFamily: "'Inter Variable', Inter, sans-serif",
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '105%',
            letterSpacing: '-0.02em',
          }}
        >
          COMPRAR AHORA
        </button>
      </div>
    </section>
  );
};
