/** DRF PageNumberPagination envelope (PAGE_SIZE = 15). */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
