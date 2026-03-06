'use client';

import { useState } from 'react';
import { AnimatedCopy } from '@/components/animations/AnimatedCopy';

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
}

export function FAQItem({ question, answer, index }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen();
    }
  };

  return (
    <div className="faq-item">
      <button
        className={`faq-item-question ${isOpen ? 'active' : ''}`}
        onClick={toggleOpen}
        onKeyPress={handleKeyPress}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        <AnimatedCopy
          delay={index * 0.05}
          tag="span"
          className="faq-item-question-text"
        >
          {question}
        </AnimatedCopy>
        <span className="faq-item-icon" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      <div
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        className={`faq-item-answer ${isOpen ? 'open' : ''}`}
      >
        <div className="faq-item-answer-content">
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}
