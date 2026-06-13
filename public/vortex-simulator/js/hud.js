import { state } from './physics.js';

export function updateHUD() {
  const fmt = (n, d) => n.toFixed(d);

  document.getElementById('hud-lift').textContent = fmt(state.F_lift, 2) + ' N';
  document.getElementById('hud-power').textContent = fmt(state.P_harvest / 1000, 2) + ' kW';
  document.getElementById('hud-cop').textContent = fmt(state.COP, 2);
  document.getElementById('hud-dp').textContent = fmt(state.deltaP, 1) + ' Pa';
  const actualRPM = Math.round(state.omegaActual * 60 / (2 * Math.PI));
  document.getElementById('hud-rpm').textContent = actualRPM + ' rpm';

  const vortexEl = document.getElementById('hud-vortex');
  if (!state.vortexEstablished) {
    vortexEl.textContent = '—';
    vortexEl.style.color = '#b06040';
  } else {
    const pct = Math.round(state.vortexStability * 100);
    vortexEl.textContent = pct + '%';
    vortexEl.style.color = `hsl(${120 * pct / 100}, 50%, 55%)`;
  }

  // Physics state
  document.getElementById('hud-density').textContent = fmt(state.vacuumDensityEff, 3) + ' kg/m³';
  document.getElementById('hud-circulation').textContent = fmt(state.vortexCirculation, 1) + ' m²/s';
  document.getElementById('hud-gradient').textContent = fmt(state.pressureGradient, 0) + ' Pa/m';

  // Physics coupling metrics
  document.getElementById('hud-param').textContent = fmt(state.parametricGain, 2) + 'x';
  document.getElementById('hud-hv').textContent = fmt(state.hvCoupling, 1);
  document.getElementById('hud-quantum').textContent = fmt(state.quantumCoupling, 2) + 'x';
  const tau = state.heisenbergLifetime;
  document.getElementById('hud-lifetime').textContent = tau > 1e-6
    ? fmt(tau * 1e6, 1) + ' µs'
    : tau > 1e-9
      ? fmt(tau * 1e9, 1) + ' ns'
      : fmt(tau * 1e12, 1) + ' ps';

  // Energy
  const P_in = state.P_motor + state.P_HV;
  document.getElementById('hud-input').textContent = fmt(P_in, 1) + ' W';
  document.getElementById('hud-loss').textContent = fmt(state.P_loss, 1) + ' W';

  const netEl = document.getElementById('hud-net');
  const net = state.netEnergy;
  if (net > 0) {
    netEl.textContent = '+' + fmt(net, 1) + ' W';
    netEl.style.color = '#50b080';
  } else if (net < 0) {
    netEl.textContent = fmt(net, 1) + ' W';
    netEl.style.color = '#c06050';
  } else {
    netEl.textContent = '0.0 W';
    netEl.style.color = '#607080';
  }

  // Energy bar: shows harvested vs input proportion
  const barEl = document.getElementById('hud-bar');
  if (state.P_harvest > 0) {
    const ratio = Math.min(1, P_in / state.P_harvest);
    const pct = Math.round(ratio * 100);
    barEl.style.width = pct + '%';
    if (state.COP > 1) {
      barEl.style.background = 'linear-gradient(90deg, #306050, #50b080)';
    } else {
      barEl.style.background = 'linear-gradient(90deg, #504030, #b08050)';
    }
    // Pulse flash
    if (state.pulseActive) {
      barEl.style.boxShadow = '0 0 8px rgba(80, 200, 180, 0.6)';
    } else {
      barEl.style.boxShadow = 'none';
    }
  } else {
    barEl.style.width = '0%';
  }
}
