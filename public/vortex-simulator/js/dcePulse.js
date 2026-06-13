import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';
import { burstParticles } from './particles.js';

let sceneRef = null;
let pumpRing;

export function buildPulse(scene) {
  sceneRef = scene;

  const pumpMat = new THREE.MeshBasicMaterial({
    color: 0x4488bb,
    transparent: true,
    opacity: 0.04,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  pumpRing = new THREE.Mesh(
    new THREE.RingGeometry(0.005, 0.12, 64),
    pumpMat
  );
  pumpRing.rotation.x = -Math.PI / 2;
  pumpRing.position.y = 0;
  scene.add(pumpRing);
}

let pulseGroup = null;
let pulseStart = 0;

export function triggerPulse(simTime) {
  // Guard: never re-trigger while a pulse is in progress
  if (state.pulseActive) return;
  if (!sceneRef) return;

  state.pulseActive = true;
  state.pulsePhase = 0;
  pulseStart = simTime || 0;

  // DCE pulse energy release
  state.pulseEnergyRelease = Math.min(200, state.P_harvest * 0.15 + 20);

  pulseGroup = new THREE.Group();

  // Expanding spherical wavefront (virtual pair creation)
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x44ddff,
    transparent: true,
    opacity: 0.5,
    wireframe: true,
    blending: THREE.AdditiveBlending,
  });
  const sphereGeo = new THREE.SphereGeometry(0.008, 16, 16);
  const s1 = new THREE.Mesh(sphereGeo, sphereMat);
  s1.position.y = 0.025;
  pulseGroup.add(s1);

  const s2 = new THREE.Mesh(sphereGeo.clone(), sphereMat.clone());
  s2.material.color.setHex(0xcc88ff);
  s2.position.y = -0.025;
  pulseGroup.add(s2);

  // Equatorial shock ring — created once, scaled during animation
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x66ddcc,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.003, 0.01, 48),
    ringMat
  );
  ring.rotation.x = -Math.PI / 2;
  pulseGroup.add(ring);

  // Center flash
  const flashMat = new THREE.MeshBasicMaterial({
    color: 0x88ddff,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  });
  const flash = new THREE.Mesh(
    new THREE.SphereGeometry(0.003, 12, 12),
    flashMat
  );
  flash.position.y = 0;
  pulseGroup.add(flash);

  const flashLight = new THREE.PointLight(0x66ccff, 0, 0.5);
  pulseGroup.add(flashLight);

  sceneRef.add(pulseGroup);
  burstParticles(300);
}

export function updatePulse(simTime) {
  if (!state.pulseActive || !pulseGroup) return;

  const elapsed = simTime !== undefined ? (simTime - pulseStart) / 0.7 : 0;
  state.pulsePhase = Math.min(elapsed, 1);

  if (elapsed >= 1) {
    state.pulseActive = false;
    sceneRef.remove(pulseGroup);
    pulseGroup.children.forEach(c => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    });
    pulseGroup = null;
    return;
  }

  const s = 1 + elapsed * 8;
  const op = 1 - elapsed;

  // Spheres: scale up and fade
  pulseGroup.children[0].scale.set(s, s, s);
  pulseGroup.children[0].material.opacity = op * 0.35;
  pulseGroup.children[1].scale.set(s * 0.85, s * 0.85, s * 0.85);
  pulseGroup.children[1].material.opacity = op * 0.25;

  // Shock ring: scale uniformly to expand (no per-frame geometry)
  const ringScale = 1 + elapsed * 6;
  pulseGroup.children[2].scale.set(ringScale, ringScale, 1);
  pulseGroup.children[2].material.opacity = op * 0.5 * (1 - Math.abs(elapsed - 0.25) * 2.5);

  // Flash
  pulseGroup.children[3].scale.setScalar(1 + elapsed * 10);
  pulseGroup.children[3].material.opacity = op * 0.8;

  // Light
  pulseGroup.children[4].intensity = op * 0.8;
}

export function checkAndTriggerPulse(time) {
  if (!state.vortexEstablished) return;
  if (state.coilLoad < 0.05) return;
  if (state.pulseActive) return; // never stack pulses

  const intensity = state.dceIntensity;
  const threshold = PHYS.DCE_COUPLING + intensity * 0.12;
  if (Math.random() < threshold) {
    triggerPulse(time);
  }
}

export function updatePumpWave() {
  const vs = state.vortexStability;
  const be = state.backEmf;
  const t = performance.now() * 0.001;
  pumpRing.material.opacity = 0.02 + vs * 0.08 + be * 0.06;
  const scale = 1 + vs * Math.sin(t * 3 + be * 5) * (0.12 + be * 0.08);
  pumpRing.scale.set(scale, 1, 1 + vs * Math.cos(t * 3 + be * 5) * (0.12 + be * 0.08));
}
