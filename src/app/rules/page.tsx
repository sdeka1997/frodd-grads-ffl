import type { Metadata } from 'next';
import RulesExplorer from '@/components/RulesExplorer';

export const metadata: Metadata = {
  title: 'Frodd FFL | Rules',
  description: 'Frodd FFL league rules, fees, schedule, and Sacko punishment.',
};

export default function RulesPage() {
  return <RulesExplorer />;
}
