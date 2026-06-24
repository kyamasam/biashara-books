import { useEffect } from 'react';

import AppTabs from '@/components/app-tabs';
import { useAuth } from '@/context/auth-context';
import { useUserStore } from '@/store/user-store';

export default function TabLayout() {
  const { accessToken } = useAuth();
  const fetchUser = useUserStore((s) => s.fetchUser);

  useEffect(() => {
    if (accessToken) fetchUser(accessToken);
  }, [accessToken, fetchUser]);

  return <AppTabs />;
}
