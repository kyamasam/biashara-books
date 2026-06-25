import type { ComponentProps, ComponentType } from 'react';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpDown,
  ArrowUpRight,
  Bell,
  BookOpenText,
  HandCoins,
  Home,
  ListChecks,
  LogOut,
  QrCode,
  ReceiptText,
  RefreshCw,
  Send,
  ShoppingCart,
} from 'lucide-react-native';

type LucideIconComponent = ComponentType<ComponentProps<typeof Home>>;

const ICONS = {
  accounts: ReceiptText,
  apply: ArrowUpRight,
  'arrow-left': ArrowLeft,
  books: BookOpenText,
  home: Home,
  loans: HandCoins,
  logout: LogOut,
  makeSale: ShoppingCart,
  notifications: Bell,
  pay: Send,
  pos: ShoppingCart,
  qr: QrCode,
  refresh: RefreshCw,
  sale: ShoppingCart,
  transactionIn: ArrowDownLeft,
  transactionOut: ArrowUpRight,
  transfer: ArrowUpDown,
  transactions: ListChecks,
} satisfies Record<string, LucideIconComponent>;

export type AppIconName = keyof typeof ICONS;

type AppIconProps = Omit<ComponentProps<typeof Home>, 'color'> & {
  name: AppIconName;
  color?: string;
};

export function AppIcon({ name, color = '#111111', strokeWidth = 2, ...props }: AppIconProps) {
  const Icon = ICONS[name];

  return <Icon color={color} strokeWidth={strokeWidth} {...props} />;
}
