import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

const BackgroundEffect = () => {
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (shouldReduceMotion) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        const init = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            particles = [];
            const isMobile = width < 768;
            const particleCount = Math.min(
                Math.floor(width * height / (isMobile ? 30000 : 15000)),
                isMobile ? 40 : 100
            );

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.2, // Very slow movement
                    vy: (Math.random() - 0.5) * 0.2,
                    size: Math.random() * 2 + 1,
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(124, 58, 237, 0.1)'; // Violet tint, very subtle
            ctx.strokeStyle = 'rgba(124, 58, 237, 0.05)';

            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Connect nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j];
                    let dx = p.x - p2.x;
                    let dy = p.y - p2.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - distance / 150)})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
            animFrameRef.current = requestAnimationFrame(draw);
        };

        init();
        animFrameRef.current = requestAnimationFrame(draw);
        window.addEventListener('resize', init);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            window.removeEventListener('resize', init);
        };
    }, [shouldReduceMotion]);

    if (shouldReduceMotion) {
        return <div className="fixed inset-0 bg-slate-950 -z-50" />;
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/70 -z-[60]" />
            <canvas
                ref={canvasRef}
                className="fixed inset-0 pointer-events-none -z-50"
                style={{ background: 'transparent' }}
            />
        </>
    );
};

export default BackgroundEffect;
