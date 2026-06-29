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

    const state = {
      mouseX: -1000,
      mouseY: -1000,
      active: false,
      scrollY: 0,
      targetScrollY: 0,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      state.mouseX = e.clientX - rect.left;
      state.mouseY = e.clientY - rect.top;
      state.active = true;
    };

    const handleMouseLeave = () => {
      state.mouseX = -1000;
      state.mouseY = -1000;
      state.active = false;
    };

    const handleScroll = () => {
      state.targetScrollY = window.scrollY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // 3D Sphere generation properties
    const numLatitudes = 14;
    const numLongitudes = 24;
    
    // Generate static 3D grid points on a unit sphere
    const spherePoints: Array<{ x: number; y: number; z: number; lat: number; lon: number }> = [];
    for (let i = 0; i <= numLatitudes; i++) {
      const lat = (i * Math.PI) / numLatitudes - Math.PI / 2;
      for (let j = 0; j < numLongitudes; j++) {
        const lon = (j * 2 * Math.PI) / numLongitudes;
        const x = Math.cos(lat) * Math.sin(lon);
        const y = Math.sin(lat);
        const z = Math.cos(lat) * Math.cos(lon);
        spherePoints.push({ x, y, z, lat, lon });
      }
    }

    const animate = (timestamp: number) => {
      // Smooth interpolation for scroll speed / parallax
      state.scrollY += (state.targetScrollY - state.scrollY) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      
      // Dynamic camera depth and sphere radius reacting to scroll position
      const scrollFactor = state.scrollY * 0.0015;
      const cameraDistance = 3.5 - Math.min(scrollFactor * 0.5, 1.2); 
      const sphereRadius = Math.min(width, height) * 0.22 * (1 + scrollFactor * 0.25);
      
      // Rotation angles driven by time + mouse hover + scroll
      const time = timestamp * 0.0006;
      let rotX = time * 0.15 + state.scrollY * 0.002;
      let rotY = time * 0.25 + state.scrollY * 0.003;
      
      if (state.active) {
        const dx = (state.mouseX - centerX) / width;
        const dy = (state.mouseY - centerY) / height;
        rotX += dy * 0.8;
        rotY += dx * 0.8;
      }

      // Draw subtle warm glowing background aura that follows the mouse
      if (state.active) {
        const gradient = ctx.createRadialGradient(
          state.mouseX,
          state.mouseY,
          5,
          state.mouseX,
          state.mouseY,
          350
        );
        gradient.addColorStop(0, 'rgba(238, 235, 228, 0.45)');
        gradient.addColorStop(0.5, 'rgba(238, 235, 228, 0.15)');
        gradient.addColorStop(1, 'rgba(250, 248, 245, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw light structural technical background blueprint grids
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(34, 37, 42, 0.015)';
      ctx.lineWidth = 1;
      const gridSpacing = 60;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Render 3D Sphere Points
      const projected: Array<{ x: number; y: number; z: number; isVisible: boolean }> = [];
      const sinX = Math.sin(rotX);
      const cosX = Math.cos(rotX);
      const sinY = Math.sin(rotY);
      const cosY = Math.cos(rotY);

      spherePoints.forEach((p) => {
        // Apply wave deformation to create a morphing/breathing mesh (like modern WebGL)
        const wave = Math.sin(p.lat * 5 + p.lon * 3 + time * 4) * 0.08 * (1 + Math.sin(time) * 0.2);
        const r = sphereRadius * (1.0 + wave);

        let px = p.x * r;
        let py = p.y * r;
        let pz = p.z * r;

        // Rotation around X axis
        const y1 = py * cosX - pz * sinX;
        const z1 = py * sinX + pz * cosX;
        py = y1;
        pz = z1;

        // Rotation around Y axis
        const x2 = px * cosY + pz * sinY;
        const z2 = -px * sinY + pz * cosY;
        px = x2;
        pz = z2;

        // Perspective projection calculation
        // Perspective formula: ScreenX = X * (focusDistance / (focusDistance + Z))
        const dist = cameraDistance * sphereRadius;
        const scale = dist / (dist + pz);
        const screenX = centerX + px * scale;
        const screenY = centerY + py * scale;

        projected.push({
          x: screenX,
          y: screenY,
          z: pz,
          // Hide backface nodes to keep wireframe mesh clean
          isVisible: pz < sphereRadius * 0.5
        });
      });

      // Draw Latitude Lines connecting the 3D projected vertices
      ctx.lineWidth = 0.8;
      for (let i = 0; i <= numLatitudes; i++) {
        ctx.beginPath();
        const startIdx = i * numLongitudes;
        for (let j = 0; j <= numLongitudes; j++) {
          const idx = startIdx + (j % numLongitudes);
          const pt = projected[idx];
          if (!pt) continue;

          // Fade out lines on the backface
          const opacity = Math.max(0, 0.09 * (1 - pt.z / (sphereRadius * 1.5)));
          ctx.strokeStyle = `rgba(34, 37, 42, ${opacity})`;

          if (j === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      }

      // Draw Longitude Lines connecting the 3D projected vertices
      for (let j = 0; j < numLongitudes; j++) {
        ctx.beginPath();
        for (let i = 0; i <= numLatitudes; i++) {
          const idx = i * numLongitudes + j;
          const pt = projected[idx];
          if (!pt) continue;

          const opacity = Math.max(0, 0.09 * (1 - pt.z / (sphereRadius * 1.5)));
          ctx.strokeStyle = `rgba(34, 37, 42, ${opacity})`;

          if (i === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      }

      // Draw floating node particles
      projected.forEach((pt) => {
        if (pt.isVisible) {
          const size = Math.max(0.5, 1.8 * (1 - pt.z / (sphereRadius * 1.5)));
          const opacity = Math.max(0, 0.25 * (1 - pt.z / (sphereRadius * 1.5)));

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34, 37, 42, ${opacity})`;
          ctx.fill();

          // Connect nodes to mouse coordinates dynamically (magnetic interaction grid)
          if (state.active) {
            const dx = state.mouseX - pt.x;
            const dy = state.mouseY - pt.y;
            const mouseDist = Math.sqrt(dx * dx + dy * dy);

            if (mouseDist < 120) {
              const lineOpacity = (1 - mouseDist / 120) * 0.08 * (1 - pt.z / (sphereRadius * 1.5));
              ctx.beginPath();
              ctx.strokeStyle = `rgba(34, 37, 42, ${lineOpacity})`;
              ctx.moveTo(pt.x, pt.y);
              ctx.lineTo(state.mouseX, state.mouseY);
              ctx.stroke();
            }
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
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
