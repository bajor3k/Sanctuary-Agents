"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    angle: number; // Current angle for autonomous drift
    speed: number; // Autonomous speed
    spinSpeed: number; // Speed of swirl
}

export default function InteractiveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0, active: false });
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            const particles: Particle[] = [];
            const count = 150; // Fixed count for the ring effect

            const colors = [
                "rgba(255, 255, 255, 0.4)", // White
                "rgba(200, 240, 255, 0.3)", // Faint Cyan
                "rgba(220, 220, 255, 0.25)", // Faint Blue
                "rgba(255, 255, 255, 0.2)", // Translucent White
            ];

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            for (let i = 0; i < count; i++) {
                // Spawn in a ring around the center
                const spawnAngle = Math.random() * Math.PI * 2;
                const minRadius = 220; // Just outside the login box roughly
                const maxRadius = 450;
                const radius = minRadius + Math.random() * (maxRadius - minRadius);

                const x = centerX + Math.cos(spawnAngle) * radius;
                const y = centerY + Math.sin(spawnAngle) * radius;

                particles.push({
                    x,
                    y,
                    baseX: x,
                    baseY: y,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 1.5 + 0.5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    angle: spawnAngle,
                    speed: Math.random() * 0.5 + 0.1,
                    spinSpeed: (Math.random() - 0.5) * 0.02,
                });
            }
            particlesRef.current = particles;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
        };

        const handleMouseLeave = () => {
            mouseRef.current.active = false;
        };

        const animate = () => {
            // Clear the canvas fully each frame to remove trails
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const isActive = mouseRef.current.active;
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            particlesRef.current.forEach((p) => {
                // --- Central Vortex Logic ---
                // Calculate distance from center
                const dxCenter = p.x - cx;
                const dyCenter = p.y - cy;
                const distCenterSq = dxCenter * dxCenter + dyCenter * dyCenter;
                const distCenter = Math.sqrt(distCenterSq);

                // Tangential force for rotation (swirl)
                const swirlStrength = 0.012;
                const swirlX = -dyCenter / distCenter; // Perpendicular vector x
                const swirlY = dxCenter / distCenter; // Perpendicular vector y

                p.vx += swirlX * swirlStrength;
                p.vy += swirlY * swirlStrength;

                // Central Gravity (keep them in bounds)
                const minR = 200;
                const maxR = 500;
                const pullStrength = 0.0005;

                if (distCenter > maxR) {
                    // Pull back strongly if too far out
                    p.vx -= (dxCenter / distCenter) * pullStrength * 5;
                    p.vy -= (dyCenter / distCenter) * pullStrength * 5;
                } else if (distCenter < minR) {
                    // Push out if too close to center (keep the hole for login box)
                    p.vx += (dxCenter / distCenter) * pullStrength * 2;
                    p.vy += (dyCenter / distCenter) * pullStrength * 2;
                }

                // --- Mouse Interaction ---
                if (isActive) {
                    const dx = mx - p.x;
                    const dy = my - p.y;
                    const distSq = dx * dx + dy * dy;
                    const dist = Math.sqrt(distSq);
                    const maxDist = 250;

                    if (dist < maxDist) {
                        const force = (maxDist - dist) / maxDist;
                        const pullStrength = force * 0.05;

                        // Pull towards mouse slightly
                        p.vx += (dx / dist) * pullStrength;
                        p.vy += (dy / dist) * pullStrength;

                        // Extra swirl from mouse
                        const mSwirlX = -dy / dist;
                        const mSwirlY = dx / dist;
                        p.vx += mSwirlX * force * 0.15;
                        p.vy += mSwirlY * force * 0.15;
                    }
                }

                // --- Apply Physics ---
                p.x += p.vx;
                p.y += p.vy;

                // Friction/Damping
                p.vx *= 0.96; // Slightly more drag to keep control
                p.vy *= 0.96;

                // --- Draw with 3D Gradient Effect ---
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

                // Create radial gradient for 3D effect
                // Offset the highlight based on particle velocity for dynamic reflection
                const highlightOffsetX = p.vx * 2;
                const highlightOffsetY = p.vy * 2;

                const gradient = ctx.createRadialGradient(
                    p.x + highlightOffsetX,
                    p.y + highlightOffsetY,
                    p.radius * 0.2, // Small bright center
                    p.x,
                    p.y,
                    p.radius // Extends to edge
                );

                // Parse the base color to create lighter/darker versions
                const baseColor = p.color;
                const colorMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);

                if (colorMatch) {
                    const r = parseInt(colorMatch[1]);
                    const g = parseInt(colorMatch[2]);
                    const b = parseInt(colorMatch[3]);
                    const a = parseFloat(colorMatch[4]);

                    // Brighter highlight on one side
                    const highlightR = Math.min(255, r + 60);
                    const highlightG = Math.min(255, g + 60);
                    const highlightB = Math.min(255, b + 60);

                    // Slightly darker on the opposite side
                    const shadowR = Math.max(0, r - 30);
                    const shadowG = Math.max(0, g - 30);
                    const shadowB = Math.max(0, b - 30);

                    gradient.addColorStop(0, `rgba(${highlightR}, ${highlightG}, ${highlightB}, ${a})`);
                    gradient.addColorStop(0.5, baseColor);
                    gradient.addColorStop(1, `rgba(${shadowR}, ${shadowG}, ${shadowB}, ${a * 0.6})`);
                } else {
                    // Fallback if color parsing fails
                    gradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");
                    gradient.addColorStop(1, baseColor);
                }

                ctx.fillStyle = gradient;
                ctx.fill();
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);
        animate();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[1] bg-transparent"
        />
    );
}
