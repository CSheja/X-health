import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 1500;
const LERP_SPEED = 0.042;
const WOBBLE = 0.002;
const CONNECT_DIST = 0.20;
const MAX_CONNECTIONS = 800;

const rand = () => Math.random();
const randB = () => Math.random() - 0.5;

// ─────────────────────────────────────────────
// HEAD — side profile bust
// ─────────────────────────────────────────────
const generateHead = (count) => {
  const pts = [];
  const sc = 1.8;
  for (let i = 0; i < count; i++) {
    const t = i / count;
    let x, y, z = randB() * 0.05;

    if (t < 0.05) {
      // Crown dissolving upward
      x = randB() * (0.3 + rand() * 0.4);
      y = 2.05 + rand() * 1.0;
      z = randB() * 0.4;
    } else if (t < 0.28) {
      // Skull interior — filled
      const a = rand() * Math.PI;
      const r = rand() * 0.9;
      x = -0.02 + Math.cos(a) * 0.44 * r;
      y = 1.30 + Math.sin(a) * 0.58 * r;
    } else if (t < 0.36) {
      // Skull right outline
      const a = (t - 0.28) / 0.08 * Math.PI * 0.85 + 0.15;
      x = Math.cos(a) * 0.46 - 0.02;
      y = 1.30 + Math.sin(a) * 0.58;
    } else if (t < 0.42) {
      // Forehead slope to brow
      const a = (t - 0.36) / 0.06;
      x = 0.36 + a * 0.07;
      y = 1.82 - a * 0.50;
    } else if (t < 0.46) {
      // Brow and eye
      x = 0.40 + rand() * 0.10;
      y = 1.28 + randB() * 0.07;
    } else if (t < 0.50) {
      // Nose bridge
      const a = (t - 0.46) / 0.04;
      x = 0.42 + a * 0.05;
      y = 1.22 - a * 0.28;
    } else if (t < 0.53) {
      // Nose tip
      x = 0.46 + rand() * 0.04;
      y = 0.93 + randB() * 0.04;
    } else if (t < 0.57) {
      // Lip area
      const a = (t - 0.53) / 0.04;
      x = 0.44 - a * 0.12;
      y = 0.90 - a * 0.22;
    } else if (t < 0.61) {
      // Chin
      const a = (t - 0.57) / 0.04 * Math.PI * 0.5;
      x = 0.20 * Math.cos(a + 0.15);
      y = 0.55 - 0.08 * Math.sin(a);
    } else if (t < 0.66) {
      // Jaw going back
      const a = (t - 0.61) / 0.05;
      x = 0.20 - a * 0.55;
      y = 0.50 + a * 0.25;
    } else if (t < 0.70) {
      // Ear
      x = -0.50 + randB() * 0.05;
      y = 0.82 + randB() * 0.16;
    } else if (t < 0.76) {
      // Back skull lower
      const a = (t - 0.70) / 0.06;
      x = -0.46 + Math.cos(Math.PI + a * 0.7) * 0.04;
      y = 1.28 - a * 0.55;
    } else if (t < 0.82) {
      // Neck
      const a = (t - 0.76) / 0.06;
      x = -0.12 + a * 0.14;
      y = 0.20 - a * 0.42;
    } else if (t < 0.90) {
      // Shoulder line
      const a = (t - 0.82) / 0.08;
      x = (a - 0.5) * 2.0;
      y = -0.24 + randB() * 0.05;
    } else {
      // Dissolve scatter
      const s = (t - 0.90) / 0.10;
      x = randB() * (1.0 + s * 2.5);
      y = 0.7 + randB() * (1.5 + s * 2.0);
      z = randB() * (0.3 + s * 0.6);
    }

    pts.push(new THREE.Vector3(x * sc, y * sc - 1.1, z));
  }
  return pts;
};

