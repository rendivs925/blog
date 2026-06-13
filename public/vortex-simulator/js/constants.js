export const PHYS = {
  // Disc geometry
  R_DISC: 0.15,
  H_DISC: 0.003,
  DISC_OFFSET: 0.12,

  // Magnet
  B_REM: 1.48,
  MAGNET_COUNT: 12,
  MAGNET_W: 0.02,
  MAGNET_H: 0.004,
  MAGNET_D: 0.008,
  MAGNET_RADIUS: 0.12,

  // Coil
  A_COIL: 0.01,
  COIL_RADIUS: 0.08,
  COIL_TUBE: 0.008,

  // Steering
  STEER_RADIUS: 0.22,
  STEER_TUBE: 0.003,

  // Physics
  HV_MAX: 50e3,
  R_LEAKAGE: 1e9,
  RHO_VAC: 1e-9,
  H: 6.626e-34,
  HBAR: 1.054e-34,
  M_E: 9.109e-31,
  A0: 1e-12,
  MU0: 4 * Math.PI * 1e-7,
  ETA: 0.85,
  ALPHA_B: 0.01,
  C_BEARING: 1e-5,
  C_WINDAGE: 1e-8,
  C_MAG: 1e-10,

  // Vortex visual
  VORTEX_CORE_RADIUS: 0.005,
  VORTEX_SEGMENTS: 64,

  // Particle
  PARTICLE_COUNT: 10000,
  PARTICLE_SPAWN_RADIUS: 0.35,
  PARTICLE_SPAWN_HEIGHT: 0.5,
  PARTICLE_LIFETIME: 3.0,
};
