import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  configured: true,
  hasContinuation: true,
  identityError: null as unknown,
  nonce: "AAECAwQFBgcICQoLDA0ODw==" as string | null,
  user: { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" } as { id: string } | null,
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ has: () => harness.hasContinuation }),
  headers: async () => new Headers(harness.nonce ? { "x-nonce": harness.nonce } : undefined),
}));
vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: () => harness.configured }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: harness.user }, error: harness.identityError }) },
  }),
}));
vi.mock("@/lib/server/invitation-continuations", () => ({
  INVITATION_CONTINUATION_COOKIE: "__Host-cevanta-invite",
}));
vi.mock("@/app/actions/invitations", () => ({
  acceptClientInvitation: async () => ({ status: "error", message: "Unavailable" }),
}));
vi.mock("@/components/action-form", () => ({
  ActionForm: ({ submitLabel }: { submitLabel: string }) => createElement("form", null, createElement("button", { type: "submit" }, submitLabel)),
}));

import InvitePage, { dynamic } from "@/app/invite/page";
import InvitationContinuePage from "@/app/invite/continue/page";
import { invitationBootstrapSource } from "@/app/invite/invitation-bootstrap";
import { metadata } from "@/app/invite/layout";

const fictionalRequest = "33333333-3333-4333-8333-333333333333";
const fictionalToken = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8";
const bootstrapModuleSource = readFileSync(join(process.cwd(), "src/app/invite/invitation-bootstrap.tsx"), "utf8");
const statusModuleSource = readFileSync(join(process.cwd(), "src/app/invite/invitation-bootstrap-status.tsx"), "utf8");

beforeEach(() => {
  harness.configured = true;
  harness.hasContinuation = true;
  harness.identityError = null;
  harness.nonce = "AAECAwQFBgcICQoLDA0ODw==";
  harness.user = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" };
});

describe("private invitation bootstrap", () => {
  it("is explicitly dynamic and gives the valid request nonce only to the first bootstrap script", async () => {
    const html = renderToStaticMarkup(await InvitePage());
    expect(dynamic).toBe("force-dynamic");
    expect(html).toContain("Preparing your secure invitation");
    expect(html.indexOf("<script")).toBeLessThan(html.indexOf("PRIVATE CLIENT ACCESS"));
    expect(html).toContain(`<script nonce="${harness.nonce}"`);
    expect(html.match(new RegExp(harness.nonce!.replace(/[+]/g, "\\+"), "g"))).toHaveLength(1);
    expect(html).not.toContain(fictionalRequest);
    expect(html).not.toContain(fictionalToken);
    expect(html).not.toMatch(/request_id=|token=|tenant_id|recipient_email|Create account|sign-up/i);
  });

  it("keeps the nonce-bearing bootstrap server-only and isolates the client status observer", () => {
    expect(bootstrapModuleSource).not.toMatch(/^\s*["']use client["']/);
    expect(statusModuleSource).toMatch(/^\s*["']use client["']/);
    expect(bootstrapModuleSource).not.toContain("useEffect");
    expect(statusModuleSource).not.toContain("InvitationBootstrap({ nonce }");
  });

  it.each([null, "short", "AAAAAAAAAAAAAAAAAAAAAA==extra", "AAAAAAAAAAAAAAAAAAAAAA="]) (
    "fails safely without an executable bootstrap when the request nonce is missing or malformed: %s",
    async nonce => {
      harness.nonce = nonce;
      const html = renderToStaticMarkup(await InvitePage());
      expect(html).not.toContain("<script");
      expect(html).toContain("This invitation is unavailable.");
      expect(html).toContain('role="alert"');
      expect(html).not.toMatch(/request_id=|token=|tenant_id|recipient_email|role=owner|return_url/i);
    },
  );

  it("removes the fragment before parsing or fetching and accepts only the exact v/r/t envelope", () => {
    const replaceIndex = invitationBootstrapSource.indexOf("history.replaceState");
    expect(replaceIndex).toBeGreaterThan(-1);
    expect(replaceIndex).toBeLessThan(invitationBootstrapSource.indexOf("new URLSearchParams"));
    expect(replaceIndex).toBeLessThan(invitationBootstrapSource.indexOf("window.fetch"));
    expect(invitationBootstrapSource).toContain('keys.length !== 3');
    expect(invitationBootstrapSource).toContain('keys[0] !== "r"');
    expect(invitationBootstrapSource).toContain('version !== "1"');
    expect(invitationBootstrapSource).toContain("{43}");
    expect(invitationBootstrapSource).toContain("decoded.length !== 32");
  });

  it("uses only the fixed same-origin exchange and continuation paths without browser storage or third-party requests", () => {
    expect(invitationBootstrapSource).toContain('const exchangePath = "/api/invitations/continuations"');
    expect(invitationBootstrapSource).toContain('const continuePath = "/invite/continue"');
    expect(invitationBootstrapSource).toContain('credentials: "same-origin"');
    expect(invitationBootstrapSource).toContain('referrerPolicy: "no-referrer"');
    expect(invitationBootstrapSource).toContain('cache: "no-store"');
    expect(invitationBootstrapSource).toContain('redirect: "error"');
    expect(invitationBootstrapSource).not.toMatch(/localStorage|sessionStorage|document\.cookie|location\.search|https?:\/\//);
  });

  it("marks the entire invitation segment noindex and no-referrer", () => {
    expect(metadata.referrer).toBe("no-referrer");
    expect(metadata.robots).toMatchObject({ index: false, follow: false, noarchive: true, nocache: true });
  });
});

describe("private invitation continuation page", () => {
  it("shows an identifier-free acceptance form to the signed-in recipient", async () => {
    const html = renderToStaticMarkup(await InvitationContinuePage());
    expect(html).toContain("Accept invitation");
    expect(html).toContain("guided workspace setup");
    expect(html).not.toMatch(/request_id|token|continuation|tenant_id|recipient|email=|role=|type="hidden"/i);
  });

  it("shows only the fixed sign-in path to a signed-out recipient and never offers sign-up", async () => {
    harness.user = null;
    const html = renderToStaticMarkup(await InvitationContinuePage());
    expect(html).toContain('href="/sign-in"');
    expect(html).toContain("Sign in to continue");
    expect(html).not.toMatch(/sign-up|Create account|request_id|token|continuation|tenant_id|recipient_email/i);
  });

  it("fails closed with generic recovery when the continuation cookie is absent", async () => {
    harness.hasContinuation = false;
    const html = renderToStaticMarkup(await InvitationContinuePage());
    expect(html).toContain("This invitation is unavailable");
    expect(html).toContain('role="alert"');
    expect(html).not.toMatch(/request_id|token|continuation|tenant_id|recipient|workspace owner|email=/i);
  });
});

