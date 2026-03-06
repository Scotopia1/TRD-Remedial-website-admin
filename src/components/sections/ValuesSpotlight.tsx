'use client';

import './ValuesSpotlight.css';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { CompanyValue } from '@/types/api';

interface ValuesSpotlightProps {
  values?: CompanyValue[];
}

export function ValuesSpotlight({ values: propValues }: ValuesSpotlightProps) {
  const [companyValues, setCompanyValues] = useState<CompanyValue[]>(propValues || []);

  // If no values passed via props, fetch from API
  useEffect(() => {
    if (!propValues || propValues.length === 0) {
      fetch('/api/public/values')
        .then((res) => res.json())
        .then((data: CompanyValue[]) => {
          setCompanyValues(data);
        })
        .catch(() => {
          // silently fail
        });
    }
  }, [propValues]);

  return (
    <section className="values-spotlight">
      <div className="values-container">
        {companyValues.map((value) => (
          <div key={value.id} className="value-item">
            {value.isText ? (
              <div className="value-text">
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </div>
            ) : value.image ? (
              <div className="value-image">
                <Image
                  src={value.image}
                  alt="TRD Value"
                  width={800}
                  height={600}
                  sizes="(max-width: 768px) 100vw, 800px"
                  quality={85}
                  priority={false}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
