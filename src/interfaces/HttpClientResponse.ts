export interface HttpClientResponse<T = any> {
  data: T;
  status: number;
  headers: object;
}
