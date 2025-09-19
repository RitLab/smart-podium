export interface Pagination {
  page: number;
  per_page: number;
  page_count: number;
  total_count: number;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}
