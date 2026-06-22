import { BusinessScreen } from '@/components/business-screen';

export default function PosScreen() {
  return (
    <BusinessScreen
      title="POS"
      subtitle="Sell, receipt, and track shop activity from one place."
      metrics={[
        { label: 'Today sales', value: 'KES 82.4k', detail: 'Up 12% from yesterday' },
        { label: 'Transactions', value: '18', detail: 'Average basket KES 4.6k' },
        { label: 'Refunds', value: '0', detail: 'No reversals recorded' },
      ]}
      actions={[
        { title: 'Start a new sale', detail: 'Add items, apply discounts, and issue a receipt.' },
        { title: 'Hold orders', detail: 'Two parked carts are waiting for checkout.' },
        { title: 'Low stock alerts', detail: 'Five fast-moving items need restocking.' },
      ]}
    />
  );
}
