import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

let group, funnelTop, funnelBot, circRings;
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

  // Circulation rings — show vortex cross-section at various heights
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x55aadd,
    transparent: true,
    opacity: 0.06,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  circRings = new THREE.Group();
  for (let ri = 0; ri < 8; ri++) {
    const t = (ri + 0.5) / 8;
    const yPos = off * (1 - 2 * t);
    const radius = 0.003 + 0.027 * Math.pow(Math.abs(yPos) / off, 1.5);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 1.5, 0.001, 8, 24),
      ringMat.clone()
    );
    ring.position.y = yPos;
    ring.rotation.x = Math.PI / 2;
    circRings.add(ring);
  }
  group.add(circRings);

  scene.add(group);
  initialized = true;
}

export function updateVortex(time, delta) {
  if (!initialized) return;

  const vs = state.vortexStability;
  const be = state.backEmf;
  const circ = state.vortexCirculation;

  const pulseFlash = state.pulseSnap * 0.5;

  const shimmerFreq = 25 + be * 20;
  const shimmer = be * 0.15 * Math.sin(time * shimmerFreq + state.rpmSmooth * 0.003);

  const circNorm = Math.min(1, circ / 150);
  const opacity = Math.min(1, 0.05 + circNorm * 0.65 + pulseFlash * 0.35);
  const bright = 0.3 + circNorm * 0.6 + pulseFlash * 0.4;

  const hue = 0.58 - circNorm * 0.06 - be * 0.02;

  const dt = delta || 0.016;
  const rotSpeed = state.omega * 0.15 * vs;
  funnelTop.rotation.y += (rotSpeed + shimmer * 0.5) * dt;
  funnelBot.rotation.y -= (rotSpeed - shimmer * 0.5) * dt;

  funnelTop.material.opacity = opacity;
  funnelBot.material.opacity = opacity * 0.6;
  funnelTop.material.color.setHSL(hue, 0.5, bright * 0.4);
  funnelBot.material.color.setHSL(hue - 0.03, 0.6, bright * 0.3);

  // Scale pinch from back EMF
  const pinch = 1 - be * 0.15;
  const scale = (0.3 + circNorm * 1.0) * pinch;
  funnelTop.scale.set(scale, 1 + be * 0.05, scale);
  funnelBot.scale.set(scale, 1 + be * 0.05, scale);

  // Circulation rings: pulse with vortex strength, rotate with flow
  circRings.rotation.y += state.omega * 0.05 * dt;
  const ringScale = (0.2 + circNorm * 0.85) * pinch;
  const ringOp = 0.02 + circNorm * 0.08 + pulseFlash * 0.06;
  const ringLit = 0.2 + circNorm * 0.25 + pulseFlash * 0.1;
  circRings.children.forEach((ring) => {
    ring.scale.setScalar(ringScale);
    ring.material.opacity = ringOp;
    ring.material.color.setHSL(hue + 0.02, 0.5, ringLit);
  });
}
