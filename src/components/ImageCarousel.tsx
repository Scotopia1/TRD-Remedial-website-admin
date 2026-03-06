'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ProjectImage } from '@/types/api';
import { useScrollLock } from '@/hooks/useScrollLock';
import './ImageCarousel.css';

interface ImageCarouselProps {
  images: ProjectImage[];
  projectName: string;
}

export function ImageCarousel({ images, projectName }: ImageCarouselProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // TEMP DISABLED - Testing if this is causing issues
  // useScrollLock(isLightboxOpen);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, goToPrevious, goToNext]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="image-masonry">
        <div className="masonry-grid">
          {images.map((image, index) => (
            <div
              key={index}
              className={`masonry-item masonry-item-${index + 1}`}
              onClick={() => openLightbox(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openLightbox(index);
                }
              }}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="masonry-image"
              />
              {image.caption && (
                <p className="masonry-caption">{image.caption}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Slideshow */}
      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="Close slideshow"
          >
            ×
          </button>

          <button
            className="lightbox-arrow lightbox-arrow-left"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            aria-label="Previous image"
          >
            ‹
          </button>

          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentImageIndex].url}
              alt={images[currentImageIndex].alt}
              className="lightbox-image"
            />
            {images[currentImageIndex].caption && (
              <p className="lightbox-caption">
                {images[currentImageIndex].caption}
              </p>
            )}
            <div className="lightbox-counter">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          <button
            className="lightbox-arrow lightbox-arrow-right"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label="Next image"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
