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
  v_eff: 0,
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
  pulseSnap: 0,
  rpmSmooth: 5000,
  timeScale: 1,

  vacuumDensityEff: 0,
  vortexCirculation: 0,
  pressureGradient: 0,
  pulseEnergyRelease: 0,
  netEnergy: 0,
  parametricGain: 1,
  hvPhaseFactor: 1,
  hvCoupling: 0,

  // GAN switching state
  ganGenerator: 0,
  ganDiscriminator: 0,
  ganPulseActive: false,
  ganPhase: 0,
  ganSlot: 0,
  ganTransition: 0,

  // discriminator membrane effect
  ganMembraneStress: 0,
  ganMembraneFlash: 0,
};

export function compute() {
  const s = state;
  const p = PHYS;
  const omega = 2 * Math.PI * s.RPM / 60;
  s.omega = omega;

  s.B_eff = s.magnetStrength * p.B_REM * (1 + 0.01 * s.HV_kV / 50);

  // --- RESEARCH FIX 1: HV phase winding of vacuum wavefunction ---
  // The rotating E-field from the charged disc winds the vacuum quantum
  // phase by Δφ = (q/ħ)∮E·v·dt = 2πn, directly nucleating vorticity.
  // HV is the PRIMARY coupling, not a minor B-field boost.
  const hvPhaseFactor = Math.max(0.4, 1 - 0.012 * s.HV_kV);
  s.hvPhaseFactor = hvPhaseFactor;

  // Vortex nucleation threshold: HV phase winding + magnet bias
  const omega_crit = p.OMEGA_CRIT * hvPhaseFactor * (1 - 0.15 * s.magnetStrength);
  const rawStability = omega > omega_crit ? (omega - omega_crit) / (2 * omega_crit) : 0;
  s.vortexEstablished = omega > omega_crit;
  s.vortexStability = Math.min(1, Math.max(0, rawStability));

  // Effective circulation: counter-rotating discs amplify the vortex
  const effKappa = p.KAPPA_EFF * (1 + s.vortexStability * 0.5);
  s.vortexCirculation = effKappa * omega;

  // --- RESEARCH FIX 2: HV enhances vacuum density coupling ---
  // Higher electric fields increase the interaction cross-section with
  // the vacuum's quantum phase, effectively raising ρ_eff.
  const hvDensityBoost = 1 + 0.3 * (s.HV_kV / 50) * (0.5 + s.vortexStability * 0.5);
  s.hvCoupling = (hvDensityBoost - 1) * 3.33;
  s.vacuumDensityEff = p.RHO_EFF * (1 + s.vortexStability * 0.5) * hvDensityBoost;

  // Pressure drop from Bernoulli in the superfluid: ΔP = ½ρv²
  s.v_eff = s.vortexCirculation;
  s.deltaP = 0.5 * s.vacuumDensityEff * s.v_eff * s.v_eff;

  // Pressure gradient driving the flow (ΔP / disc radius)
  s.pressureGradient = s.deltaP / p.R_DISC;

  // Lift: pressure area + magnetic pressure coupling
  const F_pressure = p.A_DISC * s.deltaP;
  const B2_over_2mu0 = s.B_eff * s.B_eff / (2 * p.MU0);
  const F_mag = p.C_MAG_LIFT * B2_over_2mu0 * p.A_DISC * s.vortexStability;
  s.F_lift = F_pressure + F_mag;

  // Steering
  const steerMag = Math.sqrt(s.steerX * s.steerX + s.steerY * s.steerY);
  s.steerForce = steerMag * s.F_lift * 0.15;

  // Harvest: P = η · A_coil · ω · ΔP · (1 + G_conv · stability)
  // This is the key ω³ scaling: ΔP ∝ ω², times ω gives ω³
  const convergeGain = p.G_CONV * s.vortexStability;
  const basePower = p.DCE_ETA * p.A_COIL * omega * s.deltaP;
  const P_harvest_raw = basePower * s.coilLoad * (1 + convergeGain);

  // --- RESEARCH FIX 3: Parametric resonance amplification ---
  // Counter-rotating discs naturally modulate the B-field at 2× rotation
  // frequency, creating parametric pumping of the vacuum oscillator.
  // Mathieu equation: G = exp(πε/2) per cycle, sustained over ω·t/2π cycles.
  const modDepth = s.magnetStrength * s.vortexStability * s.coilLoad;
  const cycles = Math.min(50, omega / (2 * Math.PI) * 0.05);
  const paramGainPerCycle = Math.exp(Math.PI * modDepth / 2);
  const paramRaw = 1 + (paramGainPerCycle - 1) * (s.omega / p.OMEGA_CRIT) * 0.01 * cycles;
  s.parametricGain = Math.min(p.PARAM_GAIN_MAX, Math.max(1, paramRaw));

  // DCE pulse injects a burst of energy from vacuum — appears as harvest spike
  const pulseBoost = 1 + s.pulseEnergyRelease * 0.001;
  s.P_harvest = P_harvest_raw * pulseBoost * s.parametricGain;

  // DCE intensity for triggering pulses — HV boosts quantum vacuum coupling
  s.dceIntensity = s.vortexEstablished
    ? (s.coilLoad * s.vortexStability * (1 + convergeGain * 0.1)) * (1 + 0.5 * s.HV_kV / 50)
    : 0;

  // Pulse energy decays
  s.pulseEnergyRelease *= 0.92;

  // Back EMF from Lenz's law
  const targetBackEmf = s.vortexEstablished
    ? s.coilLoad * Math.min(1, s.P_harvest / 10000)
    : 0;
  s.backEmf += (targetBackEmf - s.backEmf) * 0.08;

  s.rpmSmooth += (s.RPM - s.rpmSmooth) * 0.05;

  // Losses
  const P_bearing = p.C_BEARING * omega;
  const P_windage = p.C_WINDAGE * omega * omega * omega;
  const P_mag_drag = p.C_MAG_DRAG * s.B_eff * s.B_eff * Math.pow(omega, 2);
  s.P_loss = P_bearing + P_windage + P_mag_drag;

  // HV supply
  s.P_HV = (s.HV_kV * 1000) * (s.HV_kV * 1000) / p.R_LEAKAGE;

  // Motor input = losses (bearing + windage + magnetic drag)
  s.P_motor = s.P_loss;
  const P_in = s.P_motor + s.P_HV;
  s.COP = s.P_harvest > 0 && P_in > 0 ? s.P_harvest / P_in : 0;
  s.netEnergy = s.P_harvest - P_in;
}

export function getStatus() {
  const s = state;
  if (s.RPM === 0) return { text: 'OFF', cls: 'status-off' };
  if (!s.vortexEstablished) return { text: 'SPINNING UP...', cls: 'status-warn' };
  if (s.COP > 1) return { text: 'OVER-UNITY', cls: 'status-ok' };
  if (s.COP > 0.5) return { text: 'NEAR BREAKEVEN', cls: 'status-warn' };
  return { text: 'VORTEX ESTABLISHED', cls: 'status-ok' };
}
