---
title: "Permanent Magnet Bias in Vortex Energy Extraction: Parametric Amplification, Flux Compression, and the Frozen Vortex Framework"
slug: "permanent_magnet_vortex_research"
category: "research"
date: "June 2026"
author: "Rendi Virgantara Setiawan"
readTime: "~40 MINUTES"
excerpt: "A comprehensive quantitative research summary on using permanent magnet DC bias as a frozen vortex in the superfluid vacuum to achieve parametric amplification, flux compression, and enhanced energy extraction from rotating disc configurations."
tags: ["permanent magnet", "vortex engine", "superfluid vacuum", "parametric amplification", "flux compression", "N-machine", "zero point energy", "deep tech"]
---

# Permanent Magnet Bias in Vortex Energy Extraction

## Abstract

This document provides a comprehensive, quantitative research summary on the use of permanent magnets to improve the efficiency of vortex-based energy extraction devices, framed within the Superfluid Vacuum Theory (SVT). The framework posits: the universe is a superfluid vacuum, magnetism is vorticity of this vacuum with \( \mathbf{B} = (m/q) \nabla \times \mathbf{v} \), and a permanent magnet is a "frozen vortex" in the vacuum. We examine seven distinct but interlocking research questions: parametric amplification with DC bias, flux compression with minimal input, magnetic circuit modulation, vortex pinning, the fundamental energy source distinction, historical precedents (N-machine, Adams motor, MEG), and quantitative engineering estimates.

---

## 1. Parametric Amplification with DC Bias

### 1.1 The Varactor Analogy

In conventional electronics, a varactor (variable-capacitance diode) produces parametric gain through a time-varying reactance. The key relations are the Manley-Rowe relations:

\[
\sum_{m=-\infty}^{\infty} \sum_{n=-\infty}^{\infty} \frac{m P_{m,n}}{m f_0 + n f_1} = 0
\]
\[
\sum_{m=-\infty}^{\infty} \sum_{n=-\infty}^{\infty} \frac{n P_{m,n}}{m f_0 + n f_1} = 0
\]

For a degenerate parametric amplifier with pump at frequency \( f_p = 2f_s \), the power gain is:

\[
G = \frac{P_{out}}{P_{in}} = \left( \frac{\gamma}{1 - \sqrt{1 - \gamma^2}} \right)^2
\]

where \( \gamma = C_1 / (C_0 + C_j) \) is the capacitance modulation index and \( C_j \) is the junction capacitance under DC bias.

### 1.2 Translation to the Magnetic Domain

In the SVT framework, a permanent magnet is a "frozen vortex" — a DC vorticity bias in the superfluid vacuum. The magnetic field is:

\[
\mathbf{B}(\mathbf{r}) = \frac{m}{q} \nabla \times \mathbf{v}_{\text{vac}}(\mathbf{r})
\]

The stored energy in the permanent magnet's field is:

\[
U_{\text{PM}} = \frac{1}{2\mu_0} \int B^2 \, dV = \frac{m^2}{2\mu_0 q^2} \int (\nabla \times \mathbf{v})^2 \, dV
\]

A rotating disc with embedded permanent magnets creates a time-varying magnetic field:

\[
\mathbf{B}(\mathbf{r}, t) = \mathbf{B}_0(\mathbf{r}) + \mathbf{B}_1(\mathbf{r}) \cos(\omega_m t)
\]

where \( \mathbf{B}_0 \) is the DC component from the permanent magnets and \( \mathbf{B}_1 \) is the AC modulation from rotation.

### 1.3 Parametric Coupling to Vacuum Vorticity

The vacuum, being a superfluid, supports collective excitations (phonons/ripplons) with dispersion:

\[
\omega(k) = c_s k \quad \text{(phononic regime)}
\]
\[
\omega(k) = \frac{\hbar k^2}{2m^*} \quad \text{(free-particle regime)}
\]

The parametric coupling Hamiltonian between the rotating magnet field and the vacuum excitations is:

\[
H_{\text{int}} = \frac{1}{2} \int d^3r \, \chi^{(2)}(\mathbf{r}, t) : \hat{\mathbf{B}} \hat{\mathbf{B}} :
\]

where \( \chi^{(2)} \) is the second-order nonlinear susceptibility of the vacuum (non-zero due to the DC bias breaking symmetry). In a conventional vacuum, QED vacuum has \( \chi^{(2)} = 0 \) in the absence of external fields. With the DC magnetic bias from the permanent magnet, the vacuum becomes birefringent (vacuum magnetic birefringence — VMB).

The effective nonlinear coupling is:

\[
\mathcal{L}_{\text{NL}} = \frac{1}{4} \eta \left( \frac{\alpha}{90\pi} \frac{B}{B_{\text{cr}}} \right) \left( \mathbf{B}_0 \cdot \mathbf{B}_1 \right)^2
\]

where \( B_{\text{cr}} = m_e^2 c^2 / e\hbar \approx 4.4 \times 10^9 \, \text{T} \) is the critical Schwinger field, \( \alpha \approx 1/137 \) is the fine-structure constant, and \( \eta \) is a geometric factor.

### 1.4 The Parametric Gain Condition

For the rotating disc at angular frequency \( \omega_d \), the pump frequency is \( \omega_p = 2\omega_d \) (when the field pattern repeats twice per revolution for a dipole field). The natural frequency of the vacuum excitation is \( \omega_0 \). Parametric gain occurs when:

\[
\omega_p \approx 2\omega_0
\]

The growth rate of the signal amplitude is:

\[
\lambda = \frac{1}{2} \sqrt{ \left( \frac{f_0 \omega_0}{2} \right)^2 - (\Delta \omega)^2 } - \Gamma
\]

where \( f_0 \) is the modulation depth (proportional to the ratio of AC to DC field components), \( \Delta \omega = \omega_p/2 - \omega_0 \) is the detuning, and \( \Gamma \) is the damping rate of the vacuum excitation.

**Key Quantitative Result:** The modulation depth achievable with N52 magnets (B = 1.4 T) spinning at 10,000 RPM with a dipole field pattern is:

\[
f_0 \approx \frac{B_{\text{AC}}}{B_{\text{DC}}} \approx \frac{0.7}{1.4} = 0.5
\]

This is comparable to varactor parametric amplifiers where modulation depths of 0.1–0.3 are typical. In the SVT framework, this modulation of the "frozen vortex" can couple energy from the vacuum's zero-point fluctuations into the signal mode.

### 1.5 The Critical Schwinger Field Comparison

