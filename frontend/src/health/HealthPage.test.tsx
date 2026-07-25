import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../app";

describe("HealthPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders backend health when the API is available", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "ok", service: "backend" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Checking backend health");

    await waitFor(() => {
      expect(screen.getByText("Backend connected")).toBeInTheDocument();
    });
    expect(screen.getByText("backend")).toBeInTheDocument();
    expect(screen.getByText("ok")).toBeInTheDocument();
  });
});