// ─────────────────────────────────────────────
// DNA — double helix, fits screen
// ─────────────────────────────────────────────
const generateDNA = (count) => {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const y = t * 4.0 - 2.0;
    const angle = t * Math.PI * 14;
    const m = i % 4;
    if (m === 0) {
      // Strand A
      pts.push(new THREE.Vector3(Math.cos(angle) * 1.0, y, Math.sin(angle) * 0.22));
    } else if (m === 1) {
      // Strand B
      pts.push(new THREE.Vector3(Math.cos(angle + Math.PI) * 1.0, y, Math.sin(angle + Math.PI) * 0.22));
    } else if (m === 2) {
      // Rung connecting A to B
      const ra = Math.round(angle / (Math.PI * 0.5)) * (Math.PI * 0.5);
      const al = rand();
      const ax = Math.cos(ra) * 1.0;
      const bx = Math.cos(ra + Math.PI) * 1.0;
      pts.push(new THREE.Vector3(
        ax + (bx - ax) * al,
        Math.round(y * 5) / 5,
        0
      ));
    } else {
      // Slight scatter on strand surface
      pts.push(new THREE.Vector3(
        Math.cos(angle) * (1.0 + randB() * 0.06),
        y + randB() * 0.03,
        Math.sin(angle) * (0.22 + randB() * 0.03)
      ));
    }
  }
  return pts;
};

// ─────────────────────────────────────────────
// HEART — filled heart with ECG
// ─────────────────────────────────────────────
const generateHeart = (count) => {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const angle = t * Math.PI * 2;
    if (i < count * 0.80) {
      // Heart parametric — filled with density
      const fill = 0.5 + rand() * 0.5;
      const hx = 16 * Math.pow(Math.sin(angle), 3) * fill;
      const hy = (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) * fill;
      pts.push(new THREE.Vector3(
        hx * 0.13,
        hy * 0.13 + 0.3,
        randB() * 0.15
      ));
    } else {
      // ECG line below heart
      const ex = ((i / count) - 0.80) * 14 - 2.2;
      const phase = ((ex * 4.0) % 4 + 4) % 4;
      let ey = 0;
      if (phase < 0.10) ey = 2.8;
      else if (phase < 0.22) ey = -0.9;
      else if (phase < 0.34) ey = 2.1;
      pts.push(new THREE.Vector3(ex, ey * 0.36 - 1.8, randB() * 0.06));
    }
  }
  return pts;
};

// ─────────────────────────────────────────────
// BIRDS — multiple flocks in V formations
// ─────────────────────────────────────────────
const generateBirds = (count) => {
  const pts = [];
  const FLOCKS = 7;
  for (let i = 0; i < count; i++) {
    const f = Math.floor(rand() * FLOCKS);
    const cx = (f / (FLOCKS - 1) - 0.5) * 5.5;
    const cy = Math.sin(f * 0.9) * 1.4 + randB() * 0.25;
    const cz = randB() * 0.9;
    const side = i % 2 === 0 ? 1 : -1;
    const dist = 0.06 + rand() * 0.44;
    const dip = rand() * 0.22;
    pts.push(new THREE.Vector3(cx + side * dist, cy - dip, cz));
  }
  return pts;
};

// ─────────────────────────────────────────────
// SPHERE — evenly distributed golden spiral
// ─────────────────────────────────────────────
const generateSphere = (count) => {
  const pts = [];
  const PHI = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = PHI * i;
    pts.push(new THREE.Vector3(
      Math.cos(theta) * r * 2.4,
      y * 2.4,
      Math.sin(theta) * r * 2.4
    ));
  }
  return pts;
};

// ─────────────────────────────────────────────
// NEURAL CONNECTION LINES
// ─────────────────────────────────────────────
const NeuralLines = ({ posRef }) => {
  const linesRef = useRef();

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_CONNECTIONS * 6);
    const colors = new Float32Array(MAX_CONNECTIONS * 6);
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.setDrawRange(0, 0);
    return g;
  }, []);

  useFrame(() => {
    if (!linesRef.current || !posRef.current || posRef.current.length === 0) return;
    const pos = linesRef.current.geometry.attributes.position.array;
    const col = linesRef.current.geometry.attributes.color.array;
    const pts = posRef.current;
    let idx = 0;
    const step = Math.max(1, Math.floor(pts.length / 300));

    for (let i = 0; i < pts.length && idx < MAX_CONNECTIONS - 1; i += step) {
      for (let j = i + step; j < Math.min(i + step * 15, pts.length) && idx < MAX_CONNECTIONS - 1; j += step) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const dz = pts[i].z - pts[j].z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < CONNECT_DIST) {
          const strength = (1 - d / CONNECT_DIST) * 0.5;
          const base = idx * 6;
          pos[base]     = pts[i].x; pos[base + 1] = pts[i].y; pos[base + 2] = pts[i].z;
          pos[base + 3] = pts[j].x; pos[base + 4] = pts[j].y; pos[base + 5] = pts[j].z;
          col[base]     = strength; col[base + 1] = strength; col[base + 2] = strength;
          col[base + 3] = strength; col[base + 4] = strength; col[base + 5] = strength;
          idx++;
        }
      }
    }

    linesRef.current.geometry.setDrawRange(0, idx * 2);
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <lineSegments ref={linesRef} geometry={geo}>
      <lineBasicMaterial vertexColors transparent opacity={0.4} />
    </lineSegments>
  );
};

