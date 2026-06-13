import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

let group, funnelTop, funnelBot, sheathRays;
let initialized = false;

export function buildVortex(scene) {
  group = new THREE.Group();

  const off = PHYS.DISC_OFFSET;
  const segments = PHYS.VORTEX_SEGMENTS;
  const funnelRMax = 0.03;
  const funnelRMin = 0.003;

  // Generate funnel curve: wide at mouths, narrow at waist
  function funnelCurve(phase, dir) {
    const pts = [];
    const steps = 32;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = off * (1 - 2 * t);
      const radius = funnelRMin + (funnelRMax - funnelRMin) * Math.pow(Math.abs(y) / off, 1.5);
      const twist = t * Math.PI * 4 + phase;
      const x = radius * Math.cos(twist);
      const z = radius * Math.sin(twist);
      pts.push(new THREE.Vector3(x * dir, y, z * dir));
    }
    return new THREE.CatmullRomCurve3(pts);
  }

  const curve1 = funnelCurve(0, 1);
  const curve2 = funnelCurve(Math.PI * 0.5, -1);

  // Funnel tube material with glow
  const mat1 = new THREE.MeshBasicMaterial({
    color: 0x00ccff,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  const mat2 = new THREE.MeshBasicMaterial({
    color: 0x44ddff,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });

  const tubeGeo1 = new THREE.TubeGeometry(curve1, segments, 0.003, 8, false);
  const tubeGeo2 = new THREE.TubeGeometry(curve2, segments, 0.003, 8, false);

  funnelTop = new THREE.Mesh(tubeGeo1, mat1);
  funnelBot = new THREE.Mesh(tubeGeo2, mat2);
  group.add(funnelTop);
  group.add(funnelBot);

  // Sheath rays: thin lines tracing the vortex funnel outline
  const rayMat = new THREE.LineBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.15,
  });
  sheathRays = [];
  for (let j = 0; j < 8; j++) {
    const angle = (j / 8) * Math.PI * 2;
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const y = off * (1 - 2 * t);
      const radius = funnelRMin + (funnelRMax - funnelRMin) * Math.pow(Math.abs(y) / off, 1.5);
      const x = (radius + 0.002) * Math.cos(angle + t * Math.PI * 2);
      const z = (radius + 0.002) * Math.sin(angle + t * Math.PI * 2);
      pts.push(new THREE.Vector3(x, y, z));
    }
    const rayGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const ray = new THREE.Line(rayGeo, rayMat);
    group.add(ray);
    sheathRays.push(ray);
  }

  scene.add(group);
  initialized = true;
}

export function updateVortex(time) {
  if (!initialized) return;

  const vs = state.vortexStability;
  const opacity = 0.1 + vs * 0.7;
  const bright = 0.3 + vs * 0.7;

  // Funnel rotation animation (counter-rotating)
  const rotSpeed = state.omega * 0.15 * vs;
  funnelTop.rotation.y += rotSpeed * 0.016;
  funnelBot.rotation.y -= rotSpeed * 0.016;

  // Color and opacity
  funnelTop.material.opacity = opacity;
  funnelBot.material.opacity = opacity * 0.7;
  funnelTop.material.color.setHSL(0.55 - vs * 0.05, 0.8, bright * 0.5);
  funnelBot.material.color.setHSL(0.52 - vs * 0.05, 0.9, bright * 0.4);

  // Scale with vortex strength (visual widening)
  const scale = 0.3 + vs * 1.0;
  funnelTop.scale.set(scale, 1, scale);
  funnelBot.scale.set(scale, 1, scale);

  // Sheath rays
  for (let j = 0; j < sheathRays.length; j++) {
    sheathRays[j].material.opacity = vs * 0.2;
    sheathRays[j].rotation.y = (j / sheathRays.length) * Math.PI * 2 * vs * 0.1 * time;
  }
}
