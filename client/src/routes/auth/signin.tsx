import { createFileRoute } from '@tanstack/react-router'
import SignIn from '../../components/auth/SignIn'
import { useEffect } from 'react'

export const Route = createFileRoute('/auth/signin')({
  component: SignInPage,
})

function SignInPage() {
  // Force light mode for auth pages
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

  return <SignIn />;
}