// ─────────────────────────────────────────────
// PARTICLE SYSTEM
// ─────────────────────────────────────────────
const SHAPES = ['head', 'dna', 'heart', 'birds', 'sphere'];

const Particles = ({ shape, posRef }) => {
  const meshRef = useRef();
  const currentPos = useRef([]);
  const targetPos = useRef([]);

  const targets = useMemo(() => ({
    head:   generateHead(PARTICLE_COUNT),
    dna:    generateDNA(PARTICLE_COUNT),
    heart:  generateHeart(PARTICLE_COUNT),
    birds:  generateBirds(PARTICLE_COUNT),
    sphere: generateSphere(PARTICLE_COUNT),
  }), []);

  const { geometry, initPos } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3]     = randB() * 5;
      pos[i * 3 + 1] = randB() * 5;
      pos[i * 3 + 2] = randB() * 2;
      const shade = 0.05 + rand() * 0.20;
      col[i * 3]     = shade;
      col[i * 3 + 1] = shade;
      col[i * 3 + 2] = shade;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    return { geometry: geo, initPos: pos };
  }, []);

  useEffect(() => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      currentPos.current[i] = new THREE.Vector3(
        initPos[i * 3],
        initPos[i * 3 + 1],
        initPos[i * 3 + 2]
      );
    }
    posRef.current = currentPos.current;
  }, [initPos, posRef]);

  useEffect(() => {
    const list = targets[shape];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      targetPos.current[i] = list[i % list.length].clone();
    }
  }, [shape, targets]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const arr = meshRef.current.geometry.attributes.position.array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const cur = currentPos.current[i];
      const tgt = targetPos.current[i];
      if (!cur || !tgt) continue;

      cur.x += (tgt.x - cur.x) * LERP_SPEED;
      cur.y += (tgt.y - cur.y) * LERP_SPEED;
      cur.z += (tgt.z - cur.z) * LERP_SPEED;

      cur.x += Math.sin(t * 0.8 + i * 0.06) * WOBBLE;
      cur.y += Math.cos(t * 0.6 + i * 0.08) * WOBBLE;
      cur.z += Math.sin(t * 1.0 + i * 0.04) * WOBBLE;

      arr[i * 3]     = cur.x;
      arr[i * 3 + 1] = cur.y;
      arr[i * 3 + 2] = cur.z;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.rotation.y = t * 0.04;
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={0.040}
        vertexColors
        transparent
        opacity={0.95}
        sizeAttenuation
      />
    </points>
  );
};

// ─────────────────────────────────────────────
// SCENE
// ─────────────────────────────────────────────
const Scene = ({ shape, posRef }) => (
  <group>
    <ambientLight intensity={1} />
    <Particles shape={shape} posRef={posRef} />
    <NeuralLines posRef={posRef} />
  </group>
);

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────
const SwarmEngine = ({
  height = '100%',
  autoRotate = true,
  initialShape = 'head',
}) => {
  const [shape, setShape] = useState(initialShape);
  const posRef = useRef([]);

  useEffect(() => {
    if (!autoRotate) return;
    const id = setInterval(() => {
      setShape(prev => {
        const i = SHAPES.indexOf(prev);
        return SHAPES[(i + 1) % SHAPES.length];
      });
    }, 8000);
    return () => clearInterval(id);
  }, [autoRotate]);

  return (
    <div className="relative w-full" style={{ height }}>
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 52 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <Scene shape={shape} posRef={posRef} />
      </Canvas>

      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 items-center"
        style={{ zIndex: 10 }}
      >
        {SHAPES.map((s) => (
          <button
            key={s}
            onClick={() => setShape(s)}
            style={{
              width: shape === s ? 24 : 6,
              height: 6,
              borderRadius: 3,
              background: shape === s ? '#333333' : '#aaaaaa',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.35s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SwarmEngine;