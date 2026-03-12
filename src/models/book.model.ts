export interface Book {
  id: number;
  title: string;
  publishedYear: number;
  author: string;
  language: string;
  genre: string;
}

export type BookSortField = "title" | "publishedYear";
export type SortOrder = "asc" | "desc";

export interface BookListQuery {
  title?: string;
  year?: number;
  language?: string;
  author?: string;
  genre?: string;
  sortBy?: BookSortField;
  order?: SortOrder;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedBooksResponse {
  data: Book[];
  pagination: PaginationMeta;
}
