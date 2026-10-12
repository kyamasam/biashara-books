import { useEffect } from 'react';

import AppTabs from '@/components/app-tabs';
import { useUserStore } from '@/store/user-store';

export default function TabLayout() {
  const fetchUser = useUserStore((s) => s.fetchUser);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  return <AppTabs />;
}
