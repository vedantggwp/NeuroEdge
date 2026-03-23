"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function GsapAnimations() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      document.querySelectorAll(".reveal").forEach((el) => {
        gsap.set(el, { opacity: 1, y: 0, filter: "blur(0px)" });
      });
      return;
    }

    // Set initial state for all reveal elements
    gsap.set(".reveal", {
      opacity: 0,
      y: 64,
      filter: "blur(12px)",
    });

    // Hero elements: stagger on load (no scroll trigger needed)
    const heroReveals = document.querySelectorAll("#hero .reveal");
    gsap.to(heroReveals, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1,
      ease: "power3.out",
      stagger: 0.12,
      delay: 0.3,
    });

    // Collect grid card elements to exclude from generic handler
    const statGridCards = document.querySelectorAll("#stats .grid > .reveal");
    const howGridCards = document.querySelectorAll("#how .grid > .reveal");
    const gridCardSet = new Set([...statGridCards, ...howGridCards]);

    // Non-hero, non-grid reveal elements: individual scroll triggers
    const otherReveals = document.querySelectorAll(
      "section:not(#hero) .reveal",
    );
    otherReveals.forEach((el) => {
      if (gridCardSet.has(el)) return; // handled by staggered cascades below
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power3.out",
      });
    });

    // Stats grid: staggered cascade (ALL cards including first)
    if (statGridCards.length > 0) {
      ScrollTrigger.create({
        trigger: "#stats .grid",
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(statGridCards, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.15,
          });
        },
      });
    }

    // Steps grid: staggered cascade
    if (howGridCards.length > 0) {
      ScrollTrigger.create({
        trigger: "#how .grid",
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(howGridCards, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.15,
          });
        },
      });
    }

    // Navbar fade-in from top
    gsap.from("nav[role='navigation']", {
      opacity: 0,
      y: -20,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.1,
    });

    // Magnetic hover on buttons
    const magneticButtons = document.querySelectorAll(".magnetic-btn");
    const cleanupFns: Array<() => void> = [];

    magneticButtons.forEach((btn) => {
      const el = btn as HTMLElement;

      const onMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
          x: x * 0.15,
          y: y * 0.15,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      const onMouseLeave = () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)",
        });
      };

      el.addEventListener("mousemove", onMouseMove);
      el.addEventListener("mouseleave", onMouseLeave);

      cleanupFns.push(() => {
        el.removeEventListener("mousemove", onMouseMove);
        el.removeEventListener("mouseleave", onMouseLeave);
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return null;
}
