import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your UTHANO account.',
};
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <LoginForm />;
}
