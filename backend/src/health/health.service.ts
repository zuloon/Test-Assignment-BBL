import { Injectable } from "@nestjs/common";

export type HealthResponse = {
  status: "ok";
  service: "backend";
};

@Injectable()
export class HealthService {
  getHealth(): HealthResponse {
    return {
      status: "ok",
      service: "backend"
    };
  }
}
