'use client';

import { useEffect, useRef } from 'react';

export function BlueprintCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const mouse = { x: -1000, y: -1000, active: false };

    // Set up particles representing blueprint grid nodes
    const gridSpacing = 50;
    const cols = Math.ceil(width / gridSpacing) + 1;
    const rows = Math.ceil(height / gridSpacing) + 1;
    
    // Abstract geometric elements drifting slowly
    const shapes = [
      { x: width * 0.2, y: height * 0.4, r: 60, speedX: 0.1, speedY: -0.05, type: 'circle' },
      { x: width * 0.8, y: height * 0.3, r: 100, speedX: -0.08, speedY: 0.07, type: 'square' },
      { x: width * 0.5, y: height * 0.7, r: 80, speedX: 0.05, speedY: -0.09, type: 'quill-concept' }
    ];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const drawGrid = (t: number) => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing mouse radial aura
      if (mouse.active) {
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          300
        );
        gradient.addColorStop(0, 'rgba(238, 235, 228, 0.4)');
        gradient.addColorStop(1, 'rgba(250, 248, 245, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Render drifting abstract blueprint shapes
      ctx.strokeStyle = 'rgba(34, 37, 42, 0.04)';
      ctx.lineWidth = 1;
      shapes.forEach((shape) => {
        // Move shape
        shape.x += shape.speedX;
        shape.y += shape.speedY;

        // Wrap boundaries
        if (shape.x < -shape.r) shape.x = width + shape.r;
        if (shape.x > width + shape.r) shape.x = -shape.r;
        if (shape.y < -shape.r) shape.y = height + shape.r;
        if (shape.y > height + shape.r) shape.y = -shape.r;

        ctx.beginPath();
        if (shape.type === 'circle') {
          ctx.arc(shape.x, shape.y, shape.r, 0, Math.PI * 2);
          ctx.stroke();
          // Draw coordinates text for a technical design feel
          ctx.fillStyle = 'rgba(34, 37, 42, 0.15)';
          ctx.font = '8px monospace';
          ctx.fillText(`R: ${shape.r.toFixed(0)}`, shape.x + shape.r + 5, shape.y);
        } else if (shape.type === 'square') {
          ctx.rect(shape.x - shape.r/2, shape.y - shape.r/2, shape.r, shape.r);
          ctx.stroke();
          // Draw cross diagonal lines
          ctx.beginPath();
          ctx.moveTo(shape.x - shape.r/2, shape.y - shape.r/2);
          ctx.lineTo(shape.x + shape.r/2, shape.y + shape.r/2);
          ctx.stroke();
        } else {
          // Draw neat design grid triangles
          ctx.moveTo(shape.x, shape.y - shape.r/2);
          ctx.lineTo(shape.x + shape.r/2, shape.y + shape.r/2);
          ctx.lineTo(shape.x - shape.r/2, shape.y + shape.r/2);
          ctx.closePath();
          ctx.stroke();
        }
      });

      // 3. Render technical layout grid lines and intersections
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(34, 37, 42, 0.02)';
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(34, 37, 42, 0.02)';
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 4. Render intersection dots with mouse coordinate distortion
      for (let x = 0; x < width + gridSpacing; x += gridSpacing) {
        for (let y = 0; y < height + gridSpacing; y += gridSpacing) {
          let drawX = x;
          let drawY = y;

          // Compute distance to mouse
          if (mouse.active) {
            const dx = mouse.x - x;
            const dy = mouse.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Bending coordinate lines slightly towards mouse (magnetic layout grid)
            if (dist < 200) {
              const force = (200 - dist) / 200;
              const angle = Math.atan2(dy, dx);
              drawX += Math.cos(angle) * force * 15;
              drawY += Math.sin(angle) * force * 15;

              // Connect to mouse for design blueprint vector lines
              if (dist < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(34, 37, 42, ${0.05 * (1 - dist / 120)})`;
                ctx.moveTo(drawX, drawY);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
              }
            }
          }

          // Draw the intersection node
          ctx.beginPath();
          ctx.arc(drawX, drawY, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(34, 37, 42, 0.06)';
          ctx.fill();
        }
      }
    };

    const animate = (timestamp: number) => {
      drawGrid(timestamp);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}
