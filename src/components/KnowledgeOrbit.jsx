import { useEffect, useRef } from "react";

const LINE_COUNT = 34;
const HEX_RADIUS = 46;
const LINE_LENGTH = 18;
const POINTER_IDLE_MS = 180;

const randomBetween = (min, max) => min + Math.random() * (max - min);

function createLines(width, height) {
  return Array.from({ length: LINE_COUNT }, (_, index) => ({
    id: index,
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    vx: randomBetween(-0.18, 0.18),
    vy: randomBetween(-0.18, 0.18),
    angle: randomBetween(0, Math.PI),
    spin: randomBetween(-0.006, 0.006),
    size: randomBetween(9, 18),
    alpha: randomBetween(0.12, 0.3),
    attach: index % 6,
    offset: randomBetween(-0.34, 0.34),
  }));
}

function hexTarget(pointer, line) {
  const side = line.attach;
  const startAngle = -Math.PI / 2 + side * (Math.PI / 3);
  const endAngle = startAngle + Math.PI / 3;
  const start = {
    x: pointer.x + Math.cos(startAngle) * HEX_RADIUS,
    y: pointer.y + Math.sin(startAngle) * HEX_RADIUS,
  };
  const end = {
    x: pointer.x + Math.cos(endAngle) * HEX_RADIUS,
    y: pointer.y + Math.sin(endAngle) * HEX_RADIUS,
  };
  const t = 0.5 + line.offset;

  return {
    x: start.x + (end.x - start.x) * t,
    y: start.y + (end.y - start.y) * t,
    angle: Math.atan2(end.y - start.y, end.x - start.x),
  };
}

export default function KnowledgeOrbit() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    if (!canvas || !context || reduceMotion.matches || coarsePointer.matches) {
      return undefined;
    }

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let lines = [];
    let lastTime = performance.now();
    const pointer = {
      x: window.innerWidth * 0.68,
      y: window.innerHeight * 0.28,
      px: window.innerWidth * 0.68,
      py: window.innerHeight * 0.28,
      speed: 0,
      active: false,
      lastMove: 0,
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      lines = createLines(width, height);
    };

    const movePointer = (event) => {
      pointer.px = pointer.x;
      pointer.py = pointer.y;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.speed = Math.hypot(pointer.x - pointer.px, pointer.y - pointer.py);
      pointer.active = true;
      pointer.lastMove = performance.now();
    };

    const wrap = (line) => {
      const margin = 80;
      if (line.x < -margin) line.x = width + margin;
      if (line.x > width + margin) line.x = -margin;
      if (line.y < -margin) line.y = height + margin;
      if (line.y > height + margin) line.y = -margin;
    };

    const drawLine = (line) => {
      const half = line.size / 2;
      const dx = Math.cos(line.angle) * half;
      const dy = Math.sin(line.angle) * half;
      context.beginPath();
      context.moveTo(line.x - dx, line.y - dy);
      context.lineTo(line.x + dx, line.y + dy);
      context.strokeStyle = `rgba(49, 108, 67, ${line.alpha})`;
      context.lineWidth = 1;
      context.lineCap = "round";
      context.stroke();
    };

    const tick = (now) => {
      const delta = Math.min((now - lastTime) / 16.67, 2);
      const idle = pointer.active && now - pointer.lastMove > POINTER_IDLE_MS;
      const fast = pointer.speed > 13;
      lastTime = now;

      context.clearRect(0, 0, width, height);

      lines.forEach((line, index) => {
        line.vx += Math.sin(now * 0.00018 + index) * 0.002;
        line.vy += Math.cos(now * 0.00016 + index * 1.7) * 0.002;

        if (pointer.active) {
          const distance = Math.hypot(line.x - pointer.x, line.y - pointer.y);
          const influence = Math.max(0, 1 - distance / 360);

          if (fast && distance < 260) {
            const away = Math.atan2(line.y - pointer.y, line.x - pointer.x);
            line.vx += Math.cos(away) * influence * (0.34 + pointer.speed * 0.018);
            line.vy += Math.sin(away) * influence * (0.34 + pointer.speed * 0.018);
            line.spin += randomBetween(-0.012, 0.012);
          } else if (idle && distance < 420) {
            const target = hexTarget(pointer, line);
            line.vx += (target.x - line.x) * 0.012;
            line.vy += (target.y - line.y) * 0.012;
            line.angle += (target.angle - line.angle) * 0.1;
            line.size += (LINE_LENGTH - line.size) * 0.04;
            line.alpha += (0.32 - line.alpha) * 0.04;
          }
        }

        line.vx *= 0.93;
        line.vy *= 0.93;
        line.x += line.vx * delta;
        line.y += line.vy * delta;
        line.angle += line.spin * delta;
        line.alpha += (0.2 - line.alpha) * 0.006;
        line.size += (13 - line.size) * 0.006;
        wrap(line);
        drawLine(line);
      });

      pointer.speed *= 0.88;
      frame = window.requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", movePointer, { passive: true });
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", movePointer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="knowledge-orbit"
      aria-hidden="true"
    />
  );
}
