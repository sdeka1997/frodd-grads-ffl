import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MedianSeason from '@/components/MedianSeason';
import { MEDIAN_YEARS, getMedianWhatIf } from '@/utils/medianScoring';

// Only seasons with data exist; anything else 404s
export const dynamicParams = false;

export function generateStaticParams() {
  return MEDIAN_YEARS.map(year => ({ year }));
}

type Props = { params: Promise<{ year: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `Frodd FFL | ${year} Median What-If`,
    description: `The ${year} Frodd FFL season replayed as if the league had used median scoring.`,
  };
}

export default async function MedianSeasonPage({ params }: Props) {
  const { year } = await params;
  if (!MEDIAN_YEARS.includes(year)) notFound();
  return <MedianSeason data={getMedianWhatIf(year)} years={MEDIAN_YEARS} />;
}
