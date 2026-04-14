// ALL-STAR LANDING PAGE — re-enable each year before All-Star Weekend:
//   1. Uncomment the two imports below (AllStarCountdown, AllStarSchedule)
//   2. Uncomment the ALL_STAR_END + allStarPassed block in the component body
//   3. In the mobile section, replace the plain <HallOfFameStack> with the commented allStarPassed conditional
//   4. Change the mobile CTA text back to "Reveal Surprise"
//   5. Restore the outer div's grid class: "w-full max-w-6xl grid md:grid-cols-2 gap-12 md:gap-16 items-center"
//   6. Restore the right-side desktop schedule block at the bottom of the grid
// import AllStarCountdown from '@/components/AllStarCountdown';
// import AllStarSchedule from '@/components/AllStarSchedule';
import HallOfFameStack from '@/components/HallOfFameStack';
import { getCumulativeRecords } from '@/utils/dataProcessing';
import { Star } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const records = getCumulativeRecords();
  const hallOfFame = records
    .filter(r => r.championships > 0)
    .sort((a, b) => b.championships - a.championships);
  const maxChamps = Math.max(...hallOfFame.map(r => r.championships));

  // ALL-STAR LANDING PAGE: uncomment and update the date each year
  // const ALL_STAR_END = new Date('2027-XX-XXT00:00:00');
  // const allStarPassed = new Date() > ALL_STAR_END;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-8 pb-32">
      {/* ALL-STAR LANDING PAGE: restore grid class on this div (see step 5 above) */}
      <div className="w-full max-w-3xl">

        {/* Left: hero + main content + CTAs */}
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              The <span className="text-emerald-400">Frodd Grads</span> Hub
            </h1>
            <p className="text-slate-400 text-lg">
              The complete digital home for the Frodd Grads.
            </p>
          </div>

          {/* Mobile: Hall of Fame swipe cards (permanent) */}
          {/* ALL-STAR LANDING PAGE: replace with conditional (see step 3 above):
              {allStarPassed
                ? <div className="md:hidden"><HallOfFameStack managers={hallOfFame} maxChamps={maxChamps} /></div>
                : <AllStarCountdown />
              }
          */}
          <div className="md:hidden">
            <HallOfFameStack managers={hallOfFame} maxChamps={maxChamps} />
          </div>

          {/* Desktop CTA */}
          <Link
            href="/dashboard"
            className="self-start hidden md:inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-xl text-lg transition-colors"
          >
            <Star className="w-5 h-5" />
            Enter Site
          </Link>

          {/* Mobile CTA */}
          {/* ALL-STAR LANDING PAGE: change text to "Reveal Surprise" before the event (see step 4 above) */}
          <Link
            href="/dashboard"
            className="md:hidden flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-xl text-lg transition-colors w-full"
          >
            <Star className="w-5 h-5" />
            Enter Site
          </Link>
        </div>

        {/* ALL-STAR LANDING PAGE: restore right-side desktop schedule here (see step 6 above):
            {!allStarPassed && (
              <div className="hidden md:block">
                <AllStarSchedule />
              </div>
            )}
        */}

      </div>
    </div>
  );
}
