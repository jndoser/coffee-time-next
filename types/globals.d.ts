export {};

export type Roles = "admin" | "owner" | "user";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      userId?: string;
      role?: Roles;
    };
  }
}
