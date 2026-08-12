import type { Metadata } from 'next';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your UTHANO account.',
};
export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return <RegisterForm />;
}
