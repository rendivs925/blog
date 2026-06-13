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
      pts.push(new THREE.Vector3(
        radius * Math.cos(twist),
        y,
        radius * Math.sin(twist)
      ));
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

  funnelTop = new THREE.Mesh(
    new THREE.TubeGeometry(curve1, segments, 0.003, 8, false),
    mat1
  );
  funnelBot = new THREE.Mesh(
    new THREE.TubeGeometry(curve2, segments, 0.003, 8, false),
    mat2
  );
  group.add(funnelTop);
  group.add(funnelBot);

  scene.add(group);
  initialized = true;
}

export function updateVortex(time) {
  if (!initialized) return;

  const vs = state.vortexStability;
  const be = state.backEmf;

  // Pulse flash
  const pulseFlash = state.pulseActive
    ? Math.sin(state.pulsePhase * Math.PI) * 0.5
    : 0;

  // Back-EMF shimmer: vortex reacts to energy extraction
  const shimmerFreq = 25 + be * 20;
  const shimmer = be * 0.15 * Math.sin(time * shimmerFreq + state.rpmSmooth * 0.003);

  // Opacity modulated by everything
  const opacity = Math.min(1, 0.05 + vs * 0.5 + pulseFlash * 0.35);
  const bright = 0.3 + vs * 0.6 + pulseFlash * 0.4;

  const rotSpeed = state.omega * 0.15 * vs;
  funnelTop.rotation.y += (rotSpeed + shimmer * 0.5) * 0.016;
  funnelBot.rotation.y -= (rotSpeed - shimmer * 0.5) * 0.016;

  funnelTop.material.opacity = opacity;
  funnelBot.material.opacity = opacity * 0.6;
  funnelTop.material.color.setHSL(0.57 - vs * 0.05, 0.5, bright * 0.4);
  funnelBot.material.color.setHSL(0.54 - vs * 0.05, 0.6, bright * 0.3);

  // Scale pinch from back EMF — vortex compresses under load
  const pinch = 1 - be * 0.15;
  const scale = (0.3 + vs * 1.0) * pinch;
  funnelTop.scale.set(scale, 1 + be * 0.05, scale);
  funnelBot.scale.set(scale, 1 + be * 0.05, scale);
}
