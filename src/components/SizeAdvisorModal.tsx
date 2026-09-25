import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, MessageCircle, X } from 'lucide-react';
import { BRANDS, BRAND_LABELS } from '../data/sizeCharts';
import type { Brand, Gender, Range } from '../data/sizeCharts';
import { measuresFor, recommendSize } from '../lib/recommendSize';
import type { Measure, SizeRecommendation } from '../lib/recommendSize';

// "Asesor de tallaje": recommends a size from body measurements (cm) for one of
// the supported brands. Frontend-only — nothing typed here is stored or sent.

const WHATSAPP_URL = 'https://wa.me/593988223950';

type Step = 'gender' | 'measures' | 'brand' | 'result';

const STEP_TITLES: Record<Step, string> = {
  gender: '¿Para quién es el uniforme?',
  measures: 'Tus medidas',
  brand: 'Elige la marca',
  result: 'Tu talla',
};

const GENDER_LABELS: Record<Gender, string> = { mujer: 'Mujer', hombre: 'Hombre' };

// Sensible body-measurement bounds (cm). Values outside are rejected as typos;
// values inside but above a brand's largest size are reported as "fuera de rango".
const LIMITS: Record<Measure, [number, number]> = {
  bust: [50, 200],
  waist: [40, 200],
  hips: [50, 220],
};

const measureLabel = (measure: Measure, gender: Gender) =>
  measure === 'bust' ? (gender === 'mujer' ? 'Busto' : 'Pecho') : measure === 'waist' ? 'Cintura' : 'Cadera';

const measureHint = (measure: Measure, gender: Gender) =>
  measure === 'bust'
    ? `Rodea la parte más ancha del ${gender === 'mujer' ? 'busto' : 'pecho'}, por debajo de los brazos.`
    : measure === 'waist'
      ? 'Mide sobre la cintura natural, sin apretar la cinta.'
      : 'Mide la parte más ancha de la cadera.';

const formatCm = (value: number) => `${value.toLocaleString('es-EC')} cm`;
const formatRange = ([min, max]: Range) => (min === max ? formatCm(min) : `${min}–${max} cm`);

type MeasureValues = Record<Measure, string>;
const EMPTY_VALUES: MeasureValues = { bust: '', waist: '', hips: '' };

// Accepts "92", "92.5" or "92,5" (Spanish decimal comma), one decimal max.
function parseMeasure(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  if (!/^\d{1,3}(\.\d)?$/.test(normalized)) return null;
  return Number(normalized);
}

function validateMeasure(measure: Measure, raw: string, gender: Gender): string | null {
  const label = measureLabel(measure, gender).toLowerCase();
  if (!raw.trim()) return `Ingresa tu medida de ${label}.`;
  const value = parseMeasure(raw);
  if (value === null) return 'Usa solo números, por ejemplo 92 o 92,5.';
  const [min, max] = LIMITS[measure];
  if (value < min || value > max) return `Ingresa un valor entre ${min} y ${max} cm.`;
  return null;
}

interface SizeAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Brand of the product being viewed. When set, the brand step is skipped.
  initialBrand?: Brand | null;
}

