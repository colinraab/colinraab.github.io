---
title: "WaveVerb: Hybrid Waveguide Reverb Network"
description: "Summary of the WaveVerb hybrid reverb project."
pubDate: 2024-08-15
updatedDate: 2025-10-15
tags:
  - Audio DSP
  - Plugin Development
  - JUCE
heroImage: "https://raw.githubusercontent.com/colinraab/waveverb/refs/heads/main/assets/images/Hybrid_Reverb_Diagram.png"
projectLink: "https://colinraab.com/waveverb/"
repoLink: "https://github.com/colinraab/waveverb"
minutesRead: 4
---
WaveVerb is a hybrid digital waveguide reverb network built as the final project for MUMT 618 at McGill University. The goal is to fuse a feedback delay network (FDN) reverb with physically inspired waveguide strings so that spatial ambience and tonal resonances evolve together.

## Project Overview

- **Context:** Semester project during Fall 2024 exploring advanced reverberation techniques.
- **Deliverables:** Hybrid DSP architecture, custom JUCE plugin, playable interface prototype, and a demonstration video hosted on GitHub.
- **Sources:** Mixes academic research on FDN reverbs, Schroeder diffusion, and generalized waveguide networks.

## Background & Research

FDN reverbs (Jot, 1997) route a bank of delay lines through an orthogonal matrix to distribute energy and avoid discrete echoes. They are efficient but require careful tuning. Digital waveguides (Smith, 1992) model traveling waves with delay lines; they are the basis for plucked-string and wind-instrument synthesis. Prior work on hybrid and generalized waveguide networks informed how to introduce coupling between multiple strings. 

## Motivation

Every project I've produced or mixed (and sometimes mastered) have used digital reverbs. A personal favorite is Ableton's Hybrid Reverb, which allows me to blend the flexbility of a synthetic FDN reverb with the realism (or artistic flair) of convolutional reverb. Given my previous experience implementing FDNs, I was already familiar with circular delay lines–-a key component of the digital waveguides we were learning about in 618. This project set out to blend the late reflections of the FDN with musical, resonant sustain—something closer to Ableton’s Resonators fused with a reverb. I also drew inspiration from the work by Applied Acoustic Systems and Rhizomatic’s Plasmonic.

## Building the Hybrid Reverb

1. **Core Reverb:**
  - 16-channel FDN implemented in JUCE with a Householder mixing matrix.
  - Room size parameter determines delay lengths (~6.6–26k samples); RT60 controls the decay coefficient.
2. **Diffusion Front-End:**
  - Short IR convolution for early reflections, or optional cascaded short delay lines with Hadamard mixing and Schroeder all-pass alternatives.
  - Size X–Y pad jointly adjusts room size and decay.
3. **Waveguide Layer:**
  - Sixteen plucked-string waveguides share circular delay lines, damping filters, and violin body resonances.
  - Incoming audio triggers strings via thresholding; rate and density parameters keep triggers desynchronized.
  - Tone X–Y pad maps pickup vs. trigger position; density pad sets decay vs. retrigger rate; dropdowns tune strings to chords or single notes.
4. **Mixing Controls:**
  - Blend knob crossfades between reverb and waveguide outputs.
  - Mix knob balances dry input versus processed signal.

## Interface & Demo

Early wireframes evolved into a multi-panel GUI built with JUCE, aided by Foley’s GUI Magic. This was my first time using such a GUI designer and I had a mixed experience. I had become accustomed to JUCE's GUI quirks, and while Foley's tool simplified some aspects of the process, it added other intricacies.

## Development Lessons

For this project, I leveraged the [Pamplejuce](https://github.com/sudara/pamplejuce) template and the CLion IDE to streamline CMake builds. This invovled learning new tooling, adding additional time to the start of the project. Projucer abstracts away CMake interaction, but prevents nuanced configurations. GUI implementation remained the most time-intensive portion despite using Foley's visual editor. It was difficult to balance time between architecture, UI polish, and experimentation, given the scope and requirements of the assignment when compared to my personal goals. 

In retrospect, this was also the last project I completed entirely without any LLM coding assistance. 

## Challenges & Future Work

The WaveVerb would benefit from a clearer coupling strategy between the FDN and waveguides; future prototypes may start in MATLAB before porting to C++. Future plans include bowing or wind waveguide models, additional body filters, MIDI-controlled tuning, smarter trigger detection, octave controls, and richer reverb structures.

This project isn’t release-ready yet. It requires further DSP iteration, GUI refinement, and validation before sharing commercially. The current code is available on GitHub.

## References & Resources

My key influences for this project were: my professor Dr. Gary Scavone, [Geraint Luff’s “Let’s Write a Reverb,”](https://www.youtube.com/watch?v=QWnD30xHjW4&pp=ygUgZ2VyaWFudCBsdWZmIGxldHMgd3JpdGUgYSByZXZlcmI%3D) JUCE’s waveguide tutorials, and foundational papers by Jot, Smith, Gardner, Pirkle, and Rocchesso.

Explore the full write-up, bibliography, resources, and demo video at [colinraab.com/waveverb](https://colinraab.com/waveverb/), or dive into the source code on [GitHub](https://github.com/colinraab/waveverb).
