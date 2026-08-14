import { describe, it, expect } from "vitest";
import { isValidAbacateCheckoutUrl } from "../lib/checkoutUrl";

describe("isValidAbacateCheckoutUrl", () => {
  it("accepts the exact AbacatePay domain over https", () => {
    expect(isValidAbacateCheckoutUrl("https://abacatepay.com/checkout/abc")).toBe(true);
  });

  it("accepts real AbacatePay subdomains", () => {
    expect(isValidAbacateCheckoutUrl("https://checkout.abacatepay.com/abc")).toBe(true);
    expect(isValidAbacateCheckoutUrl("https://pay.abacatepay.com/abc")).toBe(true);
  });

  it("rejects lookalike domains that merely end with 'abacatepay.com'", () => {
    // Regression test: hostname.endsWith('abacatepay.com') alone would
    // wrongly accept this and redirect the user to an attacker-owned host.
    expect(isValidAbacateCheckoutUrl("https://evilabacatepay.com/abc")).toBe(false);
    expect(isValidAbacateCheckoutUrl("https://notabacatepay.com/abc")).toBe(false);
  });

  it("rejects AbacatePay as a path or query param on another domain", () => {
    expect(isValidAbacateCheckoutUrl("https://evil.com/abacatepay.com")).toBe(false);
    expect(isValidAbacateCheckoutUrl("https://evil.com?next=abacatepay.com")).toBe(false);
  });

  it("rejects non-https protocols", () => {
    expect(isValidAbacateCheckoutUrl("http://abacatepay.com/abc")).toBe(false);
    expect(isValidAbacateCheckoutUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects malformed URLs instead of throwing", () => {
    expect(isValidAbacateCheckoutUrl("not a url")).toBe(false);
    expect(isValidAbacateCheckoutUrl("")).toBe(false);
  });
});
