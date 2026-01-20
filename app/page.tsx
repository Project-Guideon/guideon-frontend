'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Home() {
  const [isFlipped, setIsFlipped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<(HTMLDivElement | null)[]>([]);
  const lastEnterTimeRef = useRef<{ [key: number]: number }>({});

  const ROWS = 6;
  const COLS = 6;
  const tilesCount = ROWS * COLS;
  const COOLDOWN = 800;

  useEffect(() => {
    const updateBackgroundPositions = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();

      tilesRef.current.forEach((tile) => {
        if (!tile) return;
        const tileRect = tile.getBoundingClientRect();
        const offsetX = containerRect.left - tileRect.left;
        const offsetY = containerRect.top - tileRect.top;
        tile.style.setProperty('--bg-x', `${offsetX}px`);
        tile.style.setProperty('--bg-y', `${offsetY}px`);
      });
    };

    const timer = setTimeout(updateBackgroundPositions, 50);
    window.addEventListener('resize', updateBackgroundPositions);
    return () => {
      window.removeEventListener('resize', updateBackgroundPositions);
      clearTimeout(timer);
    };
  }, []);

  const handleGlobalClick = () => {
    const nextState = !isFlipped;
    setIsFlipped(nextState);
    gsap.to(tilesRef.current, {
      rotateX: nextState ? 180 : 0,
      duration: 1.2,
      stagger: { amount: 0.5, grid: [ROWS, COLS], from: "random" },
      ease: "power2.inOut",
    });
  };

  const handleMouseEnter = (index: number) => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const lastEnter = lastEnterTimeRef.current[index] || 0;
    if (now - lastEnter < COOLDOWN) return;
    lastEnterTimeRef.current[index] = now;

    const tile = tilesRef.current[index];
    if (!tile) return;

    let tiltY = 0;
    const modIndex = index % 6;
    if (modIndex === 0) tiltY = -40;
    else if (modIndex === 5) tiltY = 40;
    else if (modIndex === 1) tiltY = -20;
    else if (modIndex === 4) tiltY = 20;
    else if (modIndex === 2) tiltY = -10;
    else tiltY = 10;

    const baseRot = isFlipped ? 180 : 0;
    const tl = gsap.timeline();

    tl.set(tile, { rotateX: baseRot, rotateY: 0 })
      .to(tile, { rotateX: baseRot + 270, rotateY: tiltY, duration: 0.5, ease: "power2.out" })
      .to(tile, { rotateX: baseRot + 360, rotateY: 0, duration: 0.5, ease: "power2.out" }, "-=0.25");
  };

  return (
    <main
      className="w-full h-screen overflow-hidden relative cursor-pointer"
      onClick={handleGlobalClick}
    >
      <div ref={containerRef} className="board-container">
        {Array.from({ length: tilesCount }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { tilesRef.current[i] = el; }}
            className="tile"
            onMouseEnter={() => handleMouseEnter(i)}
          >
            <div className="tile-face tile-front"></div>
            <div className="tile-face tile-back"></div>
          </div>
        ))}
      </div>

      <div className="footer-message">
        <div className="footer-text">
          <span className="status-dot"></span>
          <span>We are crafting an extraordinary experience</span>
        </div>
      </div>
    </main>
  );
}