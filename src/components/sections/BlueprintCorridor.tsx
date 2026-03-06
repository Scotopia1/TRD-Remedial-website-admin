'use client';

import './BlueprintCorridor.css';

import { useRef, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatedH1 } from '@/components/animations/AnimatedH1';
import { scrollTriggerManager } from '@/utils/scrollTriggerManager';
import type { ProcessStep } from '@/types/api';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface BlueprintCorridorProps {
  steps: ProcessStep[];
  images: (string | undefined)[];
  serviceName: string;
}

/**
 * Blueprint Grid SVG overlay for the seam between image and content.
 * Renders horizontal lines, vertical lines, 45-degree cross-hatch, and intersection dots.
 * All lines use stroke-dasharray/dashoffset for draw-in animation via GSAP.
 */
function BlueprintGridSVG({ panelIndex }: { panelIndex: number }) {
  const gridWidth = 120;
  const spacing = 40;
  // Estimate a tall viewport height for the grid
  const gridHeight = 1200;
  const horizontalCount = Math.floor(gridHeight / spacing);
  const verticalCount = Math.floor(gridWidth / spacing);

  return (
    <svg
      className="corridor-blueprint-svg"
      viewBox={`0 0 ${gridWidth} ${gridHeight}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-panel={panelIndex}
    >
      {/* Horizontal lines */}
      <g className="bp-horizontal-lines" data-panel={panelIndex}>
        {Array.from({ length: horizontalCount + 1 }, (_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * spacing}
            x2={gridWidth}
            y2={i * spacing}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>

      {/* Vertical lines */}
      <g className="bp-vertical-lines" data-panel={panelIndex}>
        {Array.from({ length: verticalCount + 1 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={i * spacing}
            y1="0"
            x2={i * spacing}
            y2={gridHeight}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>

      {/* 45-degree cross-hatch */}
      <g className="bp-crosshatch" data-panel={panelIndex}>
        {Array.from({ length: Math.ceil((gridWidth + gridHeight) / spacing) }, (_, i) => {
          const offset = i * spacing - gridHeight;
          return (
            <line
              key={`ch-${i}`}
              x1={offset}
              y1={gridHeight}
              x2={offset + gridHeight}
              y2="0"
              stroke="rgba(255,255,255,0.02)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </g>

      {/* Intersection dots */}
      <g className="bp-dots" data-panel={panelIndex}>
        {Array.from({ length: (verticalCount + 1) * (horizontalCount + 1) }, (_, idx) => {
          const col = idx % (verticalCount + 1);
          const row = Math.floor(idx / (verticalCount + 1));
          return (
            <circle
              key={`d-${idx}`}
              cx={col * spacing}
              cy={row * spacing}
              r="1"
              fill="rgba(255,255,255,0.06)"
            />
          );
        })}
      </g>
    </svg>
  );
}

export function BlueprintCorridor({ steps, images, serviceName }: BlueprintCorridorProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const railStepRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelContentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const numSteps = steps.length;

  // Build image array: cycle through available images for each step
  const processImages = useMemo(() => {
    const available = images.filter(Boolean) as string[];
    if (available.length === 0) return [];
    return steps.map((_, i) => available[i % available.length]);
  }, [images, steps]);

  // Format step number as "01"
  const formatNum = useCallback((n: number) => String(n).padStart(2, '0'), []);

  // GSAP: horizontal scroll driven by vertical scroll
  useGSAP(() => {
    if (!frameRef.current || !panelsRef.current || numSteps === 0) return;

    const mm = gsap.matchMedia();

    // ==================== DESKTOP (>=901px, no-preference motion) ====================
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      const panels = panelsRef.current!;
      const frame = frameRef.current!;
      const totalPanels = numSteps;
      const scrollDistance = (totalPanels - 1) * window.innerWidth;

      // Main timeline: pin frame, translate panels horizontally
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: frame,
          start: 'top top',
          end: `+=${scrollDistance}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const currentStep = Math.min(
              Math.floor(progress * totalPanels),
              totalPanels - 1
            );

            // Update rail active state
            railStepRefs.current.forEach((btn, i) => {
              if (!btn) return;
              if (i === currentStep) {
                btn.classList.add('active');
              } else {
                btn.classList.remove('active');
              }
            });

            // Update progress bar
            if (progressFillRef.current) {
              progressFillRef.current.style.transform = `scaleX(${progress})`;
            }

            // Update counter
            if (counterRef.current) {
              counterRef.current.textContent = `${formatNum(currentStep + 1)} / ${formatNum(totalPanels)}`;
            }
          },
        },
      });

      // Translate panels container horizontally
      tl.to(panels, {
        x: -(totalPanels - 1) * 100 + 'vw',
        ease: 'none',
        duration: totalPanels - 1,
      }, 0);

      // Progress bar fill
      if (progressFillRef.current) {
        tl.to(progressFillRef.current, {
          scaleX: 1,
          ease: 'none',
          duration: totalPanels - 1,
        }, 0);
      }

      // Per-panel animations
      for (let i = 0; i < totalPanels; i++) {
        const panelEl = panels.children[i] as HTMLElement;
        if (!panelEl) continue;

        const label = panelEl.querySelector('.corridor-step-label') as HTMLElement;
        const title = panelEl.querySelector('.corridor-step-title') as HTMLElement;
        const desc = panelEl.querySelector('.corridor-step-description') as HTMLElement;
        const rule = panelEl.querySelector('.corridor-step-rule') as HTMLElement;
        const nextBtn = panelEl.querySelector('.corridor-step-next') as HTMLElement;
        const img = panelEl.querySelector('.corridor-panel-image img') as HTMLElement;
        const gridSvg = panelEl.querySelector('.corridor-blueprint-svg') as SVGElement;

        // Calculate position range for this panel
        const panelStart = i > 0 ? (i - 0.3) / (totalPanels - 1) : 0;
        const panelMid = i / (totalPanels - 1);
        const panelEnd = i < totalPanels - 1 ? (i + 0.7) / (totalPanels - 1) : 1;

        // Content entrance animation (staggered reveal)
        if (i === 0) {
          // First panel: animate immediately at start
          tl.fromTo(label,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.15, ease: 'power2.out' },
            0
          );
          tl.fromTo(title,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.2, ease: 'power2.out' },
            0.05
          );
          tl.fromTo(desc,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.2, ease: 'power2.out' },
            0.1
          );
          tl.fromTo(rule,
            { opacity: 0 },
            { opacity: 1, duration: 0.15 },
            0.15
          );
          tl.fromTo(nextBtn,
            { opacity: 0 },
            { opacity: 1, duration: 0.15 },
            0.18
          );
        } else {
          // Subsequent panels: animate when panel enters viewport
          const entrancePos = (i - 0.5) / (totalPanels - 1) * (totalPanels - 1);

          tl.fromTo(label,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.15, ease: 'power2.out' },
            entrancePos
          );
          tl.fromTo(title,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.2, ease: 'power2.out' },
            entrancePos + 0.05
          );
          tl.fromTo(desc,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.2, ease: 'power2.out' },
            entrancePos + 0.1
          );
          tl.fromTo(rule,
            { opacity: 0 },
            { opacity: 1, duration: 0.15 },
            entrancePos + 0.15
          );
          tl.fromTo(nextBtn,
            { opacity: 0 },
            { opacity: 1, duration: 0.15 },
            entrancePos + 0.18
          );
        }

        // Image subtle horizontal parallax
        if (img) {
          const parallaxStart = Math.max(0, (i - 0.5) / (totalPanels - 1)) * (totalPanels - 1);
          const parallaxEnd = Math.min(totalPanels - 1, (i + 0.5) / (totalPanels - 1) * (totalPanels - 1));
          tl.fromTo(img,
            { x: -30 },
            { x: 30, ease: 'none', duration: parallaxEnd - parallaxStart },
            parallaxStart
          );
        }

        // Blueprint grid draw-in animation
        if (gridSvg) {
          const hLines = gridSvg.querySelectorAll('.bp-horizontal-lines line');
          const vLines = gridSvg.querySelectorAll('.bp-vertical-lines line');
          const crosshatch = gridSvg.querySelectorAll('.bp-crosshatch line');
          const dots = gridSvg.querySelectorAll('.bp-dots circle');

          const gridStart = i === 0 ? 0 : (i - 0.4) / (totalPanels - 1) * (totalPanels - 1);

          // Set initial state for all grid elements
          hLines.forEach(line => {
            const length = (line as SVGLineElement).getTotalLength?.() || 120;
            gsap.set(line, {
              strokeDasharray: length,
              strokeDashoffset: length,
            });
          });
          vLines.forEach(line => {
            const length = (line as SVGLineElement).getTotalLength?.() || 1200;
            gsap.set(line, {
              strokeDasharray: length,
              strokeDashoffset: length,
            });
          });
          gsap.set(crosshatch, { opacity: 0 });
          gsap.set(dots, { opacity: 0 });

          // Draw horizontal lines first
          hLines.forEach((line, li) => {
            const length = (line as SVGLineElement).getTotalLength?.() || 120;
            tl.to(line, {
              strokeDashoffset: 0,
              duration: 0.03,
              ease: 'none',
            }, gridStart + li * 0.01);
          });

          // Then vertical lines
          vLines.forEach((line, li) => {
            const length = (line as SVGLineElement).getTotalLength?.() || 1200;
            tl.to(line, {
              strokeDashoffset: 0,
              duration: 0.05,
              ease: 'none',
            }, gridStart + 0.1 + li * 0.015);
          });

          // Cross-hatch fade in
          tl.to(crosshatch, {
            opacity: 1,
            duration: 0.1,
            stagger: 0.005,
          }, gridStart + 0.15);

          // Dots fade in
          tl.to(dots, {
            opacity: 1,
            duration: 0.08,
            stagger: 0.002,
          }, gridStart + 0.2);
        }

        // Exit dimming: as panel scrolls out left, dim content and shrink image
        if (i < totalPanels - 1) {
          const exitPos = (i + 0.3) / (totalPanels - 1) * (totalPanels - 1);
          const contentEls = [label, title, desc, rule, nextBtn].filter(Boolean);

          contentEls.forEach(el => {
            tl.to(el, {
              opacity: 0.3,
              duration: 0.3,
              ease: 'none',
            }, exitPos);
          });

          if (img) {
            tl.to(img, {
              scale: 0.95,
              duration: 0.3,
              ease: 'none',
            }, exitPos);
          }

          // Fade out grid on exit
          if (gridSvg) {
            tl.to(gridSvg, {
              opacity: 0,
              duration: 0.2,
            }, exitPos);
          }
        }
      }

      scrollTriggerManager.requestRefresh();
    });

    // ==================== DESKTOP with reduced motion ====================
    mm.add('(min-width: 901px) and (prefers-reduced-motion: reduce)', () => {
      const panels = panelsRef.current!;
      const frame = frameRef.current!;
      const totalPanels = numSteps;
      const scrollDistance = (totalPanels - 1) * window.innerWidth;

      // Still pin and scroll horizontally, but no entrance/exit animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: frame,
          start: 'top top',
          end: `+=${scrollDistance}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const currentStep = Math.min(
              Math.floor(progress * totalPanels),
              totalPanels - 1
            );

            railStepRefs.current.forEach((btn, i) => {
              if (!btn) return;
              btn.classList.toggle('active', i === currentStep);
            });

            if (progressFillRef.current) {
              progressFillRef.current.style.transform = `scaleX(${progress})`;
            }

            if (counterRef.current) {
              counterRef.current.textContent = `${formatNum(currentStep + 1)} / ${formatNum(totalPanels)}`;
            }
          },
        },
      });

      tl.to(panels, {
        x: -(totalPanels - 1) * 100 + 'vw',
        ease: 'none',
        duration: totalPanels - 1,
      }, 0);

      // Make all content immediately visible
      panels.querySelectorAll('.corridor-step-label, .corridor-step-title, .corridor-step-description, .corridor-step-rule, .corridor-step-next').forEach(el => {
        gsap.set(el, { opacity: 1, y: 0, transform: 'none' });
      });

      scrollTriggerManager.requestRefresh();
    });

    // ==================== MOBILE (<=900px) ====================
    mm.add('(max-width: 900px)', () => {
      // No horizontal scroll, no pinning
      // All content is visible via CSS (opacity: 1, transform: none)
      // Rail progress is hidden
    });

  }, { scope: sectionRef });

  // Handle rail step click: scroll to that step
  const handleRailClick = useCallback((stepIndex: number) => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth <= 900) return; // No click navigation on mobile

    // Find the ScrollTrigger for this section
    const triggers = ScrollTrigger.getAll();
    const myTrigger = triggers.find(t => t.vars.trigger === frameRef.current);
    if (!myTrigger) return;

    // Calculate the scroll position for this step
    const progress = numSteps > 1 ? stepIndex / (numSteps - 1) : 0;
    const scrollStart = myTrigger.start;
    const scrollEnd = myTrigger.end;
    const targetScroll = scrollStart + progress * (scrollEnd - scrollStart);

    gsap.to(window, {
      scrollTo: { y: targetScroll },
      duration: 0.8,
      ease: 'power2.inOut',
    });
  }, [numSteps]);

  if (!steps || steps.length === 0) return null;

  return (
    <section ref={sectionRef} className="corridor-section" aria-label={`${serviceName} process steps`}>
      {/* Section header */}
      <div className="corridor-header">
        <AnimatedH1 animateOnScroll={true} className="corridor-header-title">
          Our Process
        </AnimatedH1>
      </div>

      {/* Pinned corridor frame */}
      <div ref={frameRef} className="corridor-frame">
        {/* Top rail */}
        <div className="corridor-rail" role="tablist" aria-label="Process steps navigation">
          <div className="corridor-rail-inner">
            {steps.map((step, i) => (
              <button
                key={i}
                ref={(el) => { railStepRefs.current[i] = el; }}
                className={`corridor-rail-step${i === 0 ? ' active' : ''}`}
                role="tab"
                aria-selected={i === 0}
                aria-controls={`corridor-panel-${i}`}
                onClick={() => handleRailClick(i)}
              >
                {formatNum(step.step)} {step.title}
              </button>
            ))}
          </div>
          <div className="corridor-rail-progress">
            <div ref={progressFillRef} className="corridor-rail-progress-fill" />
          </div>
        </div>

        {/* Horizontal panels container */}
        <div ref={panelsRef} className="corridor-panels">
          {steps.map((step, i) => (
            <div
              key={i}
              id={`corridor-panel-${i}`}
              className="corridor-panel"
              role="tabpanel"
              aria-labelledby={`corridor-rail-step-${i}`}
            >
              {/* Left: Image */}
              <div className="corridor-panel-image">
                {processImages[i] && (
                  <img
                    src={processImages[i]}
                    alt={`${serviceName} - ${step.title}`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                )}
              </div>

              {/* Blueprint grid overlay (center seam) */}
              <div className="corridor-blueprint-grid">
                <BlueprintGridSVG panelIndex={i} />
              </div>

              {/* Right: Content */}
              <div
                ref={(el) => { panelContentRefs.current[i] = el; }}
                className="corridor-panel-content"
              >
                <div className="corridor-step-label">
                  Step {formatNum(step.step)}
                </div>
                <h3 className="corridor-step-title">
                  {step.title}
                </h3>
                <p className="corridor-step-description">
                  {step.description}
                </p>
                <div className="corridor-step-rule" aria-hidden="true" />
                {i < steps.length - 1 ? (
                  <button
                    className="corridor-step-next"
                    onClick={() => handleRailClick(i + 1)}
                    aria-label={`Go to next step: ${steps[i + 1].title}`}
                  >
                    Next: {steps[i + 1].title}
                    <svg
                      className="corridor-step-next-arrow"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <span className="corridor-step-next" style={{ cursor: 'default' }}>
                    Final Step
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom counter */}
        <div ref={counterRef} className="corridor-counter" aria-live="polite">
          01 / {formatNum(numSteps)}
        </div>
      </div>
    </section>
  );
}
