/**
 * 백엔드 PageResponse와 일치하는 공통 페이지네이션 타입
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
