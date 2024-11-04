export interface PaginationResult<T> {
  page: number;
  skip: number;
  limit: number;
  count: number;
  result: T[] 
}