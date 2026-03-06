'use client';

import './contact.css';
import { AnimatedH1 } from '@/components/animations/AnimatedH1';
import { AnimatedCopy } from '@/components/animations/AnimatedCopy';
import Link from 'next/link';
import { COMPANY_INFO } from '@/lib/constants';

export default function ContactPage() {
  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-content">
          <div className="contact-hero-left">
            <AnimatedH1 delay={0.85} className="contact-heading">
              Get In Touch
            </AnimatedH1>
            <div className="contact-year">
              <AnimatedCopy tag="span" delay={0.1}>©25</AnimatedCopy>
            </div>
          </div>

          <div className="contact-hero-right">
            <div className="contact-info-block">
              <AnimatedCopy tag="p" delay={0.85} className="contact-label">
                Email
              </AnimatedCopy>
              <a href="mailto:contact@trdremedial.com.au" className="contact-value">
                <AnimatedCopy tag="span" delay={0.95}>
                  contact@trdremedial.com.au
                </AnimatedCopy>
              </a>
            </div>

            <div className="contact-info-block">
              <AnimatedCopy tag="p" delay={1} className="contact-label">
                Phone
              </AnimatedCopy>
              <a href={`tel:${COMPANY_INFO.contact.phone.emergency1.replace(/\s/g, '')}`} className="contact-value">
                <AnimatedCopy tag="span" delay={1.1}>
                  {COMPANY_INFO.contact.phone.emergency1}
                </AnimatedCopy>
              </a>
            </div>

            <div className="contact-info-block">
              <AnimatedCopy tag="p" delay={1.15} className="contact-label">
                Address
              </AnimatedCopy>
              <AnimatedCopy tag="p" delay={1.25} className="contact-value">
                Sydney, NSW<br />Australia
              </AnimatedCopy>
            </div>

            <div className="contact-info-block">
              <AnimatedCopy tag="p" delay={1.3} className="contact-label">
                Business Hours
              </AnimatedCopy>
              <AnimatedCopy tag="p" delay={1.4} className="contact-value">
                Mon-Fri: 7:00 AM - 6:00 PM<br />
                Sat: 8:00 AM - 2:00 PM<br />
                24/7 Emergency Service
              </AnimatedCopy>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-cta">
        <AnimatedCopy tag="p" className="contact-cta-text">
          Need expert structural remediation? We're ready to help with your project.
        </AnimatedCopy>
        <div className="contact-cta-buttons">
          <Link href="/services" className="contact-cta-button">
            View Services
          </Link>
          <Link href="/projects" className="contact-cta-button contact-cta-button-secondary">
            See Our Work
          </Link>
        </div>
      </section>
    </div>
  );
}
