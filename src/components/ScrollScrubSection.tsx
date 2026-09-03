import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';
import { SIZE_ORDER as SIZES } from '../lib/products';

const START_FRAME = 40;
const END_FRAME = 96;
const TOTAL_FRAMES = END_FRAME - START_FRAME + 1; // 57 frames
const BASE_URL = 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/scrollsectioneffect/scrub916_';
// Not a real row in `products` — favoriting it is still allowed (frontend-only,
// no product lookup), it just never appears in the Favoritos list since that
// page filters against live product data (existing "skip stale ids" rule).
const PRODUCT_ID = 'greys-anatomy-scrub-set-negro';

const COLOR_VARIANTS = [
  {
    name: "Grey's Anatomy Scrub Set Red",
    price: '$65.00',
    colorLabel: 'Red',
    imageUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/scrubcred.webp',
  },
  {
    name: "Grey's Anatomy Scrub Set Blue",
    price: '$65.00',
    colorLabel: 'Blue',
    imageUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/scrubcblue.webp',
  },
];

const FRAME_URLS = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const frameNum = String(START_FRAME + i).padStart(3, '0');
  return `${BASE_URL}${frameNum}.webp`;
});

export const ScrollScrubSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shirtCalloutRef = useRef<HTMLDivElement>(null);
  const pantsCalloutRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const targetProgressRef = useRef<number>(0);
  const displayedProgressRef = useRef<number>(0);
  const isNearViewportRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>('M');

  // 1. Preload all 105 frames into memory (040 through 144)
  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    FRAME_URLS.forEach((url, idx) => {
      const img = new Image();
      img.src = url;

      const handleLoad = () => {
        if (isCancelled) return;
        loadedCount += 1;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));

        if (loadedCount === TOTAL_FRAMES) {
          setIsLoading(false);
        }
      };

      const handleError = () => {
        if (isCancelled) return;
        loadedCount += 1;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) {
          setIsLoading(false);
        }
      };

      img.onload = handleLoad;
      img.onerror = handleError;
      images[idx] = img;
    });

    imagesRef.current = images;

    return () => {
      isCancelled = true;
    };
  }, []);

  // Helper to compute contain draw parameters for an image on canvas (scaled to ~78% of column space for generous negative framing)
  const getImageDrawParams = (
    img: HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    // Scale frame to 78% of available container space to provide clean surrounding whitespace
    const scaleFactor = 0.78;
    const availWidth = canvasWidth * scaleFactor;
    const availHeight = canvasHeight * scaleFactor;
    const availRatio = availWidth / availHeight;

    let drawWidth = availWidth;
    let drawHeight = availHeight;

    if (availRatio > imgRatio) {
      drawWidth = availHeight * imgRatio;
      drawHeight = availHeight;
    } else {
      drawHeight = availWidth / imgRatio;
      drawWidth = availWidth;
    }

    const offsetX = (canvasWidth - drawWidth) / 2;
    const offsetY = (canvasHeight - drawHeight) / 2;

    return { offsetX, offsetY, drawWidth, drawHeight };
  };

  // 2. Render smoothed frame with cross-fade dissolution between adjacent frames
  const renderSmoothedFrame = (fractionalIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    if (canvasWidth === 0 || canvasHeight === 0) return;

    const baseIndex = Math.floor(fractionalIndex);
    const nextIndex = Math.min(TOTAL_FRAMES - 1, baseIndex + 1);
    const blend = fractionalIndex - baseIndex; // 0 to 1

    const imgBase = imagesRef.current[baseIndex];
    const imgNext = imagesRef.current[nextIndex];

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw base frame
    if (imgBase && imgBase.complete && imgBase.naturalWidth > 0) {
      const { offsetX, offsetY, drawWidth, drawHeight } = getImageDrawParams(
        imgBase,
        canvasWidth,
        canvasHeight
      );
      ctx.globalAlpha = 1;
      ctx.drawImage(imgBase, offsetX, offsetY, drawWidth, drawHeight);
    }

    // Blend next frame on top using fractional opacity
    if (blend > 0.005 && imgNext && imgNext.complete && imgNext.naturalWidth > 0) {
      const { offsetX, offsetY, drawWidth, drawHeight } = getImageDrawParams(
        imgNext,
        canvasWidth,
        canvasHeight
      );
      ctx.globalAlpha = blend;
      ctx.drawImage(imgNext, offsetX, offsetY, drawWidth, drawHeight);
      ctx.globalAlpha = 1;
    }

    // Apply minimal perimeter feathering exclusively at the outer image border (first 2-3% of edges only)
    if (imgBase && imgBase.complete && imgBase.naturalWidth > 0) {
      const { offsetX, offsetY, drawWidth, drawHeight } = getImageDrawParams(
        imgBase,
        canvasWidth,
        canvasHeight
      );

      ctx.globalCompositeOperation = 'destination-in';

      // Very narrow horizontal feathering strictly at the extreme left & right edges
      const hGrad = ctx.createLinearGradient(offsetX, 0, offsetX + drawWidth, 0);
      hGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      hGrad.addColorStop(0.025, 'rgba(0, 0, 0, 1)');
      hGrad.addColorStop(0.975, 'rgba(0, 0, 0, 1)');
      hGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Very narrow vertical feathering strictly at the extreme top & bottom edges
      const vGrad = ctx.createLinearGradient(0, offsetY, 0, offsetY + drawHeight);
      vGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vGrad.addColorStop(0.02, 'rgba(0, 0, 0, 1)');
      vGrad.addColorStop(0.98, 'rgba(0, 0, 0, 1)');
      vGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = vGrad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      ctx.globalCompositeOperation = 'source-over';
    }
  };

  // 3. Resize canvas to match display resolution and render
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const targetWidth = Math.floor(rect.width * dpr);
    const targetHeight = Math.floor(rect.height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    renderSmoothedFrame(displayedProgressRef.current * (TOTAL_FRAMES - 1));
  };

  useEffect(() => {
    if (isLoading) return;
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoading]);

  // 4. Smooth animation loop: LERP progress (factor: 0.15) & cross-fade render
  useEffect(() => {
    if (isLoading) return;

    const calculateTargetProgress = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const progress = Math.min(1, Math.max(0, -rect.top / totalScrollable));
      targetProgressRef.current = progress;
    };

    let isRunning = true;

    const animationTick = () => {
      if (!isRunning) return;

      if (isNearViewportRef.current) {
        // Interpolate displayed progress toward target progress (0.15 smoothing factor)
        const diff = targetProgressRef.current - displayedProgressRef.current;
        if (Math.abs(diff) > 0.0001) {
          displayedProgressRef.current += diff * 0.15;
        } else {
          displayedProgressRef.current = targetProgressRef.current;
        }

        const fractionalIndex = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, displayedProgressRef.current * (TOTAL_FRAMES - 1))
        );
        renderSmoothedFrame(fractionalIndex);

        // Compute sequential opacities for shirt & pants callouts
        const p = displayedProgressRef.current;

        // Shirt Callout Opacity: 1 from 0 to 0.35, fades out between 0.35 and 0.50
        let shirtOpacity = 0;
        if (p < 0.35) {
          shirtOpacity = 1;
        } else if (p <= 0.50) {
          shirtOpacity = (0.50 - p) / 0.15;
        } else {
          shirtOpacity = 0;
        }

        // Pants Callout Opacity: 0 before 0.50, fades in between 0.50 and 0.65, 1 from 0.65 to 1.0
        let pantsOpacity = 0;
        if (p < 0.50) {
          pantsOpacity = 0;
        } else if (p <= 0.65) {
          pantsOpacity = (p - 0.50) / 0.15;
        } else {
          pantsOpacity = 1;
        }

        if (shirtCalloutRef.current) {
          shirtCalloutRef.current.style.opacity = Math.max(0, Math.min(1, shirtOpacity)).toFixed(3);
          shirtCalloutRef.current.style.pointerEvents = shirtOpacity > 0.05 ? 'auto' : 'none';
        }

        if (pantsCalloutRef.current) {
          pantsCalloutRef.current.style.opacity = Math.max(0, Math.min(1, pantsOpacity)).toFixed(3);
          pantsCalloutRef.current.style.pointerEvents = pantsOpacity > 0.05 ? 'auto' : 'none';
        }
      }

      rafIdRef.current = requestAnimationFrame(animationTick);
    };

    const onScroll = () => {
      if (isNearViewportRef.current) {
        calculateTargetProgress();
      }
    };

    // IntersectionObserver gates computation when near viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isNearViewportRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          calculateTargetProgress();
        }
      },
      {
        rootMargin: '200px 0px 200px 0px',
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    calculateTargetProgress();
    displayedProgressRef.current = targetProgressRef.current;
    window.addEventListener('scroll', onScroll, { passive: true });
    rafIdRef.current = requestAnimationFrame(animationTick);

    return () => {
      isRunning = false;
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isLoading]);

  return (
    <section
      ref={containerRef}
      id="scroll-scrub-section"
      className="relative w-full md:h-[400vh] bg-[#FFFFFF]"
      aria-label="Presentación del uniforme médico Grey's Anatomy Scrub Set Negro"
    >
      {/* 1. Mobile-Only Static View (< md:) */}
      <div className="block md:hidden w-full bg-[#FFFFFF] pb-12">
        {/* Photo Container with Top Cropping (Head-to-Waist) and Bottom Fade Gradient */}
        <div className="relative w-full max-w-md mx-auto h-[340px] sm:h-[400px] overflow-hidden">
          <img
            src="https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/cucucucu.png"
            alt="Grey's Anatomy Scrub Set Negro"
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
          {/* Bottom fade gradient blending photo into the section background below */}
          <div
            className="pointer-events-none absolute bottom-0 inset-x-0 h-24 sm:h-32 z-10"
            style={{
              background: 'linear-gradient(to top, #FFFFFF 0%, rgba(255, 255, 255, 0.85) 45%, rgba(255, 255, 255, 0) 100%)',
            }}
          />
        </div>

        {/* Product Ficha Content (Reflowed to a single mobile column) */}
        <div className="max-w-md mx-auto px-5 sm:px-6 relative z-20 -mt-6">
          {/* Eyebrow Label */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2C63AE]">
              Nuestro Best Seller
            </span>
            <FavoriteButton productId={PRODUCT_ID} />
          </div>

          {/* Heading */}
          <h2
            className="text-[#16232F] mb-2"
            style={{
              fontFamily: "'Inter Variable', Inter, sans-serif",
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: '105%',
              letterSpacing: '-0.02em',
            }}
          >
            Grey's Anatomy Scrub Set Negro
          </h2>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-[#16232F] tracking-tight">$65</span>
            <span className="text-xs font-medium text-[#5A6E85]">IVA incluido</span>
          </div>

          {/* Description Copy */}
          <p className="text-sm text-[#5A6E85] leading-relaxed mb-5">
            Corte moderno, transpirable de principio a fin de turno. Bolsillos funcionales, tela resistente a manchas y ajuste pensado para moverte sin límites durante guardias largas.
          </p>

          {/* Size Selector */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#16232F] mb-2">
              <span>
                Talla: <span className="text-[#2C63AE] font-bold">{selectedSize}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`h-9 min-w-[40px] px-2.5 rounded-[4px] border text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer ${
                    selectedSize === size
                      ? 'bg-[#84B8FF] text-[#FFFFFF] border-[#84B8FF]'
                      : 'bg-[#FFFFFF] text-[#16232F] border-[#DDE3EA] hover:border-[#16232F]/60'
                  }`}
                  aria-label={`Seleccionar talla ${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Button — visual only; product is not real inventory yet, so no cart action is wired */}
          <button
            type="button"
            className="w-full h-12 bg-[#2C63AE] hover:bg-[#245292] text-[#FFFFFF] text-sm font-semibold rounded-[6px] transition-colors flex items-center justify-center min-h-[48px] shadow-sm cursor-pointer mb-6"
            aria-label="Grey's Anatomy Scrub Set Negro"
          >
            COMPRAR AHORA
          </button>

          {/* También disponible en */}
          <div className="pt-4 border-t border-[#DDE3EA]">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#16232F] mb-2.5">
              También disponible en
            </span>
            <div className="grid grid-cols-2 gap-3">
              {COLOR_VARIANTS.map((variant) => (
                <div
                  key={variant.name}
                  className="flex items-center gap-2.5 p-2 rounded-[6px] border border-[#DDE3EA] bg-[#FFFFFF] hover:border-[#16232F]/40 transition-colors cursor-default"
                >
                  <div className="w-10 h-12 rounded-[4px] overflow-hidden bg-[#F7F9FB] flex-shrink-0 border border-[#DDE3EA]/60">
                    <img
                      src={variant.imageUrl}
                      alt={variant.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-[#16232F] truncate">
                      {variant.name}
                    </span>
                    <span className="text-xs font-medium text-[#5A6E85]">
                      {variant.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Desktop/Tablet Sticky Scroll-Scrub Video View (>= md:) */}
      <div className="hidden md:flex sticky top-0 h-screen h-[100dvh] w-full overflow-hidden bg-[#FFFFFF] items-center justify-center isolate">
        <div className="w-full max-w-[1536px] mx-auto h-full pl-6 md:pl-8 lg:pl-10 pr-3 lg:pr-6 flex flex-row items-center gap-4 lg:gap-6 relative">
          {/* a. LEFT column: Persistent Product Info Panel (Expanded width for generous breathing room) */}
          <div className="w-[420px] md:w-[460px] lg:w-[540px] xl:w-[580px] flex-shrink-0 flex flex-col justify-center py-6 select-none z-20">
            {/* Eyebrow Label */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2C63AE]">
                Nuestro Best Seller
              </span>
              <FavoriteButton productId={PRODUCT_ID} />
            </div>

            {/* Locked Typography Heading */}
            <h2
              className="text-[#16232F] mb-2"
              style={{
                fontFamily: "'Inter Variable', Inter, sans-serif",
                fontWeight: 700,
                fontSize: '20px',
                lineHeight: '105%',
                letterSpacing: '-0.02em',
              }}
            >
              Grey's Anatomy Scrub Set Negro
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-[#16232F] tracking-tight">$65</span>
              <span className="text-xs font-medium text-[#5A6E85]">IVA incluido</span>
            </div>

            {/* Description Copy */}
            <p className="text-sm text-[#5A6E85] leading-relaxed mb-5">
              Corte moderno, transpirable de principio a fin de turno. Bolsillos funcionales, tela resistente a manchas y ajuste pensado para moverte sin límites durante guardias largas.
            </p>

            {/* Size Selector */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#16232F] mb-2">
                <span>Talla: <span className="text-[#2C63AE] font-bold">{selectedSize}</span></span>
              </div>
              <div className="flex flex-wrap gap-1.5 lg:gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`h-9 min-w-[38px] lg:min-w-[42px] px-2 rounded-[4px] border text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer ${
                      selectedSize === size
                        ? 'bg-[#84B8FF] text-[#FFFFFF] border-[#84B8FF]'
                        : 'bg-[#FFFFFF] text-[#16232F] border-[#DDE3EA] hover:border-[#16232F]/60'
                    }`}
                    aria-label={`Seleccionar talla ${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button — visual only; product is not real inventory yet, so no cart action is wired */}
            <button
              type="button"
              className="w-full h-12 bg-[#2C63AE] hover:bg-[#245292] text-[#FFFFFF] text-sm font-semibold rounded-[6px] transition-colors flex items-center justify-center min-h-[48px] shadow-sm cursor-pointer mb-6"
              aria-label="Grey's Anatomy Scrub Set Negro"
            >
              COMPRAR AHORA
            </button>

            {/* También disponible en */}
            <div className="pt-4 border-t border-[#DDE3EA]">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#16232F] mb-2.5">
                También disponible en
              </span>
              <div className="grid grid-cols-2 gap-3">
                {COLOR_VARIANTS.map((variant) => (
                  <div
                    key={variant.name}
                    className="flex items-center gap-2.5 p-2 rounded-[6px] border border-[#DDE3EA] bg-[#FFFFFF] hover:border-[#16232F]/40 transition-colors cursor-default"
                  >
                    <div className="w-10 h-12 lg:w-12 lg:h-14 rounded-[4px] overflow-hidden bg-[#F7F9FB] flex-shrink-0 border border-[#DDE3EA]/60">
                      <img
                        src={variant.imageUrl}
                        alt={variant.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-[#16232F] truncate">
                        {variant.name}
                      </span>
                      <span className="text-xs font-medium text-[#5A6E85]">
                        {variant.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* b. RIGHT column: Scroll-Scrub Video Pane (Closer to right edge, with scaled down uncropped video & clear callouts) */}
          <div className="flex-1 h-full relative flex items-center justify-center overflow-hidden">
            {/* Canvas Rendering Cross-Faded Image Sequence */}
            <canvas
              ref={canvasRef}
              className={`w-full h-full block object-contain bg-[#FFFFFF] transition-opacity duration-700 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {/* Sequential Scroll-Synced Callouts Overlay (Desktop only - positioned at z-20 ABOVE gradients for 100% visibility) */}
            {!isLoading && (
              <div className="absolute inset-0 pointer-events-none w-full h-full z-20">
                {/* Shirt Callout (Left side of right pane, inset comfortably from edge gradient) */}
                <div
                  ref={shirtCalloutRef}
                  className="pointer-events-auto absolute left-8 lg:left-12 top-[30%] -translate-y-1/2 max-w-[220px] lg:max-w-[260px] flex flex-col items-start"
                  style={{ opacity: 1 }}
                >
                  {/* Pointer line connecting to shirt area */}
                  <div className="flex items-center gap-2 mb-2 text-[#2C63AE]">
                    <div className="h-[2px] w-8 lg:w-12 bg-[#2C63AE] relative flex items-center">
                      <div className="absolute right-0 w-2 h-2 rounded-full bg-[#2C63AE]" />
                    </div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#5A6E85]">
                      Camisa
                    </span>
                  </div>

                  {/* Copy line with approved 32px size exception in fixed dark color */}
                  <p
                    className="text-[#16232F] text-left"
                    style={{
                      fontFamily: "'Inter Variable', Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: '32px',
                      lineHeight: '105%',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Ligereza que te acompaña turno tras turno
                  </p>
                </div>

                {/* Pants Callout (Right side of right pane, inset comfortably from edge gradient) */}
                <div
                  ref={pantsCalloutRef}
                  className="pointer-events-auto absolute right-8 lg:right-12 top-[62%] -translate-y-1/2 max-w-[220px] lg:max-w-[260px] flex flex-col items-end text-right"
                  style={{ opacity: 0 }}
                >
                  {/* Pointer line connecting to pants area */}
                  <div className="flex items-center gap-2 mb-2 text-[#2C63AE]">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#5A6E85]">
                      Pantalón
                    </span>
                    <div className="h-[2px] w-8 lg:w-12 bg-[#2C63AE] relative flex items-center">
                      <div className="absolute left-0 w-2 h-2 rounded-full bg-[#2C63AE]" />
                    </div>
                  </div>

                  {/* Copy line with approved 32px size exception in fixed dark color */}
                  <p
                    className="text-[#16232F] text-right"
                    style={{
                      fontFamily: "'Inter Variable', Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: '32px',
                      lineHeight: '105%',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Libertad de movimiento en el pantalón
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Minimal Preloading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFFFFF] text-[#16232F] gap-4 z-30">
            <Loader2 className="w-8 h-8 animate-spin text-[#2C63AE]" />
            <span className="text-sm font-medium tracking-wide text-[#16232F]/70">
              Cargando experiencia... {loadProgress}%
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
