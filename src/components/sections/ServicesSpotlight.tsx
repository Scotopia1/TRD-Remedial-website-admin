"use client";
import "./ServicesSpotlight.css";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Service } from "@/types/api";
import { getStableHeight } from '@/utils/deviceDetect';

interface SpotlightItem {
  name: string;
  img: string;
  id: string;
}

interface ServicesSpotlightProps {
  services?: Service[];
}

const ServicesSpotlight = ({ services: SERVICES = [] }: ServicesSpotlightProps) => {
  const spotlightRef = useRef<HTMLElement>(null);
  const titlesContainerRef = useRef<HTMLDivElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const spotlightHeaderRef = useRef<HTMLDivElement>(null);
  const titlesContainerElementRef = useRef<HTMLDivElement>(null);
  const introTextElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imageElementsRef = useRef<HTMLDivElement[]>([]);
  const titleElementsRef = useRef<NodeListOf<HTMLHeadingElement> | null>(null);
  const currentActiveIndexRef = useRef(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Ref for active background index - direct DOM manipulation avoids React re-renders
  const activeBgIndexRef = useRef(0);

  // CGMWTAUG2025 pattern: Mobile detection for conditional ScrollTrigger
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Track hydration state to prevent DOM manipulation during React hydration
  const [isHydrated, setIsHydrated] = useState(false);
  const hasInitializedRef = useRef(false);

  // Wait for hydration before DOM manipulation
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth <= 1000);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Configuration for synchronized title and image timing
  // Desktop config - Adjusted for perfect alignment when title reaches "OUR SERVICES" position
  const desktopConfig = {
    gap: 0.12,        // Increased gap for better spacing between service reveals
    speed: 0.4,       // Longer duration for smoother image transitions
    arcRadius: 500,   // Maintained from reference
  };

  // Mobile config - Optimized for smaller screens with very tight arc
  const mobileConfig = {
    gap: 0.08,        // Same as CGMWTAUG2025 standard - faster progression
    speed: 0.3,       // Balanced animation duration for mobile
    arcRadius: 40,    // Very tight arc to keep images close to text and fully on-screen
  };

  // Convert TRD services to spotlight items
  // Use heroImage (real project images) with visual (Unsplash) as fallback
  const spotlightItems: SpotlightItem[] = SERVICES.map((service) => ({
    name: service.title,
    img: service.heroImage || service.visual,
    id: service.id,
  }));

  useEffect(() => {
    // Wait for hydration and prevent duplicate initialization
    if (!isHydrated || hasInitializedRef.current) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const initializeSpotlight = () => {
      const titlesContainer = titlesContainerRef.current;
      const imagesContainer = imagesContainerRef.current;
      const spotlightHeader = spotlightHeaderRef.current;
      const titlesContainerElement = titlesContainerElementRef.current;
      const introTextElements = introTextElementsRef.current;
      const imageElements = imageElementsRef.current;

      if (
        !titlesContainer ||
        !imagesContainer ||
        !spotlightHeader ||
        !titlesContainerElement
      ) {
        return false;
      }

      // Clear and rebuild title elements only once after hydration
      // This prevents DOM conflicts during React hydration
      if (titlesContainer.children.length !== spotlightItems.length) {
        titlesContainer.innerHTML = "";

        // Create title elements for each service
        spotlightItems.forEach((item, index) => {
          // Create title element
          const titleElement = document.createElement("h1");
          titleElement.textContent = item.name;
          if (index === 0) titleElement.style.opacity = "1";
          titleElement.style.cursor = "pointer";
          titleElement.onclick = () => {
            window.location.href = `/services/${SERVICES[index].slug}`;
          };
          titlesContainer.appendChild(titleElement);
        });

        // Mark as initialized to prevent duplicate runs
        hasInitializedRef.current = true;
      }

      const titleElements = titlesContainer.querySelectorAll("h1");
      titleElementsRef.current = titleElements;

      if (titleElements.length === 0) {
        return false;
      }

      return true;
    };

    // Initialize with retry mechanism
    let initialized = initializeSpotlight();

    if (!initialized) {
      // Wait for next frame when DOM should be ready
      const rafId = requestAnimationFrame(() => {
        initialized = initializeSpotlight();
        if (!initialized) {
          // One more try after a short delay
          setTimeout(() => initializeSpotlight(), 100);
        }
      });
      return () => cancelAnimationFrame(rafId);
    }

    if (!initialized) {
      return;
    }

    const titlesContainer = titlesContainerRef.current;
    const imagesContainer = imagesContainerRef.current;
    const spotlightHeader = spotlightHeaderRef.current;
    const titlesContainerElement = titlesContainerElementRef.current;
    const introTextElements = introTextElementsRef.current;
    const imageElements = imageElementsRef.current;
    const titleElements = titleElementsRef.current;
    // Cache background image elements for per-frame updates (avoid DOM query in onUpdate)
    const bgImageElements = document.querySelectorAll('.spotlight-bg-img-item');
    let currentActiveIndex = 0;

    /**
     * Calculate position along quadratic Bezier curve
     * Creates the smooth arc motion for service images
     * @param t - Progress value 0-1 along the curve
     * @param isMobile - Whether to use mobile-optimized arc
     */
    function getBezierPosition(t: number, isMobile: boolean = false) {
      const config = isMobile ? mobileConfig : desktopConfig;
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;

      // Mobile arc: very compact positioning to keep images fully visible
      // Position images safely within viewport with generous margins
      const imageSize = containerWidth <= 640 ? 160 : 180;
      const safeMargin = 30; // 30px padding from edge
      const arcRadiusMargin = config.arcRadius; // Account for curve bulge

      const arcStartX = isMobile
        ? Math.min(
            containerWidth * 0.45,                                    // 45% of viewport (more centered)
            containerWidth - imageSize - safeMargin - arcRadiusMargin // Full image + margin + curve
          )
        : containerWidth * 0.9;

      const arcStartY = isMobile
        ? -150                   // Start slightly above viewport
        : -200;

      const arcEndY = isMobile
        ? containerHeight + 150  // End slightly below viewport
        : containerHeight + 200;

      const controlPointX = arcStartX + config.arcRadius;
      const controlPointY = containerHeight / 2;

      // Quadratic Bezier formula
      const x = (1 - t) * (1 - t) * arcStartX +
                2 * (1 - t) * t * controlPointX +
                t * t * arcStartX;

      const y = (1 - t) * (1 - t) * arcStartY +
                2 * (1 - t) * t * controlPointY +
                t * t * arcEndY;

      return { x, y };
    }

    /**
     * Calculate progress state for individual image
     * Returns -1 (before), 0-1 (animating), or 2 (after)
     * @param index - Index of the image/service
     * @param overallProgress - Overall scroll progress 0-1
     * @param isMobile - Whether to use mobile timing configuration
     */
    function getImgProgressState(index: number, overallProgress: number, isMobile: boolean = false) {
      const config = isMobile ? mobileConfig : desktopConfig;
      const startTime = index * config.gap;      // Each image starts staggered
      const endTime = startTime + config.speed;   // Animation duration

      if (overallProgress < startTime) return -1;  // Not started
      if (overallProgress > endTime) return 2;     // Finished (hidden)

      // Return normalized progress 0-1 for Bezier calculation
      return (overallProgress - startTime) / config.speed;
    }

    // CGMWTAUG2025 pattern: Only create complex ScrollTrigger on desktop
    // Mobile gets simpler, non-pinned experience
    if (!isMobileDevice) {
      // Desktop: Set background to scale(0) for Phase 1 animation (base CSS is scale(1) for mobile safety)
      gsap.set(".spotlight-bg-img", { transform: "scale(0)" });
      // Desktop: Set all images to invisible initially (will be animated)
      imageElements.forEach((img) => gsap.set(img, { opacity: 0 }));

      // Create ScrollTrigger - dynamic duration based on service count
      scrollTriggerRef.current = ScrollTrigger.create({
      trigger: ".services-spotlight",
      start: "top top",
      end: `+=${getStableHeight() * spotlightItems.length * 1.5}px`, // Increased for better timing sync
      pin: true,
      pinSpacing: true, // Enable spacing to prevent content skipping
      scrub: 1,
      refreshPriority: 9, // High priority after WhyChooseTRD
      onUpdate: (self) => {
        const progress = self.progress;

        // ==================== PHASE 1: Intro Text Split (0-20%) ====================
        if (progress <= 0.2) {
          const animationProgress = progress / 0.2;

          // Split intro text apart horizontally
          const moveDistance = window.innerWidth * 0.6;
          gsap.set(introTextElements[0], {
            x: -animationProgress * moveDistance,
          });
          gsap.set(introTextElements[1], {
            x: animationProgress * moveDistance,
          });
          gsap.set(introTextElements[0], { opacity: 1 });
          gsap.set(introTextElements[1], { opacity: 1 });

          // Scale background image
          gsap.set(".spotlight-bg-img", {
            transform: `scale(${animationProgress})`,
          });
          // Counter-scale inner image for zoom effect
          gsap.set(".spotlight-bg-img img", {
            transform: `scale(${1.5 - animationProgress * 0.5})`,
          });

          // Hide all other elements
          imageElements.forEach((img) => gsap.set(img, { opacity: 0 }));
          if (spotlightHeader) spotlightHeader.style.opacity = "0";
          gsap.set(titlesContainerElement, {
            "--before-opacity": "0",
            "--after-opacity": "0",
          });
        }
        // ==================== PHASE 2: Transition (20-25%) ====================
        else if (progress > 0.2 && progress <= 0.25) {
          // Finalize background scale
          gsap.set(".spotlight-bg-img", { transform: "scale(1)" });
          gsap.set(".spotlight-bg-img img", { transform: "scale(1)" });

          // Hide intro text
          gsap.set(introTextElements[0], { opacity: 0 });
          gsap.set(introTextElements[1], { opacity: 0 });

          // Show main UI elements
          imageElements.forEach((img) => gsap.set(img, { opacity: 0 }));
          if (spotlightHeader) {
            spotlightHeader.style.opacity = "1";
            // Reset to "Our Services" at start
            spotlightHeader.innerHTML = `<p>Our Services</p>`;
          }
          gsap.set(titlesContainerElement, {
            "--before-opacity": "1",
            "--after-opacity": "1",
          });

          // Reset active index for mobile header tracking
          currentActiveIndex = -1;
        }
        // ==================== PHASE 3: Main Animation (25-95%) ====================
        else if (progress > 0.25 && progress <= 0.95) {
          // Null check for required elements
          if (!titlesContainer || !titleElements) return;

          // Maintain background and intro text state
          gsap.set(".spotlight-bg-img", { transform: "scale(1)" });
          gsap.set(".spotlight-bg-img img", { transform: "scale(1)" });
          gsap.set(introTextElements[0], { opacity: 0 });
          gsap.set(introTextElements[1], { opacity: 0 });

          // Show header and decorative lines
          if (spotlightHeader) spotlightHeader.style.opacity = "1";
          gsap.set(titlesContainerElement, {
            "--before-opacity": "1",
            "--after-opacity": "1",
          });

          // Calculate scroll progress for main animation (0-1 range)
          const switchProgress = (progress - 0.25) / 0.7;

          // Animate titles scrolling vertically
          const viewportHeight = window.innerHeight;
          const titlesContainerHeight = titlesContainer.scrollHeight;
          const startPosition = viewportHeight;
          const targetPosition = -titlesContainerHeight;
          const totalDistance = startPosition - targetPosition;
          const currentY = startPosition - switchProgress * totalDistance;

          gsap.set(".spotlight-titles", {
            transform: `translateY(${currentY}px)`,
          });

          // Determine active index by which title is closest to viewport center
          const viewportCenter = viewportHeight / 2;
          let closestIndex = 0;
          let closestDistance = Infinity;

          if (titleElements) {
            titleElements.forEach((title, index) => {
              const rect = title.getBoundingClientRect();
              const titleCenter = rect.top + rect.height / 2;
              const distance = Math.abs(titleCenter - viewportCenter);
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
              }
            });
          }

          // Animate images along Bezier curve
          const isMobile = false; // Desktop mode
          imageElements.forEach((img, index) => {
            const imageProgress = getImgProgressState(index, switchProgress, isMobile);

            if (imageProgress < 0 || imageProgress > 1) {
              gsap.set(img, { opacity: 0 });
            } else {
              const pos = getBezierPosition(imageProgress, isMobile);
              gsap.set(img, {
                x: pos.x - 100,
                y: pos.y - 75,
                opacity: 1,
              });
            }
          });

          // Update title opacity based on index distance (no DOM query)
          if (!isMobile && titleElements) {
            titleElements.forEach((title, index) => {
              if (index === closestIndex) {
                title.style.opacity = "1";
              } else {
                const distance = Math.abs(index - closestIndex);
                if (distance === 1) {
                  title.style.opacity = "0.5";
                } else if (distance === 2) {
                  title.style.opacity = "0.3";
                } else {
                  title.style.opacity = "0.2";
                }
              }
            });
          }

          // Change background image when active service changes
          if (closestIndex !== currentActiveIndex) {
            if (closestIndex >= 0 && closestIndex < spotlightItems.length) {
              activeBgIndexRef.current = closestIndex;
              // Direct DOM: show current bg, hide others (use cached NodeList)
              bgImageElements.forEach((img, i) => {
                (img as HTMLElement).style.opacity = i === closestIndex ? '1' : '0';
              });
            }

            // On mobile: update header text to show service name
            if (isMobile && spotlightHeader && closestIndex >= 0) {
              const serviceName = spotlightItems[closestIndex].name;
              // Format: max 2 words per line
              const words = serviceName.split(" ");
              let formattedName = "";
              for (let i = 0; i < words.length; i += 2) {
                if (i > 0) formattedName += "<br>";
                formattedName += words.slice(i, i + 2).join(" ");
              }
              spotlightHeader.innerHTML = `<p>${formattedName}</p>`;
            }

            currentActiveIndex = closestIndex;
          }
        }
        // ==================== PHASE 4: Exit Fade (95-100%) ====================
        else if (progress > 0.95) {
          if (spotlightHeader) spotlightHeader.style.opacity = "0";
          gsap.set(titlesContainerElement, {
            "--before-opacity": "0",
            "--after-opacity": "0",
          });
        }
      },
    });
    } else {
      // ============================================================
      // MOBILE: Non-pinned vertical scroll experience
      // Uses ScrollTrigger WITHOUT pin to avoid iOS position:fixed
      // momentum scroll bugs (multiple simultaneous pins cause jank)
      // ============================================================
      let currentActiveIndex = -1; // Start at -1 so first update (index 0) triggers visibility

      // Show background image at full scale
      gsap.set(".spotlight-bg-img", { transform: "scale(1)" });
      gsap.set(".spotlight-bg-img img", { transform: "scale(1)" });

      // Hide intro text on mobile (takes up too much space)
      gsap.set(introTextElements[0], { opacity: 0 });
      gsap.set(introTextElements[1], { opacity: 0 });

      // Show decorative lines
      gsap.set(titlesContainerElement, {
        "--before-opacity": "1",
        "--after-opacity": "1",
      });

      // Hide floating images on mobile (no Bezier curve animation without pin)
      imageElements.forEach((img) => gsap.set(img, { opacity: 0 }));

      // Explicitly set first background image visible (desktop branch may have set all to opacity: 0)
      bgImageElements.forEach((img, i) => {
        (img as HTMLElement).style.opacity = i === 0 ? '1' : '0';
      });

      // Set initial header to first service name
      if (spotlightHeader) {
        const firstName = spotlightItems[0].name;
        const words = firstName.split(" ");
        let formattedName = "";
        for (let i = 0; i < words.length; i += 2) {
          if (i > 0) formattedName += "<br>";
          formattedName += words.slice(i, i + 2).join(" ");
        }
        spotlightHeader.innerHTML = `<p>${formattedName}</p>`;
        spotlightHeader.style.opacity = "1";
      }

      // PINNED ScrollTrigger: pins section while user scrolls through services
      // Background crossfades and header updates as user scrolls through
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: ".services-spotlight",
        start: "top top",
        end: `+=${getStableHeight() * spotlightItems.length * 1.2}px`,
        pin: true,
        pinSpacing: true,
        scrub: isSafari && isIOSDevice ? 0.5 : 1,
        invalidateOnRefresh: true,
        refreshPriority: 9,
        onUpdate: (self) => {
          const progress = self.progress;

          // Determine which service is active based on scroll progress
          const serviceIndex = Math.min(
            Math.floor(progress * spotlightItems.length),
            spotlightItems.length - 1
          );

          // Update background and header when active service changes
          if (serviceIndex !== currentActiveIndex) {
            currentActiveIndex = serviceIndex;
            activeBgIndexRef.current = serviceIndex;

            // Update background image visibility (use cached NodeList)
            bgImageElements.forEach((img, i) => {
              (img as HTMLElement).style.opacity = i === serviceIndex ? '1' : '0';
            });

            // Update header text to show current service name
            if (spotlightHeader) {
              const serviceName = spotlightItems[serviceIndex].name;
              const words = serviceName.split(" ");
              let formattedName = "";
              for (let i = 0; i < words.length; i += 2) {
                if (i > 0) formattedName += "<br>";
                formattedName += words.slice(i, i + 2).join(" ");
              }
              spotlightHeader.innerHTML = `<p>${formattedName}</p>`;
            }
          }

          // Keep header visible throughout scroll
          if (spotlightHeader) {
            spotlightHeader.style.opacity = "1";
          }
        },
      });
    } // End mobile-only experience

    // Cleanup function
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }

      // Clear title elements to prevent memory leaks
      if (titleElementsRef.current) {
        titleElementsRef.current = null;
      }

      // Reset initialization flag on cleanup
      hasInitializedRef.current = false;
    };
  }, [isHydrated, isMobileDevice]); // Re-run when hydration or mobile state changes

  return (
    <section className="services-spotlight" ref={spotlightRef}>
      {/* Main container with intro and background */}
      <div className="spotlight-inner">
        {/* Intro text that splits apart (0-20% progress) */}
        <div className="spotlight-intro-text-wrapper">
          <div
            className="spotlight-intro-text"
            ref={(el) => { introTextElementsRef.current[0] = el; }}
          >
            <p>Innovative</p>
          </div>
          <div
            className="spotlight-intro-text"
            ref={(el) => { introTextElementsRef.current[1] = el; }}
          >
            <p>Solutions</p>
          </div>
        </div>

        {/* Background images - all stacked, opacity toggled via DOM */}
        <div className="spotlight-bg-img">
          {spotlightItems.map((item, index) => (
            <Image
              key={item.id}
              className="spotlight-bg-img-item"
              src={item.img}
              alt=""
              fill
              sizes="100vw"
              quality={85}
              priority={index === 0}
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
                opacity: index === 0 ? 1 : 0,
                transition: 'opacity 0.3s ease',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Scrolling titles with clip-path mask */}
      <div
        className="spotlight-titles-container"
        ref={titlesContainerElementRef}
      >
        <div className="spotlight-titles" ref={titlesContainerRef}></div>
      </div>

      {/* Images following Bezier curve - React-rendered */}
      <div className="spotlight-images" ref={imagesContainerRef}>
        {spotlightItems.map((item, index) => (
          <div
            key={item.id}
            className="spotlight-img"
            ref={(el) => {
              if (el) imageElementsRef.current[index] = el;
            }}
          >
            <Image
              src={item.img}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={85}
              priority={index === 0}
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>
        ))}
      </div>

      {/* "Discover" header text - uses dangerouslySetInnerHTML to avoid React reconciliation
          conflicts when JS updates content via innerHTML during scroll animations */}
      <div className="spotlight-header" ref={spotlightHeaderRef}
        dangerouslySetInnerHTML={{ __html: '<p>Our Services</p>' }}
      />

      {/* TRD-branded outline border */}
      <div className="spotlight-outline"></div>
    </section>
  );
};

export default ServicesSpotlight;