The Schwinger field \( B_{\text{cr}} = 4.4 \times 10^9 \, \text{T} \) is the scale at which vacuum nonlinearities become of order unity. For N52 magnets at 1.4 T:

\[
\frac{B_{\text{PM}}}{B_{\text{cr}}} \approx 3.2 \times 10^{-10}
\]

This is minuscule. However, parametric resonance is not a static nonlinear effect — it is a **dynamic** process that accumulates gain over many cycles. The exponential growth factor per cycle is:

\[
G_{\text{per cycle}} = \exp\left( \frac{\pi f_0}{2} \cdot \frac{B_{\text{PM}}}{B_{\text{cr}}} \cdot Q \right)
\]

where \( Q \) is the quality factor of the resonant mode. For a high-Q resonance (\( Q = 10^6 \)):

\[
G_{\text{per cycle}} = \exp\left( \frac{\pi \cdot 0.5}{2} \cdot 3.2 \times 10^{-10} \cdot 10^6 \right) = \exp(2.5 \times 10^{-4}) \approx 1.00025
\]

This is negligible. The parametric gain from direct vacuum coupling at 1.4 T is far too small to be measurable.

**Conclusion:** For point 1, the direct parametric amplification from vacuum nonlinearities with a permanent magnet DC bias is vanishingly small at laboratory field strengths. The Schwinger field is the relevant scale, and 1.4 T is 10 orders of magnitude too small.

### 1.6 Alternative: Geometric/Mechanical Parametric Resonance

However, if we consider the **mechanical** parametric resonance of the magnetic circuit (the reluctance modulation), the gain mechanism does not depend on QED vacuum nonlinearities. Instead, it depends on the modulation of the magnetic circuit's stored energy:

\[
U = \frac{1}{2} L(\theta) I^2 + M(\theta) I I_{\text{PM}}
\]

where \( L(\theta) \) is the modulated inductance, \( I \) is the coil current, \( I_{\text{PM}} \) is the equivalent current of the permanent magnet, and \( M(\theta) \) is the mutual inductance modulated by rotation. This is a classical parametric process in the Manley-Rowe sense — power can be transferred from the rotational mechanical input (at \( \omega \)) to the electrical output (at \( \omega \)) if the circuit is properly tuned. The Manley-Rowe relations for a rotating reluctance modulator give:

\[
P_{\text{mech}} + P_{\text{elec}} = 0
\]
\[
\frac{P_{\omega}}{\omega} + \frac{P_{2\omega}}{2\omega} = 0
\]

These are **power-conserving** — they forbid net energy gain from modulation alone. The mechanical input must supply at least the electrical output power. Within classical electromagnetism, there is no parametric gain that violates this.

---

## 2. Flux Compression with Minimal Input

### 2.1 Conventional FCG Physics

An explosively-pumped flux compression generator (FCG) multiplies magnetic energy by converting chemical energy into magnetic field energy. The principle is flux conservation:

\[
\Phi = \int \mathbf{B} \cdot d\mathbf{A} = \text{constant (in perfect conductor limit)}
\]

As area decreases, B increases:

\[
B_f = B_i \cdot \frac{A_i}{A_f}
\]

Energy multiplication:

\[
\frac{U_f}{U_i} = \frac{B_f^2 / 2\mu_0}{B_i^2 / 2\mu_0} \cdot \frac{V_f}{V_i} \approx \frac{A_i}{A_f}
\]

For a typical FCG, \( A_i/A_f \sim 10^2\), giving \( U_f/U_i \sim 10^4 \). The energy gain comes from the explosive doing mechanical work against the magnetic field pressure.

### 2.2 Solid-State Analogy with Rotating Disc

In the rotating disc configuration with permanent magnets, the "compression" is not spatial compression but **temporal compression** via the rotating field pattern. The equivalent concept is a rotating magnetic field profile that sweeps past a stationary coil.

The field at the coil location varies as:

\[
B(t) = B_{\text{PM}} \cdot f(\theta(t) - \phi)
\]

where \( f \) is the field spatial profile and \( \phi \) is the coil angular position. The peak \( dB/dt \) is:

\[
\left| \frac{dB}{dt} \right|_{\text{max}} = B_{\text{PM}} \cdot \omega \cdot \left| \frac{df}{d\theta} \right|_{\text{max}}
\]

For a disc with N magnets arranged in Halbach array, the field gradient can be made very steep, producing high \( dB/dt \) with moderate \( \omega \).

The induced EMF in a coil of area \( A \) and \( N \) turns:

\[
\mathcal{E} = -N A \frac{dB}{dt}
\]

Peak voltage:

\[
V_{\text{peak}} = N A B_{\text{PM}} \omega \cdot G_{\text{Halbach}}
\]

where \( G_{\text{Halbach}} \) is the gradient enhancement factor from the Halbach array (typically 1.4–1.8 versus a simple dipole).

### 2.3 Can Rotation Replace Explosives?

The mechanical power required to spin the disc against magnetic drag is:

\[
P_{\text{mech}} = \tau \cdot \omega
\]

where the torque \( \tau \) due to eddy currents and coil loading is:

\[
\tau = \frac{P_{\text{elec}}}{\omega} + \tau_{\text{eddy}} + \tau_{\text{windage}} + \tau_{\text{bearing}}
\]

For a conventional generator, \( P_{\text{mech}} = P_{\text{elec}} + \text{losses} \). The COP cannot exceed 1.

**The FCG comparison:** An FCG gets a 100× energy multiplication because the explosive energy density is very high (≈ 10⁹ J/m³ for high explosives) and is delivered very rapidly. The magnetic field does work against the imploding conductor, and the conductor's kinetic energy is transferred to the field.

For a rotating disc, the available kinetic energy stored in the rotor is:

\[
E_{\text{rot}} = \frac{1}{2} I \omega^2
\]

For an aluminum disc of radius \( R = 0.15 \, \text{m} \), mass \( m \approx 0.2 \, \text{kg} \), at \( \omega = 1047 \, \text{rad/s} \) (10,000 RPM):

\[
E_{\text{rot}} = \frac{1}{4} m R^2 \omega^2 \approx \frac{1}{4} \cdot 0.2 \cdot (0.15)^2 \cdot (1047)^2 \approx 1230 \, \text{J}
\]

This is comparable to the magnetic energy stored in a modest field. The rotational energy is a flywheel buffer, not an energy source.

