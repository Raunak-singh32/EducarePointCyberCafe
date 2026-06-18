// useScrollEffects.js
// Zero-dependency hooks that pair with the new classes in App.css:
//   .reveal / .reveal.visible      -> useReveal
//   .parallax-card (--parallax-y)  -> useParallax
//   .scroll-tint-overlay           -> useScrollTint
//   .navbar.scrolled               -> useStickyNav
//   .tilt-3d                       -> useTilt3D
//
// All four are plain React hooks built on IntersectionObserver / scroll
// listeners — no extra npm packages required. If you'd rather not maintain
// the reveal logic yourself, the lightweight "react-intersection-observer"
// package (~2KB) is a drop-in alternative for useReveal only.

import { useEffect, useRef, useState } from 'react';

/**
 * Fades/slides an element in once it scrolls into view.
 * Usage:
 *   const { ref, className } = useReveal();
 *   <div ref={ref} className={className}>...</div>
 */
export function useReveal(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect(); // animate once, then stop watching
      }
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, className: `reveal${visible ? ' visible' : ''}` };
}

/**
 * Applies a subtle scroll-linked vertical offset to an element via the
 * --parallax-y CSS variable consumed by .parallax-card in App.css.
 * `strength` controls how far the element drifts (px per 100px scrolled).
 */
export function useParallax(strength = 8) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = null;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const distanceFromCenter = rect.top + rect.height / 2 - viewportCenter;
      const offset = (distanceFromCenter / 100) * strength * -1;
      el.style.setProperty('--parallax-y', `${offset}px`);
      frame = null;
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength]);

  return ref;
}

/**
 * Sets a --scroll-progress CSS variable on <html> (0 to `max`) as the user
 * scrolls down the page. Render <div className="scroll-tint-overlay" /> once,
 * near the root of your app, to see the effect.
 */
export function useScrollTint(max = 0.3) {
  useEffect(() => {
    let frame = null;

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      document.documentElement.style.setProperty(
        '--scroll-progress',
        String(Math.min(progress * max, max))
      );
      frame = null;
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [max]);
}

/**
 * Returns `true` once the page has scrolled past `threshold` px — toggle
 * the .scrolled class on your <nav className="navbar"> with it.
 */
export function useStickyNav(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}

/**
 * Mouse-tilt 3D effect for cards. Attach the returned ref to any card
 * that also has the .tilt-3d class in App.css. As the cursor moves over
 * the element, it rotates toward the cursor and lifts slightly in Z —
 * resets smoothly via CSS transition when the mouse leaves.
 *
 * Usage:
 *   const tiltRef = useTilt3D();
 *   <div ref={tiltRef} className="product-card tilt-3d">...</div>
 */
export function useTilt3D({ max = 12, scale = 1.04, perspective = 1000, liftZ = 30 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 2 * max;
      const rotateX = ((y / rect.height) - 0.5) * -2 * max;
      el.style.transform =
        `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${liftZ}px) scale(${scale})`;
    };

    const handleLeave = () => {
      el.style.transform = '';
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [max, scale, perspective, liftZ]);

  return ref;
}