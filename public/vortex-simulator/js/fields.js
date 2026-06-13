import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

let fieldPlane, canvas, ctx;
let convergenceGlow;
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
  const geo = new THREE.PlaneGeometry(0.8, 0.8);
  fieldPlane = new THREE.Mesh(geo, mat);
  fieldPlane.rotation.x = -Math.PI / 2;
  fieldPlane.position.y = -PHYS.DISC_OFFSET - 0.01;
  scene.add(fieldPlane);

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x4488cc,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glowGeo = new THREE.SphereGeometry(0.008, 16, 16);
  convergenceGlow = new THREE.Mesh(glowGeo, glowMat);
  convergenceGlow.position.y = 0;
  scene.add(convergenceGlow);

  const glowLight = new THREE.PointLight(0x4488cc, 0, 0.3);
  glowLight.position.y = 0;
  convergenceGlow.add(glowLight);

  initialized = true;
}

export function updateFields() {
  if (!initialized) return;

  const vs = state.vortexStability;

  const imageData = ctx.createImageData(128, 128);
  const data = imageData.data;
  const cx = 64, cy = 64;
  const maxR = 60;

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
      const intensity = Math.min(1, pressure * 1.5);

      data[idx] = Math.floor(20 + 100 * Math.pow(intensity, 0.8));
      data[idx + 1] = Math.floor(15 + 120 * Math.pow(intensity, 0.7));
      data[idx + 2] = Math.floor(40 + 180 * intensity);
      data[idx + 3] = Math.floor(100 * intensity);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  fieldPlane.material.map.needsUpdate = true;
  fieldPlane.material.opacity = 0.05 + vs * 0.25;

  convergenceGlow.material.opacity = 0.05 + vs * 0.3;
  const gs = 0.5 + vs * 1.5 + Math.sin(performance.now() * 0.003) * vs * 0.15;
  convergenceGlow.scale.set(gs, gs, gs);
  convergenceGlow.children[0].intensity = vs * 0.4;
}
