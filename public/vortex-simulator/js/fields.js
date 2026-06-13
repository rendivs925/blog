import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

let plane, canvas, ctx;
let initialized = false;

export function buildFields(scene) {
  canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const geo = new THREE.PlaneGeometry(0.8, 0.8);
  plane = new THREE.Mesh(geo, mat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -PHYS.DISC_OFFSET - 0.01;
  scene.add(plane);
  initialized = true;
}

export function updateFields() {
  if (!initialized) return;

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
        data[idx] = 10;
        data[idx + 1] = 5;
        data[idx + 2] = 30;
        data[idx + 3] = 0;
        continue;
      }

      const pressure = 1 - (r / maxR) * state.vortexStability;
      const blue = Math.floor(200 * pressure);
      const red = Math.floor(50 + 150 * (1 - pressure));
      const green = Math.floor(50 + 100 * (1 - pressure));

      data[idx] = red;
      data[idx + 1] = green;
      data[idx + 2] = blue;
      data[idx + 3] = 120;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  plane.material.map.needsUpdate = true;
  plane.material.opacity = 0.1 + state.vortexStability * 0.3;
}
