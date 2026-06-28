/** Individual criteria are scored 0-100; `overall` is their weighted aggregate. */
export interface BrandScore {
  length: number;
  pronunciation: number;
  memorability: number;
  visualAppeal: number;
  uniqueness: number;
  professionalFeel: number;
  kidFriendliness?: number;
  overall: number;
}
