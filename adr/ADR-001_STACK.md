# ADR-001: Vanilla TypeScript and Canvas 2D

## Status

Accepted.

## Context

The product requires a single real-time 2D scene, custom deformable radial shapes, a small semantic UI overlay, offline support, and deterministic tests. It does not require a scene editor, 3D, rigid-body physics, networking, or a large component application.

## Decision

Use Vite, strict TypeScript, Canvas 2D, DOM/CSS UI, Web Audio, IndexedDB, and Service Worker APIs.

## Consequences

Positive:

- small runtime dependency surface;
- direct control over camera and blob rendering;
- easy static deployment;
- simpler clean-room proof;
- predictable performance profiling.

Negative:

- custom tooling for sprites/effects;
- more responsibility for lifecycle and asset management;
- native packaging needs a wrapper later.

## Reconsider when

- authored levels become a major feature;
- shader-heavy rendering becomes essential;
- team size requires visual editing tools;
- 3D is added.