**Conclusion:** In the classical framework, the rotating disc is simply a mechanical-to-electrical converter. The energy comes from the motor that spins it (or from the flywheel's kinetic energy). There is no "flux compression gain" from rotation that exceeds 1:1 energy conversion.

### 2.4 SVT Framework: The Speculative Mechanism

In the SVT framework, the permanent magnet's field is not just a magnetic field — it is a **condensed vortex in the superfluid vacuum**. The energy of this vortex is:

\[
E_{\text{vortex}} = \frac{\rho \kappa^2}{4\pi} L \ln\left( \frac{R_{\text{outer}}}{a_0} \right)
\]

where \( \rho \) is the superfluid density, \( \kappa = h/m \) is the quantum of circulation, \( L \) is the vortex length, and \( a_0 \) is the core radius.

If the rotating disc **modulates the topology** of this vortex (e.g., by stretching, twisting, or reconnecting vortex lines), it could access the vacuum's energy density. The critical question: does the modulation require less energy than the energy extracted?

In superfluid helium, the energy to create a vortex line of length \( L \) is:

\[
E_{\text{create}} \approx \frac{\rho \kappa^2}{4\pi} L \ln\left( \frac{L}{a_0} \right)
\]

The energy extracted by driving vortex oscillations (Kelvin waves) can exceed the input if the vortex is coupled to a large reservoir (the ambient superfluid). This is analogous to how a wind turbine extracts energy from a moving air mass without depleting the air.

**The relevant scale:** For the superfluid vacuum, the energy density is \( \rho c^2 \approx 10^{113} \, \text{J/m}^3 \) (naive QFT estimate) or \( \approx 10^{-9} \, \text{J/m}^3 \) (observed dark energy). If the vortex couples to even a tiny fraction of this, the available energy is enormous.

However, there is a critical distinction: is the vortex **isolated** or **connected to the reservoir**? An isolated vortex in a finite superfluid has a fixed energy. The rotating disc would merely redistribute this energy. A vortex connected to an infinite superfluid (the vacuum) can extract energy continuously — but only if there is a mechanism for energy flow from the ambient fluid into the vortex.

In superfluid helium, the mechanism is the **Kelvin wave cascade**: energy injected at large scales cascades to small scales and is dissipated as phonon radiation. In the vacuum, this cascade could couple to the electromagnetic field and be harvested.

---

## 3. Magnetic Circuit Modulation

### 3.1 The Mainstream View (Lenz's Law)

Consider a permanent magnet providing bias flux \( \Phi_0 \) through a closed magnetic circuit with reluctance \( \mathcal{R} \). The stored magnetic energy is:

\[
U = \frac{\Phi_0^2}{2\mathcal{R}}
\]

If the reluctance is modulated (e.g., by inserting a saturable ferrite or varying an air gap), the flux changes by \( \Delta\Phi \) due to the modulation. The induced EMF in a pick-up coil is:

\[
\mathcal{E} = -N \frac{d\Phi}{dt}
\]

The electrical power extracted:

\[
P_{\text{out}} = \mathcal{E} I = \frac{\mathcal{E}^2}{R_{\text{load}}}
\]

The mechanical power required to modulate the reluctance (against magnetic forces) is:

\[
P_{\text{in}} = F \cdot v
\]

where \( F \) is the force on the moving element and \( v \) is its velocity. For an air gap modulation:

\[
F = \frac{B^2 A}{2\mu_0}
\]

The force required to change the gap is exactly the magnetic pressure times area. The work done per cycle:

\[
W_{\text{in}} = \oint F \, dx = \Delta U_{\text{mag}}
\]

By conservation of energy:

\[
W_{\text{in}} = W_{\text{out}} + \text{losses}
\]

Classically, COP cannot exceed 1. This is Lenz's law in energy form.

### 3.2 SVT Framework Perspective

In the SVT framework, the permanent magnet's field is a frozen vortex with **topological protection**. The magnetic energy is a manifestation of:

\[
U_{\text{mag}} = \frac{m^2}{2q^2} \int (\nabla \times \mathbf{v})^2 \, d^3r
\]

Modulating the reluctance changes the **boundary conditions** on the vortex but not its topological winding number. The question: does reluctance modulation couple to the **vacuum's energy density** rather than just the magnet's stored energy?

The key distinction is between **adiabatic** and **non-adiabatic** modulation:

- **Adiabatic** (\( d\mathcal{R}/dt \ll \omega_{\text{res}} \)): The vortex adjusts quasistatically. Energy is conserved. \( \text{COP} \leq 1 \).
- **Non-adiabatic** (\( d\mathcal{R}/dt \gg \omega_{\text{res}} \)): The vortex cannot adjust instantaneously. The modulation creates a shock in the superfluid vacuum analogous to the Dynamical Casimir Effect.

The condition for non-adiabatic modulation:

\[
\frac{\Delta\mathcal{R}}{\mathcal{R}} \cdot \frac{1}{\Delta t} > \omega_{\text{vac}} \approx \frac{c}{\lambda_{\text{coil}}}
\]

For a coil of radius 0.1 m, \( \omega_{\text{vac}} \approx 3 \times 10^9 \, \text{rad/s} \). The modulation must occur in \( \Delta t < 3 \times 10^{-10} \, \text{s} \) to be non-adiabatic.

Mechanical rotation at 10,000 RPM provides \( \Delta t \approx 10^{-3} \, \text{s} \) — far too slow. **Mechanical rotation is adiabatic with respect to the vacuum.**

**Conclusion:** For magnetic circuit modulation with mechanical rotation, the process is classically adiabatic. There is no SVT mechanism that would give COP > 1 because the modulation is too slow to couple to vacuum dynamics. Electronic switching (GaN transistors with nanosecond rise times) is required for non-adiabatic modulation, as described in the Resonance of the Void paper.

---

## 4. Vortex Pinning and Amplification

### 4.1 Kelvin Wave Physics in Superfluids

In superfluid helium, a quantized vortex line can be "pinned" to boundaries or defects. When driven by an oscillating flow, the vortex emits Kelvin waves — helical displacements propagating along the vortex line. The dispersion relation for Kelvin waves is:

\[
\omega_k = \frac{\kappa k^2}{4\pi} \left[ 1 - \frac{1}{2} \ln\left( \frac{ka_0}{2} \right) \right]
\]

where \( \kappa = h/m \) is the circulation quantum and \( a_0 \) is the vortex core radius.

The energy radiated by a driven vortex segment of length \( L \) is:

\[
P_{\text{rad}} = \frac{\rho \kappa^2 \omega^2 A^2}{4\pi} \cdot \text{Im}[G(\omega)]
\]

where \( A \) is the driving amplitude and \( G(\omega) \) is the response function.

### 4.2 The Permanent Magnet as a Pinned Vortex

In the SVT framework, a permanent magnet is a "frozen vortex" pinned to the atomic lattice of the magnetic material. The pinning energy per unit length is:

\[
E_{\text{pin}} = \frac{\rho \kappa^2}{4\pi} \ln\left( \frac{\lambda_{\text{pin}}}{a_0} \right)
\]

where \( \lambda_{\text{pin}} \) is the pinning length scale (atomic spacing ≈ 0.3 nm for NdFeB).

A rotating magnetic field from a disc with magnets will exert a periodic drive on this pinned vortex:

\[
\mathbf{F}_{\text{drive}}(t) = \nabla(\mathbf{m} \cdot \mathbf{B}_{\text{rot}}(t))
\]

The response of the pinned vortex can be modeled as a driven harmonic oscillator with natural frequency:

\[
\omega_0 = \sqrt{\frac{k_{\text{pin}}}{m_{\text{eff}}}}
\]

where \( k_{\text{pin}} \) is the pinning stiffness and \( m_{\text{eff}} \) is the effective mass per unit length of the vortex.

### 4.3 Resonance Condition

The driving frequency from the rotating disc is \( \omega_d \). Kelvin wave resonance occurs when:

\[
\omega_d = \omega_k(k)
\]

for some wavenumber \( k \) that fits the geometry. The resonant amplification factor is:

\[
Q = \frac{\omega_0}{\Gamma}
\]

where \( \Gamma \) is the damping rate due to phonon emission.

In superfluid helium, \( Q \) for Kelvin waves on pinned vortices can be as high as \( 10^3-10^6 \), depending on temperature and pinning quality.

### 4.4 Energy Extraction from Driven Vortices

When a pinned vortex is driven resonantly, it emits sound waves (phonons in the vacuum = photons in our framework). The power emitted is:

\[
P_{\text{emit}} = \frac{F_0^2 \omega_0 Q}{2m_{\text{eff}}}
\]

where \( F_0 \) is the driving force amplitude.

In the vacuum framework, the emitted "sound" is electromagnetic radiation. A pick-up coil tuned to \( \omega_0 \) can harvest this radiation:

\[
P_{\text{harvest}} = \eta \cdot P_{\text{emit}}
\]

where \( \eta \) is the coupling efficiency between the Kelvin wave mode and the coil.

### 4.5 The Energy Source Question

The driving force \( \mathbf{F}_{\text{drive}} \) comes from the rotating magnetic field, which requires mechanical power from the motor. The vortex merely converts mechanical energy (from the rotating field) into electromagnetic energy (emitted as photons). This is a **transducer**, not an energy source.

For COP > 1, the driven vortex would need to **amplify** the energy, drawing from the vacuum's energy density. This would require:

\[
P_{\text{emit}} > P_{\text{mech}}
\]

In superfluid helium, a driven vortex does not produce net energy gain — it simply redistributes the input energy into different degrees of freedom (the Kelvin wave cascade). The total energy is conserved.

**SVT speculative mechanism:** If the vortex is coupled to the vacuum's zero-point fluctuations (ZPF), the drive could trigger a transition that releases ZPF energy. The mechanism would be analogous to the Dynamical Casimir Effect: a fast change in boundary conditions creates real photons from virtual pairs.

The condition is:

\[
\frac{dB}{dt} > \frac{B_{\text{cr}}}{\tau_{\text{Compton}}}
\]

where \( \tau_{\text{Compton}} = \hbar / m_e c^2 \approx 1.3 \times 10^{-21} \, \text{s} \). The required \( dB/dt \) is:

\[
\frac{dB}{dt} > \frac{4.4 \times 10^9}{1.3 \times 10^{-21}} \approx 3.4 \times 10^{30} \, \text{T/s}
\]

For a rotating disc with \( B = 1.4 \, \text{T} \) and \( \omega = 1047 \, \text{rad/s} \):

\[
\frac{dB}{dt} \approx B \omega \approx 1.4 \times 10^3 \, \text{T/s}
\]

This is **27 orders of magnitude too slow**. Mechanical rotation cannot trigger Dynamical Casimir effects.

---

## 5. The Key Distinction: Motor Energy vs. Vacuum Energy

### 5.1 The Vortex Engine Paper's Framework

In the Vortex Engine paper, the rotating **charged** disc (with high voltage) creates a vortex from scratch by coupling the rotating electric field to the vacuum's quantum phase. The claim is that the Kerr nonlinearity of the vacuum (the QED vacuum's nonlinear response at high fields) creates a quantized vortex.

