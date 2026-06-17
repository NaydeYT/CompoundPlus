/* Compound+ — hooks et composants d'animation partagés */
import { useEffect, useRef, useState } from "react";

export function useTitle(title) {
  useEffect(() => { document.title = title; }, [title]);
}

/* Révélation au scroll des éléments .reveal (avec délais en cascade via --reveal-delay) */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* Interpolation animée d'un nombre (ease-out cubic), repart de la valeur courante à chaque changement */
export function useTweenedNumber(target, duration = 450) {
  const [display, setDisplay] = useState(0);
  const state = useRef({ value: 0, raf: 0 });

  useEffect(() => {
    const s = state.current;
    cancelAnimationFrame(s.raf);
    const from = s.value;
    const start = performance.now();
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      s.value = t < 1 ? from + (target - from) * eased : target;
      setDisplay(s.value);
      if (t < 1) s.raf = requestAnimationFrame(frame);
    };
    s.raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(s.raf);
  }, [target, duration]);

  return display;
}

/* Nombre animé en continu (suit les changements de valeur) */
export function TweenNumber({ value, format = String, duration = 450 }) {
  const display = useTweenedNumber(value, duration);
  return <>{format(display)}</>;
}

/* Compteur déclenché à l'apparition de l'élément dans le viewport */
export function CountUp({ value, format = String, duration = 1200, ...rest }) {
  const ref = useRef(null);
  const [target, setTarget] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setTarget(value);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [value]);

  const display = useTweenedNumber(target, duration);
  return <span ref={ref} {...rest}>{format(display)}</span>;
}

/* <output> qui rejoue l'animation .pop à chaque changement de contenu */
export function PopValue({ className = "", children }) {
  const ref = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = ref.current;
    el.classList.remove("pop");
    void el.offsetWidth; /* relance l'animation */
    el.classList.add("pop");
  }, [children]);

  return <output ref={ref} className={className}>{children}</output>;
}

/* Déclenche un état "vu" quand l'élément référencé entre dans le viewport */
export function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      });
    }, { threshold });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, inView];
}
