import React, { useState } from 'react';
import { Instagram, Volume2, VolumeX } from 'lucide-react';
import { Section } from './Section';

const REELS: { id: string; src: string; label: string; href: string }[] = [
  {
    id: 'reel-1',
    src: 'https://ik.imagekit.io/reidyt4xa/Induscrubs/induscrubsec_DZoV57SIp8K.mp4',
    label: 'Reel de clienta con uniforme Induscrubs 1',
    href: 'https://www.instagram.com/p/DZoV57SIp8K/',
  },
  {
    id: 'reel-2',
    src: 'https://ik.imagekit.io/reidyt4xa/Induscrubs/induscrubsec_DYFp74IIaZa.mp4',
    label: 'Reel de clienta con uniforme Induscrubs 2',
    href: 'https://www.instagram.com/p/DYFp74IIaZa/',
  },
  {
    id: 'reel-3',
    src: 'https://ik.imagekit.io/reidyt4xa/Induscrubs/induscrubsec_DTJUZ9sEgMA.mp4',
    label: 'Reel de clienta con uniforme Induscrubs 3',
    href: 'https://www.instagram.com/p/DTJUZ9sEgMA/',
  },
  {
    id: 'reel-4',
    src: 'https://ik.imagekit.io/reidyt4xa/Induscrubs/induscrubsec_DZJJPrqIE0t.mp4',
    label: 'Reel de clienta con uniforme Induscrubs 4',
    href: 'https://www.instagram.com/p/DZbGeKQo2Pu/',
  },
];

export const LookGoodOnYouSection: React.FC = () => {
  // Reels autoplay muted (browsers block autoplay with sound); only one reel can have sound at a time
  const [soundId, setSoundId] = useState<string | null>(null);

  return (
    <Section
      id="mira-como-se-ve-en-ti"
      density="default"
      bg="white"
      title="Mira cómo se ve en ti"
      headerAlign="center"
    >
      <div className="flex md:grid md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 overflow-x-auto md:overflow-visible pb-4 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:pb-0 md:pt-0">
        {REELS.map((reel) => {
          const hasSound = soundId === reel.id;
          return (
            <div
              key={reel.id}
              className="relative w-[64%] sm:w-[44%] md:w-auto shrink-0 snap-start aspect-[9/16] overflow-hidden rounded-[6px] bg-[#F7F9FB]"
            >
              <video
                src={reel.src}
                className="w-full h-full object-cover"
                autoPlay
                muted={!hasSound}
                loop
                playsInline
                preload="auto"
                aria-label={reel.label}
              />

              {/* Whole tile links to the Instagram post; sound button sits above it */}
              <a
                href={reel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-10"
                aria-label={`Ver en Instagram: ${reel.label}`}
              />

              <span className="pointer-events-none absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-[#FFFFFF]/90 shadow-md flex items-center justify-center text-[#16232F]">
                <Instagram className="w-[18px] h-[18px]" />
              </span>

              <button
                type="button"
                onClick={() => setSoundId((prev) => (prev === reel.id ? null : reel.id))}
                className="absolute bottom-3 right-3 z-20 w-10 h-10 rounded-full bg-[#FFFFFF]/90 shadow-md flex items-center justify-center text-[#16232F] hover:bg-[#FFFFFF] transition-colors cursor-pointer"
                aria-label={hasSound ? 'Silenciar video' : 'Activar sonido'}
              >
                {hasSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          );
        })}
      </div>
    </Section>
  );
};
