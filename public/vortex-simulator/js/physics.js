import { PHYS } from './constants.js';

export const state = {
  RPM: 5000,
  HV_kV: 25,
  coilLoad: 0.5,
  steerX: 0,
  steerY: 0,
  magnetStrength: 1.0,

  omega: 0,
  B_eff: 0,
  deltaP: 0,
  F_lift: 0,
  P_harvest: 0,
  P_motor: 0,
  P_HV: 0,
  P_loss: 0,
  COP: 0,
  vortexEstablished: false,
  vortexStability: 0,
  steerForce: 0,
  dceIntensity: 0,

  backEmf: 0,
  pulseActive: false,
  pulsePhase: 0,
  rpmSmooth: 5000,
};

export function compute() {
  const s = state;
  const p = PHYS;
  const omega = 2 * Math.PI * s.RPM / 60;
  s.omega = omega;

  // Effective magnetic field with HV enhancement
  s.B_eff = s.magnetStrength * p.B_REM * (1 + 0.01 * s.HV_kV / 50);

  // Vortex nucleation threshold
  const omega_crit = p.OMEGA_CRIT * (1 - 0.15 * s.magnetStrength);
  const rawStability = omega > omega_crit ? (omega - omega_crit) / (2 * omega_crit) : 0;
  s.vortexEstablished = omega > omega_crit;
  s.vortexStability = Math.min(1, Math.max(0, rawStability));

  // Vortex dipole coupling term: counter-rotation enhances effective circulation
  const effKappa = p.KAPPA_EFF * (1 + s.vortexStability * 0.5);
  const v_eff = effKappa * omega;
  s.deltaP = 0.5 * p.RHO_EFF * v_eff * v_eff;

  // Lift: pressure + magnetic pressure coupling
  const F_pressure = p.A_DISC * s.deltaP;
  const B2_over_2mu0 = s.B_eff * s.B_eff / (2 * p.MU0);
  const F_mag = p.C_MAG_LIFT * B2_over_2mu0 * p.A_DISC * s.vortexStability;
  s.F_lift = F_pressure + F_mag;

  // Steering deflection (approximate lateral force)
  const steerMag = Math.sqrt(s.steerX * s.steerX + s.steerY * s.steerY);
  s.steerForce = steerMag * s.F_lift * 0.15;

  // Harvested power via DCE in convergent cylindrical geometry
  const convergeGain = p.G_CONV * s.vortexStability;
  const basePower = p.DCE_ETA * p.A_COIL * omega * s.deltaP;
  s.P_harvest = basePower * s.coilLoad * (1 + convergeGain);

  // DCE pulse intensity for visual system
  s.dceIntensity = s.vortexEstablished
    ? (s.coilLoad * s.vortexStability * (1 + convergeGain * 0.1))
    : 0;

  // Back EMF: Lenz's law reaction — energy extraction perturbs the vortex
  const targetBackEmf = s.vortexEstablished
    ? s.coilLoad * Math.min(1, s.P_harvest / 10000)
    : 0;
  s.backEmf += (targetBackEmf - s.backEmf) * 0.08;

  // Smooth RPM for wave animations
  s.rpmSmooth += (s.RPM - s.rpmSmooth) * 0.05;

  // Losses
  const P_bearing = p.C_BEARING * omega;
  const P_windage = p.C_WINDAGE * Math.pow(omega, 2.5);
  const P_mag_drag = p.C_MAG_DRAG * s.B_eff * s.B_eff * Math.pow(omega, 2);
  s.P_loss = P_bearing + P_windage + P_mag_drag;

  // HV supply power
  s.P_HV = (s.HV_kV * 1000) * (s.HV_kV * 1000) / p.R_LEAKAGE;

  // Total input = motor losses (which include the harvested energy extracted as drag)
  // The key insight: in a COP>1 system, the harvested power appears as negative drag
  // Net mechanical power = motor_losses - harvested_extraction_drag
  // But for the COP calculation:
  s.P_motor = s.P_loss;
  const P_in = s.P_motor + s.P_HV;
  s.COP = s.P_harvest > 0 && P_in > 0 ? s.P_harvest / P_in : 0;
}

export function getStatus() {
  const s = state;
  if (s.RPM === 0) return { text: 'OFF', cls: 'status-off' };
  if (!s.vortexEstablished) return { text: 'SPINNING UP...', cls: 'status-warn' };
  if (s.COP > 1) return { text: 'OVER-UNITY', cls: 'status-ok' };
  if (s.COP > 0.5) return { text: 'NEAR BREAKEVEN', cls: 'status-warn' };
  return { text: 'VORTEX ESTABLISHED', cls: 'status-ok' };
}
