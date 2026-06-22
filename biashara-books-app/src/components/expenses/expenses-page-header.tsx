import { IconButton } from '@/components/home/icon-button';
import { PageHeader } from '@/components/page-header';

export function ExpensesPageHeader() {
  return (
    <PageHeader
      title="Expenses"
      actions={
        <>
          <IconButton name="qr" accessibilityLabel="Scan QR code" />
          <IconButton name="notifications" accessibilityLabel="Notifications" badge />
        </>
      }
    />
  );
}
