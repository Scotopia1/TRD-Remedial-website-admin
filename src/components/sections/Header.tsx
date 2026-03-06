'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { NAV_LINKS, COMPANY_INFO } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useStore } from '@/stores/useStore';
import { MagneticText } from '@/components/ui/MagneticText';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);

  const menuOpen = useStore((state) => state.menuOpen);
  const toggleMenu = useStore((state) => state.toggleMenu);
  const closeMenu = useStore((state) => state.closeMenu);
  const setCursorVariant = useStore((state) => state.setCursorVariant);

  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuLinksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const isMobile = useMediaQuery('(max-width: 1024px)');

  // Scroll detection - hide/show header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine if scrolled
      setIsScrolled(currentScrollY > 50);

      // Hide header on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Animate header visibility
  useGSAP(() => {
    if (!headerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(headerRef.current, { y: headerVisible ? 0 : -100 });
    } else {
      gsap.to(headerRef.current, {
        y: headerVisible ? 0 : -100,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [headerVisible]);

  // Full-screen menu animation with circular clip-path reveal
  useGSAP(() => {
    if (!menuRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (menuOpen) {
      const tl = gsap.timeline();

      if (prefersReducedMotion || isMobile) {
        // Simplified animation for reduced motion or mobile
        tl.to(menuRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        })
        .fromTo(
          menuLinksRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            duration: 0.3,
            ease: 'power2.out',
          },
          '-=0.1'
        );
      } else {
        // Full circular clip-path reveal for desktop
        tl.to(menuRef.current, {
          clipPath: 'circle(150% at 100% 0%)',
          duration: 0.8,
          ease: 'power4.inOut',
        })
        .fromTo(
          menuLinksRef.current,
          { opacity: 0, y: 50, rotateX: -90 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            stagger: 0.1,
            duration: 0.5,
            ease: 'back.out(1.7)',
          },
          '-=0.3'
        );
      }
    } else {
      // Close animation
      if (prefersReducedMotion || isMobile) {
        gsap.to(menuRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        gsap.to(menuRef.current, {
          clipPath: 'circle(0% at 100% 0%)',
          duration: 0.6,
          ease: 'power4.inOut',
        });
      }
    }
  }, [menuOpen, isMobile]);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && menuOpen) {
        closeMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen, closeMenu]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLinkClick = () => {
    closeMenu();
  };

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-transparent'
        )}
      >
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-25 lg:h-30">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 z-50"
              onMouseEnter={() => setCursorVariant('link')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <div className={cn(
                'transition-all duration-300 h-12 lg:h-14',
                isScrolled ? 'brightness-0' : 'brightness-100'
              )}>
                <img
                  src="/trd-logo.svg"
                  alt="TRD Remedial - Tension Reinforced Developments"
                  className="h-full w-auto"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <ul className="hidden lg:flex items-center space-x-8">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'text-sm font-medium transition-all duration-300 hover:opacity-70',
                      'relative after:absolute after:bottom-0 after:left-0 after:h-0.5',
                      'after:w-0 after:bg-current after:transition-all after:duration-300',
                      'hover:after:w-full',
                      isScrolled ? 'text-trd-primary' : 'text-white'
                    )}
                    onMouseEnter={() => setCursorVariant('link')}
                    onMouseLeave={() => setCursorVariant('default')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Emergency Contact Button */}
            <a
              href={`tel:${COMPANY_INFO.contact.phone.emergency1.replace(/\s/g, '')}`}
              className={cn(
                'hidden lg:block px-6 py-3 rounded-lg font-medium',
                'transition-all duration-300 hover:scale-105',
                isScrolled
                  ? 'bg-trd-accent text-white hover:bg-trd-accent/90'
                  : 'bg-white text-trd-primary hover:bg-white/90'
              )}
              onMouseEnter={() => setCursorVariant('cta')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              Emergency: {COMPANY_INFO.contact.phone.emergency1}
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className={cn(
                'lg:hidden z-50 p-2 transition-colors duration-300',
                menuOpen ? 'text-white' : (isScrolled ? 'text-trd-primary' : 'text-white')
              )}
              aria-label="Toggle mobile menu"
              aria-expanded={menuOpen}
              onMouseEnter={() => setCursorVariant('link')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span
                  className={cn(
                    'h-0.5 w-full bg-current transition-all duration-300',
                    menuOpen && 'rotate-45 translate-y-2'
                  )}
                />
                <span
                  className={cn(
                    'h-0.5 w-full bg-current transition-all duration-300',
                    menuOpen && 'opacity-0'
                  )}
                />
                <span
                  className={cn(
                    'h-0.5 w-full bg-current transition-all duration-300',
                    menuOpen && '-rotate-45 -translate-y-2'
                  )}
                />
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Full-Screen Expandable Menu */}
      <div
        ref={menuRef}
        className={cn(
          'fixed inset-0 z-30 bg-trd-primary',
          'flex items-center justify-center',
          isMobile ? 'opacity-0' : 'clip-path-circle-0'
        )}
        style={{
          clipPath: isMobile ? undefined : 'circle(0% at 100% 0%)',
          pointerEvents: menuOpen ? 'auto' : 'none',
          opacity: isMobile && !menuOpen ? 0 : 1,
        }}
      >
        <div className="container mx-auto px-4">
          {/* Logo in Menu */}
          <div className="flex justify-center mb-12 lg:mb-16">
            <img
              src="/trd-logo.svg"
              alt="TRD Remedial"
              className="h-16 lg:h-20 w-auto opacity-0"
              ref={(el) => {
                if (el) menuLinksRef.current[-1] = el as any;
              }}
            />
          </div>

          {/* Menu Links */}
          <nav className="flex flex-col items-center space-y-6 lg:space-y-8">
            {NAV_LINKS.map((link, index) => (
              <Link
                key={link.href}
                ref={(el) => {
                  menuLinksRef.current[index] = el;
                }}
                href={link.href}
                onClick={handleLinkClick}
                className="text-4xl lg:text-6xl font-bold text-white opacity-0"
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
              >
                {isMobile ? (
                  link.label
                ) : (
                  <MagneticText strength={0.5}>{link.label}</MagneticText>
                )}
              </Link>
            ))}

            {/* Emergency CTA in Menu */}
            <a
              ref={(el) => {
                menuLinksRef.current[NAV_LINKS.length] = el;
              }}
              href={`tel:${COMPANY_INFO.contact.phone.emergency1.replace(/\s/g, '')}`}
              className="mt-8 px-8 py-4 bg-trd-accent text-white rounded-lg font-medium text-xl opacity-0
                       hover:bg-trd-accent/90 transition-colors duration-300"
              onMouseEnter={() => setCursorVariant('cta')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              Emergency: {COMPANY_INFO.contact.phone.emergency1}
            </a>
          </nav>
        </div>
      </div>
    </>
  );
}
