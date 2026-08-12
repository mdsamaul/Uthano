import Link from 'next/link';
import { User, Package, MapPin, Star, Heart } from 'lucide-react';

const PROFILE_LINKS = [
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Orders', href: '/profile/orders', icon: Package },
  { label: 'Addresses', href: '/profile/addresses', icon: MapPin },
  { label: 'Reviews', href: '/profile/reviews', icon: Star },
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">My Account</h1>
      <div className="grid gap-8 lg:grid-cols-4">
        <nav className="space-y-1 lg:col-span-1" aria-label="Account navigation">
          {PROFILE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}