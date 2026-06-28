import { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let rx = 0, ry = 0, dx = 0, dy = 0;
    let raf = 0;

    const move = (e: MouseEvent) => {
      dx = e.clientX;
      dy = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }
      const t = e.target as HTMLElement;
      const interactive = t.closest('button, a, input, textarea, [role="button"], .cursor-pointer');
      setHovering(!!interactive);
    };

    const loop = () => {
      rx += (dx - rx) * 0.18;
      ry += (dy - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', move);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] -ml-1 -mt-1 h-2 w-2 rounded-full bg-accent"
        style={{ mixBlendMode: 'difference' }}
      />
      <div
        ref={ringRef}
        className={`pointer-events-none fixed top-0 left-0 z-[9998] rounded-full border border-accent transition-[width,height,opacity] duration-300 ${
          hovering ? '-ml-6 -mt-6 h-12 w-12 opacity-100' : '-ml-4 -mt-4 h-8 w-8 opacity-60'
        }`}
      />
    </>
  );
};

export default CustomCursor;
