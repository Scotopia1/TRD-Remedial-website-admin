'use client';

import React, { useEffect, useRef, useState } from 'react';
import './Menu.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { useStore } from '@/stores/useStore';
import { useScrollLock } from '@/hooks/useScrollLock';

export function Menu() {
  const menuLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/projects', label: 'Projects' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  const pathname = usePathname();
  const menuContainer = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnimation = useRef<GSAPTimeline | null>(null);
  const menuLinksAnimation = useRef<GSAPTimeline | null>(null);

  const lastScrollY = useRef(0);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const { isLoading } = useStore();

  const [windowWidth, setWindowWidth] = useState(0);
  const [shouldDelayClose, setShouldDelayClose] = useState(false);
  const previousPathRef = useRef(pathname);
  const scrollPositionRef = useRef(0);
  const [showMenuHint, setShowMenuHint] = useState(false);
  const [showMenuLabel, setShowMenuLabel] = useState(false);
  const [menuLabelFading, setMenuLabelFading] = useState(false);

  useScrollLock(isMenuOpen);

  // Initialize window width on client + check if menu label should show
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    if (!localStorage.getItem('trd-menu-opened')) {
      setShowMenuLabel(true);
    }
  }, []);

  // Show menu hint for 3 seconds AFTER loading completes
  useEffect(() => {
    if (!isLoading) {
      // Start hint animation after loading is done
      setShowMenuHint(true);

      const timer = setTimeout(() => {
        setShowMenuHint(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const toggleMenu = () => {
    const logoButton = document.querySelector('.logo-menu-button');
    if (logoButton) {
      logoButton.classList.toggle('active');
    }

    // First time opening: persist and fade out the label
    if (!isMenuOpen && showMenuLabel) {
      localStorage.setItem('trd-menu-opened', 'true');
      setMenuLabelFading(true);
      setTimeout(() => {
        setShowMenuLabel(false);
        setMenuLabelFading(false);
      }, 500);
    }

    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    if (isMenuOpen) {
      const logoButton = document.querySelector('.logo-menu-button');
      if (logoButton) {
        logoButton.classList.remove('active');
      }
      setIsMenuOpen(false);
    }
  };

  const handleLinkClick = (path: string) => {
    if (path !== pathname) {
      closeMenu(); // Close menu immediately when a page is selected
    }
  };

  useEffect(() => {
    if (pathname !== previousPathRef.current && shouldDelayClose) {
      const timer = setTimeout(() => {
        closeMenu();
        setShouldDelayClose(false);
      }, 100); // Close menu quickly before transition reveals new page

      previousPathRef.current = pathname;
      return () => clearTimeout(timer);
    }

    previousPathRef.current = pathname;
  }, [pathname, shouldDelayClose]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    gsap.set('.menu-link-item-holder', { y: 125 });

    menuAnimation.current = gsap.timeline({ paused: true }).to('.menu', {
      duration: 1,
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      ease: 'power4.inOut',
    });

    menuLinksAnimation.current = gsap
      .timeline({ paused: true })
      .to('.menu-link-item-holder', {
        y: 0,
        duration: 1.25,
        stagger: 0.075,
        ease: 'power3.inOut',
        delay: 0.125,
      });
  }, [windowWidth]);

  useEffect(() => {
    if (isMenuOpen) {
      menuAnimation.current?.play();
      menuLinksAnimation.current?.play();
    } else {
      menuAnimation.current?.reverse();
      menuLinksAnimation.current?.reverse();
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) return;

      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current) {
        gsap.to('.menu-bar', {
          y: -200,
          duration: 1,
          ease: 'power2.out',
        });
      } else {
        gsap.to('.menu-bar', {
          y: 0,
          duration: 1,
          ease: 'power2.out',
        });
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMenuOpen]);


  // Only hide menu during loading on homepage (where preloader exists)
  const isHomePage = pathname === '/';
  const shouldHideMenu = isLoading && isHomePage;

  return (
    <div
      className="menu-container"
      ref={menuContainer}
      style={{ display: shouldHideMenu ? 'none' : 'block' }}
    >
      <div className="menu-bar" ref={menuBarRef}>
        <div className="menu-bar-container">
          <div className="menu-actions">
            <div className="menu-toggle">
              <button
                className={`logo-menu-button ${showMenuHint ? 'menu-hint' : ''}`}
                onClick={toggleMenu}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
              >
                <img
                  src="/trd-logo.svg"
                  alt="TRD"
                  className="logo-icon"
                  style={{
                    filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))',
                  }}
                />
                {showMenuLabel && (
                  <span className={`menu-label ${menuLabelFading ? 'menu-label-fade-out' : ''}`}>
                    MENU
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={`menu ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="menu-col">
          <div className="menu-sub-col">
            <div className="menu-links">
              {menuLinks.map((link, index) => (
                <div key={index} className="menu-link-item">
                  <div className="menu-link-item-holder">
                    <Link
                      className="menu-link"
                      href={link.path}
                      onClick={() => handleLinkClick(link.path)}
                    >
                      {link.label}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