export const SizeAdvisorModal: React.FC<SizeAdvisorModalProps> = ({ isOpen, onClose, initialBrand = null }) => {
  const [step, setStep] = useState<Step>('gender');
  const [gender, setGender] = useState<Gender | null>(null);
  const [values, setValues] = useState<MeasureValues>(EMPTY_VALUES);
  const [showErrors, setShowErrors] = useState(false);
  const [brand, setBrand] = useState<Brand | null>(initialBrand);
  const [stepError, setStepError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pointerDownOnOverlay = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const idPrefix = useId();

  const steps: Step[] = initialBrand ? ['gender', 'measures', 'result'] : ['gender', 'measures', 'brand', 'result'];
  const stepIndex = steps.indexOf(step);

  // Fresh start every time the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    setStep('gender');
    setGender(null);
    setValues(EMPTY_VALUES);
    setShowErrors(false);
    setStepError(null);
    setBrand(initialBrand);
  }, [isOpen, initialBrand]);

  // Esc to close, Tab kept inside the dialog, body scroll locked, focus restored.
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  // Move focus to the step heading so screen readers announce each step.
  useEffect(() => {
    if (isOpen) headingRef.current?.focus();
  }, [isOpen, step]);

  if (!isOpen) return null;

  const activeMeasures = gender ? measuresFor(gender) : [];
  const errors: Partial<Record<Measure, string>> = {};
  if (gender) {
    for (const measure of activeMeasures) {
      const error = validateMeasure(measure, values[measure], gender);
      if (error) errors[measure] = error;
    }
  }

  let recommendation: SizeRecommendation | null = null;
  if (step === 'result' && gender && brand) {
    recommendation = recommendSize({
      gender,
      brand,
      bust: parseMeasure(values.bust) ?? 0,
      waist: parseMeasure(values.waist) ?? 0,
      hips: gender === 'mujer' ? (parseMeasure(values.hips) ?? 0) : undefined,
    });
  }

  const goTo = (next: Step) => {
    setStepError(null);
    setStep(next);
  };

  const handleNext = () => {
    if (step === 'gender') {
      if (!gender) return setStepError('Selecciona una opción para continuar.');
    } else if (step === 'measures') {
      if (Object.keys(errors).length > 0) {
        setShowErrors(true);
        const firstInvalid = activeMeasures.find((m) => errors[m]);
        if (firstInvalid) document.getElementById(`${idPrefix}-${firstInvalid}`)?.focus();
        return;
      }
    } else if (step === 'brand') {
      if (!brand) return setStepError('Selecciona una marca para continuar.');
    }
    goTo(steps[stepIndex + 1]);
  };

  const handleBack = () => {
    if (stepIndex > 0) goTo(steps[stepIndex - 1]);
  };

  const handleRestart = () => {
    setShowErrors(false);
    goTo('gender');
  };

  const handleMeasureChange = (measure: Measure, raw: string) => {
    // Keep only digits and one decimal separator; length-capped ("123,5").
    const cleaned = raw.replace(/[^\d.,]/g, '').slice(0, 5);
    setValues((prev) => ({ ...prev, [measure]: cleaned }));
  };

  const optionClass = (selected: boolean) =>
    `w-full min-h-[52px] px-4 py-3 rounded-[6px] border text-sm font-semibold text-left transition-colors cursor-pointer ${
      selected
        ? 'border-[#2C63AE] bg-[#2C63AE]/[0.06] text-[#2C63AE] ring-1 ring-[#2C63AE]'
        : 'border-[#DDE3EA] bg-[#FFFFFF] text-[#16232F] hover:border-[#16232F]/60'
    }`;

  const nextLabel = steps[stepIndex + 1] === 'result' ? 'Ver mi talla' : 'Siguiente';
  const headingId = `${idPrefix}-title`;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-[#000000]/60 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        pointerDownOnOverlay.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        // Only close when the whole click happened on the overlay (not a text
        // selection dragged out of an input).
        if (pointerDownOnOverlay.current && e.target === e.currentTarget) onClose();
        pointerDownOnOverlay.current = false;
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="relative w-full max-w-[520px] max-h-[calc(100dvh-2rem)] flex flex-col bg-[#FFFFFF] text-[#16232F] rounded-[8px] shadow-2xl overflow-hidden"
      >
        {/* Header: step counter + progress + close */}
        <div className="shrink-0 px-5 sm:px-6 pt-5 pb-4 border-b border-[#DDE3EA]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2C63AE]">
                Asesor de tallaje · Paso {stepIndex + 1} de {steps.length}
              </p>
              <h2
                id={headingId}
                ref={headingRef}
                tabIndex={-1}
                className="mt-1 text-xl font-bold tracking-tight focus:outline-none"
              >
                {STEP_TITLES[step]}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="shrink-0 -mr-2 -mt-1 w-10 h-10 flex items-center justify-center rounded-[4px] text-[#5A6E85] hover:text-[#16232F] hover:bg-[#F7F9FB] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }} aria-hidden="true">
            {steps.map((s, i) => (
              <div key={s} className={`h-1 rounded-[1px] ${i <= stepIndex ? 'bg-[#2C63AE]' : 'bg-[#DDE3EA]'}`} />
            ))}
          </div>
        </div>

        <form
          noValidate
          className="flex flex-col min-h-0 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (step !== 'result') handleNext();
          }}
        >
          {/* Body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-5">
            {step === 'gender' && (
              <div role="radiogroup" aria-labelledby={headingId} className="grid grid-cols-2 gap-3">
                {(['mujer', 'hombre'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    role="radio"
                    aria-checked={gender === g}
                    onClick={() => {
                      setGender(g);
                      setStepError(null);
                    }}
                    className={`${optionClass(gender === g)} text-center`}
                  >
                    {GENDER_LABELS[g]}
                  </button>
                ))}
              </div>
            )}

            {step === 'measures' && gender && (
              <div className="space-y-5">
                <p className="text-sm text-[#5A6E85] leading-relaxed">
                  Usa una cinta métrica y escribe tus medidas en centímetros.
                  {initialBrand && (
                    <>
                      {' '}
                      Calcularemos tu talla en <strong className="text-[#16232F]">{BRAND_LABELS[initialBrand]}</strong>.
                    </>
                  )}
                </p>
                {activeMeasures.map((measure) => {
                  const inputId = `${idPrefix}-${measure}`;
                  const hintId = `${inputId}-hint`;
                  const errorId = `${inputId}-error`;
                  const error = showErrors ? errors[measure] : undefined;
                  return (
                    <div key={measure} className="sm:grid sm:grid-cols-[1fr_140px] sm:gap-4 sm:items-start">
                      <div className="mb-2 sm:mb-0">
                        <label htmlFor={inputId} className="block text-sm font-semibold">
                          {measureLabel(measure, gender)}
                        </label>
                        <p id={hintId} className="mt-0.5 text-xs text-[#5A6E85] leading-relaxed">
                          {measureHint(measure, gender)}
                        </p>
                      </div>
                      <div>
                        <div className="relative">
                          <input
                            id={inputId}
                            type="text"
                            inputMode="decimal"
                            autoComplete="off"
                            placeholder="0"
                            value={values[measure]}
                            onChange={(e) => handleMeasureChange(measure, e.target.value)}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? `${hintId} ${errorId}` : hintId}
                            className={`w-full h-11 pl-3 pr-10 rounded-[6px] border text-base font-semibold text-[#16232F] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#2C63AE]/40 ${
                              error ? 'border-[#C0392B]' : 'border-[#DDE3EA] focus:border-[#2C63AE]'
                            }`}
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#5A6E85]">
                            cm
                          </span>
                        </div>
                        {error && (
                          <p id={errorId} className="mt-1 text-xs font-medium text-[#C0392B]">
                            {error}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {step === 'brand' && (
              <div role="radiogroup" aria-labelledby={headingId} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BRANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    role="radio"
                    aria-checked={brand === b}
                    onClick={() => {
                      setBrand(b);
                      setStepError(null);
                    }}
                    className={optionClass(brand === b)}
                  >
                    {BRAND_LABELS[b]}
                  </button>
                ))}
              </div>
            )}

            {step === 'result' && gender && brand && recommendation && (
              <div aria-live="polite">
                {recommendation.status === 'ok' ? (
                  <>
                    <div className="flex items-end gap-4 pb-5 border-b border-[#DDE3EA]">
                      <span className="text-5xl font-bold tracking-tight text-[#2C63AE] leading-none">
                        {recommendation.size}
                      </span>
                      <span className="text-sm text-[#5A6E85] leading-snug">
                        Talla recomendada en <strong className="text-[#16232F]">{BRAND_LABELS[brand]}</strong>{' '}
                        ({GENDER_LABELS[gender]})
                      </span>
                    </div>
                    <table className="w-full mt-4 text-sm">
                      <caption className="sr-only">
                        Tus medidas frente al rango de la talla {recommendation.size} en {BRAND_LABELS[brand]}
                      </caption>
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-[#5A6E85]">
                          <th scope="col" className="py-2 font-semibold">Medida</th>
                          <th scope="col" className="py-2 font-semibold">Tu medida</th>
                          <th scope="col" className="py-2 font-semibold">Talla {recommendation.size}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recommendation.measures.map((m) => {
                          const range = recommendation.row[m.measure];
                          return (
                            <tr key={m.measure} className="border-t border-[#EAEFF4]">
                              <th scope="row" className="py-2.5 text-left font-semibold">
                                {measureLabel(m.measure, gender)}
                              </th>
                              <td className="py-2.5">{formatCm(m.value)}</td>
                              <td className="py-2.5">{range ? formatRange(range) : '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <p className="mt-4 text-xs text-[#5A6E85] leading-relaxed">
                      Si tus medidas quedan entre dos tallas, te recomendamos la mayor. Es una guía de referencia según la
                      tabla de la marca.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-base font-semibold">
                      Tus medidas están fuera de la tabla de {BRAND_LABELS[brand]} ({GENDER_LABELS[gender]}).
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-[#5A6E85]">
                      {recommendation.outOfRange.map((measure) => {
                        const value = recommendation.measures.find((m) => m.measure === measure)?.value;
                        return (
                          <li key={measure}>
                            {measureLabel(measure, gender)}: {value !== undefined ? formatCm(value) : '—'}
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-4 text-sm text-[#5A6E85] leading-relaxed">
                      Escríbenos y te ayudamos a encontrar la talla ideal con asesoría personalizada.
                    </p>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center justify-center gap-2 w-full sm:w-auto h-11 px-5 rounded-[6px] bg-[#2C63AE] hover:bg-[#245292] text-[#FFFFFF] text-sm font-semibold transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Escríbenos por WhatsApp
                    </a>
                  </>
                )}
              </div>
            )}

            {stepError && (
              <p role="alert" className="mt-3 text-xs font-medium text-[#C0392B]">
                {stepError}
              </p>
            )}
          </div>

          {/* Footer controls */}
          <div className="shrink-0 px-5 sm:px-6 py-4 border-t border-[#DDE3EA] flex items-center justify-between gap-3">
            {step === 'result' ? (
              <>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="h-11 px-4 rounded-[6px] border border-[#DDE3EA] text-sm font-semibold text-[#16232F] hover:border-[#16232F]/60 transition-colors cursor-pointer"
                >
                  Calcular de nuevo
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 px-5 rounded-[6px] bg-[#2C63AE] hover:bg-[#245292] text-[#FFFFFF] text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </>
            ) : (
              <>
                {stepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="h-11 px-4 rounded-[6px] border border-[#DDE3EA] text-sm font-semibold text-[#16232F] hover:border-[#16232F]/60 transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Atrás
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  className="h-11 px-5 rounded-[6px] bg-[#2C63AE] hover:bg-[#245292] text-[#FFFFFF] text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  {nextLabel}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
