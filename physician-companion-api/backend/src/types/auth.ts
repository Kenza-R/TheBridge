export type JwtRole = "physician" | "hospital_admin";

export type PhysicianClaims = {
  sub: string;
  role: "physician";
  physicianId: string;
  hospitalId: string;
};

export type AdminClaims = {
  sub: string;
  role: "hospital_admin";
  hospitalId: string;
};

export type AuthUser = PhysicianClaims | AdminClaims;

declare module "fastify" {
  interface FastifyRequest {
    auth?: AuthUser;
  }
}
