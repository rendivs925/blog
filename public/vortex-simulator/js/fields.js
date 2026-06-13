import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

let fieldPlane, canvas, ctx;
let initialized = false;

export function buildFields(scene) {
  canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  fieldPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.8),
    mat
  );
  fieldPlane.rotation.x = -Math.PI / 2;
  fieldPlane.position.y = -PHYS.DISC_OFFSET - 0.01;
  scene.add(fieldPlane);

  initialized = true;
}

export function updateFields(time) {
  if (!initialized) return;

  const vs = state.vortexStability;
  const be = state.backEmf;
  const pulseActive = state.pulseActive;
  const pulsePhase = state.pulsePhase;

  const imageData = ctx.createImageData(128, 128);
  const data = imageData.data;
  const cx = 64, cy = 64;
  const maxR = 60;

  // Pulse shockwave radius in pixel space
  const shockRadius = pulseActive ? pulsePhase * maxR * 0.85 : -1;

  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.sqrt(dx * dx + dy * dy);
      const idx = (y * 128 + x) * 4;

      if (r > maxR) {
        data[idx] = 5; data[idx + 1] = 3; data[idx + 2] = 12; data[idx + 3] = 0;
        continue;
      }

      const normR = r / maxR;
      const pressure = vs * (1 / (normR + 0.05) - 0.5);
      let intensity = Math.min(1, pressure * 1.5);

      // Back-EMF creates concentric standing ripples — the vacuum vibrating
      if (be > 0.01) {
        const waveFreq = 8 + be * 6 + state.rpmSmooth * 0.00005;
        const emfWave = Math.sin(r * waveFreq - time * 6 + be * 4) * 0.5 + 0.5;
        intensity *= 1 + emfWave * be * 0.35;
      }

      // Pulse shockwave: expanding bright ring
      if (pulseActive) {
        const distToRing = Math.abs(r - shockRadius);
        if (distToRing < 5) {
          const ringBright = (1 - distToRing / 5) * Math.sin(pulsePhase * Math.PI) * 2;
          intensity = Math.min(1, intensity + ringBright);
        }
      }

      // Clamp
      intensity = Math.min(1, Math.max(0, intensity));

      // Color: blue-white gradient, warmer when back-EMF active
      const rVal = Math.floor(20 + (60 + be * 40) * Math.pow(intensity, 0.8));
      const gVal = Math.floor(15 + (80 + be * 30) * Math.pow(intensity, 0.7));
      const bVal = Math.floor(40 + 180 * intensity);

      data[idx] = Math.min(255, rVal);
      data[idx + 1] = Math.min(255, gVal);
      data[idx + 2] = Math.min(255, bVal);
      data[idx + 3] = Math.floor(120 * intensity);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  fieldPlane.material.map.needsUpdate = true;
  fieldPlane.material.opacity = Math.min(0.4, 0.05 + vs * 0.25 + be * 0.08);
}
