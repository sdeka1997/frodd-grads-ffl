"use client";

import { useState, useEffect, useRef } from 'react';
import { Upload, Star, Calendar, MapPin, Users, Heart } from 'lucide-react';
import AllStarSchedule from '@/components/AllStarSchedule';

interface Photo {
  src: string;
  extraClass?: string;
}

interface YearData {
  year: string;
  location?: string;
  dates?: string;
  highlights?: string[];
  photos?: Photo[];
}

const allStarYears: YearData[] = [
  {
    year: '2026',
    location: 'New York, NY',
    dates: 'April 10-12',
    highlights: ['Sacko: Subway Busking'],
    photos: []
  },
  {
    year: '2025',
    location: 'Washington, D.C.',
    dates: 'April 25-27',
    highlights: [
      'Sacko: Bunny Hop 5K',
      'Barcelona Wine Bar'
    ],
    photos: [
      { src: '/allstar/2025_sacko.jpg' },
      { src: '/allstar/2025.jpg' },
      { src: '/allstar/2025_1.png' },
    ]
  },
  {
    year: '2024',
    location: 'Houston, TX',
    dates: 'May 3-5',
    highlights: [
      'Sacko: Mime',
      'Oishii'
    ],
    photos: [
      { src: '/allstar/2024_sacko.JPG', extraClass: 'scale-110' },
      { src: '/allstar/2024.jpg',        extraClass: 'object-center scale-110' },
      { src: '/allstar/2024_1.JPG',      extraClass: 'scale-110' },
      { src: '/allstar/2024_3.jpg' },
    ]
  },
  {
    year: '2023',
    location: 'Washington, D.C.',
    dates: 'April 7-9',
    highlights: [
      'Sacko: Comedy Club',
      'Heist'
    ],
    photos: [
      { src: '/allstar/2023_sacko.JPG' },
      { src: '/allstar/2023.JPG',  extraClass: 'scale-125' },
      { src: '/allstar/2023_1.JPG' },
    ]
  },
  {
    year: '2022',
    location: 'Philadelphia, PA',
    dates: 'February 18-20',
    highlights: [
      'Sacko: Box',
      'Diplo @ Noto'
    ],
    photos: [
      { src: '/allstar/2022_sacko.JPG' },
      { src: '/allstar/2022.JPG' },
      { src: '/allstar/2022_1.JPG' },
    ]
  }
];

