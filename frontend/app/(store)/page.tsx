import { HeroSection } from '@/components/home/HeroSection';
import { HomeContent } from '@/components/home/HomeContent';

export const metadata = {
  title: 'Fresh from the Farm. Straight to Your Home.',
  description:
    'UTHANO sources fresh fruits and agricultural products directly from Bangladeshi farms with complete traceability. From Farm to Family.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HomeContent />
    </>
  );
}