import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

let fieldPlane, canvas, ctx;
let fluxLines = [];
let convergenceGlow;
let initialized = false;

export function buildFields(scene) {
  // Pressure field canvas
  canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const geo = new THREE.PlaneGeometry(0.9, 0.9);
  fieldPlane = new THREE.Mesh(geo, mat);
  fieldPlane.rotation.x = -Math.PI / 2;
  fieldPlane.position.y = -PHYS.DISC_OFFSET - 0.01;
  scene.add(fieldPlane);

  // Magnetic flux lines between discs
  const fluxMat = new THREE.LineBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.15,
  });
  const fluxSteps = 12;
  for (let j = 0; j < fluxSteps; j++) {
    const angle = (j / fluxSteps) * Math.PI * 2;
    const pts = [];
    const rStart = PHYS.MAGNET_RADIUS;
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const y = PHYS.DISC_OFFSET * (1 - 2 * t);
      const bulge = Math.sin(t * Math.PI) * 0.01;
      const r = rStart + bulge;
      pts.push(new THREE.Vector3(
        r * Math.cos(angle + t * 0.5),
        y,
        r * Math.sin(angle + t * 0.5)
      ));
    }
    const fluxGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(fluxGeo, fluxMat);
    scene.add(line);
    fluxLines.push(line);
  }

  // Convergence glow at center
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00ccff,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glowGeo = new THREE.SphereGeometry(0.008, 16, 16);
  convergenceGlow = new THREE.Mesh(glowGeo, glowMat);
  convergenceGlow.position.y = 0;
  scene.add(convergenceGlow);

  const glowLight = new THREE.PointLight(0x00aaff, 0.3, 0.3);
  glowLight.position.y = 0;
  convergenceGlow.add(glowLight);

  initialized = true;
}

export function updateFields() {
  if (!initialized) return;

  const vs = state.vortexStability;

  // --- Pressure field canvas ---
  const imageData = ctx.createImageData(256, 256);
  const data = imageData.data;
  const cx = 128, cy = 128;
  const maxR = 120;

  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.sqrt(dx * dx + dy * dy);
      const idx = (y * 256 + x) * 4;

      if (r > maxR) {
        data[idx] = 5;
        data[idx + 1] = 2;
        data[idx + 2] = 20;
        data[idx + 3] = 0;
        continue;
      }

      // 1/r pressure profile (convergent geometry signature)
      const normR = r / maxR;
      const pressure = vs * (1 / (normR + 0.05) - 0.5);

      // HDR color ramp: blue → cyan → white toward center
      const intensity = Math.min(1, pressure * 1.5);
      const rv = Math.floor(30 + 225 * Math.pow(intensity, 0.5));
      const gv = Math.floor(20 + 180 * Math.pow(intensity, 0.8));
      const bv = Math.floor(80 + 175 * intensity);

      data[idx] = rv;
      data[idx + 1] = gv;
      data[idx + 2] = bv;
      data[idx + 3] = Math.floor(140 * intensity);

      // Pressure contour lines (every 20% pressure)
      const contourVal = (1 / (normR + 0.05) - 0.5);
      const contourSpacing = 0.5;
      if (vs > 0.3 && Math.abs(contourVal % contourSpacing) < 0.03 && normR > 0.05) {
        data[idx] = Math.min(255, data[idx] + 60);
        data[idx + 1] = Math.min(255, data[idx + 1] + 80);
        data[idx + 2] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  fieldPlane.material.map.needsUpdate = true;
  fieldPlane.material.opacity = 0.05 + vs * 0.35;

  // --- Magnetic flux lines ---
  const fluxOp = vs * 0.25;
  for (const line of fluxLines) {
    line.material.opacity = fluxOp;
    line.rotation.y += 0.005 * vs;
  }

  // --- Convergence glow ---
  convergenceGlow.material.opacity = 0.1 + vs * 0.5;
  const glowScale = 0.5 + vs * 1.5 + Math.sin(performance.now() * 0.003) * vs * 0.2;
  convergenceGlow.scale.set(glowScale, glowScale, glowScale);
  convergenceGlow.children[0].intensity = 0.1 + vs * 0.6;
}
