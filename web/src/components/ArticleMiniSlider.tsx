import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ArticleMiniSliderProps {
  images: string[];
  onImageClick: (url: string) => void;
}

export const ArticleMiniSlider: React.FC<ArticleMiniSliderProps> = ({ images, onImageClick }) => {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrent(idx);
  };

  const handleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onImageClick(images[current]);
  };

  return (
    <div className="relative w-full h-full group/minislider overflow-hidden bg-slate-950 rounded-xl select-none">
      {/* Slides Container */}
      <div className="w-full h-full relative">
        {images.map((img, idx) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={img}
              alt={`Gallery preview ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-15 pointer-events-none" />
      </div>

      {/* Glass Zoom Hover Button */}
      <button
        onClick={handleZoom}
        className="absolute top-3 right-3 z-20 p-2 bg-black/60 dark:bg-slate-900/80 hover:bg-accentBlue text-white border border-slate-750 rounded-xl opacity-0 group-hover/minislider:opacity-100 transition-all duration-200 hover:scale-105"
        title="View Fullscreen"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-black/40 hover:bg-black/75 border border-slate-800 text-white rounded-lg opacity-0 group-hover/minislider:opacity-100 transition-all duration-200 hover:scale-105"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-black/40 hover:bg-black/75 border border-slate-800 text-white rounded-lg opacity-0 group-hover/minislider:opacity-100 transition-all duration-200 hover:scale-105"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Pagination dots overlay */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex space-x-1 z-20">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => handleDotClick(e, idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === current ? 'bg-accentBlue w-3' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ArticleMiniSlider;
