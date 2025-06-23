import { UserRole } from "./user";

export type AuthJwtPayload = {
  sub: string;
  role?: UserRole;
}