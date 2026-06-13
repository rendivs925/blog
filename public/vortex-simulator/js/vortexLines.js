import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

let group, funnelTop, funnelBot;
let initialized = false;

export function buildVortex(scene) {
  group = new THREE.Group();

  const off = PHYS.DISC_OFFSET;
  const segments = PHYS.VORTEX_SEGMENTS;

  function funnelCurve(phase) {
    const pts = [];
    const steps = 32;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = off * (1 - 2 * t);
      const radius = 0.003 + 0.027 * Math.pow(Math.abs(y) / off, 1.5);
      const twist = t * Math.PI * 4 + phase;
      const x = radius * Math.cos(twist);
      const z = radius * Math.sin(twist);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(pts);
  }

  const curve1 = funnelCurve(0);
  const curve2 = funnelCurve(Math.PI * 0.5);

  const mat1 = new THREE.MeshBasicMaterial({
    color: 0x4499cc,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mat2 = new THREE.MeshBasicMaterial({
    color: 0x55aadd,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const tubeGeo1 = new THREE.TubeGeometry(curve1, segments, 0.003, 8, false);
  const tubeGeo2 = new THREE.TubeGeometry(curve2, segments, 0.003, 8, false);

  funnelTop = new THREE.Mesh(tubeGeo1, mat1);
  funnelBot = new THREE.Mesh(tubeGeo2, mat2);
  group.add(funnelTop);
  group.add(funnelBot);

  scene.add(group);
  initialized = true;
}

export function updateVortex(time) {
  if (!initialized) return;

  const vs = state.vortexStability;
  const opacity = 0.05 + vs * 0.5;
  const bright = 0.3 + vs * 0.6;

  const rotSpeed = state.omega * 0.15 * vs;
  funnelTop.rotation.y += rotSpeed * 0.016;
  funnelBot.rotation.y -= rotSpeed * 0.016;

  funnelTop.material.opacity = opacity;
  funnelBot.material.opacity = opacity * 0.6;
  funnelTop.material.color.setHSL(0.57 - vs * 0.05, 0.5, bright * 0.4);
  funnelBot.material.color.setHSL(0.54 - vs * 0.05, 0.6, bright * 0.3);

  const scale = 0.3 + vs * 1.0;
  funnelTop.scale.set(scale, 1, scale);
  funnelBot.scale.set(scale, 1, scale);
}
