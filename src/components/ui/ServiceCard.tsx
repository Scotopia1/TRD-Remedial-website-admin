'use client';

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import type { Service } from '@/types/api';

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
}

const ServiceCardInternal = function ServiceCard({ service, onClick }: ServiceCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative h-[400px] perspective-1000 cursor-pointer group"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={onClick}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        {/* Front of Card */}
        <div className="absolute inset-0 backface-hidden">
          <div
            className="h-full rounded-2xl overflow-hidden bg-gradient-to-br from-industrial-600 to-concrete-700
                     shadow-lg group-hover:shadow-2xl transition-shadow duration-300"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${service.visual})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="h-full flex flex-col justify-end p-6">
              <h3 className="text-sm font-bold text-white mb-3 uppercase leading-tight">
                {service.title}
              </h3>

              {/* Features List */}
              {service.features && service.features.length > 0 && (
                <ul className="mb-4 space-y-1">
                  {service.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="text-white/90 text-sm">
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto pt-4">
                <div className="inline-flex items-center text-trd-accent font-semibold text-sm
                             px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  View Details
                  <svg
                    className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="h-full rounded-2xl bg-gradient-to-br from-trd-primary to-industrial-800
                       shadow-lg p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-4">
                {service.title}
              </h3>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-white/90 text-sm">
                    <span className="text-trd-accent mr-2 text-lg">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={onClick}
              className="w-full py-3 bg-trd-accent text-white rounded-lg
                       hover:bg-trd-accent/90 transition-all duration-300 font-semibold"
            >
              View Details
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const ServiceCard = memo(ServiceCardInternal);
