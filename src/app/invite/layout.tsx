import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private client access | Cevanta",
  description: "Securely continue a private Cevanta workspace invitation.",
  referrer: "no-referrer",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      noimageindex: true,
    },
  },
};

export default function InvitationLayout({ children }: { children: React.ReactNode }) {
  return children;
}

