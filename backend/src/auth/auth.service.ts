import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { JWTPayload } from "jose";
import { AUTH0_AUDIENCE, AUTH0_ISSUER } from "./auth.constants";
import { CurrentUser } from "./current-user";

type JoseModule = typeof import("jose");

@Injectable()
export class AuthService {
  private jwks: ReturnType<JoseModule["createRemoteJWKSet"]> | undefined;

  async verifyBearerToken(authorization: string | undefined): Promise<CurrentUser> {
    const token = this.extractBearerToken(authorization);

    if (process.env.AUTH_MODE === "test") {
      return this.verifyTestToken(token);
    }

    const { createRemoteJWKSet, jwtVerify } = await this.loadJose();
    this.jwks ??= createRemoteJWKSet(new URL(`${AUTH0_ISSUER}.well-known/jwks.json`));

    try {
      const result = await jwtVerify(token, this.jwks, {
        issuer: AUTH0_ISSUER,
        audience: AUTH0_AUDIENCE,
        algorithms: ["RS256"]
      });

      return this.userFromPayload(result.payload);
    } catch {
      throw new UnauthorizedException("Invalid bearer token");
    }
  }

  private extractBearerToken(authorization: string | undefined) {
    const match = authorization?.match(/^Bearer (?<token>.+)$/i);

    if (!match?.groups?.token) {
      throw new UnauthorizedException("Missing bearer token");
    }

    return match.groups.token;
  }

  private verifyTestToken(token: string): CurrentUser {
    if (!token.startsWith("test:")) {
      throw new UnauthorizedException("Invalid test token");
    }

    const id = token.slice("test:".length);

    if (!id) {
      throw new UnauthorizedException("Invalid test token");
    }

    return { id };
  }

  private userFromPayload(payload: JWTPayload): CurrentUser {
    if (!payload.sub) {
      throw new UnauthorizedException("Token is missing subject");
    }

    return {
      id: payload.sub,
      email: typeof payload.email === "string" ? payload.email : undefined,
      name: typeof payload.name === "string" ? payload.name : undefined
    };
  }

  private loadJose(): Promise<JoseModule> {
    const load = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<JoseModule>;
    return load("jose");
  }
}
