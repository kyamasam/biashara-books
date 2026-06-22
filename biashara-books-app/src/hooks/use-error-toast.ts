import { useToast } from '@/context/toast-context';
import { ApiError } from '@/lib/api-error';

export function useErrorToast() {
  const { showError } = useToast();

  return (err: unknown): void => {
    if (err instanceof ApiError || err instanceof Error) {
      showError(err.message);
    } else {
      showError('Something went wrong. Please try again.');
    }
  };
}
