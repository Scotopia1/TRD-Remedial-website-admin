'use client';

import Image, { ImageProps } from 'next/image';
import { useState, memo } from 'react';

/**
 * Optimized Image Component
 *
 * Next.js Image wrapper with blur-up pattern for progressive loading.
 * Blur data URLs are provided via the blurDataURL prop (sourced from
 * project/service data in the database).
 */

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  src: string;
  alt: string;
  priority?: boolean;
  /** Optional blur data URL */
  blurDataURL?: string;
}

const OptimizedImageComponent = function OptimizedImage({
  src,
  alt,
  priority = false,
  className = '',
  blurDataURL,
  ...props
}: OptimizedImageProps) {
  // Priority images should be visible immediately (above-the-fold)
  const [isLoaded, setIsLoaded] = useState(priority);

  return (
    <Image
      src={src}
      alt={alt}
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      priority={priority}
      onLoad={() => setIsLoaded(true)}
      className={`
        transition-opacity duration-500
        ${isLoaded ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
      {...props}
    />
  );
};

export const OptimizedImage = memo(OptimizedImageComponent);