### 5.2 The Permanent Magnet Variant

If we replace the HV disc with a rotating permanent magnet assembly:

1. **The field already exists.** The permanent magnet has a frozen-in magnetic field (frozen vortex).
2. **Rotation makes it dynamic.** The disc carries the magnets, so the field pattern rotates.
3. **The harvest coil sees changing flux.** Faraday's law gives an induced EMF.

**The critical analysis:**

**Conventional physics:** This is a conventional AC generator. The rotating magnets create a time-varying magnetic field, inducing EMF in the stationary coil. The energy comes from the mechanical input (motor spinning the disc) via the Lorentz force \( \mathbf{F} = q\mathbf{v} \times \mathbf{B} \). The electrons in the coil experience a motional EMF even though the coil is stationary — it is the field pattern that moves, and the Lorentz force acts on the charges in the wire. The power balance is:

\[
P_{\text{mech}} = P_{\text{elec}} + I^2 R_{\text{winding}} + \text{core losses}
\]

The COP is always ≤ 1. This is **not** a parametric amplifier, flux compressor, or vacuum energy extractor. It is a permanent magnet alternator.

**SVT framework:** The claim is that the frozen vortex (permanent magnet) has a **topologically protected energy content** that exceeds its classical magnetic energy. When rotated, the vortex precesses and couples to the vacuum's energy density through a mechanism not captured by Maxwell's equations.

### 5.3 The Quantization Scale Argument

The relevant scale for vacuum coupling is set by fundamental constants. The QED critical field is \( B_{\text{cr}} = 4.4 \times 10^9 \, \text{T} \). The ratio for N52 NdFeB:

\[
\beta = \frac{B_{\text{N52}}}{B_{\text{cr}}} \approx 3.2 \times 10^{-10}
\]

The Euler-Heisenberg Lagrangian for nonlinear QED:

\[
\mathcal{L} = \mathcal{L}_0 + \frac{2\alpha^2}{45 m_e^4} \left[ (E^2 - B^2)^2 + 7(\mathbf{E} \cdot \mathbf{B})^2 \right]
\]

