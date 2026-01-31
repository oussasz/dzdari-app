import React from "react";
import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  tagline: string;
  exploreTitle: string;
  legalTitle: string;
  exploreLinks: Array<{ label: string; href: string }>;
  legalLinks: Array<{ label: string; href: string }>;
}

const Footer = ({
  tagline,
  exploreTitle,
  legalTitle,
  exploreLinks,
  legalLinks,
}: FooterProps) => {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="main-container py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-black/5">
                <Image
                  src="/images/logo.png"
                  alt="Lugario"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="text-base font-bold text-neutral-900">
                Lugario
              </div>
            </div>
            <p className="mt-3 max-w-md text-sm text-neutral-600">{tagline}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-900">
              {exploreTitle}
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              {exploreLinks.map((l) => (
                <li key={l.href}>
                  <Link className="hover:text-neutral-900" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-900">
              {legalTitle}
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              {legalLinks.map((l, idx) => (
                <li key={`${l.label}-${idx}`}>
                  <Link className="hover:text-neutral-900" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-neutral-200 pt-6 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Lugario</div>
          <div>Built for fast stays discovery.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
