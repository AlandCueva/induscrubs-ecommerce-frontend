import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { LEGAL_PAGES, LegalInline } from '../data/legalPages';

interface LegalPageProps {
  slug?: string;
  onNavigate?: (view: any, extra?: any) => void;
}

const renderInline = (parts: LegalInline[]) =>
  parts.map((part, i) =>
    typeof part === 'string' ? (
      <React.Fragment key={i}>{part}</React.Fragment>
    ) : (
      <strong key={i} className="font-semibold text-[#16232F]">
        {part.b}
      </strong>
    )
  );

const INTER = "'Inter Variable', Inter, sans-serif";

export const LegalPage: React.FC<LegalPageProps> = ({ slug, onNavigate }) => {
  const page = LEGAL_PAGES.find((p) => p.slug === slug);

  // Footer links swap pages without leaving this view, so key off the slug.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  return (
    <main id="legal-content" className="w-full bg-[#FFFFFF] py-6 sm:py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate?.('home')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5A6E85] hover:text-[#16232F] transition-colors mb-6 sm:mb-8 cursor-pointer group"
          aria-label="Volver al Inicio"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver al Inicio</span>
        </button>

        {/* ~68 characters per line keeps long legal text readable */}
        <article className="max-w-[68ch]" style={{ fontFamily: INTER }}>
          {page ? (
            <>
              <h1
                className="text-[#16232F] mb-2"
                style={{
                  fontFamily: INTER,
                  fontWeight: 700,
                  fontSize: '28px',
                  lineHeight: '1.1',
                  letterSpacing: '-0.025em',
                }}
              >
                {page.title}
              </h1>
              <p className="text-xs text-[#5A6E85] mb-8">{page.updated}</p>

              {page.blocks.map((block, i) => {
                if (block.t === 'h2') {
                  return (
                    <h2
                      key={i}
                      className="text-[#16232F] text-lg font-semibold leading-snug mt-10 mb-3"
                    >
                      {block.text}
                    </h2>
                  );
                }
                if (block.t === 'p') {
                  return (
                    <p key={i} className="text-[15px] leading-[1.7] text-[#3D4F63] mb-4">
                      {renderInline(block.c)}
                    </p>
                  );
                }
                const List = block.t === 'ol' ? 'ol' : 'ul';
                return (
                  <List
                    key={i}
                    className={`${
                      block.t === 'ol' ? 'list-decimal' : 'list-disc'
                    } pl-5 mb-4 space-y-2 text-[15px] leading-[1.7] text-[#3D4F63] marker:text-[#5A6E85]`}
                  >
                    {block.items.map((item, j) => (
                      <li key={j}>{renderInline(item)}</li>
                    ))}
                  </List>
                );
              })}
            </>
          ) : (
            <>
              <h1
                className="text-[#16232F] mb-2"
                style={{ fontFamily: INTER, fontWeight: 700, fontSize: '28px', lineHeight: '1.1' }}
              >
                Página no encontrada
              </h1>
              <p className="text-[15px] leading-[1.7] text-[#3D4F63]">
                No encontramos el documento que buscas.
              </p>
            </>
          )}
        </article>
      </div>
    </main>
  );
};
