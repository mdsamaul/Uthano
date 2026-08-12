import { Header, MobileSearchOverlay } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { CartDrawer } from '@/components/cart/CartDrawer';

export const dynamic = 'force-dynamic';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <MobileNavigation />
      <CartDrawer />
      <MobileSearchOverlay />
    </div>
  );
}