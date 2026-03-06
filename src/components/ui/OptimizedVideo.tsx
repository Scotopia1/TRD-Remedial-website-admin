'use client';

import { useRef, useEffect, useState } from 'react';
import { isIOS, isMobile } from '@/utils/deviceDetect';

interface OptimizedVideoProps {
  src: string; // base path without extension (e.g., "/videos/hero-video")
  poster?: string;
  className?: string;
  priority?: boolean; // Load immediately vs lazy
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
}

export function OptimizedVideo({
  src,
  poster,
  className = '',
  priority = false,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  // On mobile/iOS: defer video loading to improve first paint
  // On desktop: respect priority prop
  const shouldDeferLoad = isClient && (isMobileDevice || isIOSDevice);
  // Always start false to match server render and avoid hydration mismatch
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsMobileDevice(isMobile());
    setIsIOSDevice(isIOS());
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // On mobile/iOS: delay video load for better initial performance
    if (shouldDeferLoad) {
      // Wait for idle time to load video
      const timeoutId = setTimeout(() => {
        setIsLoaded(true);
      }, 1500); // Load after 1.5s to allow page to render first

      return () => clearTimeout(timeoutId);
    }

    // Desktop or priority: use intersection observer
    if (priority || !videoRef.current) {
      setIsLoaded(true);
      return;
    }

    // Lazy load video using Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' } // Start loading 100px before entering viewport
    );

    observer.observe(videoRef.current);

    return () => observer.disconnect();
  }, [priority, isClient, shouldDeferLoad]);

  // Optimize preload based on device
  const preloadStrategy = isClient
    ? shouldDeferLoad
      ? 'none' // Don't preload on mobile/iOS
      : priority
      ? 'metadata' // Changed from 'auto' to 'metadata' for faster FCP
      : 'none'
    : 'none';

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay={autoPlay && isLoaded}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      preload={preloadStrategy}
      poster={poster}
      // iOS optimization: disable remote playback
      x-webkit-airplay="deny"
      disableRemotePlayback
    >
      {isLoaded && (
        <>
          {/* Prioritize MP4 for Safari/iOS (native codec, better performance) */}
          {isIOSDevice && <source src={`${src}-optimized.mp4`} type="video/mp4" />}
          {/* WebM for modern browsers (Chrome, Firefox, Edge) */}
          {!isIOSDevice && <source src={`${src}.webm`} type="video/webm" />}
          {/* MP4 fallback for Safari and older browsers */}
          {!isIOSDevice && <source src={`${src}-optimized.mp4`} type="video/mp4" />}
        </>
      )}
      Your browser does not support the video tag.
    </video>
  );
}
