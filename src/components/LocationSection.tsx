import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';

export const LocationSection: React.FC = () => {
  const schedule = [
    { day: 'Lunes', hours: '10 AM–7 PM' },
    { day: 'Martes', hours: '10 AM–7 PM' },
    { day: 'Miércoles', hours: '10 AM–7 PM' },
    { day: 'Jueves', hours: '10 AM–7 PM' },
    { day: 'Viernes', hours: '10 AM–7 PM' },
    { day: 'Sábado', hours: '10 AM–3:30 PM' },
    { day: 'Domingo', hours: 'Cerrado' },
  ];

  return (
    <section id="ubicacion" className="relative w-full bg-[#FFFFFF] scroll-mt-24">
      {/* Map + Overlapping Card Container */}
      <div className="relative w-full flex flex-col md:block">
        {/* Full-width Embedded Google Map */}
        <div className="w-full h-[450px] sm:h-[540px] md:h-[650px] lg:h-[700px] bg-[#F7F9FB] overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d795.3207238967851!2d-79.20365271447122!3d-3.991993912290126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91cb4935f8ac8e47%3A0x4755ec98a0ee4d3c!2sInduscrubs%20(indumentaria%20m%C3%A9dica%20)!5e1!3m2!1sen!2sec!4v1788184024147!5m2!1sen!2sec"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación INDUSCRUBS Loja, Ecuador"
            className="w-full h-full block filter contrast-[1.02]"
          />
        </div>

        {/* Floating Info Card (Desktop: Bottom-Right Overlay | Mobile: Overlay or Tight Bottom on small screens) */}
        <div className="w-full md:w-auto md:absolute md:bottom-8 md:right-8 lg:bottom-12 lg:right-12 z-10 px-4 py-4 md:p-0">
          <div className="w-full md:w-[350px] lg:w-[370px] bg-[#FFFFFF] rounded-[6px] shadow-lg border border-[#DDE3EA] p-6 sm:p-7">
            {/* Header / Title */}
            <h2
              className="text-[#16232F] text-xl font-bold mb-4 flex items-center gap-2"
              style={{
                fontFamily: "'Inter Variable', Inter, sans-serif",
                fontWeight: 700,
                fontSize: '20px',
                lineHeight: '1.05',
                letterSpacing: '-0.02em',
              }}
            >
              <MapPin className="w-5 h-5 text-[#84B8FF] shrink-0" />
              <span>Nuestra Ubicación</span>
            </h2>

            {/* Address */}
            <div className="mb-4 text-sm text-[#16232F] flex items-start gap-2.5">
              <span className="font-semibold text-[#16232F] shrink-0">Dirección:</span>
              <span className="text-[#5B6B7A]">Antonio José de Sucre y Juan de Salinas</span>
            </div>

            {/* Phone (WhatsApp Link) */}
            <div className="mb-5 text-sm flex items-center gap-2.5">
              <span className="font-semibold text-[#16232F] shrink-0">Teléfono:</span>
              <a
                href="https://wa.me/593988223950"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-[#2C63AE] hover:text-[#225191] hover:underline transition-colors"
                aria-label="Contactar por WhatsApp al 0988223950"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>0988223950</span>
              </a>
            </div>

            {/* Divider */}
            <div className="border-t border-[#DDE3EA] pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-[#84B8FF] shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6B7A]">
                  Horario de Atención
                </span>
              </div>

              {/* Day / Hours Schedule */}
              <ul className="space-y-1.5 text-xs sm:text-[13px]">
                {schedule.map((item) => (
                  <li
                    key={item.day}
                    className="flex items-center justify-between text-[#16232F] py-0.5"
                  >
                    <span className="font-medium text-[#16232F]">{item.day}:</span>
                    <span
                      className={
                        item.hours === 'Cerrado'
                          ? 'text-[#B4522F] font-semibold'
                          : 'text-[#5B6B7A]'
                      }
                    >
                      {item.hours}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
