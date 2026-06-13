import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';
import { burstParticles } from './particles.js';

let pulseGroup, pumpWave;
let pulseActive = false;
let pulseStartTime = 0;
let sceneRef = null;

export function buildPulse(scene) {
  sceneRef = scene;

  // Parametric pump wave: a translucent ripple disc
  const pumpMat = new THREE.MeshBasicMaterial({
    color: 0x00ffaa,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const pumpGeo = new THREE.RingGeometry(0.01, 0.15, 48);
  pumpWave = new THREE.Mesh(pumpGeo, pumpMat);
  pumpWave.rotation.x = -Math.PI / 2;
  pumpWave.position.y = 0;
  scene.add(pumpWave);
}

export function triggerPulse() {
  if (pulseActive || !sceneRef) return;

  pulseGroup = new THREE.Group();

  // Twin expanding spheres (photon-anti-photon pair)
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.6,
    wireframe: true,
  });
  const sphereGeo = new THREE.SphereGeometry(0.005, 16, 16);

  const s1 = new THREE.Mesh(sphereGeo, sphereMat);
  s1.position.y = 0.02;
  pulseGroup.add(s1);

  const s2 = new THREE.Mesh(sphereGeo.clone(), sphereMat.clone());
  s2.material.color.setHex(0xff88ff);
  s2.position.y = -0.02;
  pulseGroup.add(s2);

  // Interference ring at midplane
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x88ffdd,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ringGeo = new THREE.RingGeometry(0.003, 0.006, 32);
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0;
  pulseGroup.add(ring);

  // Energy burst particles
  burstParticles(200);

  sceneRef.add(pulseGroup);
  pulseActive = true;
  pulseStartTime = performance.now();
}

export function updatePulse() {
  if (!pulseActive || !pulseGroup) return;

  const elapsed = (performance.now() - pulseStartTime) / 600;

  if (elapsed >= 1) {
    sceneRef.remove(pulseGroup);
    pulseGroup.children.forEach(c => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    });
    pulseGroup = null;
    pulseActive = false;
    return;
  }

  const s = 1 + elapsed * 6;
  const op = 1 - elapsed;

  // Update both spheres
  const s1 = pulseGroup.children[0];
  const s2 = pulseGroup.children[1];
  s1.scale.set(s, s, s);
  s1.material.opacity = op * 0.5;
  s2.scale.set(s * 0.9, s * 0.9, s * 0.9);
  s2.material.opacity = op * 0.4;

  // Interference ring expansion
  const ring = pulseGroup.children[2];
  const ringInner = 0.003 + elapsed * 0.04;
  const ringOuter = ringInner + 0.003 + elapsed * 0.01;
  ring.geometry.dispose();
  ring.geometry = new THREE.RingGeometry(ringInner, ringOuter, 32);
  ring.material.opacity = op * 0.5 * (1 - Math.abs(elapsed - 0.3) * 2);
}

export function checkAndTriggerPulse(time) {
  if (!state.vortexEstablished) return;
  if (state.coilLoad < 0.05) return;

  const intensity = state.dceIntensity;
  const threshold = PHYS.DCE_COUPLING + intensity * 0.08;
  if (Math.random() < threshold) {
    triggerPulse();
  }
}

export function updatePumpWave() {
  const vs = state.vortexStability;
  pumpWave.material.opacity = vs * 0.12;
  pumpWave.scale.set(1 + vs * Math.sin(performance.now() * 0.005) * 0.2, 1, 1 + vs * Math.cos(performance.now() * 0.005) * 0.2);
}
