import { describe, expect, it } from "vitest";
import { ADMIN_COOKIE, createAdminToken, isAdminSession } from "./adminAuth";

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
});
