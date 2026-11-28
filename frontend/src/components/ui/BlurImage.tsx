'use client';

import { useState } from 'react';

interface BlurImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Image component with a lightweight BlurHash-style blurred gradient placeholder
 * that smoothly unblurs once loaded.
 */
export function BlurImage({ src, alt, className = '', width, height }: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 skeleton-shimmer blur-md scale-105"
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`size-full object-cover transition-all duration-300 ease-out ${
          loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-[1.02]'
        }`}
      />
    </div>
  );
}
