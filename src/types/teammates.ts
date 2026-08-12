/** Shape returned by GET /me/teammates — everyone on the current user's team, excluding themself. */
export interface Teammate {
  id: number;
  full_name: string;
}
