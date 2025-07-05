import { useState, useEffect, useCallback } from 'react';
import { generateAssetUrl } from '@/utils/cdnConfig';

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  lazy?: boolean;
  placeholder?: string;
}

interface OptimizedImage {
  src: string;
  srcSet: string;
  sizes: string;
  isLoaded: boolean;
  isError: boolean;
}

export const useImageOptimization = (
  originalSrc: string,
  options: ImageOptimizationOptions = {}
) => {
  const [optimizedImage, setOptimizedImage] = useState<OptimizedImage>({
    src: options.placeholder || '',
    srcSet: '',
    sizes: '',
    isLoaded: false,
    isError: false
  });

  const generateResponsiveImages = useCallback((src: string, opts: ImageOptimizationOptions) => {
    // Generate different sizes for responsive images
    const sizes = [320, 640, 768, 1024, 1280, 1920];
    const { quality = 80, format = 'webp' } = opts;
    
    // Generate srcSet for responsive images
    const srcSet = sizes
      .filter(size => !opts.width || size <= opts.width * 2) // Don't generate larger than 2x the target
      .map(size => {
        const optimizedUrl = generateAssetUrl(src, 'jsdelivr', {
          width: size,
          quality,
          format
        });
        return `${optimizedUrl} ${size}w`;
      })
      .join(', ');

    // Generate sizes attribute
    const sizesAttr = [
      '(max-width: 320px) 320px',
      '(max-width: 640px) 640px',
      '(max-width: 768px) 768px',
      '(max-width: 1024px) 1024px',
      '(max-width: 1280px) 1280px',
      '1920px'
    ].join(', ');

    // Main optimized image
    const mainSrc = generateAssetUrl(src, 'jsdelivr', {
      width: opts.width,
      height: opts.height,
      quality,
      format
    });

    return {
      src: mainSrc,
      srcSet,
      sizes: sizesAttr
    };
  }, []);

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve();
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (!originalSrc) return;

    const loadOptimizedImage = async () => {
      try {
        // Check if image is external (needs CDN optimization)
        const isExternal = originalSrc.startsWith('http');
        
        if (isExternal) {
          // Use CDN optimization for external images
          const optimized = generateResponsiveImages(originalSrc, options);
          
          if (!options.lazy) {
            // Preload main image if not lazy
            await preloadImage(optimized.src);
          }
          
          setOptimizedImage({
            ...optimized,
            isLoaded: !options.lazy,
            isError: false
          });
        } else {
          // Local image - use as is but still generate responsive attributes
          const optimized = {
            src: originalSrc,
            srcSet: '',
            sizes: '',
          };
          
          if (!options.lazy) {
            await preloadImage(originalSrc);
          }
          
          setOptimizedImage({
            ...optimized,
            isLoaded: !options.lazy,
            isError: false
          });
        }
      } catch (error) {
        console.error('Image optimization failed:', error);
        setOptimizedImage(prev => ({
          ...prev,
          src: originalSrc,
          isError: true,
          isLoaded: false
        }));
      }
    };

    loadOptimizedImage();
  }, [originalSrc, options, generateResponsiveImages, preloadImage]);

  const handleImageLoad = useCallback(() => {
    setOptimizedImage(prev => ({
      ...prev,
      isLoaded: true,
      isError: false
    }));
  }, []);

  const handleImageError = useCallback(() => {
    setOptimizedImage(prev => ({
      ...prev,
      isError: true,
      isLoaded: false,
      src: originalSrc // Fallback to original
    }));
  }, [originalSrc]);

  return {
    ...optimizedImage,
    handleImageLoad,
    handleImageError
  };
};

// Hook for lazy loading images with Intersection Observer
export const useLazyImage = (
  src: string,
  options: ImageOptimizationOptions = {}
) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  const optimizedImage = useImageOptimization(
    shouldLoad ? src : '',
    { ...options, lazy: true }
  );

  useEffect(() => {
    if (!ref || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px' // Start loading 50px before entering viewport
      }
    );

    observer.observe(ref);

    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, [ref, shouldLoad]);

  return {
    ...optimizedImage,
    ref: setRef,
    shouldLoad
  };
};

// Utility to generate WebP fallback
export const generateWebPFallback = (src: string, fallbackFormat: 'jpg' | 'png' = 'jpg') => {
  const webpSrc = generateAssetUrl(src, 'jsdelivr', { format: 'webp' });
  const fallbackSrc = generateAssetUrl(src, 'jsdelivr', { format: fallbackFormat });
  
  return {
    webp: webpSrc,
    fallback: fallbackSrc
  };
};