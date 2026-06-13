import * as THREE from 'three';
import { state } from './physics.js';

let pulseMesh = null;
let pulseActive = false;
let pulseStartTime = 0;
let sceneRef = null;

export function buildPulse(scene) {
  sceneRef = scene;
}

export function triggerPulse() {
  if (pulseActive || !sceneRef) return;

  const geo = new THREE.SphereGeometry(0.005, 16, 16);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 1,
  });
  pulseMesh = new THREE.Mesh(geo, mat);
  pulseMesh.position.y = 0;
  sceneRef.add(pulseMesh);
  pulseActive = true;
  pulseStartTime = performance.now();
}

export function updatePulse() {
  if (!pulseActive || !pulseMesh) return;

  const elapsed = (performance.now() - pulseStartTime) / 500;
  if (elapsed >= 1) {
    sceneRef.remove(pulseMesh);
    pulseMesh.geometry.dispose();
    pulseMesh.material.dispose();
    pulseMesh = null;
    pulseActive = false;
    return;
  }

  const s = 1 + elapsed * 8;
  pulseMesh.scale.set(s, s, s);
  pulseMesh.material.opacity = 1 - elapsed;
}

export function checkAndTriggerPulse(time) {
  if (!state.vortexEstablished) return;
  if (state.coilLoad < 0.05) return;

  const stability = state.vortexStability;
  const threshold = 0.001 + stability * 0.05;
  if (Math.random() < threshold) {
    triggerPulse();
  }
}
