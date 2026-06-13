import { PHYS } from './constants.js';

export const state = {
  // Inputs
  RPM: 5000,
  HV_kV: 25,
  coilLoad: 0.5,
  steerX: 0,
  steerY: 0,
  magnetStrength: 1.0,

  // Computed
  omega: 0,
  B_eff: 0,
  deltaP: 0,
  F_lift: 0,
  P_harvest: 0,
  P_motor: 0,
  P_HV: 0,
  COP: 0,
  vortexEstablished: false,
  vortexStability: 0,
};

export function compute() {
  const s = state;
  const omega = 2 * Math.PI * s.RPM / 60;
  s.omega = omega;

  s.B_eff = s.magnetStrength * PHYS.B_REM * (1 + PHYS.ALPHA_B * (s.HV_kV / 50));

  const R = PHYS.R_DISC;
  const omega_crit = (PHYS.H / (PHYS.M_E * R * R)) * Math.log(R / PHYS.A0)
    / (1 + PHYS.ALPHA_B * s.B_eff);

  s.vortexEstablished = omega > omega_crit;
  s.vortexStability = Math.min(1, Math.max(0, (omega - omega_crit) / (omega_crit * 2)));

  s.deltaP = 0.5 * PHYS.RHO_VAC * omega * omega * R * R;
  const A_disc = Math.PI * R * R;
  const M_magnet = PHYS.B_REM / PHYS.MU0;
  s.F_lift = A_disc * s.deltaP + PHYS.MU0 * M_magnet * (s.B_eff / R);

  s.P_harvest = PHYS.ETA * PHYS.A_COIL * omega * s.deltaP * s.coilLoad;

  const P_bearing = PHYS.C_BEARING * omega;
  const P_windage = PHYS.C_WINDAGE * Math.pow(omega, 3);
  const P_mag_drag = PHYS.C_MAG * s.B_eff * s.B_eff * omega;
  s.P_motor = P_bearing + P_windage + P_mag_drag;

  s.P_HV = (s.HV_kV * 1000) * (s.HV_kV * 1000) / PHYS.R_LEAKAGE;

  const P_in = s.P_motor + s.P_HV;
  s.COP = (s.P_harvest > 0 && P_in > 0) ? s.P_harvest / P_in : 0;
}

export function getStatus() {
  const s = state;
  if (s.RPM === 0) return { text: 'OFF', cls: 'status-off' };
  if (!s.vortexEstablished) return { text: 'SPINNING UP...', cls: 'status-warn' };
  if (s.COP > 1) return { text: 'SELF-SUSTAINING', cls: 'status-ok' };
  if (s.COP > 0.5) return { text: 'NEAR BREAKEVEN', cls: 'status-warn' };
  return { text: 'ESTABLISHED', cls: 'status-ok' };
}
