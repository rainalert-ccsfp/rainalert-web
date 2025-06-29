"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FloodAlertsContent from '../components/FloodAlertsContent';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!user) {
      router.push('/');
    }

    // Real-time logout across tabs
    const handleStorageChange = (event) => {
      if (event.key === 'user' && (event.newValue === null || event.newValue === undefined)) {
        window.location.href = '/';
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  return <FloodAlertsContent />;
} 