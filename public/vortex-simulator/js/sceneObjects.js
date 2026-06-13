import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

const group = new THREE.Group();
let topDisc, bottomDisc, coil, steerXRing, steerYRing, magnetMeshes, axisArrow, coilGlow;
let initialized = false;

export function buildScene(scene) {
  const R = PHYS.R_DISC;
  const off = PHYS.DISC_OFFSET;

  const discGeo = new THREE.CylinderGeometry(R, R, PHYS.H_DISC, 48);
  const discMat = new THREE.MeshPhysicalMaterial({
    color: 0x88aacc,
    metalness: 0.9,
    roughness: 0.15,
    envMapIntensity: 0.8,
  });

  topDisc = new THREE.Mesh(discGeo, discMat);
  topDisc.position.y = off;
  topDisc.userData.dir = 1;

  bottomDisc = new THREE.Mesh(discGeo.clone(), discMat.clone());
  bottomDisc.position.y = -off;
  bottomDisc.userData.dir = -1;

  group.add(topDisc);
  group.add(bottomDisc);

  // Magnets on top disc
  magnetMeshes = [];
  const magMatN = new THREE.MeshPhysicalMaterial({ color: 0xff3333, emissive: 0x661111, emissiveIntensity: 0.5 });
  const magMatS = new THREE.MeshPhysicalMaterial({ color: 0x3333ff, emissive: 0x111166, emissiveIntensity: 0.5 });
  const magGeo = new THREE.BoxGeometry(PHYS.MAGNET_W, PHYS.MAGNET_H, PHYS.MAGNET_D);

  for (let i = 0; i < PHYS.MAGNET_COUNT; i++) {
    const angle = (i / PHYS.MAGNET_COUNT) * Math.PI * 2;
    const mag = new THREE.Mesh(magGeo, i % 2 === 0 ? magMatN : magMatS);
    const r = PHYS.MAGNET_RADIUS;
    mag.position.set(r * Math.cos(angle), 0, r * Math.sin(angle));
    mag.rotation.y = -angle;
    mag.userData.angle = angle;
    topDisc.add(mag);
    magnetMeshes.push(mag);
  }

  // Magnets on bottom disc (inverted pattern)
  for (let i = 0; i < PHYS.MAGNET_COUNT; i++) {
    const angle = (i / PHYS.MAGNET_COUNT) * Math.PI * 2 + Math.PI / PHYS.MAGNET_COUNT;
    const mag = new THREE.Mesh(magGeo.clone(), i % 2 === 0 ? magMatS : magMatN);
    const r = PHYS.MAGNET_RADIUS;
    mag.position.set(r * Math.cos(angle), 0, r * Math.sin(angle));
    mag.rotation.y = -angle;
    bottomDisc.add(mag);
  }

  // Harvest coil
  const coilMat = new THREE.MeshPhysicalMaterial({
    color: 0xffaa00,
    emissive: 0xff6600,
    emissiveIntensity: 0.3,
    metalness: 0.8,
    roughness: 0.2,
  });
  const coilGeo = new THREE.TorusGeometry(PHYS.COIL_RADIUS, PHYS.COIL_TUBE, 24, 48);
  coil = new THREE.Mesh(coilGeo, coilMat);
  coil.rotation.x = Math.PI / 2;
  group.add(coil);

  coilGlow = new THREE.PointLight(0xff8800, 0.5, 0.3);
  coilGlow.position.y = 0;
  group.add(coilGlow);

  // Steering rings
  const steerMat = new THREE.MeshBasicMaterial({ color: 0x4488ff, wireframe: true, transparent: true, opacity: 0.3 });
  const steerGeo = new THREE.TorusGeometry(PHYS.STEER_RADIUS, PHYS.STEER_TUBE, 16, 48);
  steerXRing = new THREE.Mesh(steerGeo, steerMat);
  steerXRing.rotation.y = Math.PI / 2;
  steerXRing.position.y = 0;
  group.add(steerXRing);

  steerYRing = new THREE.Mesh(steerGeo.clone(), steerMat.clone());
  steerYRing.rotation.x = Math.PI / 2;
  steerYRing.position.y = 0;
  group.add(steerYRing);

  // Center glow sphere (vortex core)
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.4 });
  const coreGeo = new THREE.SphereGeometry(0.008, 16, 16);
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.y = 0;
  group.add(core);

  // Arrow for lift vector
  const arrowDir = new THREE.Vector3(0, 1, 0);
  const arrowOrigin = new THREE.Vector3(0, -0.3, 0);
  axisArrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, 0.2, 0x00ff88, 0.04, 0.02);
  group.add(axisArrow);

  scene.add(group);
  initialized = true;
}

export function updateScene(time) {
  if (!initialized) return;

  const omega = state.omega;
  const visRPM = Math.min(state.RPM, 3000); // cap visual speed to avoid aliasing
  const visOmega = 2 * Math.PI * visRPM / 60;

  topDisc.rotation.y += visOmega * 0.016;
  bottomDisc.rotation.y -= visOmega * 0.016;

  // Coil glow based on power
  const intensity = 0.3 + state.P_harvest / 5000 * 3;
  coil.material.emissiveIntensity = Math.min(intensity, 5);
  coilGlow.intensity = Math.min(0.5 + state.P_harvest / 10000 * 2, 3);

  // Steering deflection visual
  const sx = state.steerX * 0.1;
  const sy = state.steerY * 0.1;
  steerXRing.position.x = sx * 0.3;
  steerXRing.position.z = sy * 0.3;
  steerYRing.position.x = sx * 0.3;
  steerYRing.position.z = sy * 0.3;

  // Arrow updates
  const liftMag = Math.min(state.F_lift / 50, 1);
  axisArrow.setLength(0.05 + liftMag * 0.3, 0.04, 0.02);
  axisArrow.setColor(new THREE.Color(0x00ff88).lerp(new THREE.Color(0xff8800), liftMag));

  // Vortex stability visual
  const opacity = 0.3 + state.vortexStability * 0.7;
  core.material.opacity = opacity;
}
