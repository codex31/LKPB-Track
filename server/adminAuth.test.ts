import { describe, expect, it } from "vitest";
import { ADMIN_COOKIE, createAdminToken, isAdminSession, isSameOrigin } from "./adminAuth";

function requestWithToken(token: string) {
  return { headers: { cookie: `${ADMIN_COOKIE}=${token}` } } as never;
}

describe("admin session", () => {
  it("accepts a freshly signed admin token", () => {
    expect(isAdminSession(requestWithToken(createAdminToken(Date.now())))).toBe(true);
  });

  it("rejects expired and tampered tokens", () => {
    expect(isAdminSession(requestWithToken(createAdminToken(Date.now() - 9 * 60 * 60 * 1000)))).toBe(false);
    const token = createAdminToken();
    expect(isAdminSession(requestWithToken(`${token.slice(0, -1)}x`))).toBe(false);
  });

  it("requires a same-origin browser request", () => {
    const request = (origin?: string) => ({
      headers: { host: "lkpb.example.com", origin },
      get(name: string) { return name === "host" ? "lkpb.example.com" : origin; },
    }) as never;
    expect(isSameOrigin(request("https://lkpb.example.com"))).toBe(true);
    expect(isSameOrigin(request("https://attacker.example"))).toBe(false);
    expect(isSameOrigin(request())).toBe(false);
  });
});