export default function AllStarPage() {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  // Mobile photo carousel state
  const [photoIndex, setPhotoIndex] = useState(0);
  const [photoDragX, setPhotoDragX] = useState(0);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const photoStartX = useRef(0);
  const photoDragActive = useRef(false);
  const wasPhotoDragging = useRef(false);

  // Reset photo index when year changes
  useEffect(() => { setPhotoIndex(0); }, [selectedYear]);

  const onPhotoPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    photoStartX.current = e.clientX;
    photoDragActive.current = false;
  };
  const onPhotoPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dx = e.clientX - photoStartX.current;
    if (!photoDragActive.current && Math.abs(dx) > 8) {
      photoDragActive.current = true;
      setIsDraggingPhoto(true);
    }
    if (photoDragActive.current) setPhotoDragX(dx);
  };
  const onPhotoPointerUp = () => {
    wasPhotoDragging.current = photoDragActive.current;
    if (photoDragActive.current) {
      setIsDraggingPhoto(false);
      if (photoDragX < -60 && photoIndex < currentPhotos.length - 1) setPhotoIndex(i => i + 1);
      else if (photoDragX > 60 && photoIndex > 0) setPhotoIndex(i => i - 1);
      setPhotoDragX(0);
    }
    photoDragActive.current = false;
  };

  const currentPhotos = allStarYears.find(y => y.year === selectedYear)?.photos || [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalIndex(null);
      if (e.key === 'ArrowRight' && modalIndex !== null) setModalIndex(i => Math.min((i ?? 0) + 1, currentPhotos.length - 1));
      if (e.key === 'ArrowLeft' && modalIndex !== null) setModalIndex(i => Math.max((i ?? 0) - 1, 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalIndex, currentPhotos.length]);


  return (
    <>
    <div className="space-y-6 md:space-y-16">
      <header className="border-b border-slate-800 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <Star className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
            All-Star Weekend
          </h1>
          <span className="text-slate-500 text-sm">
            Established 2022
          </span>
        </div>
        <p className="mt-2 text-slate-500 text-xs md:text-lg md:text-slate-400 md:mt-4">
          The league gets together in the Sacko's city for an epic weekend of friendly competition and unforgettable memories.
        </p>
      </header>

      {/* YEAR SELECTOR */}
      <section id="year-selector">
        {/* Mobile: full-width grid chips */}
        <div className="grid md:hidden gap-2" style={{ gridTemplateColumns: `repeat(${allStarYears.length}, 1fr)` }}>
          {allStarYears.map((yearData) => (
            <button
              key={yearData.year}
              onClick={() => setSelectedYear(yearData.year)}
              className={`py-1.5 rounded-full border text-xs font-bold transition-all ${
                selectedYear === yearData.year
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
              }`}
            >
              {yearData.year}
            </button>
          ))}
        </div>

        {/* Desktop: grid of cards */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {allStarYears.map((yearData) => (
            <button
              key={yearData.year}
              onClick={() => setSelectedYear(yearData.year)}
              className={`p-4 rounded-xl border overflow-hidden transition-all text-left ${
                selectedYear === yearData.year
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-600'
              }`}
            >
              <div className="text-xl font-bold">{yearData.year}</div>
              <div className="text-xs text-slate-400 mt-1 truncate w-full">
                {yearData.location !== 'TBD' && yearData.location !== 'Add location...'
                  ? yearData.location
                  : 'All-Star Weekend'
                }
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SELECTED YEAR DETAILS */}
      <section>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
          <div className="mb-4">
            <h2 className="text-xl md:text-3xl font-bold flex items-center justify-center md:justify-start gap-2 mb-3">
              <Star className="text-yellow-400 shrink-0" />
              {selectedYear} All-Star Weekend
            </h2>

            {/* Event Details - always one row */}
            {(() => {
              const yd = allStarYears.find(y => y.year === selectedYear);
              const sacko = yd?.highlights?.find(h => h.startsWith('Sacko:'))?.replace('Sacko: ', '') || 'TBD';
              return (
                <div className="flex flex-wrap items-center gap-4 md:gap-8 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="hidden md:inline font-medium text-sm">Location:&nbsp;</span>
                    <span className="md:hidden text-sm">{yd?.location?.split(',')[0]}</span>
                    <span className="hidden md:inline text-sm">{yd?.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="hidden md:inline font-medium text-sm">Dates:&nbsp;</span>
                    <span className="text-sm">{yd?.dates}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="hidden md:inline font-medium text-sm">Sacko:&nbsp;</span>
                    <span className="text-sm">{sacko}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Separator Line */}
          <div className="pt-1">
            <div className="border-t border-slate-700"></div>
          </div>

          {/* Schedule - 2026 only */}
          {selectedYear === '2026' && (
            <div className="pt-8">
              <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-400" />
                Weekend Schedule
              </h3>
              <AllStarSchedule />
              <div className="mt-8 border-t border-slate-700" />
            </div>
          )}

          {/* Photos/Upload Section */}
          <div className="pt-8">
            <div className="flex items-center gap-2 text-slate-300 mb-6">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="font-medium text-lg">{selectedYear === '2026' ? 'Upload Photos:' : 'Photos:'}</span>
            </div>

            {selectedYear === '2026' ? (
              <div
                className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-yellow-400 transition-colors cursor-pointer max-w-md mx-auto"
                onClick={() => window.open('https://photos.app.goo.gl/jiiBHSd7U7exD9Ex9', '_blank')}
              >
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <div className="text-slate-400 mb-2 text-lg">
                  Click to upload photos from {selectedYear}
                </div>
                <div className="text-sm text-slate-500">
                  Opens shared Google Photos album
                </div>
              </div>
            ) : (
              <>
                {/* Mobile: swipeable single photo */}
                <div className="md:hidden flex flex-col gap-3">
                  <div
                    className="overflow-hidden rounded-lg cursor-grab active:cursor-grabbing"
                    style={{ touchAction: 'none' }}
                    onPointerDown={onPhotoPointerDown}
                    onPointerMove={onPhotoPointerMove}
                    onPointerUp={onPhotoPointerUp}
                  >
                    <div
                      className="flex"
                      style={{
                        transform: `translateX(calc(-${photoIndex * 100}% + ${photoDragX}px))`,
                        transition: isDraggingPhoto ? 'none' : 'transform 0.3s ease',
                      }}
                    >
                      {currentPhotos.map((photo, index) => (
                        <div
                          key={index}
                          className="aspect-square relative overflow-hidden bg-slate-800 border border-slate-700 shrink-0 w-full"
                          style={{ minWidth: '100%' }}
                          onClick={() => { if (wasPhotoDragging.current) { wasPhotoDragging.current = false; return; } setModalIndex(index); }}
                        >
                          <img
                            src={photo.src}
                            alt={`${selectedYear} All-Star Weekend - Photo ${index + 1}`}
                            className={['w-full h-full object-cover', photo.extraClass ?? ''].join(' ').trim()}
                            draggable={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {currentPhotos.length > 1 && (
                    <div className="flex gap-1.5 justify-center">
                      {currentPhotos.map((_, i) => (
                        <div key={i} className={`rounded-full transition-all duration-300 ${i === photoIndex ? 'w-4 h-1.5 bg-yellow-400' : 'w-1.5 h-1.5 bg-slate-600'}`} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop: photo grid */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center max-w-fit mx-auto">
                  {currentPhotos.map((photo, index) => (
                    <div
                      key={index}
                      className="aspect-square relative overflow-hidden rounded-lg bg-slate-800 border border-slate-700 group cursor-pointer"
                      onClick={() => setModalIndex(index)}
                    >
                      <img
                        src={photo.src}
                        alt={`${selectedYear} All-Star Weekend - Photo ${index + 1}`}
                        className={['w-full h-full object-cover hover:scale-105 transition-transform duration-300', photo.extraClass ?? ''].join(' ').trim()}
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-8 h-8 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>

      {/* Photo modal */}
      {modalIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setModalIndex(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            onClick={() => setModalIndex(null)}
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev */}
          {modalIndex > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-black/40 rounded-full"
              onClick={e => { e.stopPropagation(); setModalIndex(i => Math.max((i ?? 1) - 1, 0)); }}
              aria-label="Previous"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next */}
          {modalIndex < currentPhotos.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-black/40 rounded-full"
              onClick={e => { e.stopPropagation(); setModalIndex(i => Math.min((i ?? 0) + 1, currentPhotos.length - 1)); }}
              aria-label="Next"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <img
            src={currentPhotos[modalIndex].src}
            alt={`${selectedYear} All-Star Weekend - Photo ${modalIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />

          {/* Dots */}
          {currentPhotos.length > 1 && (
            <div className="absolute bottom-4 flex gap-2">
              {currentPhotos.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setModalIndex(i); }}
                  className={`rounded-full transition-all ${i === modalIndex ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}