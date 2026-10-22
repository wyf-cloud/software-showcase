"use client";

import { useEffect, useRef } from "react";

type Dot = { x: number; y: number; vx: number; vy: number; radius: number; alpha: number };

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    let visible = true;
    let frame = 0;
    let width = 0;
    let height = 0;
    let dots: Dot[] = [];
    const pointer = { x: -1000, y: -1000 };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.7);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(58, Math.max(22, Math.round(width / 18)));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        radius: Math.random() * 1.6 + 0.7,
        alpha: Math.random() * 0.35 + 0.16,
      }));
    };

    const draw = () => {
      frame = requestAnimationFrame(draw);
      if (document.hidden || !visible) return;
      context.clearRect(0, 0, width, height);
      dots.forEach((dot, index) => {
        if (!reduced) {
          dot.x += dot.vx;
          dot.y += dot.vy;
          if (dot.x < 0 || dot.x > width) dot.vx *= -1;
          if (dot.y < 0 || dot.y > height) dot.vy *= -1;
          const dx = dot.x - pointer.x;
          const dy = dot.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 110 && distance > 0) {
            dot.x += (dx / distance) * 0.16;
            dot.y += (dy / distance) * 0.16;
          }
        }
        context.beginPath();
        context.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(63, 131, 105, ${dot.alpha})`;
        context.fill();
        for (let other = index + 1; other < dots.length; other += 1) {
          const next = dots[other];
          const distance = Math.hypot(dot.x - next.x, dot.y - next.y);
          if (distance < 92) {
            context.beginPath();
            context.moveTo(dot.x, dot.y);
            context.lineTo(next.x, next.y);
            context.strokeStyle = `rgba(73, 137, 112, ${(1 - distance / 92) * 0.12})`;
            context.lineWidth = 0.7;
            context.stroke();
          }
        }
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
    };
    const onPointerLeave = () => { pointer.x = -1000; pointer.y = -1000; };
    const onVisibility = () => { if (!document.hidden && visible) draw(); };

    resize();
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}
