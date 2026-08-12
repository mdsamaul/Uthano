import type { Metadata } from 'next';
import { AddressesClient } from './AddressesClient';

export const metadata: Metadata = {
  title: 'My Addresses',
  description: 'Manage your delivery addresses.',
};

export default function AddressesPage() {
  return <AddressesClient />;
}