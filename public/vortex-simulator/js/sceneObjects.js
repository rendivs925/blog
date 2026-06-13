import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

const group = new THREE.Group();
let topDisc, bottomDisc, coil, coilGlow, liftArrow, core;
let initialized = false;

export function buildScene(scene) {
  const R = PHYS.R_DISC;
  const off = PHYS.DISC_OFFSET;

  // --- Discs: machined titanium ---
  const discGeo = new THREE.CylinderGeometry(R, R, PHYS.H_DISC, 48);
  const discMat = new THREE.MeshPhysicalMaterial({
    color: 0x8898a8,
    metalness: 0.95,
    roughness: 0.15,
    envMapIntensity: 1.2,
    clearcoat: 0.1,
    clearcoatRoughness: 0.3,
  });

  topDisc = new THREE.Mesh(discGeo, discMat);
  topDisc.position.y = off;

  bottomDisc = new THREE.Mesh(discGeo.clone(), discMat.clone());
  bottomDisc.position.y = -off;

  group.add(topDisc);
  group.add(bottomDisc);

  // --- Halbach magnets: realistic N52 sintered ---
  const magMat = new THREE.MeshPhysicalMaterial({
    color: 0x2a2a35,
    metalness: 0.7,
    roughness: 0.4,
  });
  const magGeo = new THREE.BoxGeometry(PHYS.MAGNET_W, PHYS.MAGNET_H, PHYS.MAGNET_D);
  const poleGeo = new THREE.SphereGeometry(0.002, 8, 8);
  const nMat = new THREE.MeshBasicMaterial({ color: 0xcc3333 });
  const sMat = new THREE.MeshBasicMaterial({ color: 0x3355cc });

  for (let i = 0; i < PHYS.MAGNET_COUNT; i++) {
    const angle = (i / PHYS.MAGNET_COUNT) * Math.PI * 2;
    const mag = new THREE.Mesh(magGeo, magMat);
    const mr = PHYS.MAGNET_RADIUS;
    mag.position.set(mr * Math.cos(angle), 0, mr * Math.sin(angle));
    mag.rotation.y = -angle;

    const pole = new THREE.Mesh(poleGeo, i % 2 === 0 ? nMat : sMat);
    pole.position.set(0, PHYS.MAGNET_H / 2 + 0.001, 0);
    mag.add(pole);
    topDisc.add(mag);
  }

  for (let i = 0; i < PHYS.MAGNET_COUNT; i++) {
    const angle = (i / PHYS.MAGNET_COUNT) * Math.PI * 2 + Math.PI / PHYS.MAGNET_COUNT;
    const mag = new THREE.Mesh(magGeo.clone(), magMat);
    const mr = PHYS.MAGNET_RADIUS;
    mag.position.set(mr * Math.cos(angle), 0, mr * Math.sin(angle));
    mag.rotation.y = -angle;

    const pole = new THREE.Mesh(poleGeo, i % 2 === 0 ? sMat : nMat);
    pole.position.set(0, -PHYS.MAGNET_H / 2 - 0.001, 0);
    mag.add(pole);
    bottomDisc.add(mag);
  }

  // --- Harvest coil: copper winding ---
  const coilMat = new THREE.MeshPhysicalMaterial({
    color: 0xcc8840,
    metalness: 0.85,
    roughness: 0.25,
    envMapIntensity: 0.8,
  });
  coil = new THREE.Mesh(
    new THREE.TorusGeometry(PHYS.COIL_RADIUS, PHYS.COIL_TUBE, 24, 48),
    coilMat
  );
  coil.rotation.x = Math.PI / 2;
  group.add(coil);

  coilGlow = new THREE.PointLight(0xff8800, 0, 0.3);
  coilGlow.position.y = 0;
  group.add(coilGlow);

  // --- Convergence core ---
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x66ccff,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
  });
  core = new THREE.Mesh(new THREE.SphereGeometry(0.005, 16, 16), coreMat);
  core.position.y = 0;
  group.add(core);

  // --- Lift arrow ---
  liftArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -0.35, 0),
    0.04, 0x50a080, 0.05, 0.025
  );
  group.add(liftArrow);

  scene.add(group);
  initialized = true;
}

export function updateScene(time) {
  if (!initialized) return;

  const visRPM = Math.min(state.RPM, 3000);
  const visOmega = 2 * Math.PI * visRPM / 60;
  topDisc.rotation.y += visOmega * 0.016;
  bottomDisc.rotation.y -= visOmega * 0.016;

  const vs = state.vortexStability;
  const be = state.backEmf;

  // Harvest power drives coil appearance
  const powerRatio = Math.min(1, state.P_harvest / 50000);
  const hue = 0.08 - powerRatio * 0.06;
  const sat = 0.6 + powerRatio * 0.3;
  const lit = 0.35 + powerRatio * 0.25;
  coil.material.color.setHSL(hue, sat, lit);

  // Back-EMF makes coil flicker — Lenz reaction visible
  const emfFlicker = 1 + (0.5 + 0.5 * Math.sin(time * 50 + be * 15)) * be * 0.4;
  coil.material.emissive = new THREE.Color(0xff8800);
  coil.material.emissiveIntensity = powerRatio * 2 * emfFlicker;
  coilGlow.intensity = powerRatio * 1.5 * emfFlicker;

  // Lift arrow
  const liftMag = Math.min(state.F_lift / 50, 1);
  liftArrow.setLength(0.04 + liftMag * 0.35, 0.05, 0.025);
  liftArrow.setColor(new THREE.Color(0x50a080).lerp(new THREE.Color(0xc08040), liftMag));

  // Vortex core — reacts to everything
  const pulseFlash = state.pulseActive
    ? Math.sin(state.pulsePhase * Math.PI) * 0.6
    : 0;
  const beShimmer = Math.sin(time * 35 + be * 12) * be * 0.2;
  const beThrob = (0.5 + 0.5 * Math.sin(time * 8 + be * 20)) * be * 0.25;

  core.material.opacity = 0.1 + vs * 0.4 + beShimmer * 0.15 + pulseFlash * 0.35;
  const baseScale = 0.5 + vs * 1.5 + Math.sin(time * 5) * vs * 0.15;
  core.scale.setScalar(baseScale + beThrob * 0.6 + pulseFlash * 2.0 + beShimmer * 0.3);
  core.material.color.setHSL(
    0.58 - vs * 0.04 - pulseFlash * 0.06,
    0.4 + pulseFlash * 0.3,
    0.5 + pulseFlash * 0.3
  );
}
