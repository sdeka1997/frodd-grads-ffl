"use client";

import { useState, useEffect, useRef } from 'react';
import { Upload, Star, Calendar, MapPin, Users, Heart } from 'lucide-react';

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

const schedule2026 = [
  {
    day: 'Friday',
    date: 'Apr 10',
    accent: 'border-l-yellow-400',
    headColor: 'text-yellow-400',
    events: [
      { time: '4PM',  text: 'Check-In',         sub: 'Airbnb',                         star: false },
      { time: '6PM',  text: 'Happy Hour',          sub: 'Westlight',                      star: false },
      { time: '8PM',  text: 'Dinner',            sub: 'Brooklyn',                       star: false },
      { time: '11PM', text: 'Pre-Game',                  sub: 'Airbnb',                  star: false },
      { time: '1AM',  text: 'CamelPhat',         sub: 'Brooklyn Storehouse',     star: true  },
    ],
  },
  {
    day: 'Saturday',
    date: 'Apr 11',
    accent: 'border-l-blue-400',
    headColor: 'text-blue-400',
    events: [
      { time: '12PM', text: 'Football',                   sub: 'Sternberg Park',            star: false },
      { time: '2PM',  text: 'Sacko',                     sub: 'Union Square Station',      star: true  },
      { time: '4PM',  text: 'Rooftop DJ Set',           sub: 'The Italic',                star: false },
      { time: '7PM',  text: 'Dinner',                   sub: 'Manhattan',                 star: false },
      { time: '9PM',  text: 'Beer Olympics',                   sub: 'Airbnb',            star: false },
    ],
  },
  {
    day: 'Sunday',
    date: 'Apr 12',
    accent: 'border-l-purple-400',
    headColor: 'text-purple-400',
    events: [
      { time: '11AM',  text: 'Check-Out',      sub: 'Airbnb',        star: false },
      { time: '11:30', text: 'Basketball',    sub: 'Sternberg Park', star: false },
      { time: '1PM',   text: 'Farewell Lunch', sub: 'Brooklyn',      star: false },
    ],
  },
];

function getCurrentEventKey(now: Date): string | null {
  if (now.getFullYear() !== 2026 || now.getMonth() !== 3) return null;
  const d = now.getDate();
  const mins = now.getHours() * 60 + now.getMinutes();
  if (d === 11 && mins < 3 * 60) return 'Friday-1AM';
  const days: [number, string, [string, number][]][] = [
    [10, 'Friday',   [['4PM', 16*60], ['6PM', 18*60], ['8PM', 20*60], ['11PM', 23*60], ['1AM', 25*60]]],
    [11, 'Saturday', [['12PM', 12*60], ['2PM', 14*60], ['4PM', 16*60], ['7PM', 19*60], ['9PM', 21*60]]],
    [12, 'Sunday',   [['11AM', 11*60], ['11:30', 11*60+30], ['1PM', 13*60]]],
  ];
  const entry = days.find(([date]) => date === d);
  if (!entry) return null;
  const [, dayName, events] = entry;
  let key: string | null = null;
  for (const [time, startMin] of events) {
    if (mins >= startMin) key = `${dayName}-${time}`;
  }
  return key;
}

export default function AllStarPage() {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [currentKey, setCurrentKey] = useState<string | null>(null);

  useEffect(() => {
    setCurrentKey(getCurrentEventKey(new Date()));
  }, []);

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
    <div className="space-y-16">
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
        <p className="mt-4 text-slate-400 text-lg">
          The league gets together in the Sacko's city for an epic weekend of friendly competition and unforgettable memories.
        </p>
      </header>

      {/* YEAR SELECTOR */}
      <section>
        <div className="mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="text-blue-400" /> Choose Your Year
          </h2>
          <p className="text-slate-400 mt-2">
            Select a year to view memories and upload photos.
          </p>
        </div>

        {/* Mobile: horizontal scroll chips */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar md:hidden pb-1">
          {allStarYears.map((yearData) => (
            <button
              key={yearData.year}
              onClick={() => setSelectedYear(yearData.year)}
              className={`shrink-0 px-4 py-2 rounded-full border text-sm font-bold transition-all ${
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
          <div className="mb-8">
            <h2 className="text-xl md:text-3xl font-bold flex items-center justify-center md:justify-start gap-2 mb-6">
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
                    <span className="text-sm">{yd?.location}</span>
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
          <div className="pt-4">
            <div className="border-t border-slate-700"></div>
          </div>

          {/* Schedule - 2026 only */}
          {selectedYear === '2026' && (
            <div className="pt-8">
              <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-400" />
                Weekend Schedule
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {schedule2026.map(day => (
                  <div key={day.day} className={`rounded-xl bg-slate-800/50 border border-slate-700/60 border-l-4 ${day.accent} p-5`}>
                    <div className={`font-bold text-base ${day.headColor}`}>{day.day}</div>
                    <div className="text-slate-500 text-xs mb-4">{day.date}</div>
                    <div className="space-y-3">
                      {day.events.map(ev => {
                        const key = `${day.day}-${ev.time}`;
                        const isCurrent = currentKey === key;
                        return (
                          <div
                            key={ev.time}
                            className={`flex gap-3 items-start rounded-lg ${isCurrent ? 'bg-white/5 px-2 py-1.5 -mx-2' : ''}`}
                          >
                            <span className="font-mono text-xs text-slate-500 w-10 shrink-0 pt-0.5">{ev.time}</span>
                            <div>
                              <div className={`text-sm font-medium leading-snug ${ev.star ? 'text-yellow-300' : 'text-slate-200'}`}>{ev.text}</div>
                              {ev.sub && <div className="text-xs text-slate-500 mt-0.5">{ev.sub}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
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