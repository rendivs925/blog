import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

let vortexGroup = new THREE.Group();
let tube1, tube2;
let initialized = false;

export function buildVortex(scene) {
  vortexGroup = new THREE.Group();

  const mat1 = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.6,
  });
  const mat2 = new THREE.MeshBasicMaterial({
    color: 0x44ddff,
    transparent: true,
    opacity: 0.5,
  });

  const pts1 = generateCurve(0);
  const curve1 = new THREE.CatmullRomCurve3(pts1);
  tube1 = new THREE.Mesh(new THREE.TubeGeometry(curve1, PHYS.VORTEX_SEGMENTS, PHYS.VORTEX_CORE_RADIUS, 8, false), mat1);

  const pts2 = generateCurve(0.5);
  const curve2 = new THREE.CatmullRomCurve3(pts2);
  tube2 = new THREE.Mesh(new THREE.TubeGeometry(curve2, PHYS.VORTEX_SEGMENTS, PHYS.VORTEX_CORE_RADIUS * 0.8, 8, false), mat2);

  vortexGroup.add(tube1);
  vortexGroup.add(tube2);
  scene.add(vortexGroup);
  initialized = true;
}

function generateCurve(phase) {
  const off = PHYS.DISC_OFFSET;
  const pts = [];
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = off * (1 - 2 * t);
    const twist = (t - 0.5) * Math.PI * 2 + phase * Math.PI;
    const r = 0.02 * Math.sin(t * Math.PI) * state.vortexStability;
    const x = r * Math.cos(twist);
    const z = r * Math.sin(twist);
    pts.push(new THREE.Vector3(x, y, z));
  }
  return pts;
}

export function updateVortex(time) {
  if (!initialized) return;

  const scale = 0.3 + state.vortexStability * 1.0;
  const radius = PHYS.VORTEX_CORE_RADIUS * Math.max(scale, 0.01);

  const pts1 = generateCurve(0);
  const curve1 = new THREE.CatmullRomCurve3(pts1);
  tube1.geometry.dispose();
  tube1.geometry = new THREE.TubeGeometry(curve1, PHYS.VORTEX_SEGMENTS, radius, 8, false);

  const pts2 = generateCurve(0.5 + time * 0.5);
  const curve2 = new THREE.CatmullRomCurve3(pts2);
  tube2.geometry.dispose();
  tube2.geometry = new THREE.TubeGeometry(curve2, PHYS.VORTEX_SEGMENTS, radius * 0.8, 8, false);

  const alpha = 0.2 + state.vortexStability * 0.6;
  tube1.material.opacity = alpha;
  tube2.material.opacity = alpha * 0.8;

  const bright = 0.3 + state.vortexStability * 0.7;
  tube1.material.color.setHSL(0.55, 0.8, bright * 0.5);
  tube2.material.color.setHSL(0.52, 0.9, bright * 0.4);
}
