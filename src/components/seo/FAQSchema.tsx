/**
 * FAQ Schema Component
 * Phase 2 SEO Optimization - Advanced Schema Markup
 *
 * Implements FAQPage schema.org structured data for rich snippets
 * in Google search results.
 *
 * Pass faqs via props for server-rendered schema, or omit to render nothing
 * (FAQ data should be fetched server-side for proper SEO indexing).
 */

import type { FAQItem } from '@/types/api';

interface FAQSchemaProps {
  faqs?: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
