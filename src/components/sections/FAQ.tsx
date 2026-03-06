'use client';

/**
 * FAQ Section Component
 * Phase 2 SEO Optimization - Content Expansion
 *
 * Features:
 * - FAQs organized by category (Process, Technical, Services)
 * - Accessible accordion interface with ARIA labels
 * - Keyboard navigation support
 * - Mobile-responsive design
 * - Integrated with FAQSchema for SEO
 */

import { useState, useEffect } from 'react';
import type { FAQItem } from '@/types/api';

// Helper functions (previously imported from @/data/faqs)
function getFAQsByCategory(faqs: FAQItem[], category: FAQItem['category']): FAQItem[] {
  return faqs.filter((faq) => faq.category === category);
}

function getFAQCategories(faqs: FAQItem[]): FAQItem['category'][] {
  const cats = new Set(faqs.map((f) => f.category));
  return Array.from(cats);
}

const categoryLabels: Record<FAQItem['category'], string> = {
  process: 'Process & Timeline',
  technical: 'Technical Information',
  services: 'Our Services',
};

interface FAQProps {
  faqs?: FAQItem[];
}

export function FAQ({ faqs: propFaqs }: FAQProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<FAQItem['category']>('process');
  const [faqs, setFaqs] = useState<FAQItem[]>(propFaqs || []);

  // If no FAQs passed via props, fetch from API
  useEffect(() => {
    if (!propFaqs || propFaqs.length === 0) {
      fetch('/api/public/faqs')
        .then((res) => res.json())
        .then((data: FAQItem[]) => {
          setFaqs(data);
        })
        .catch(() => {
          // silently fail
        });
    }
  }, [propFaqs]);

  const toggleFAQ = (id: string) => {
    setActiveId(activeId === id ? null : id);
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFAQ(id);
    }
  };

  const categories = getFAQCategories(faqs);
  const currentFAQs = getFAQsByCategory(faqs, activeCategory);

  return (
    <section className="faq-section" id="faq">
      <div className="faq-container">
        {/* Section Header */}
        <div className="faq-header">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <p className="faq-subtitle">
            Get answers to common questions about our structural remediation services across Sydney
          </p>
        </div>

        {/* Category Tabs */}
        <div className="faq-categories" role="tablist" aria-label="FAQ Categories">
          {categories.map((category) => (
            <button
              key={category}
              role="tab"
              aria-selected={activeCategory === category}
              aria-controls={`faq-panel-${category}`}
              id={`faq-tab-${category}`}
              className={`faq-category-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(category);
                setActiveId(null); // Close all FAQs when switching category
              }}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div
          role="tabpanel"
          id={`faq-panel-${activeCategory}`}
          aria-labelledby={`faq-tab-${activeCategory}`}
          className="faq-list"
        >
          {currentFAQs.map((faq) => (
            <div key={faq.id} className="faq-item">
              <button
                className={`faq-question ${activeId === faq.id ? 'active' : ''}`}
                onClick={() => toggleFAQ(faq.id)}
                onKeyPress={(e) => handleKeyPress(e, faq.id)}
                aria-expanded={activeId === faq.id}
                aria-controls={`faq-answer-${faq.id}`}
                id={`faq-question-${faq.id}`}
              >
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-icon" aria-hidden="true">
                  {activeId === faq.id ? '\u2212' : '+'}
                </span>
              </button>
              <div
                id={`faq-answer-${faq.id}`}
                role="region"
                aria-labelledby={`faq-question-${faq.id}`}
                className={`faq-answer ${activeId === faq.id ? 'open' : ''}`}
              >
                <div className="faq-answer-content">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="faq-cta">
          <p>Can't find your answer?</p>
          <a href="/contact" className="faq-cta-btn">
            Contact Us
          </a>
          <span className="faq-cta-divider">or call</span>
          <a href="tel:0414727167" className="faq-cta-phone">
            0414 727 167
          </a>
          <span className="faq-cta-divider">or</span>
          <a href="tel:0404404422" className="faq-cta-phone">
            0404 404 422
          </a>
        </div>
      </div>

      <style jsx>{`
        .faq-section {
          padding: 80px 20px;
          background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
        }

        .faq-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .faq-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .faq-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .faq-subtitle {
          font-size: 1.125rem;
          color: #666;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .faq-categories {
          display: flex;
          gap: 12px;
          margin-bottom: 40px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .faq-category-btn {
          padding: 12px 24px;
          background: #ffffff;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .faq-category-btn:hover {
          border-color: #000000;
          color: #000000;
        }

        .faq-category-btn.active {
          background: #000000;
          border-color: #000000;
          color: #ffffff;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .faq-item {
          background: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s ease;
        }

        .faq-item:hover {
          border-color: #000000;
        }

        .faq-question {
          width: 100%;
          padding: 20px 24px;
          background: transparent;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          text-align: left;
          transition: background-color 0.2s ease;
        }

        .faq-question:hover {
          background: #f8f9fa;
        }

        .faq-question.active {
          background: #fff5f0;
        }

        .faq-question-text {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a1a1a;
          flex: 1;
          padding-right: 16px;
        }

        .faq-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000000;
          color: #ffffff;
          border-radius: 50%;
          font-size: 1.5rem;
          font-weight: 300;
          flex-shrink: 0;
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .faq-answer.open {
          max-height: 500px;
        }

        .faq-answer-content {
          padding: 0 24px 24px 24px;
        }

        .faq-answer-content p {
          font-size: 1rem;
          color: #4a4a4a;
          line-height: 1.7;
          margin: 0;
        }

        .faq-cta {
          margin-top: 64px;
          padding: 40px 32px;
          background: #ffffff;
          border: 2px solid #000000;
          border-radius: 12px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .faq-cta p {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .faq-cta-btn {
          display: inline-block;
          padding: 16px 40px;
          background: #000000;
          color: #ffffff;
          font-size: 1.0625rem;
          font-weight: 600;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          min-width: 180px;
        }

        .faq-cta-btn:hover {
          background: #333333;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .faq-cta-divider {
          color: #999;
          font-size: 0.9375rem;
          margin: -8px 0;
        }

        .faq-cta-phone {
          font-size: 1.25rem;
          font-weight: 600;
          color: #000000;
          text-decoration: none;
          transition: color 0.2s ease;
          letter-spacing: 0.5px;
        }

        .faq-cta-phone:hover {
          color: #333333;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .faq-section {
            padding: 60px 16px;
          }

          .faq-title {
            font-size: 2rem;
          }

          .faq-subtitle {
            font-size: 1rem;
          }

          .faq-category-btn {
            padding: 10px 16px;
            font-size: 0.875rem;
          }

          .faq-question-text {
            font-size: 1rem;
          }

          .faq-cta {
            padding: 32px 20px;
            gap: 20px;
          }

          .faq-cta p {
            font-size: 1.125rem;
          }

          .faq-cta-btn {
            padding: 14px 32px;
            font-size: 1rem;
            min-width: 160px;
          }

          .faq-cta-divider {
            font-size: 0.875rem;
            margin: -6px 0;
          }

          .faq-cta-phone {
            font-size: 1.125rem;
          }
        }

        @media (max-width: 480px) {
          .faq-cta {
            padding: 28px 16px;
            gap: 18px;
          }

          .faq-cta p {
            font-size: 1rem;
          }

          .faq-cta-btn {
            padding: 12px 28px;
            font-size: 0.9375rem;
            min-width: 140px;
          }

          .faq-cta-phone {
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