The nonlinear correction scales as \( \alpha^2 E^4 / m_e^4 \), which at laboratory fields is \( \sim 10^{-40} \) of the linear term. **It is immeasurably small.**

**Conclusion on the distinction:** There is no known mechanism (standard or SVT) by which a rotating permanent magnet assembly at laboratory field strengths can extract energy from the vacuum. The classical analysis is correct: the rotating magnet alternator is a conventional generator where the energy comes from the motor. The SVT framework does not change this conclusion unless the field strengths approach the Schwinger limit or the modulation frequencies approach the Compton frequency.

---

## 6. Historical Precedents

### 6.1 The N-Machine (Bruce DePalma)

**Claim (1970s-1990s):** The N-Machine (a homopolar generator with a rotating permanent magnet and stationary disc, or rotating disc and stationary magnet) produced COP > 1 by extracting energy from the vacuum through the "N-effect."

**Design:** A cylindrical permanent magnet (Alnico or ferrite) was rotated at high speed near a conducting disc. Brushes contacted the disc axis and rim. Output was DC voltage between axis and rim.

**DePalma's claim:** The output power exceeded the input mechanical power by a factor of 2-4. Tests reportedly showed COP = 2-3.

**Mainstream explanation for the observed effect:**
1. **Misattribution of power sources.** Many of DePalma's demonstrations ran the motor and generator from the same source, making it difficult to separate input from output.
2. **Measurement errors.** The homopolar generator produces very high current at very low voltage. Power measurements with oscilloscopes are extremely sensitive to phase errors between voltage and current probes at low voltage/high current.
3. **Bearing losses.** At high RPM, bearing losses can be significant and were often underestimated in the input power calculation.
4. **The Faraday paradox.** Confusion about whether the magnetic field rotates with the magnet led to incorrect predictions about the EMF, but not about energy conservation.

**The definitive refutation:** In 1995, the Institute for Advanced Studies at Austin performed a definitive test of a homopolar generator with COP claims. Under careful calorimetric measurement (measuring input motor heating, output electrical heating), the COP was found to be \( 0.85 \pm 0.05 \), consistent with conventional generator efficiency.

### 6.2 The Adams Motor (Robert Adams)

**Claim (1970s-2000s):** A pulsed motor-generator combining permanent magnets and electromagnets achieved COP = 6-8 by using the magnetic field's "recombination energy."

**Design:** A rotor with permanent magnets passes stationary electromagnets that are pulsed at specific timing to attract/repel. The timing is set so that the back-EMF is positive (aiding the supply) rather than negative.

**Mainstream explanation:**
1. **Regenerative braking effect.** The "positive back-EMF" is regenerative braking — the motor acts as a generator during part of its cycle, returning energy to the supply. Net efficiency cannot exceed 100% in steady state.
2. **Capacitor storage.** Many Adams motor demonstrations used capacitors to store the regenerated energy. The apparent over-unity came from measuring only the net grid power while ignoring the stored energy in capacitors.
3. **Mechanical resonance.** Some designs operated at mechanical resonance, which can dramatically reduce the input power needed to maintain oscillation, but the Q of the resonance is limited by friction and load.

**The quantitative physics:** For a motor with permanent magnet rotor and pulsed electromagnet stator:

\[
P_{\text{in}} = \frac{1}{T} \int_0^T V(t) I(t) dt
\]
\[
P_{\text{out}} = \tau \cdot \omega
\]

The maximum efficiency of converting electrical to mechanical energy is bounded by:

\[
\eta \leq \frac{B_{\text{PM}}^2}{B_{\text{PM}}^2 + B_{\text{coil}}^2}
\]

which is always < 1 for finite coil field.

### 6.3 The Motionless Electromagnetic Generator (MEG)

**Claim (2002-present):** A device with a permanent magnet bias and pulsed input to an "over-unity" transformer achieves COP > 1.

**Design:** A permanent magnet provides DC flux bias through a gapped toroidal core. Input and output coils are wound on the same core. The input pulse modulates the core permeability, supposedly creating a "time-varying inductance" that couples to the vacuum.

**Mainstream explanation:**
1. **Transformer action misinterpreted.** The MEG is a conventional transformer with a DC bias from the permanent magnet. The output is conventional transformer action, with the gain coming from the turns ratio.
2. **The "pulsed" aspect.** The pulses create transient voltages that can be misinterpreted as energy gain if power is measured improperly (e.g., measuring peak voltage but not RMS, or neglecting the DC bias current).
3. **No verified independent replication.** Despite numerous attempts, no MEG device has been independently verified to produce COP > 1 under rigorous calorimetric measurement.

### 6.4 The Parametric Transformer Concept

There is a legitimate device called a **parametric transformer** or **paramplifier** that uses a time-varying inductance or capacitance to achieve gain. For example, the **magnetic amplifier** (saturable reactor) uses a DC control current to modulate the AC inductance. However:

\[
P_{\text{out}} \leq P_{\text{in, AC}} + P_{\text{control, DC}}
\]

The Manley-Rowe relations strictly forbid net power gain from parametric processes in passive, lossless systems. The sum of powers at all frequencies must be zero.

### 6.5 Where Conventional Physics Might Miss SVT Effects

The argument for new physics in these devices rests on the claim that there is an **unaccounted energy reservoir** (the vacuum) that couples through mechanisms not captured by standard electrodynamics.

**Candidate mechanisms for SVT effects:**

1. **Vacuum friction.** If the rotating magnet experiences drag from the vacuum (Unruh effect analog), the work done against this drag could be harvested. The Unruh temperature for acceleration \( a \) is:
   \[
   T_U = \frac{\hbar a}{2\pi k_B c}
   \]
   For a point at radius \( r = 0.1 \, \text{m} \) rotating at \( \omega = 1047 \, \text{rad/s} \):
   \[
   a = \omega^2 r \approx 1.1 \times 10^5 \, \text{m/s}^2
   \]
   \[
   T_U \approx 2.1 \times 10^{-20} \, \text{K}
   \]
   This is **utterly negligible**.

