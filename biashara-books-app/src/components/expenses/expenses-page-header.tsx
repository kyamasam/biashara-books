import { useRouter } from 'expo-router';

import { IconButton } from '@/components/home/icon-button';
import { PageHeader } from '@/components/page-header';

export function ExpensesPageHeader() {
  const router = useRouter();

  return (
    <PageHeader
      title="Expenses"
      showBack
      onBack={() => router.replace('/books')}
      actions={
        <>
          <IconButton name="qr" accessibilityLabel="Scan QR code" />
          <IconButton name="notifications" accessibilityLabel="Notifications" badge />
        </>
      }
    />
  );
}
