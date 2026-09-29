import type { Metadata } from 'next';
import MedianLanding from '@/components/MedianLanding';
import { getAllMedianWhatIfs } from '@/utils/medianScoring';

export const metadata: Metadata = {
  title: 'Frodd FFL | What If: Median Scoring',
  description: 'Every Frodd FFL season replayed as if the league had used median scoring.',
};

export default function MedianPage() {
  return <MedianLanding seasons={getAllMedianWhatIfs()} />;
}
