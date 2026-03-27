"use client";

import { useState } from 'react';
import { Upload, Star, Calendar, MapPin, Users, Heart } from 'lucide-react';

interface YearData {
  year: string;
  location?: string;
  dates?: string;
  highlights?: string[];
  photos?: string[];
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
    photos: ['/allstar/2025_sacko.HEIC', '/allstar/2025.HEIC', '/allstar/2025_1.png']
  },
  {
    year: '2024',
    location: 'Houston, TX',
    dates: 'May 3-5',
    highlights: [
      'Sacko: Mime',
      'Oishii'
    ],
    photos: ['/allstar/2024_sacko.JPG', '/allstar/2024.HEIC', '/allstar/2024_1.JPG', '/allstar/2024_3.HEIC']
  },
  {
    year: '2023',
    location: 'Washington, D.C.',
    dates: 'April 7-9',
    highlights: [
      'Sacko: Comedy Club',
      'Heist'
    ],
    photos: ['/allstar/2023_sacko.JPG', '/allstar/2023.JPG', '/allstar/2023_1.JPG']
  },
  {
    year: '2022',
    location: 'Philadelphia, PA',
    dates: 'February 18-20',
    highlights: [
      'Sacko: Box',
      'Diplo @ Noto'
    ],
    photos: ['/allstar/2022_sacko.JPG', '/allstar/2022.JPG', '/allstar/2022_1.JPG']
  }
];

export default function AllStarPage() {
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [modalPhoto, setModalPhoto] = useState<string | null>(null);

  const getCurrentPhotos = () => {
    const yearData = allStarYears.find(y => y.year === selectedYear);
    return yearData?.photos || [];
  };

  const currentPhotos = getCurrentPhotos();

  return (
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

            {/* Event Details - Horizontal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-300">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Location:</span>
                <span>{allStarYears.find(y => y.year === selectedYear)?.location}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="font-medium">Dates:</span>
                <span>{allStarYears.find(y => y.year === selectedYear)?.dates}</span>
              </div>
              <div className="flex items-center justify-center md:justify-end gap-2 text-slate-300">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="font-medium">Sacko:</span>
                <span>
                  {allStarYears.find(y => y.year === selectedYear)?.highlights?.find(h => h.startsWith('Sacko:'))?.replace('Sacko: ', '') || 'TBD'}
                </span>
              </div>
            </div>
          </div>

          {/* Separator Line */}
          <div className="pt-4">
            <div className="border-t border-slate-700"></div>
          </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center max-w-fit mx-auto">
                {currentPhotos.map((photo, index) => {
                  // Special styling for specific photos that need adjustment
                  let imageClass = "w-full h-full object-cover hover:scale-105 transition-transform duration-300";

                  // 2023 football field photo needs more zoom
                  if (selectedYear === '2023' && photo.includes('2023.JPG')) {
                    imageClass += " scale-125";
                  }

                  // 2024 football photo needs better centering
                  if (selectedYear === '2024' && photo.includes('2024.HEIC')) {
                    imageClass += " object-center scale-110";
                  }

                  // 2024 basketball photo needs slight zoom
                  if (selectedYear === '2024' && photo.includes('2024_1.JPG')) {
                    imageClass += " scale-110";
                  }

                  // 2024 sacko photo (now JPG instead of HEIC)
                  if (selectedYear === '2024' && photo.includes('2024_sacko.JPG')) {
                    imageClass += " scale-110";
                  }

                  return (
                    <div
                      key={index}
                      className="aspect-square relative overflow-hidden rounded-lg bg-slate-800 border border-slate-700 group cursor-pointer"
                      onClick={() => setModalPhoto(photo)}
                    >
                      <img
                        src={photo}
                        alt={`${selectedYear} All-Star Weekend - Photo ${index + 1}`}
                        className={imageClass}
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-8 h-8 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>


      {/* Photo modal */}
      {modalPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setModalPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            onClick={() => setModalPhoto(null)}
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={modalPhoto}
            alt="Full size photo"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}