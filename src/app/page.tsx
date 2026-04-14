// ALL-STAR LANDING PAGE — restore for next year's All-Star Weekend:
//   Replace this entire file with the commented block below (remove the redirect import + component).
//   Then follow the numbered checklist within that block to re-enable the countdown/schedule.

import { redirect } from 'next/navigation';

export default function LandingPage() {
  redirect('/dashboard');
}

// ─── PRESERVED LANDING PAGE (re-enable for 2027) ───────────────────────────
//
// Instructions:
//   1. Delete the redirect import and component above
//   2. Uncomment the AllStarCountdown and AllStarSchedule imports
//   3. Update ALL_STAR_END to the Monday after the 2027 weekend
//   4. Restore the outer div's grid class (see step 5 comment inline)
//   5. In the mobile section, swap plain <HallOfFameStack> for the allStarPassed conditional
//   6. Change the mobile CTA text back to "Reveal Surprise"
//   7. Restore the right-side desktop schedule block
//
// import AllStarCountdown from '@/components/AllStarCountdown';
// import AllStarSchedule from '@/components/AllStarSchedule';
// import HallOfFameStack from '@/components/HallOfFameStack';
// import { getCumulativeRecords } from '@/utils/dataProcessing';
// import { Star } from 'lucide-react';
// import Link from 'next/link';
//
// const ALL_STAR_END = new Date('2027-XX-XXT00:00:00'); // ← update each year
//
// export default function LandingPage() {
//   const allStarPassed = new Date() > ALL_STAR_END;
//
//   let hallOfFame: { manager: string; championships: number; wins: number; losses: number }[] = [];
//   let maxChamps = 0;
//   if (allStarPassed) {
//     const records = getCumulativeRecords();
//     hallOfFame = records
//       .filter(r => r.championships > 0)
//       .sort((a, b) => b.championships - a.championships);
//     maxChamps = Math.max(...hallOfFame.map(r => r.championships));
//   }
//
//   return (
//     <div className="min-h-screen flex items-center justify-center px-6 pt-8 pb-32">
//       {/* Step 5: restore grid class → "w-full max-w-6xl grid md:grid-cols-2 gap-12 md:gap-16 items-center" */}
//       <div className="w-full max-w-6xl">
//         <div className="flex flex-col gap-8">
//           <div>
//             <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
//               The <span className="text-emerald-400">Frodd Grads</span> Hub
//             </h1>
//             <p className="text-slate-400 text-lg">
//               {allStarPassed ? 'The complete digital home for the Frodd Grads.' : 'All-Star Weekend 2027 is coming.'}
//             </p>
//           </div>
//
//           {/* Step 5: mobile — conditional countdown vs Hall of Fame */}
//           {allStarPassed
//             ? <div className="md:hidden"><HallOfFameStack managers={hallOfFame} maxChamps={maxChamps} /></div>
//             : <AllStarCountdown />
//           }
//
//           {/* Desktop CTA */}
//           <Link
//             href="/dashboard"
//             className="self-start hidden md:inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-xl text-lg transition-colors"
//           >
//             <Star className="w-5 h-5" />
//             Enter Site
//           </Link>
//
//           {/* Step 6: Mobile CTA — change text to "Reveal Surprise" before the event */}
//           <Link
//             href="/dashboard"
//             className="md:hidden flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-xl text-lg transition-colors w-full"
//           >
//             <Star className="w-5 h-5" />
//             Reveal Surprise
//           </Link>
//         </div>
//
//         {/* Step 7: right-side desktop schedule */}
//         {!allStarPassed && (
//           <div className="hidden md:block">
//             <AllStarSchedule />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
