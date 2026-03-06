import './EmergencyCTA.css';

import Link from 'next/link';
import { COMPANY_INFO } from '@/lib/constants';

export function EmergencyCTA() {
  return (
    <div className="emergency-cta">
      {/* Row 1: Info Bar */}
      <div className="emergency-cta-row">
        <div className="emergency-cta-row-copy-item">
          <p className="primary sm">Critical Repairs</p>
        </div>
        <div className="emergency-cta-row-copy-item">
          <p className="primary sm">(Emergency — 24/7)</p>
        </div>
        <div className="emergency-cta-row-copy-item">
          <p className="primary sm">&copy; TRD Remedial 2025</p>
        </div>
      </div>

      {/* Row 2: Main Content */}
      <div className="emergency-cta-row">
        {/* Left Column: Header + Availability */}
        <div className="emergency-cta-col">
          <div className="emergency-cta-header">
            <h3>24/7 Emergency Response</h3>

            <p>
              Structural emergencies demand immediate action. Our team is on standby 24/7
              to respond when you need expert intervention. No project too complex,
              no problem too urgent.
            </p>
          </div>

          <div className="emergency-availability">
            <p className="primary sm">Always Available</p>
            <p className="primary sm">All Suburbs</p>
          </div>
        </div>

        {/* Right Column: Contact Info + CTA */}
        <div className="emergency-cta-col">
          <div className="emergency-contact-info">
            <h4>Emergency Lines</h4>
            <a
              href={`tel:${COMPANY_INFO.emergency_phones[0].replace(/\s/g, '')}`}
              className="emergency-phone"
            >
              {COMPANY_INFO.emergency_phones[0]}
            </a>
            <a
              href={`tel:${COMPANY_INFO.emergency_phones[1].replace(/\s/g, '')}`}
              className="emergency-phone"
            >
              {COMPANY_INFO.emergency_phones[1]}
            </a>
          </div>

          <div className="emergency-contact-info">
            <h4>Email</h4>
            <a href={`mailto:${COMPANY_INFO.email}`} className="emergency-email">
              {COMPANY_INFO.email}
            </a>
          </div>

          <div className="emergency-cta-button">
            <Link href="/contact" className="btn-emergency">
              Request Emergency Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