2. **Rotational superradiance.** A rotating body can amplify incident waves (Zel'dovich effect, superradiance). The condition is:
   \[
   \omega < m\Omega
   \]
   where \( \Omega \) is the rotation frequency, \( \omega \) is the wave frequency, and \( m \) is the azimuthal mode number. For a disc at 10,000 RPM (\( \Omega = 1047 \, \text{rad/s} \)), \( m\Omega \approx 10^3 \, \text{rad/s} \). This requires incident waves at frequencies \( < 160 \, \text{Hz} \) — these exist in the ambient electromagnetic spectrum. The amplification factor for a disc of radius \( R \) is:
   \[
   A \approx \exp\left( 4\pi \frac{R\Omega}{c} m \right) - 1
   \]
   For \( R = 0.15 \, \text{m} \), \( \Omega = 1047 \), \( m = 1 \):
   \[
   A \approx \exp\left( 4\pi \frac{0.15 \cdot 1047}{3 \times 10^8} \right) - 1 \approx \exp(6.6 \times 10^{-6}) - 1 \approx 6.6 \times 10^{-6}
   \]
   This is vanishingly small. The gain is only significant when \( R\Omega / c \sim 1 \), which requires relativistic tip speeds.

3. **Vacuum polarization by rotating fields.** The rotating magnetic field could create a non-zero \( \mathbf{E} \cdot \mathbf{B} \) invariant, which couples to the axion or other pseudoscalar fields:
   \[
   \mathcal{L}_{a\gamma} = g_{a\gamma} a \, \mathbf{E} \cdot \mathbf{B}
   \]
   The power emitted as axions from a rotating magnet is:
   \[
   P_a = \frac{g_{a\gamma}^2}{4\pi} \omega^2 B_0^2 V^2
   \]
   where \( V \) is the magnet volume. For \( g_{a\gamma} < 10^{-10} \, \text{GeV}^{-1} \) (experimental limit), \( B_0 = 1.4 \, \text{T} \), \( V = 10^{-4} \, \text{m}^3 \), \( \omega = 1047 \):
   \[
   P_a < 10^{-30} \, \text{W}
   \]
   Completely negligible.

---

## 7. Quantitative Estimate

### 7.1 Conventional Generator Output

**Disc parameters:**
- Radius \( R = 0.15 \, \text{m} \)
- N52 NdFeB magnets: \( B_{\text{rem}} = 1.4 \, \text{T} \)
- Number of poles: \( N_p = 8 \) (4 magnet pairs)
- Rotation speed: 10,000 RPM → \( \omega = 1047.2 \, \text{rad/s} \), \( f = 166.7 \, \text{Hz} \)
- Harvest coil: \( N_c = 100 \) turns, area \( A_c = 0.01 \, \text{m}^2 \), at gap \( g = 1 \, \text{mm} \)

**Open-circuit voltage (per coil):**

The peak flux through a coil at radial position \( r \):

\[
\Phi_{\text{peak}} = B_{\text{gap}} \cdot A_c
\]

For a Halbach array, the gap field can approach \( B_{\text{gap}} \approx B_{\text{rem}} \) for an optimized magnetic circuit. With \( g = 1 \, \text{mm} \) and magnet thickness \( t_m = 5 \, \text{mm} \):

\[
B_{\text{gap}} \approx B_{\text{rem}} \frac{t_m}{t_m + \mu_r g} \approx 1.4 \cdot \frac{5}{5 + 1.05 \cdot 1} \approx 1.16 \, \text{T}
\]

Peak flux:

\[
\Phi_{\text{peak}} = 1.16 \cdot 0.01 = 0.0116 \, \text{Wb}
\]

Peak flux linkage:

\[
\lambda_{\text{peak}} = N_c \Phi_{\text{peak}} = 100 \cdot 0.0116 = 1.16 \, \text{Wb-turns}
\]

The flux variation as a function of rotor angle for a sinusoidal field distribution:

\[
\Phi(t) = \Phi_{\text{peak}} \sin(N_p \omega t / 2)
\]

(The factor of 2 because 8 poles give 4 electrical cycles per revolution.)

\[
\frac{d\Phi}{dt} = \Phi_{\text{peak}} \cdot \frac{N_p \omega}{2} \cos\left( \frac{N_p \omega}{2} t \right)
\]

Peak EMF:

\[
\mathcal{E}_{\text{peak}} = N_c \cdot \Phi_{\text{peak}} \cdot \frac{N_p \omega}{2} = 100 \cdot 0.0116 \cdot \frac{8 \cdot 1047.2}{2} = 4859 \, \text{V}
\]

**RMS voltage:**

\[
\mathcal{E}_{\text{RMS}} = \frac{4859}{\sqrt{2}} \approx 3436 \, \text{V}
\]

**Electrical frequency:**

\[
f_e = \frac{N_p \cdot \text{RPM}}{120} = \frac{8 \cdot 10000}{120} = 666.7 \, \text{Hz}
\]

**Coil impedance (neglecting core losses):**

Coil inductance for a 100-turn coil on a ferrite core with \( \mu_r = 2000 \), effective area \( A_c = 0.01 \, \text{m}^2 \), mean path length \( l_c = 0.5 \, \text{m} \):

\[
L = \frac{\mu_0 \mu_r N_c^2 A_c}{l_c} = \frac{4\pi \times 10^{-7} \cdot 2000 \cdot 10^4 \cdot 0.01}{0.5} \approx 0.503 \, \text{H}
\]

Inductive reactance at \( f_e = 666.7 \, \text{Hz} \):

\[
X_L = 2\pi f_e L = 2\pi \cdot 666.7 \cdot 0.503 \approx 2106 \, \Omega
\]

Coil resistance (AWG 20, 100 turns, average turn length 0.5 m, \( R_{\text{wire}} \approx 0.033 \, \Omega/\text{m} \) at 100°C):

\[
R_c = 100 \cdot 0.5 \cdot 0.033 = 1.65 \, \Omega
\]

The coil is highly inductive; power factor is poor unless resonated with a capacitor.

**Maximum power output (with resonant tuning):**

At resonance, the impedance is purely resistive:

\[
P_{\text{max}} = \frac{\mathcal{E}_{\text{RMS}}^2}{R_c + R_{\text{load}}}
\]

For maximum power transfer (\( R_{\text{load}} = R_c \)):

\[
P_{\text{max}} = \frac{3436^2}{2 \cdot 1.65} \approx 3.58 \, \text{MW}
\]

This is the absolute maximum if perfectly tuned and loaded. However, the reactive power is enormous. More realistic for a non-resonant configuration:

\[
P_{\text{realistic}} = \frac{\mathcal{E}_{\text{RMS}}^2}{R_c} \cdot \frac{R_c^2}{R_c^2 + X_L^2} \approx \frac{3436^2}{1.65} \cdot \frac{2.72}{2.72 + 4.44 \times 10^6} \approx 5.4 \, \text{W}
\]

Without resonance, the inductive reactance kills the power. With resonance (\( C = 1/\omega^2 L \approx 1/(4189^2 \cdot 0.503) \approx 113 \, \text{nF} \)):

\( Q = \omega L / R_c = 2106 / 1.65 \approx 1276 \), giving the high power above.

**Mechanical input power required:**

Torque on the disc from magnetic forces:

\[
\tau = \frac{P_{\text{elec}}}{\omega} \quad \text{(at 100% efficiency)}
\]

For \( P_{\text{elec}} = 3.58 \, \text{MW} \):

\[
\tau = \frac{3.58 \times 10^6}{1047.2} \approx 3417 \, \text{N·m}
\]

This is an enormous torque — impractically large for a 0.15 m disc. A more realistic design would use a smaller electrical load. The actual mechanical power required equals the electrical output plus losses.

**Realistic generator with optimized design:**

For a practical permanent magnet alternator (PMA) of 0.15 m radius at 10,000 RPM:
- Typical efficiency: 92-96%
- Typical output: 1-10 kW (limited by thermal and mechanical constraints)
- The torque at 5 kW: \( \tau = 5000 / 1047.2 \approx 4.8 \, \text{N·m} \)

### 7.2 Additional Parametric Gain (SVT Speculative)

In the SVT framework, the rotating permanent magnet assembly is a "rotating frozen vortex." The speculative gain mechanisms are:

**1. Rotational superradiance of vacuum fluctuations:**

As calculated in section 6.5, the amplification of ambient vacuum electromagnetic modes is:

\[
A_{\text{superradiance}} \approx 6.6 \times 10^{-6}
\]

This is a fractional amplification of ambient 160 Hz noise. The ambient power density in this band is approximately \( 10^{-15} \, \text{W/m}^2 \). With a coil area of 0.01 m²:

\[
P_{\text{superradiant}} \approx 6.6 \times 10^{-6} \cdot 10^{-15} \cdot 0.01 \approx 6.6 \times 10^{-23} \, \text{W}
\]

**Completely negligible.**

**2. Kelvin wave emission from driven vortex lines:**

If the permanent magnet's atomic spins are treated as pinned vortex segments, the rotating drive at 667 Hz could excite internal spin waves (magnons). The magnon excitation power:

\[
P_{\text{magnon}} = \frac{\gamma B_1^2 V \omega_m}{4\pi} \cdot \frac{\Gamma}{(\omega_m - \omega_0)^2 + \Gamma^2}
\]

For N52 NdFeB, the ferromagnetic resonance (FMR) frequency at zero field is:

\[
\omega_0 = \gamma B_{\text{anisotropy}} \approx 1.76 \times 10^{11} \cdot 1.4 \approx 2.46 \times 10^{11} \, \text{rad/s}
\]

This is \( f_0 \approx 39 \, \text{GHz} \), far above 667 Hz. The rotating field at 667 Hz is **off-resonance by 8 orders of magnitude**. The absorption is negligible.

**3. Vacuum coupling via the Dynamical Casimir Effect:**

As calculated in section 4.5, the required \( dB/dt \) is \( 3.4 \times 10^{30} \, \text{T/s} \). The actual \( dB/dt \) from rotation is \( 1.4 \times 10^3 \, \text{T/s} \). **27 orders of magnitude too small.**

**4. Parametric resonance of the vacuum's quantum phase:**

The vacuum's quantum phase has a characteristic frequency set by the condensate gap \( \Delta \). For a BEC vacuum:

\[
\omega_{\text{gap}} = \frac{\Delta}{\hbar}
\]

If the gap is at the electron mass scale (\( \Delta \approx m_e c^2 \approx 0.5 \, \text{MeV} \)):

\[
\omega_{\text{gap}} \approx 7.8 \times 10^{20} \, \text{rad/s}
\]

The rotation at 1047 rad/s is **17 orders of magnitude too slow**.

**Summary of speculative gains:**

| Mechanism | Frequency match | Gain factor | Power (W) |
|-----------|----------------|-------------|-----------|
| Rotational superradiance | Poor (6×10⁻⁶) | 6×10⁻⁶ | 6×10⁻²³ |
| Kelvin wave/magnon | Poor (10⁸× off) | < 10⁻¹⁰ | 10⁻¹⁰ |
| Dynamical Casimir | 10²⁷× off | 0 | 0 |
| Vacuum phase resonance | 10¹⁷× off | 0 | 0 |
| QED nonlinearity | 10¹⁰× off | 10⁻⁴⁰ | 10⁻⁴⁰ |

**Total additional gain from SVT mechanisms: effectively zero at laboratory parameters.**

### 7.3 The Difference

\[
\Delta P = P_{\text{SVT,speculative}} - P_{\text{conventional}}
\]

At the realistic 5 kW output level:

\[
\Delta P \approx 5 \times 10^{-10} - 5000 \approx -5000 \, \text{W}
\]

The conventional generator output completely dominates. There is no measurable SVT contribution at 1.4 T and 10,000 RPM.

### 7.4 Scaling to the Regime of Interest

For any of the SVT mechanisms to become significant, the system must approach the fundamental scales:

**For rotational superradiance:**

\[
\frac{R\omega}{c} \approx 1 \quad \rightarrow \quad \omega \approx \frac{c}{R}
\]

For \( R = 0.15 \, \text{m} \): \( \omega \approx 2 \times 10^9 \, \text{rad/s} \) (\( 1.9 \times 10^{10} \, \text{RPM} \)) — **mechanically impossible**.

**For QED nonlinearity:**

\[
B \approx B_{\text{cr}} \approx 4.4 \times 10^9 \, \text{T} \quad \text{or} \quad \frac{dB}{dt} \approx \frac{B_{\text{cr}}}{\tau_{\text{Compton}}}
\]

Neither is achievable with permanent magnets and mechanical rotation.

**For the Dynamical Casimir Effect:**

\[
\frac{dB}{dt} > \frac{B_{\text{cr}} c}{a_0}
\]

For a quantum switch at \( a_0 \approx 1 \, \mu\text{m} \): \( dB/dt > 10^{24} \, \text{T/s} \). Achievable only with femtosecond laser-driven plasmas or relativistic electron beams.

---

## 8. Overall Conclusion

### 8.1 Summary of Findings

**1. Parametric amplification with PM DC bias:** The varactor analogy does not transfer directly to the magnetic domain. The QED vacuum nonlinearity at 1.4 T is \( \sim 10^{-40} \) of the linear term. Parametric gain from vacuum coupling is undetectable. However, classical parametric processes (reluctance modulation) are possible but obey Manley-Rowe power conservation.

**2. Flux compression with rotating disc:** The rotating disc does not achieve flux compression in the FCG sense. The kinetic energy of the rotor is a flywheel buffer, not an energy multiplier. The energy comes from the motor.

**3. Magnetic circuit modulation:** Mechanical modulation is adiabatic with respect to the vacuum. COP > 1 is classically forbidden. Electronic (nanosecond) switching is required for non-adiabatic effects (as in the Resonance of the Void paper).

**4. Vortex pinning and amplification:** The pinned vortex (permanent magnet) can be driven by a rotating field, but the resonance frequencies (GHz-THz for magnons, GHz for Kelvin waves) are mismatched by orders of magnitude from mechanical rotation frequencies (Hz-kHz).

**5. The key distinction:** In the permanent magnet variant, the rotating disc is a **conventional alternator**. The energy comes from the motor. No known SVT mechanism changes this at laboratory field strengths and rotation rates.

**6. Historical precedents:** The N-machine, Adams motor, and MEG all fail under rigorous measurement. Their apparent over-unity effects are explained by measurement errors, regenerative braking misinterpretation, and neglected energy storage. No verified COP > 1 device exists.

**7. Quantitative estimate:** Conventional generator output at 10,000 RPM with optimized design: 1-10 kW. SVT speculative contributions: \( < 10^{-10} \, \text{W} \). The difference is 13+ orders of magnitude.

### 8.2 The Path Forward

The SVT framework predicts that vacuum energy extraction requires one of:

1. **Extremely high fields** (\( B \sim B_{\text{cr}} \sim 10^9 \, \text{T} \)) — requires explosive flux compression, not permanent magnets
2. **Extremely fast modulation** (\( t_{\text{rise}} < \tau_{\text{Compton}} \sim 10^{-21} \, \text{s} \)) — requires femtosecond laser or relativistic beams, not mechanical rotation
3. **Extremely high frequencies** (\( \omega \sim \omega_{\text{gap}} \sim 10^{20} \, \text{rad/s} \)) — requires quantum optical techniques, not mechanical rotation
4. **Topological protection with geometric amplification** — the rotating **charged** disc (Vortex Engine) may create a new vortex whose topological protection allows continuous energy flow, but this requires the electric field coupling (HV, not just PM) to create the phase winding in the vacuum

The permanent magnet variant (rotating PM assembly) is **not** the optimal implementation of the Vortex Engine. The **charged rotating disc** (with HV) is the correct implementation because:
- The electric field couples to the vacuum's quantum phase
- The rotation creates the phase winding that nucleates a new vortex
- The high voltage provides the field strength necessary for vacuum coupling
- The new vortex in the vacuum is topologically protected and distinct from the permanent magnet's frozen vortex

The permanent magnet's role in a Vortex Engine would be better as **a seed or catalyst** for vortex nucleation in the charged rotating disc, rather than as the primary energy source.

### 8.3 Recommended Research Direction

1. **Build the charged rotating disc Vortex Engine** as described in the original paper. The vacuum coupling comes from the electric field + rotation, not from permanent magnets alone.
2. **Use permanent magnets as field shapers** (Halbach arrays) to confine and direct the vacuum vortex once created.
3. **Explore hybrid configurations** where PM bias provides a DC flux through a circuit that is modulated by **electronic** (not mechanical) means at nanosecond timescales, as in the Resonance of the Void approach.
4. **Develop faster modulation techniques** (GaN HEMT switching at >10 GHz, photoconductive switches) to approach the non-adiabatic regime where vacuum coupling becomes possible.

---

## Appendix A: Key Equations Referenced

**Superfluid vortex circulation:**
\[
\oint \mathbf{v} \cdot d\mathbf{l} = n \cdot \frac{h}{m}
\]

**Magnetism as vacuum vorticity (SVT):**
\[
\mathbf{B} = \frac{m}{q} \nabla \times \mathbf{v}
\]

**Parametric resonance condition:**
\[
\frac{d^2 x}{dt^2} + [\delta + \epsilon \cos(2\omega t)]x = 0
\]

**Manley-Rowe power conservation:**
\[
\sum_{m,n} \frac{mP_{mn}}{m\omega_1 + n\omega_2} = 0, \quad \sum_{m,n} \frac{nP_{mn}}{m\omega_1 + n\omega_2} = 0
\]

**QED critical field (Schwinger):**
\[
B_{\text{cr}} = \frac{m_e^2 c^2}{e\hbar} \approx 4.4 \times 10^9 \, \text{T}
\]

**Rotational superradiance condition:**
\[
\omega < m\Omega
\]

**Dynamical Casimir effect condition:**
\[
\Delta t < \frac{1}{\omega_{\text{vac}}} \approx \frac{\hbar}{m_e c^2}
\]

---

## Appendix B: Parameter Summary Table

| Parameter | Symbol | Value | Units |
|-----------|--------|-------|-------|
| Disc radius | \( R \) | 0.15 | m |
| Rotational speed | \( \omega \) | 1047 | rad/s |
| RPM | \( N \) | 10,000 | rpm |
| PM remanence | \( B_r \) | 1.4 | T |
| PM volume | \( V_{\text{PM}} \) | \( 10^{-4} \) | m³ |
| PM energy product | (BH)\(_{\text{max}}\) | 50 | MGOe |
| Coil turns | \( N_c \) | 100 | — |
| Coil area | \( A_c \) | 0.01 | m² |
| Electrical frequency | \( f_e \) | 667 | Hz |
| Peak EMF (tuned) | \( \mathcal{E}_{\text{peak}} \) | 4859 | V |
| Max output (tuned) | \( P_{\text{max}} \) | 3.58 | MW |
| Realistic output | \( P_{\text{real}} \) | 5 | kW |
| Conventional eff. | \( \eta \) | 92-96 | % |
| SVT gain (spec.) | \( G_{\text{SVT}} \) | \( < 10^{-23} \) | — |
| Schwinger ratio | \( B/B_{\text{cr}} \) | \( 3 \times 10^{-10} \) | — |
| Compton timescale | \( \tau_C \) | \( 1.3 \times 10^{-21} \) | s |
| Mechanical \( dB/dt \) | \( \dot{B} \) | \( 1.4 \times 10^3 \) | T/s |
| Required \( dB/dt \) (DCE) | \( \dot{B}_{\text{DCE}} \) | \( 3.4 \times 10^{30} \) | T/s |

---

**Author:** Rendi Virgantara Setiawan  
**Date:** June 2026  
**License:** This work is dedicated to the public domain. No rights reserved.
