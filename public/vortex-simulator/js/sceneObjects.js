import * as THREE from 'three';
import { PHYS } from './constants.js';
import { state } from './physics.js';

const group = new THREE.Group();
let topDisc, bottomDisc, coil, coilGlow, steerIndicator, liftArrow, topArrow, core;
let initialized = false;

export function buildScene(scene) {
  const R = PHYS.R_DISC;
  const off = PHYS.DISC_OFFSET;

  // --- Discs ---
  const discGeo = new THREE.CylinderGeometry(R, R, PHYS.H_DISC, 48);
  const discMat = new THREE.MeshPhysicalMaterial({
    color: 0x88aacc,
    metalness: 0.9,
    roughness: 0.12,
    envMapIntensity: 0.8,
  });

  topDisc = new THREE.Mesh(discGeo, discMat);
  topDisc.position.y = off;

  bottomDisc = new THREE.Mesh(discGeo.clone(), discMat.clone());
  bottomDisc.position.y = -off;

  group.add(topDisc);
  group.add(bottomDisc);

  // --- Halbach magnets on top disc ---
  const magMatN = new THREE.MeshPhysicalMaterial({
    color: 0xff3333,
    emissive: 0xff2222,
    emissiveIntensity: 0.6,
    metalness: 0.3,
    roughness: 0.3,
  });
  const magMatS = new THREE.MeshPhysicalMaterial({
    color: 0x3333ff,
    emissive: 0x2222ff,
    emissiveIntensity: 0.6,
    metalness: 0.3,
    roughness: 0.3,
  });
  const magGeo = new THREE.BoxGeometry(PHYS.MAGNET_W, PHYS.MAGNET_H, PHYS.MAGNET_D);

  for (let i = 0; i < PHYS.MAGNET_COUNT; i++) {
    const angle = (i / PHYS.MAGNET_COUNT) * Math.PI * 2;
    const isN = i % 2 === 0;
    const mag = new THREE.Mesh(magGeo, isN ? magMatN : magMatS);
    const mr = PHYS.MAGNET_RADIUS;
    mag.position.set(mr * Math.cos(angle), 0, mr * Math.sin(angle));
    mag.rotation.y = -angle;
    // Arrow label: small cone pointing outward on magnets
    const arrowCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.002, 0.005, 6),
      new THREE.MeshBasicMaterial({ color: isN ? 0xff6666 : 0x6666ff })
    );
    arrowCone.rotation.x = Math.PI / 2;
    arrowCone.position.set(0.012, 0, 0);
    mag.add(arrowCone);
    topDisc.add(mag);
  }

  // Bottom disc magnets (inverted polarity pattern)
  for (let i = 0; i < PHYS.MAGNET_COUNT; i++) {
    const angle = (i / PHYS.MAGNET_COUNT) * Math.PI * 2 + Math.PI / PHYS.MAGNET_COUNT;
    const isN = i % 2 === 0;
    const mag = new THREE.Mesh(magGeo.clone(), isN ? magMatS : magMatN);
    const mr = PHYS.MAGNET_RADIUS;
    mag.position.set(mr * Math.cos(angle), 0, mr * Math.sin(angle));
    mag.rotation.y = -angle;
    bottomDisc.add(mag);
  }

  // --- Harvest coil with winding detail ---
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

  // Winding rings around coil cross-section
  for (let i = 0; i < 16; i++) {
    const t = i / 16;
    const angle = t * Math.PI * 2;
    const ringGeo = new THREE.TorusGeometry(PHYS.COIL_TUBE * 0.5, 0.001, 6, 12);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffcc44,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    const r = PHYS.COIL_RADIUS;
    ring.position.set(r * Math.cos(angle), 0, r * Math.sin(angle));
    ring.rotation.y = angle;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }

  coilGlow = new THREE.PointLight(0xff8800, 0.4, 0.3);
  coilGlow.position.y = 0;
  group.add(coilGlow);

  // --- Steering field indicator (crosshair) ---
  const steerMat = new THREE.MeshBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.2,
    wireframe: true,
  });
  const steerGeo = new THREE.TorusGeometry(PHYS.STEER_RADIUS, PHYS.STEER_TUBE, 16, 48);
  steerIndicator = new THREE.Mesh(steerGeo, steerMat);
  steerIndicator.position.y = 0;
  group.add(steerIndicator);

  // --- Center convergence core ---
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x00ccff,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
  });
  const coreGeo = new THREE.SphereGeometry(0.005, 16, 16);
  core = new THREE.Mesh(coreGeo, coreMat);
  core.position.y = 0;
  group.add(core);

  // --- Lift arrow (thrust vector) ---
  liftArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -0.35, 0),
    0.05, 0x00ff88, 0.06, 0.03
  );
  group.add(liftArrow);

  // --- Thrust cone glow ---
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const coneGeo = new THREE.CylinderGeometry(0.02, 0.12, 0.2, 16, 1, true);
  topArrow = new THREE.Mesh(coneGeo, coneMat);
  topArrow.position.y = -0.3;
  group.add(topArrow);

  // --- Ground reference rings ---
  const ringMatGnd = new THREE.MeshBasicMaterial({
    color: 0x224488,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  });
  for (let i = 1; i <= 3; i++) {
    const gndRing = new THREE.Mesh(
      new THREE.RingGeometry(i * 0.08 - 0.003, i * 0.08, 48),
      ringMatGnd
    );
    gndRing.rotation.x = -Math.PI / 2;
    gndRing.position.y = -off - 0.02;
    group.add(gndRing);
  }

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
  const intensity = 0.3 + state.P_harvest / 5000 * 3;
  coil.material.emissiveIntensity = Math.min(intensity, 5);
  coilGlow.intensity = Math.min(0.4 + state.P_harvest / 10000 * 2, 3);

  // Coil color shifts from orange → white → blue-white as power increases
  const powerRatio = Math.min(1, state.P_harvest / 50000);
  const hue = 0.08 - powerRatio * 0.1;
  const sat = 0.9 - powerRatio * 0.4;
  const lit = 0.5 + powerRatio * 0.3;
  coil.material.color.setHSL(hue, sat, lit);
  coil.material.emissive.setHSL(hue + 0.02, sat, 0.3 + powerRatio * 0.5);

  // Steering field indicator offset
  const sx = state.steerX * 0.08;
  const sy = state.steerY * 0.08;
  steerIndicator.position.x = sx;
  steerIndicator.position.z = sy;
  steerIndicator.material.opacity = 0.1 + Math.sqrt(sx * sx + sy * sy) * 2;

  // Lift arrow
  const liftMag = Math.min(state.F_lift / 50, 1);
  liftArrow.setLength(0.05 + liftMag * 0.35, 0.06, 0.03);
  liftArrow.setColor(new THREE.Color(0x00ff88).lerp(new THREE.Color(0xff8800), liftMag));

  // Thrust cone
  topArrow.material.opacity = liftMag * 0.15;
  topArrow.scale.y = 0.5 + liftMag * 1.5;
  topArrow.scale.x = 0.5 + liftMag * 2;
  topArrow.scale.z = 0.5 + liftMag * 2;

  // Vortex core pulse
  const vvs = state.vortexStability;
  core.material.opacity = 0.2 + vvs * 0.6;
  core.scale.setScalar(0.5 + vvs * 1.5 + Math.sin(time * 5) * vvs * 0.2);
}
