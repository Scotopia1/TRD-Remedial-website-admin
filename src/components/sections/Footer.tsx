'use client';

import './Footer.css';

import Link from 'next/link';

export function Footer() {
  return (
    <>
      {/* Sliding Banner */}
      <div className="footer-banner">
        <div className="footer-banner-track">
          <div className="footer-banner-content">
            <span>TRD REMEDIAL • THE REMEDIAL EXPERTS • </span>
            <span>TRD REMEDIAL • THE REMEDIAL EXPERTS • </span>
            <span>TRD REMEDIAL • THE REMEDIAL EXPERTS • </span>
            <span>TRD REMEDIAL • THE REMEDIAL EXPERTS • </span>
            <span>TRD REMEDIAL • THE REMEDIAL EXPERTS • </span>
            <span>TRD REMEDIAL • THE REMEDIAL EXPERTS • </span>
            <span>TRD REMEDIAL • THE REMEDIAL EXPERTS • </span>
            <span>TRD REMEDIAL • THE REMEDIAL EXPERTS • </span>
          </div>
        </div>
      </div>

      <div className="footer">
        {/* Row 1: Contact CTA + Navigation */}
        <div className="footer-row">
        <div className="footer-contact">
          <h3>
            Let&apos;s Build Together <br />
            contact<span>@</span>trdremedial.com.au
          </h3>

          <p className="secondary">
            From structural remediation to emergency repairs — we&apos;re always ready to collaborate.
            Reach out anytime for expert solutions.
          </p>

          <Link href="/contact" className="btn">
            Get in Touch
          </Link>
        </div>

        <div className="footer-nav">
          <Link href="/services" className="footer-nav-item">
            <span>Services</span>
            <span>&#8594;</span>
          </Link>
          <Link href="/projects" className="footer-nav-item">
            <span>Projects</span>
            <span>&#8594;</span>
          </Link>
          <Link href="/about" className="footer-nav-item">
            <span>About</span>
            <span>&#8594;</span>
          </Link>
          <Link href="/contact" className="footer-nav-item">
            <span>Contact</span>
            <span>&#8594;</span>
          </Link>
          <Link href="/emergency" className="footer-nav-item">
            <span>Emergency</span>
            <span>&#8594;</span>
          </Link>
        </div>
      </div>

      {/* Row 2: Logo + Copyright */}
      <div className="footer-row">
        <div className="footer-header">
          <div className="footer-logo">
            <img
              src="/trd-logo-black.svg"
              alt="TRD Remedial"
            />
          </div>
        </div>

        <div className="footer-copyright-line">
          <p className="primary sm">&copy; TRD Remedial 2025</p>
          <p className="primary sm">
            Website by{' '}
            <a
              href="https://theelitessolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline' }}
            >
              The Elites Solutions
            </a>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
