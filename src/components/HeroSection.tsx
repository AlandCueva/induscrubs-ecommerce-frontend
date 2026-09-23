import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onNavigateToCatalog: () => void;
  onNavigate?: (view: any, extra?: any) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigateToCatalog, onNavigate }) => {
  const videoSrc = 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/herosection.mp4';
  const posterSrc = 'https://images.unsplash.com/photo-1594824813590-78965a31a980?auto=format&fit=crop&w=1600&q=80';

  return (
    <section
      id="hero"
      className="relative w-full min-h-[100svh] flex items-center justify-center overflow-hidden border-b border-[#DDE3EA]"
    >
      {/* Background Video & Static Fallback for Reduced Motion */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#16232F]">
        {/* Static fallback image displayed when prefers-reduced-motion is active */}
        <img
          src={posterSrc}
          alt="Personal de salud en entorno clínico"
          className="hidden motion-reduce:block absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />

        {/* Autoplaying background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc}
          aria-label="Fondo decorativo: profesionales de la salud en movimiento"
          className="block motion-reduce:hidden absolute inset-0 w-full h-full object-cover object-center"
        >
          <source src={videoSrc} type="video/mp4" />
          {/* Fallback image inside video element for non-supporting browsers */}
          <img
            src={posterSrc}
            alt="Personal médico en acción"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Dark Navy Semi-Transparent Overlay (50% opacity for WCAG AA text contrast) */}
        <div
          className="absolute inset-0 bg-[#16232F]/50 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Centered Single-Column Content vertically and horizontally centered in 100svh */}
      <div className="relative z-10 max-container w-full pt-16 sm:pt-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          {/* Main Display Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FFFFFF] leading-[1.08] mb-4 sm:mb-6 text-center break-words">
            Tú cuidas de otros, nosotros cuidamos de ti.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-[#F2F7FF] max-w-xl mx-auto mb-8 sm:mb-10 text-center font-normal leading-relaxed">
            Uniformes médicos pensados para quienes cuidan.
          </p>

          {/* CTA: Size help (no action yet) */}
          <div className="w-full sm:w-auto flex flex-col items-center justify-center">
            <button
              type="button"
              className="w-full sm:w-auto max-w-full h-auto py-3 lg:h-12 lg:py-0 px-6 bg-[#84B8FF] hover:bg-[#6FA5ED] text-[#FFFFFF] text-sm font-semibold rounded-[6px] transition-colors flex items-center justify-center gap-2 min-h-[44px] shadow-sm cursor-pointer"
            >
              <span className="min-w-0 text-center leading-snug">¿No sabes tu talla? ¡Nosotros te ayudamos!</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

