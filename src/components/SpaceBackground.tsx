import { useEffect, useRef, useCallback } from 'react';

interface Planet {
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  orbitSpeed: number;
  orbitRadius: number;
  angle: number;
  type: 'sun' | 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'moon';
  isSquishing: boolean;
  squishStartTime: number;
  squishX: number;
  squishY: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  color: string;
  depth: number;
}

const SpaceBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planetsRef = useRef<Planet[]>([]);
  const starsRef = useRef<Star[]>([]);
  const waveRef = useRef<{ active: boolean; progress: number; origin: { x: number; y: number } }>({
    active: false,
    progress: 0,
    origin: { x: 0, y: 0 }
  });

  const createPlanets = useCallback((width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    const planetConfigs = [
      { type: 'sun', size: 80, color: '#FDB813', glowColor: 'rgba(253, 184, 19, 0.8)', orbitSpeed: 0, orbitRadius: 0 },
      { type: 'mercury', size: 20, color: '#A5A5A5', glowColor: 'rgba(165, 165, 165, 0.4)', orbitSpeed: 0.008, orbitRadius: 150 },
      { type: 'venus', size: 35, color: '#E6C87A', glowColor: 'rgba(230, 200, 122, 0.5)', orbitSpeed: 0.006, orbitRadius: 210 },
      { type: 'earth', size: 38, color: '#6B93D6', glowColor: 'rgba(107, 147, 214, 0.6)', orbitSpeed: 0.005, orbitRadius: 280 },
      { type: 'mars', size: 28, color: '#C1440E', glowColor: 'rgba(193, 68, 14, 0.5)', orbitSpeed: 0.004, orbitRadius: 350 },
      { type: 'jupiter', size: 70, color: '#D8CA9D', glowColor: 'rgba(216, 202, 157, 0.6)', orbitSpeed: 0.002, orbitRadius: 440 },
      { type: 'saturn', size: 60, color: '#F4D59E', glowColor: 'rgba(244, 213, 158, 0.6)', orbitSpeed: 0.0015, orbitRadius: 540 },
      { type: 'uranus', size: 45, color: '#D1F5F8', glowColor: 'rgba(209, 245, 248, 0.5)', orbitSpeed: 0.001, orbitRadius: 640 },
      { type: 'neptune', size: 44, color: '#5B5DDF', glowColor: 'rgba(91, 93, 223, 0.5)', orbitSpeed: 0.0008, orbitRadius: 740 },
      { type: 'moon', size: 15, color: '#F4F4F4', glowColor: 'rgba(244, 244, 244, 0.4)', orbitSpeed: 0.012, orbitRadius: 110 },
    ];

    return planetConfigs.map((config, i) => ({
      x: config.orbitRadius > 0 ? centerX + Math.cos((i * Math.PI * 2) / planetConfigs.length) * config.orbitRadius : centerX,
      y: config.orbitRadius > 0 ? centerY + Math.sin((i * Math.PI * 2) / planetConfigs.length) * config.orbitRadius : centerY,
      size: config.size,
      color: config.color,
      glowColor: config.glowColor,
      orbitSpeed: config.orbitSpeed * (i % 2 === 0 ? 1 : -1),
      orbitRadius: config.orbitRadius,
      angle: (i * Math.PI * 2) / planetConfigs.length,
      type: config.type as any,
      isSquishing: false,
      squishStartTime: 0,
      squishX: 1,
      squishY: 1,
    }));
  }, []);

  const createStars = useCallback((width: number, height: number) => {
    const starColors = ['#FFFFFF', '#FCE7F3', '#FDF2F8', '#F9A8D4', '#F472B6', '#FEF3C7'];
    const stars: Star[] = [];
    
    const starCount = 1000;
    
    for (let i = 0; i < starCount; i++) {
      const depth = Math.random();
      let x = Math.random() * width;
      let y = Math.random() * height;
      
      // Avoid clustering in the top-left corner (0-20% of width/height)
      if (x < width * 0.25 && y < height * 0.25) {
        // Shift or re-roll if in top-left
        x = width * 0.25 + Math.random() * width * 0.75;
        y = height * 0.25 + Math.random() * height * 0.75;
      }
      
      // Higher probability of stars being near the central diagonal band (nebula area)
      const nebulaCenterY = (x * Math.tan(Math.PI / 6)) + (height / 2 - (width / 2 * Math.tan(Math.PI / 6)));
      const distToNebula = Math.abs(y - nebulaCenterY);
      
      if (distToNebula > height * 0.4 && Math.random() > 0.7) {
        y = nebulaCenterY + (Math.random() - 0.5) * height * 0.5;
      }

      stars.push({
        x,
        y,
        size: depth * 1.5 + 0.1,
        brightness: Math.random(),
        twinkleSpeed: Math.random() * 0.015 + 0.005,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        depth: depth,
      });
    }
    return stars;
  }, []);

  const triggerWave = useCallback((x: number, y: number) => {
    waveRef.current = {
      active: true,
      progress: 0,
      origin: { x, y }
    };
  }, []);

  const checkPlanetClick = useCallback((clickX: number, clickY: number) => {
    let clicked = false;
    planetsRef.current.forEach((planet) => {
      if (planet.isSquishing) return;
      
      const dx = clickX - planet.x;
      const dy = clickY - planet.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < planet.size + 20) {
        planet.isSquishing = true;
        planet.squishStartTime = Date.now();
        clicked = true;
      }
    });
    return clicked;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      planetsRef.current = createPlanets(canvas.width, canvas.height);
      starsRef.current = createStars(canvas.width, canvas.height);
    };

    const drawGradientBackground = () => {
      // Deep space base (Dark Magenta/Navy)
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      bgGrad.addColorStop(0, '#2d0a1e'); // Dark Rose
      bgGrad.addColorStop(0.5, '#150510'); // Deep Wine
      bgGrad.addColorStop(1, '#050208'); // Blackish Purple
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bright Pink Milky Way Nebula
      const drawNebula = (x: number, y: number, rw: number, rh: number, angle: number, color: string) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rw);
        grad.addColorStop(0, color);
        grad.addColorStop(0.5, color.replace('0.6', '0.2').replace('0.4', '0.1'));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      // Create the diagonal bright PINK band
      drawNebula(canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.9, canvas.height * 0.35, -Math.PI / 6, 'rgba(219, 39, 119, 0.4)'); // Pink-600
      drawNebula(canvas.width * 0.55, canvas.height * 0.52, canvas.width * 0.6, canvas.height * 0.25, -Math.PI / 6, 'rgba(236, 72, 153, 0.3)'); // Pink-500
      drawNebula(canvas.width * 0.45, canvas.height * 0.48, canvas.width * 0.5, canvas.height * 0.2, -Math.PI / 6, 'rgba(244, 114, 182, 0.2)'); // Pink-400
      drawNebula(canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.4, canvas.height * 0.1, -Math.PI / 6, 'rgba(255, 255, 255, 0.15)'); // White core
      drawNebula(canvas.width * 0.3, canvas.height * 0.2, canvas.width * 0.3, canvas.height * 0.2, 0, 'rgba(124, 58, 237, 0.15)'); // Purple accent
      
      ctx.globalCompositeOperation = 'source-over';
    };

    const drawStars = () => {
      starsRef.current.forEach((star) => {
        // More organic twinkling with varying phases
        const phase1 = Math.sin(time * star.twinkleSpeed * 1.2 + star.x);
        const phase2 = Math.cos(time * star.twinkleSpeed * 0.8 + star.y);
        const twinkle = (phase1 + phase2 + 2) / 4; // 0 to 1
        
        star.brightness = 0.2 + twinkle * 0.8;
        
        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.globalAlpha = star.brightness;
        
        if (star.size > 1.2) {
          const starColor = star.color;
          
          // Outer glowing halo
          const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, star.size * 10);
          halo.addColorStop(0, starColor);
          halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = halo;
          ctx.globalAlpha = star.brightness * 0.2;
          ctx.beginPath();
          ctx.arc(0, 0, star.size * 10, 0, Math.PI * 2);
          ctx.fill();

          // Central Diamond/Shine point
          ctx.globalAlpha = star.brightness;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(0, 0, star.size * 0.6, 0, Math.PI * 2);
          ctx.fill();

          // 4-Point Shine (Diamond style)
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = star.brightness * 0.6;
          
          const flareLen = star.size * (4 + twinkle * 4); // Flare length pulses with twinkle
          ctx.beginPath();
          ctx.moveTo(0, -flareLen); ctx.lineTo(0, flareLen);
          ctx.moveTo(-flareLen, 0); ctx.lineTo(flareLen, 0);
          ctx.stroke();
        } else {
          ctx.fillStyle = star.color;
          ctx.globalAlpha = star.brightness * 0.7;
          ctx.beginPath();
          ctx.arc(0, 0, star.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
    };

    const drawSun = (planet: Planet) => {
      // Animated corona with rays
      const numRays = 12;
      for (let i = 0; i < numRays; i++) {
        const rayAngle = (i / numRays) * Math.PI * 2 + time * 0.00005;
        const rayGrad = ctx.createLinearGradient(
          planet.x + Math.cos(rayAngle) * planet.size,
          planet.y + Math.sin(rayAngle) * planet.size,
          planet.x + Math.cos(rayAngle) * planet.size * 2.5,
          planet.y + Math.sin(rayAngle) * planet.size * 2.5
        );
        rayGrad.addColorStop(0, 'rgba(255, 200, 50, 0.6)');
        rayGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(planet.x, planet.y);
        ctx.lineTo(
          planet.x + Math.cos(rayAngle - 0.15) * planet.size * 2.5,
          planet.y + Math.sin(rayAngle - 0.15) * planet.size * 2.5
        );
        ctx.lineTo(
          planet.x + Math.cos(rayAngle + 0.15) * planet.size * 2.5,
          planet.y + Math.sin(rayAngle + 0.15) * planet.size * 2.5
        );
        ctx.closePath();
        ctx.fill();
      }

      // Sun corona glow
      const coronaGrad = ctx.createRadialGradient(planet.x, planet.y, planet.size * 0.9, planet.x, planet.y, planet.size * 3);
      coronaGrad.addColorStop(0, 'rgba(253, 184, 19, 0.8)');
      coronaGrad.addColorStop(0.4, 'rgba(255, 150, 50, 0.4)');
      coronaGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Sun body
      const sunGrad = ctx.createRadialGradient(
        planet.x - planet.size * 0.3,
        planet.y - planet.size * 0.3,
        0,
        planet.x,
        planet.y,
        planet.size
      );
      sunGrad.addColorStop(0, '#FFFFE0');
      sunGrad.addColorStop(0.3, '#FDB813');
      sunGrad.addColorStop(0.7, '#FF8C00');
      sunGrad.addColorStop(1, '#FF4500');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
      ctx.fill();

      // Animated sun spots
      ctx.fillStyle = 'rgba(200, 100, 0, 0.5)';
      for (let i = 0; i < 6; i++) {
        const spotX = planet.x + Math.cos(i * 1.3 + time * 0.0001) * planet.size * 0.6;
        const spotY = planet.y + Math.sin(i * 1.3 + time * 0.0001) * planet.size * 0.6;
        const spotSize = planet.size * (0.1 + Math.sin(time * 0.001 + i) * 0.05);
        ctx.beginPath();
        ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Solar flares
      ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const flareAngle = (i / 4) * Math.PI * 2 + time * 0.0002;
        ctx.beginPath();
        ctx.moveTo(
          planet.x + Math.cos(flareAngle) * planet.size,
          planet.y + Math.sin(flareAngle) * planet.size
        );
        ctx.lineTo(
          planet.x + Math.cos(flareAngle) * planet.size * 1.5,
          planet.y + Math.sin(flareAngle) * planet.size * 1.5
        );
        ctx.stroke();
      }
    };

    const drawEarth = (planet: Planet) => {
      ctx.save();
      // Clip to planet circle
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
      ctx.clip();

      // Ocean base with gradient
      const oceanGrad = ctx.createRadialGradient(
        planet.x - planet.size * 0.3,
        planet.y - planet.size * 0.3,
        0,
        planet.x,
        planet.y,
        planet.size
      );
      oceanGrad.addColorStop(0, '#4A90C8');
      oceanGrad.addColorStop(0.5, '#1E3A5F');
      oceanGrad.addColorStop(1, '#0D1B2A');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(planet.x - planet.size, planet.y - planet.size, planet.size * 2, planet.size * 2);

      // Continents with irregular shapes
      ctx.fillStyle = '#2D5016';
      ctx.beginPath();
      ctx.moveTo(planet.x - planet.size * 0.6, planet.y - planet.size * 0.3);
      ctx.bezierCurveTo(
        planet.x - planet.size * 0.2, planet.y - planet.size * 0.5,
        planet.x + planet.size * 0.1, planet.y - planet.size * 0.2,
        planet.x - planet.size * 0.1, planet.y + planet.size * 0.3
      );
      ctx.bezierCurveTo(
        planet.x - planet.size * 0.4, planet.y + planet.size * 0.5,
        planet.x - planet.size * 0.7, planet.y + planet.size * 0.2,
        planet.x - planet.size * 0.6, planet.y - planet.size * 0.3
      );
      ctx.fill();

      // Second continent
      ctx.beginPath();
      ctx.moveTo(planet.x + planet.size * 0.2, planet.y - planet.size * 0.4);
      ctx.bezierCurveTo(
        planet.x + planet.size * 0.6, planet.y - planet.size * 0.6,
        planet.x + planet.size * 0.8, planet.y - planet.size * 0.1,
        planet.x + planet.size * 0.5, planet.y + planet.size * 0.4
      );
      ctx.bezierCurveTo(
        planet.x + planet.size * 0.2, planet.y + planet.size * 0.6,
        planet.x + planet.size * 0.1, planet.y,
        planet.x + planet.size * 0.2, planet.y - planet.size * 0.4
      );
      ctx.fill();

      // Clouds (multiple layers)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.ellipse(planet.x - planet.size * 0.2, planet.y - planet.size * 0.5, planet.size * 0.5, planet.size * 0.15, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(planet.x + planet.size * 0.3, planet.y + planet.size * 0.2, planet.size * 0.4, planet.size * 0.12, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(planet.x - planet.size * 0.5, planet.y + planet.size * 0.4, planet.size * 0.3, planet.size * 0.1, 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Polar ice cap
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(planet.x, planet.y - planet.size * 0.85, planet.size * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawJupiter = (planet: Planet) => {
      ctx.save();
      // Clip to planet circle
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
      ctx.clip();

      // Base gradient
      const jupGrad = ctx.createRadialGradient(
        planet.x - planet.size * 0.3,
        planet.y - planet.size * 0.3,
        0,
        planet.x,
        planet.y,
        planet.size
      );
      jupGrad.addColorStop(0, '#F5E6D3');
      jupGrad.addColorStop(0.5, '#D8CA9D');
      jupGrad.addColorStop(1, '#8B7355');
      ctx.fillStyle = jupGrad;
      ctx.fillRect(planet.x - planet.size, planet.y - planet.size, planet.size * 2, planet.size * 2);

      // Atmospheric bands (curved)
      const bandColors = [
        { color: '#C9B896', y: -0.7, height: 0.25 },
        { color: '#A89F91', y: -0.3, height: 0.2 },
        { color: '#E8DCC8', y: 0.1, height: 0.25 },
        { color: '#C4B5A0', y: 0.5, height: 0.2 },
        { color: '#B8A080', y: 0.8, height: 0.15 },
      ];

      bandColors.forEach((band) => {
        ctx.fillStyle = band.color;
        ctx.beginPath();
        ctx.ellipse(planet.x, planet.y + planet.size * band.y, planet.size * 1.2, planet.size * band.height, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Great Red Spot
      const spotGrad = ctx.createRadialGradient(
        planet.x + planet.size * 0.3,
        planet.y + planet.size * 0.2,
        0,
        planet.x + planet.size * 0.3,
        planet.y + planet.size * 0.2,
        planet.size * 0.25
      );
      spotGrad.addColorStop(0, 'rgba(205, 92, 92, 0.8)');
      spotGrad.addColorStop(1, 'rgba(139, 69, 19, 0.4)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.ellipse(planet.x + planet.size * 0.3, planet.y + planet.size * 0.2, planet.size * 0.25, planet.size * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawSaturn = (planet: Planet) => {
      // Rings (draw behind planet)
      ctx.save();
      ctx.strokeStyle = 'rgba(210, 180, 140, 0.8)';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.ellipse(planet.x, planet.y, planet.size * 2.3, planet.size * 0.75, 0.3, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(180, 150, 120, 0.6)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.ellipse(planet.x, planet.y, planet.size * 1.9, planet.size * 0.55, 0.3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(150, 120, 100, 0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(planet.x, planet.y, planet.size * 1.5, planet.size * 0.4, 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Planet body with clipping
      ctx.save();
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
      ctx.clip();

      const saturnGrad = ctx.createRadialGradient(
        planet.x - planet.size * 0.3,
        planet.y - planet.size * 0.3,
        0,
        planet.x,
        planet.y,
        planet.size
      );
      saturnGrad.addColorStop(0, '#F4D59E');
      saturnGrad.addColorStop(0.5, '#D4B584');
      saturnGrad.addColorStop(1, '#A48564');
      ctx.fillStyle = saturnGrad;
      ctx.fillRect(planet.x - planet.size, planet.y - planet.size, planet.size * 2, planet.size * 2);

      // Subtle bands
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = 'rgba(180, 150, 120, 0.5)';
      ctx.beginPath();
      ctx.ellipse(planet.x, planet.y - planet.size * 0.3, planet.size * 1.2, planet.size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(planet.x, planet.y + planet.size * 0.4, planet.size * 1.2, planet.size * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      ctx.restore();
    };

    const drawMars = (planet: Planet) => {
      ctx.save();
      // Clip to planet circle
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
      ctx.clip();

      // Base red with gradient
      const marsGrad = ctx.createRadialGradient(
        planet.x - planet.size * 0.3,
        planet.y - planet.size * 0.3,
        0,
        planet.x,
        planet.y,
        planet.size
      );
      marsGrad.addColorStop(0, '#E07A5F');
      marsGrad.addColorStop(0.5, '#C1440E');
      marsGrad.addColorStop(1, '#8B3127');
      ctx.fillStyle = marsGrad;
      ctx.fillRect(planet.x - planet.size, planet.y - planet.size, planet.size * 2, planet.size * 2);

      // Dark surface regions (irregular shapes)
      ctx.fillStyle = 'rgba(80, 40, 30, 0.5)';
      ctx.beginPath();
      ctx.ellipse(planet.x - planet.size * 0.3, planet.y + planet.size * 0.2, planet.size * 0.35, planet.size * 0.25, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(planet.x + planet.size * 0.4, planet.y - planet.size * 0.1, planet.size * 0.25, planet.size * 0.2, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Valles Marineris (canyon)
      ctx.strokeStyle = 'rgba(60, 30, 20, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(planet.x + planet.size * 0.2, planet.y);
      ctx.quadraticCurveTo(planet.x + planet.size * 0.5, planet.y + planet.size * 0.1, planet.x + planet.size * 0.7, planet.y);
      ctx.stroke();

      // Polar ice caps (both poles)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(planet.x, planet.y - planet.size * 0.85, planet.size * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(planet.x, planet.y + planet.size * 0.85, planet.size * 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawGenericPlanet = (planet: Planet) => {
      ctx.save();
      // Clip to planet circle
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
      ctx.clip();

      const grad = ctx.createRadialGradient(
        planet.x - planet.size * 0.3,
        planet.y - planet.size * 0.3,
        0,
        planet.x,
        planet.y,
        planet.size
      );
      grad.addColorStop(0, '#fff');
      grad.addColorStop(0.3, planet.color);
      grad.addColorStop(1, '#000');
      ctx.fillStyle = grad;
      ctx.fillRect(planet.x - planet.size, planet.y - planet.size, planet.size * 2, planet.size * 2);

      // Add subtle surface details based on planet type
      ctx.globalAlpha = 0.3;
      if (planet.type === 'venus') {
        // Cloudy swirls
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(planet.x, planet.y, planet.size * 0.8, planet.size * 0.3, 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (planet.type === 'uranus' || planet.type === 'neptune') {
        // Atmospheric bands
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.ellipse(planet.x, planet.y + i * planet.size * 0.25, planet.size * 1.2, planet.size * 0.1, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (planet.type === 'mercury' || planet.type === 'moon') {
        // Craters
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        const craterPositions = [
          { x: 0.3, y: -0.2, r: 0.15 },
          { x: -0.4, y: 0.3, r: 0.2 },
          { x: 0.5, y: 0.4, r: 0.12 },
          { x: -0.2, y: -0.5, r: 0.1 },
        ];
        craterPositions.forEach((crater) => {
          ctx.beginPath();
          ctx.arc(planet.x + planet.size * crater.x, planet.y + planet.size * crater.y, planet.size * crater.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.globalAlpha = 1.0;
      ctx.restore();
    };

    const drawPlanets = () => {
      planetsRef.current.forEach((planet) => {
        // Update orbit
        if (planet.orbitRadius > 0) {
          planet.angle += planet.orbitSpeed;
          planet.x = canvas.width / 2 + Math.cos(planet.angle) * planet.orbitRadius;
          planet.y = canvas.height / 2 + Math.sin(planet.angle) * planet.orbitRadius;
        }

        // Handle squish animation
        if (planet.isSquishing) {
          const squishTime = Date.now() - planet.squishStartTime;
          if (squishTime > 600) {
            planet.isSquishing = false;
            planet.squishX = 1;
            planet.squishY = 1;
          } else {
            // Squish effect: flatten then bounce back
            const progress = squishTime / 600;
            planet.squishX = 1 + Math.sin(progress * Math.PI) * 0.3 * Math.sin(progress * Math.PI * 3);
            planet.squishY = 1 - Math.sin(progress * Math.PI) * 0.2 * Math.cos(progress * Math.PI * 2);
          }
        }

        // Glow
        const glowGradient = ctx.createRadialGradient(planet.x, planet.y, 0, planet.x, planet.y, planet.size * 2.5);
        glowGradient.addColorStop(0, planet.glowColor);
        glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Apply squish transform
        ctx.save();
        ctx.translate(planet.x, planet.y);
        ctx.scale(planet.squishX, planet.squishY);
        ctx.translate(-planet.x, -planet.y);

        // Draw specific planet
        if (planet.type === 'sun') {
          drawSun(planet);
        } else if (planet.type === 'earth') {
          drawEarth(planet);
        } else if (planet.type === 'jupiter') {
          drawJupiter(planet);
        } else if (planet.type === 'saturn') {
          drawSaturn(planet);
        } else if (planet.type === 'mars') {
          drawMars(planet);
        } else {
          drawGenericPlanet(planet);
        }

        ctx.restore();
      });
    };

    const drawWave = () => {
      if (!waveRef.current.active) return;

      const { origin, progress } = waveRef.current;
      const maxRadius = Math.max(canvas.width, canvas.height) * 1.5;
      const currentRadius = (progress / 100) * maxRadius;

      if (progress >= 100) {
        waveRef.current.active = false;
        return;
      }

      const waveGradient = ctx.createRadialGradient(
        origin.x, origin.y, currentRadius * 0.7,
        origin.x, origin.y, currentRadius
      );
      waveGradient.addColorStop(0, 'rgba(236, 72, 153, 0)');
      waveGradient.addColorStop(0.6, 'rgba(236, 72, 153, 0.1)');
      waveGradient.addColorStop(0.9, 'rgba(255, 255, 255, 0.4)');
      waveGradient.addColorStop(1, 'rgba(236, 72, 153, 0)');

      ctx.fillStyle = waveGradient;
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, currentRadius, 0, Math.PI * 2);
      ctx.stroke();

      waveRef.current.progress += 2;
    };

    const animate = () => {
      time += 16;

      drawGradientBackground();
      drawStars();
      drawPlanets();
      drawWave();

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      init();
    };

    const handleClick = (e: MouseEvent) => {
      checkPlanetClick(e.clientX, e.clientY);
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('click', handleClick);

    (window as any).triggerSpaceWave = triggerWave;
    (window as any).checkPlanetClick = checkPlanetClick;

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleClick);
      delete (window as any).triggerSpaceWave;
      delete (window as any).checkPlanetClick;
    };
  }, [createPlanets, createStars, triggerWave, checkPlanetClick]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-auto z-0"
      style={{ cursor: 'crosshair' }}
    />
  );
};

export default SpaceBackground;
