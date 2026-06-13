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

  // --- Halbach magnets: realistic N52 look (dark sintered body) ---
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
    const isN = i % 2 === 0;
    const mag = new THREE.Mesh(magGeo, magMat);
    const mr = PHYS.MAGNET_RADIUS;
    mag.position.set(mr * Math.cos(angle), 0, mr * Math.sin(angle));
    mag.rotation.y = -angle;

    // Small colored pole marker (red = N, blue = S)
    const pole = new THREE.Mesh(poleGeo, isN ? nMat : sMat);
    pole.position.set(0, PHYS.MAGNET_H / 2 + 0.001, 0);
    mag.add(pole);

    topDisc.add(mag);
  }

  // Bottom disc magnets (inverted polarity pattern, offset for Halbach)
  for (let i = 0; i < PHYS.MAGNET_COUNT; i++) {
    const angle = (i / PHYS.MAGNET_COUNT) * Math.PI * 2 + Math.PI / PHYS.MAGNET_COUNT;
    const isN = i % 2 === 0;
    const mag = new THREE.Mesh(magGeo.clone(), magMat);
    const mr = PHYS.MAGNET_RADIUS;
    mag.position.set(mr * Math.cos(angle), 0, mr * Math.sin(angle));
    mag.rotation.y = -angle;

    const pole = new THREE.Mesh(poleGeo, isN ? sMat : nMat);
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
  const coilGeo = new THREE.TorusGeometry(PHYS.COIL_RADIUS, PHYS.COIL_TUBE, 24, 48);
  coil = new THREE.Mesh(coilGeo, coilMat);
  coil.rotation.x = Math.PI / 2;
  group.add(coil);

  // Coil glow light
  coilGlow = new THREE.PointLight(0xff8800, 0, 0.3);
  coilGlow.position.y = 0;
  group.add(coilGlow);

  // --- Center convergence core ---
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x66ccff,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
  });
  const coreGeo = new THREE.SphereGeometry(0.005, 16, 16);
  core = new THREE.Mesh(coreGeo, coreMat);
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

  // Coil glow based on harvested power
  const powerRatio = Math.min(1, state.P_harvest / 50000);
  const intensity = 0.3 + powerRatio * 4;
  coil.material.emissive = new THREE.Color(0xff8800);
  coil.material.emissiveIntensity = powerRatio * 2;
  coilGlow.intensity = powerRatio * 1.5;

  // Coil color warms with extraction
  const hue = 0.08 - powerRatio * 0.06;
  const sat = 0.6 + powerRatio * 0.3;
  const lit = 0.35 + powerRatio * 0.25;
  coil.material.color.setHSL(hue, sat, lit);

  // Lift arrow
  const liftMag = Math.min(state.F_lift / 50, 1);
  liftArrow.setLength(0.04 + liftMag * 0.35, 0.05, 0.025);
  liftArrow.setColor(new THREE.Color(0x50a080).lerp(new THREE.Color(0xc08040), liftMag));

  // Vortex core pulse
  const vvs = state.vortexStability;
  core.material.opacity = 0.1 + vvs * 0.4;
  core.scale.setScalar(0.5 + vvs * 1.5 + Math.sin(time * 5) * vvs * 0.15);
}
