"use client";

import { useState } from "react";

const NAV_LINKS = [
  { href: "#stats", label: "Why It Matters" },
  { href: "#how", label: "How It Works" },
] as const;

const navLinkClass =
  "text-[0.8125rem] font-medium text-navy transition-colors hover:text-accent";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-5" aria-hidden="true">
      <span
        className={[
          "absolute left-0 top-0 h-0.5 w-5 rounded-full bg-navy transition-transform duration-200 ease-out",
          open ? "translate-y-[7px] rotate-45" : "",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-navy transition-all duration-200 ease-out",
          open ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-navy transition-transform duration-200 ease-out",
          open ? "-translate-y-[7px] -rotate-45" : "",
        ].join(" ")}
      />
    </span>
  );
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="fixed top-4 left-1/2 z-[100] w-[calc(100%-1.5rem)] max-w-[24rem] -translate-x-1/2 sm:top-6 sm:w-auto sm:max-w-none">
      <nav
        className="relative flex items-center justify-between gap-3 rounded-full bg-white/95 px-5 py-3 shadow-md backdrop-blur-sm sm:gap-8 sm:px-8"
        role="navigation"
        aria-label="Main navigation"
      >
        <a
          href="/"
          className="px-1 py-2 font-extrabold text-base tracking-tight text-navy"
          onClick={closeMenu}
        >
          Neuro<span className="text-accent">Edge</span>
        </a>

        <ul className="hidden items-center gap-7 sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={navLinkClass}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#hero"
          className="hidden cursor-pointer items-center gap-2 rounded-full bg-accent px-5 py-2 text-[0.8125rem] font-bold text-white transition-all hover:bg-accent-hover active:scale-[0.97] sm:inline-flex"
        >
          Free Scan
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 12L12 4" />
            <path d="M5 4h7v7" />
          </svg>
        </a>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-white text-navy transition-colors hover:border-accent/40 hover:text-accent sm:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsOpen((open) => !open)}
        >
          <MenuIcon open={isOpen} />
        </button>
      </nav>

      <div
        id="mobile-nav"
        className={[
          "grid overflow-hidden transition-[grid-template-rows,opacity,transform] duration-200 ease-out sm:hidden",
          isOpen
            ? "mt-3 grid-rows-[1fr] opacity-100 translate-y-0"
            : "grid-rows-[0fr] opacity-0 -translate-y-2 pointer-events-none",
        ].join(" ")}
      >
        <div className="min-h-0 overflow-hidden rounded-[1.5rem] bg-white/95 p-3 shadow-md backdrop-blur-sm">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-navy transition-colors hover:bg-accent-subtle hover:text-accent"
                onClick={closeMenu}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#hero"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition-all hover:bg-accent-hover active:scale-[0.97]"
              onClick={closeMenu}
            >
              Free Scan
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 12L12 4" />
                <path d="M5 4h7v7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
