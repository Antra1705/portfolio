'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { GardenColors } from './ContributionGarden';
import { makePetalGeometry } from './Petals3D';
import { useGardenColors } from '../lib/gardenColors';
import PaperLantern from './HeroLantern';

// The contact section's cherry tree, grown rather than modelled: a curved,
// tapering trunk that forks into branches and twigs, covered in thousands of
// five-petal sakura flowers built from the same petal as the site's falling
// petals, with a few young leaves. It stands on a grassy mound that fades into
// the page, sways in the breeze, drops petals that settle on the grass, and
// shakes loose a flurry when the pointer passes over it. A paper lantern like the
// hero's hangs from a low limb and takes you back to the top. Loaded lazily by Contact.

// Deterministic randomness, so the tree grows the same shape every visit
export const rng = (seed: number) => {
    let t = seed >>> 0;
    return () => {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
};

const MOUND_R = 1.35;
const MOUND_H = 0.16;
const groundY = (x: number, z: number) => {
    const d = Math.hypot(x, z / 0.8) / MOUND_R;
    return d < 1 ? MOUND_H * (1 - d * d) : 0;
};

const MAX_DEPTH = 4;
const UP = new THREE.Vector3(0, 1, 0);

export interface Segment { a: THREE.Vector3; b: THREE.Vector3; r0: number; r1: number }
interface Twig { a: THREE.Vector3; b: THREE.Vector3; depth: number }

// Recursively grows the branch structure: each limb is a few bent segments,
// then forks into thinner, shorter limbs that fan out and droop slightly
const growTree = () => {
    const random = rng(1705);
    const segments: Segment[] = [];
    const twigs: Twig[] = [];

    const grow = (start: THREE.Vector3, dir: THREE.Vector3, length: number, radius: number, depth: number) => {
        const steps = depth === 0 ? 4 : 3;
        let p = start.clone();
        const d = dir.clone();
        let r = radius;
        for (let s = 0; s < steps; s++) {
            // the trunk rises straight; limbs wander a little and the outer ones bow
            // under their blossoms
            if (depth > 0) {
                d.add(new THREE.Vector3(random() - 0.5, (random() - 0.5) * 0.6, random() - 0.5).multiplyScalar(0.3));
                if (depth >= 3) d.y -= 0.05;
                d.normalize();
            }
            const next = p.clone().addScaledVector(d, length / steps);
            const rNext = radius * (1 - ((s + 1) / steps) * 0.38);
            segments.push({ a: p, b: next, r0: r, r1: rNext });
            if (depth >= MAX_DEPTH - 2) twigs.push({ a: p, b: next, depth }); // inner limbs bloom too, so the crown has no hollow middle
            p = next;
            r = rNext;
        }
        if (depth === MAX_DEPTH) return;
        const children = depth === 0 ? 4 : random() < 0.5 ? 2 : 3;
        const twist = random() * Math.PI * 2;
        for (let i = 0; i < children; i++) {
            // main limbs fan up and out from a short trunk into a full, rounded crown
            const spread = depth === 0 ? 0.3 + random() * 0.12 : 0.3 + random() * 0.26;
            const azimuth = twist + (i / children) * Math.PI * 2 + (random() - 0.5) * 0.6;
            // a direction rotated `spread` away from the parent, around it by `azimuth`
            const side = new THREE.Vector3().crossVectors(d, Math.abs(d.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : UP).normalize();
            const childDir = d.clone().applyAxisAngle(side, spread).applyAxisAngle(d, azimuth);
            if (childDir.y < 0.05) childDir.y = 0.05 + random() * 0.15; // keep limbs reaching up and out
            // branches scale from a fixed base, so the crown's size doesn't depend on the trunk's
            grow(p, childDir.normalize(), (depth === 0 ? 1.2 : length) * (0.72 + random() * 0.08), r * 0.72, depth + 1);
        }
    };

    // a short, straight, sturdy trunk, as on a real cherry: the crown does the reaching
    grow(new THREE.Vector3(0, MOUND_H - 0.06, 0), new THREE.Vector3(0, 1, 0), 0.7, 0.14, 0);
    return { segments, twigs, random };
};

// All branch segments merged into one mesh: tapered cylinders with a sphere
// at each joint so the bends read as one continuous limb
export const buildBark = (segments: Segment[]) => {
    const parts: THREE.BufferGeometry[] = [];
    for (const { a, b, r0, r1 } of segments) {
        const dir = b.clone().sub(a);
        const len = dir.length();
        const g = new THREE.CylinderGeometry(r1, r0, len, 8, 1, false);
        g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize()));
        g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
        parts.push(g.toNonIndexed());
        if (r0 > 0.03) {
            const joint = new THREE.IcosahedronGeometry(r0 * 0.98, 1);
            joint.translate(a.x, a.y, a.z);
            parts.push(joint.toNonIndexed());
        }
    }
    parts.forEach((g) => g.deleteAttribute('uv'));
    const merged = mergeGeometries(parts);
    merged.computeVertexNormals();
    return merged;
};

// One sakura flower: five cupped petals around a deep-pink centre
const buildFlowerGeometry = () => {
    const petal = makePetalGeometry(3); // small on screen and drawn thousands of times: keep it light
    petal.translate(0, 0.5, 0); // base at the flower's centre
    const parts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 5; i++) {
        const g = petal.clone();
        g.rotateX(-0.5); // tilt up into a cup
        g.rotateZ((i / 5) * Math.PI * 2);
        parts.push(g.toNonIndexed());
    }
    const centre = new THREE.IcosahedronGeometry(0.13, 0);
    const pink = new THREE.Color('#D9537B');
    centre.setAttribute('color', new THREE.Float32BufferAttribute(Array.from({ length: centre.attributes.position.count }, () => [pink.r, pink.g, pink.b]).flat(), 3));
    centre.translate(0, 0, 0.08);
    parts.push(centre);
    parts.forEach((g) => g.deleteAttribute('uv'));
    const merged = mergeGeometries(parts);
    merged.computeVertexNormals();
    return merged;
};

const buildLeafGeometry = () => {
    const leaf = makePetalGeometry(4);
    leaf.deleteAttribute('color');
    leaf.scale(0.55, 1.3, 1);
    return leaf;
};

export interface Bloom { pos: THREE.Vector3; quat: THREE.Quaternion; scale: number; shade: number }

// Flowers crowd the outer twigs: scattered around each twig, facing outward.
// `density` thins the crown on small screens, where the GPU budget is tighter.
const placeBlossoms = (twigs: Twig[], random: () => number, density: number) => {
    const flowers: Bloom[] = [];
    const leaves: Bloom[] = [];
    const centre = new THREE.Vector3(0, 1.6, 0);
    const z = new THREE.Vector3(0, 0, 1);
    for (const t of twigs) {
        const n = Math.round((t.depth === MAX_DEPTH ? 44 : t.depth === MAX_DEPTH - 1 ? 16 : 10) * density);
        for (let i = 0; i < n; i++) {
            const along = t.a.clone().lerp(t.b, random());
            const pos = along.add(new THREE.Vector3(random() - 0.5, random() - 0.4, random() - 0.5).multiplyScalar(0.32));
            const out = pos.clone().sub(centre).normalize().add(new THREE.Vector3(random() - 0.5, random() * 0.6, random() - 0.5).multiplyScalar(0.9)).normalize();
            const quat = new THREE.Quaternion().setFromUnitVectors(z, out);
            quat.multiply(new THREE.Quaternion().setFromAxisAngle(z, random() * Math.PI * 2));
            flowers.push({ pos, quat, scale: 0.055 + random() * 0.035, shade: random() });
        }
        if (random() < 0.45) {
            const pos = t.b.clone().add(new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(0.1));
            const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(random() * 6, random() * 6, random() * 6));
            leaves.push({ pos, quat, scale: 0.05 + random() * 0.025, shade: random() });
        }
    }
    return { flowers, leaves };
};

export const Blossoms = ({ flowers, leaves, colors }: { flowers: Bloom[]; leaves: Bloom[]; colors: GardenColors }) => {
    const flowerMesh = useRef<THREE.InstancedMesh>(null);
    const leafMesh = useRef<THREE.InstancedMesh>(null);
    const flowerMaterial = useRef<THREE.MeshStandardMaterial>(null);
    const leafMaterial = useRef<THREE.MeshStandardMaterial>(null);
    const flowerGeometry = useMemo(() => buildFlowerGeometry(), []);
    const leafGeometry = useMemo(() => buildLeafGeometry(), []);

    useLayoutEffect(() => {
        const o = new THREE.Object3D();
        const c = new THREE.Color();
        const white = new THREE.Color('#FFFFFF');
        const fm = flowerMesh.current;
        const lm = leafMesh.current;
        if (!fm || !lm) return;
        flowers.forEach((f, i) => {
            o.position.copy(f.pos);
            o.quaternion.copy(f.quat);
            o.scale.setScalar(f.scale);
            o.updateMatrix();
            fm.setMatrixAt(i, o.matrix);
            // tints multiply the petal's own pale-to-pink shading: some blush, some near white
            fm.setColorAt(i, c.set(colors.github[Math.floor(f.shade * 2)]).lerp(white, 0.35 + f.shade * 0.5));
        });
        leaves.forEach((l, i) => {
            o.position.copy(l.pos);
            o.quaternion.copy(l.quat);
            o.scale.setScalar(l.scale);
            o.updateMatrix();
            lm.setMatrixAt(i, o.matrix);
            lm.setColorAt(i, c.set(colors.grass).lerp(white, l.shade * 0.25));
        });
        for (const [m, mat] of [[fm, flowerMaterial.current], [lm, leafMaterial.current]] as const) {
            m.instanceMatrix.needsUpdate = true;
            if (m.instanceColor) m.instanceColor.needsUpdate = true;
            if (mat) mat.needsUpdate = true;
            m.computeBoundingSphere();
        }
    }, [flowers, leaves, colors]);

    return (
        <>
            <instancedMesh ref={flowerMesh} args={[flowerGeometry, undefined, flowers.length]} castShadow>
                <meshStandardMaterial ref={flowerMaterial} vertexColors side={THREE.DoubleSide} roughness={0.6} emissive="#F7B8CA" emissiveIntensity={0.08} />
            </instancedMesh>
            <instancedMesh ref={leafMesh} args={[leafGeometry, undefined, leaves.length]}>
                <meshStandardMaterial ref={leafMaterial} side={THREE.DoubleSide} roughness={0.7} />
            </instancedMesh>
        </>
    );
};

interface FallingPetal {
    pos: THREE.Vector3;
    vy: number;
    swayPhase: number;
    rot: THREE.Euler;
    spin: THREE.Vector3;
    landedAt: number; // clock time it settled, or -1 while falling
    rest: number; // seconds it lies on the grass before drifting up again
}

const PETALS = 120;
const RESTING = 220; // petals that always lie on the grass

const Petals = ({ flowers, colors, animate, burst }: { flowers: Bloom[]; colors: GardenColors; animate: boolean; burst: React.RefObject<number> }) => {
    const falling = useRef<THREE.InstancedMesh>(null);
    const resting = useRef<THREE.InstancedMesh>(null);
    const geometry = useMemo(() => makePetalGeometry(8), []);
    const o = useMemo(() => new THREE.Object3D(), []);
    const seenBurst = useRef(0); // last shake handled; the tree counts up, petals catch up

    const spawnAt = (p: FallingPetal, t: number) => {
        const f = flowers[Math.floor(Math.random() * flowers.length)];
        p.pos.copy(f.pos);
        p.vy = 0.16 + Math.random() * 0.12;
        p.landedAt = -1;
        p.rest = 2 + Math.random() * 4;
        p.swayPhase = Math.random() * 6.28 + t;
    };

    const petals = useMemo<FallingPetal[]>(() => {
        const random = rng(42);
        return Array.from({ length: PETALS }, () => ({
            pos: new THREE.Vector3(), vy: 0, swayPhase: 0, landedAt: -1, rest: 0,
            rot: new THREE.Euler(random() * 6, random() * 6, random() * 6),
            spin: new THREE.Vector3(random() * 3 - 1.5, random() * 2 - 1, random() * 2 - 1),
        }));
    }, []);

    // Scatter the falling petals through the air at the start, not all in the canopy
    useLayoutEffect(() => {
        const random = rng(7);
        petals.forEach((p) => {
            const f = flowers[Math.floor(random() * flowers.length)];
            p.pos.set(f.pos.x, random() * f.pos.y, f.pos.z);
            p.vy = 0.16 + random() * 0.12;
            p.rest = 2 + random() * 4;
            p.swayPhase = random() * 6.28;
        });
    }, [petals, flowers]);

    // A carpet of petals under the tree, densest near the trunk
    useLayoutEffect(() => {
        const m = resting.current;
        if (!m) return;
        const random = rng(99);
        for (let i = 0; i < RESTING; i++) {
            const a = random() * Math.PI * 2;
            const r = 0.15 + Math.pow(random(), 0.7) * 1.5;
            const x = Math.cos(a) * r;
            const z = Math.sin(a) * r * 0.75;
            o.position.set(x, groundY(x, z) + 0.006, z);
            o.rotation.set(-Math.PI / 2 + (random() - 0.5) * 0.3, 0, random() * 6.28);
            o.scale.setScalar(0.045 + random() * 0.02);
            o.updateMatrix();
            m.setMatrixAt(i, o.matrix);
        }
        m.instanceMatrix.needsUpdate = true;
        m.computeBoundingSphere();
    }, [o]);

    useFrame(({ clock }, delta) => {
        const m = falling.current;
        if (!m) return;
        const t = clock.elapsedTime;
        const dt = Math.min(delta, 0.05);
        // A shake sends the settled petals (and a few mid-air) back up into the canopy
        if (burst.current !== seenBurst.current) {
            let freed = 0;
            for (const p of petals) {
                if (freed >= 30) break;
                if (p.landedAt >= 0 || Math.random() < 0.3) { spawnAt(p, t); freed++; }
            }
            seenBurst.current = burst.current;
        }
        petals.forEach((p, i) => {
            if (animate) {
                if (p.landedAt < 0) {
                    p.pos.y -= p.vy * dt;
                    p.pos.x += Math.sin(t * 1.3 + p.swayPhase) * 0.2 * dt + 0.035 * dt; // sway, with a light breeze
                    p.pos.z += Math.cos(t * 0.9 + p.swayPhase) * 0.1 * dt;
                    const floor = groundY(p.pos.x, p.pos.z) + 0.008;
                    if (p.pos.y <= floor) {
                        p.pos.y = floor;
                        p.landedAt = t;
                    }
                } else if (t - p.landedAt > p.rest) {
                    spawnAt(p, t);
                }
            }
            o.position.copy(p.pos);
            if (p.landedAt >= 0 || !animate) o.rotation.set(-Math.PI / 2, 0, p.rot.z);
            else o.rotation.set(p.rot.x + p.spin.x * t, p.rot.y + p.spin.y * t, p.rot.z + p.spin.z * t);
            o.scale.setScalar(0.055);
            o.updateMatrix();
            m.setMatrixAt(i, o.matrix);
        });
        m.instanceMatrix.needsUpdate = true;
    });

    const material = (
        <meshStandardMaterial vertexColors color={colors.github[3]} side={THREE.DoubleSide} roughness={0.55} emissive="#F7B8CA" emissiveIntensity={0.1} />
    );
    return (
        <>
            <instancedMesh ref={falling} args={[geometry, undefined, PETALS]} frustumCulled={false}>{material}</instancedMesh>
            <instancedMesh ref={resting} args={[geometry, undefined, RESTING]} receiveShadow>{material}</instancedMesh>
        </>
    );
};

const makeFadeTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
};

// A single blade of grass: a thin, slightly bent triangle
const makeBladeGeometry = () => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0.12, 1, 0.25], 3));
    g.computeVertexNormals();
    return g;
};

const BLADES = 1500;
const LAWN_R = 1.9; // grass thins to nothing by this radius

const Ground = ({ colors }: { colors: GardenColors }) => {
    const fade = useMemo(() => makeFadeTexture(), []);
    const bladeGeometry = useMemo(() => makeBladeGeometry(), []);
    const blades = useRef<THREE.InstancedMesh>(null);
    const bladeMaterial = useRef<THREE.MeshStandardMaterial>(null);

    useLayoutEffect(() => {
        const m = blades.current;
        if (!m) return;
        const random = rng(2026);
        const o = new THREE.Object3D();
        const c = new THREE.Color();
        const light = new THREE.Color(colors.grass);
        const dark = new THREE.Color(colors.ground);
        for (let i = 0; i < BLADES; i++) {
            const a = random() * Math.PI * 2;
            // denser near the trunk, sparse towards the rim
            const r = Math.pow(random(), 0.85) * LAWN_R;
            const x = Math.cos(a) * r;
            const z = Math.sin(a) * r * 0.72;
            // shorter towards the faded edge of the lawn
            const h = (0.05 + random() * 0.06) * (1 - (r / LAWN_R) * 0.75);
            o.position.set(x, groundY(x, z) - 0.004, z);
            o.rotation.set((random() - 0.5) * 0.5, random() * Math.PI * 2, (random() - 0.5) * 0.5);
            o.scale.set(0.012 + random() * 0.01, h, 1);
            o.updateMatrix();
            m.setMatrixAt(i, o.matrix);
            m.setColorAt(i, c.copy(dark).lerp(light, 0.35 + random() * 0.65));
        }
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
        if (bladeMaterial.current) bladeMaterial.current.needsUpdate = true;
        m.computeBoundingSphere();
    }, [colors]);

    return (
        <>
            {/* lawn that fades out into the page */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[LAWN_R * 2.4, LAWN_R * 1.75]} />
                <meshStandardMaterial color={colors.ground} map={fade} transparent depthWrite={false} roughness={1} />
            </mesh>
            {/* the gentle mound the tree stands on */}
            <mesh scale={[MOUND_R, MOUND_H, MOUND_R * 0.8]} receiveShadow>
                <sphereGeometry args={[1, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={colors.ground} roughness={1} />
            </mesh>
            <instancedMesh ref={blades} args={[bladeGeometry, undefined, BLADES]} receiveShadow>
                <meshStandardMaterial ref={bladeMaterial} side={THREE.DoubleSide} roughness={0.9} />
            </instancedMesh>
        </>
    );
};

// Where the lantern hangs: the lowest twig on the front of an outer limb on the
// crown's left, well out from the trunk, so it dangles in the open below the blossoms
const pickLanternPoint = (twigs: Twig[]) => {
    const outer = twigs.map((t) => t.b).filter((p) => p.x < -0.75 && p.z > 0);
    return outer.reduce((low, p) => (p.y < low.y ? p : low), outer[0] ?? new THREE.Vector3(-0.9, 1.4, 0.2));
};

// Grows the tree once: branches, blossoms, the flower points that frame the camera, and the lantern's knot
const buildTree = (density: number) => {
    const { segments, twigs, random } = growTree();
    const { flowers, leaves } = placeBlossoms(twigs, random, density);
    return { bark: buildBark(segments), flowers, leaves, points: flowers.map((f) => f.pos), lantern: pickLanternPoint(twigs) };
};

// The lantern follows the page's theme like the hero's: lit at night, unlit by day
const watchTheme = (onChange: () => void) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
};
const useNight = () => useSyncExternalStore(watchTheme, () => document.documentElement.dataset.theme !== 'light', () => true);

// Back to the top of the page, and keyboard focus with it (the hero takes focus
// only to carry it there, so it draws no focus ring)
const toTop = () => {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    const home = document.getElementById('home');
    if (home) {
        home.tabIndex = -1;
        home.focus({ preventScroll: true });
    }
};
type GrownTree = ReturnType<typeof buildTree>;

// The whole tree, with breeze and hover shake
const Tree = ({ tree, colors, animate, onHoverChange }: {
    tree: GrownTree; colors: GardenColors; animate: boolean; onHoverChange: (hovering: boolean) => void;
}) => {
    const group = useRef<THREE.Group>(null);
    const shake = useRef(0);
    const burst = useRef(0);
    const { bark, flowers, leaves, lantern } = tree;
    const night = useNight();

    useFrame(({ clock }, delta) => {
        const g = group.current;
        if (!g) return;
        const t = clock.elapsedTime;
        shake.current = Math.max(0, shake.current - delta * 1.4);
        const breeze = animate ? Math.sin(t * 0.7) * 0.01 + Math.sin(t * 1.9) * 0.004 : 0;
        const rattle = animate ? Math.sin(t * 22) * 0.03 * shake.current : 0;
        g.rotation.z = breeze + rattle;
        g.rotation.x = rattle * 0.5;
    });

    const onEnter = () => {
        onHoverChange(true);
        if (shake.current < 0.4) {
            shake.current = 1;
            burst.current += 1;
        }
    };

    return (
        <>
            <group ref={group} onPointerOver={onEnter} onPointerOut={() => onHoverChange(false)} onClick={onEnter}>
                <mesh geometry={bark} castShadow receiveShadow>
                    <meshStandardMaterial color={colors.trunk} roughness={0.95} />
                </mesh>
                <Blossoms flowers={flowers} leaves={leaves} colors={colors} />
                {/* the lantern hangs from its twig, so it sways with the tree */}
                <group position={lantern}>
                    <Html zIndexRange={[15, 0]} pointerEvents="none">
                        <PaperLantern lit={night} onPress={toTop} label="Back to the top" hint="Back to the top" track="top-lantern" cord={80} delay={0.6} />
                    </Html>
                </group>
            </group>
            <Petals flowers={flowers} colors={colors} animate={animate} burst={burst} />
        </>
    );
};

// Frames the tree from just above eye level, as large as it fits inside
// `region`: the slice of the canvas, as [left, right] fractions of its width, the
// tree may use. On desktop the canvas spans the whole section, so the region is
// the open space right of the postcard; nothing of the tree hides behind it.
// The trunk stands on the lawn near the bottom, and when the height allows, the
// crown's top meets the canvas top.
const FitCamera = ({ points, region }: { points: THREE.Vector3[]; region: [number, number] }) => {
    const { camera, size } = useThree();
    const [regionLeft, regionRight] = region;
    useLayoutEffect(() => {
        const cam = camera as THREE.PerspectiveCamera;
        // Fit to the real flowers (a sample), padded a touch for the petals' size;
        // a bounding box would leave its empty corners as wasted space
        const sample = points.filter((_, i) => i % 3 === 0).map((v) => v.clone().multiplyScalar(1.03));
        const top = Math.max(...points.map((v) => v.y));
        const target = new THREE.Vector3(0, top * 0.52, 0);
        const base = new THREE.Vector3(0, MOUND_H * 0.5, 0); // where the trunk meets the mound
        const dir = new THREE.Vector3(0, 0.14, 1).normalize();
        const p = new THREE.Vector3();
        const TOP = 0.995; // crown top, in screen units (1 = canvas top)
        const BASE = -0.8; // trunk base; the band below shows lawn
        const width = (regionRight - regionLeft) * 2; // region width in screen units
        const measure = () => {
            let maxY = -Infinity, minX = Infinity, maxX = -Infinity;
            for (const c of sample) {
                p.copy(c).project(cam);
                maxY = Math.max(maxY, p.y);
                minX = Math.min(minX, p.x);
                maxX = Math.max(maxX, p.x);
            }
            return { maxY, minX, maxX, baseY: p.copy(base).project(cam).y };
        };
        // Move in until the tree fills the height or the region's width, whichever comes first
        for (let d = 2; d < 60; d += 0.04) {
            cam.position.copy(dir).multiplyScalar(d).add(target);
            cam.lookAt(target);
            cam.updateMatrixWorld();
            cam.updateProjectionMatrix();
            const m = measure();
            if (m.maxY - m.baseY <= TOP - BASE && m.maxX - m.minX <= width) break;
        }
        // Then slide the view: up/down so the trunk stands at BASE, and sideways so
        // the crown is centred in the region
        const m = measure();
        const dist = cam.position.distanceTo(target);
        const halfH = dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
        const regionCentre = regionLeft + regionRight - 1; // in screen units
        const dy = (BASE - m.baseY) * halfH;
        const dx = (regionCentre - (m.minX + m.maxX) / 2) * halfH * cam.aspect;
        const look = target.clone().add(new THREE.Vector3(-dx, -dy, 0));
        cam.position.add(new THREE.Vector3(-dx, -dy, 0));
        cam.lookAt(look);
        cam.updateMatrixWorld();
    }, [camera, size.width, size.height, points, regionLeft, regionRight]);
    return null;
};

const ContactTree = ({ region = [0.03, 0.97] }: { region?: [number, number] }) => {
    const colors = useGardenColors();
    const holder = useRef<HTMLDivElement>(null);
    const [onScreen, setOnScreen] = useState(true);
    const [animate] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [hovering, setHovering] = useState(false); // pointer over the tree: show it can be shaken
    // Grown before the first frame, so the camera is framed from the start (no zoomed-in flash)
    const tree = useMemo(() => buildTree(window.matchMedia('(max-width: 767px)').matches ? 0.5 : 1), []);

    useEffect(() => {
        const el = holder.current;
        if (!el) return;
        const observer = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={holder}
            role="img"
            aria-label="A cherry blossom tree in full bloom on a small grassy mound, dropping petals"
            className={`contact-tree h-full w-full ${hovering ? 'cursor-pointer' : ''}`}
        >
            <Canvas
                shadows="soft"
                dpr={[1, 2]}
                frameloop={onScreen ? 'always' : 'never'}
                camera={{ fov: 30, near: 0.1, far: 100 }}
                gl={{ antialias: true, alpha: true }}
                style={{ touchAction: 'pan-y' }}
            >
                <FitCamera points={tree.points} region={region} />
                <hemisphereLight args={['#FFF6F9', colors.ground, 1.15]} />
                <directionalLight
                    position={[-3, 6, 4]}
                    intensity={1.7}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                    shadow-camera-left={-3}
                    shadow-camera-right={3}
                    shadow-camera-top={3.5}
                    shadow-camera-bottom={-3}
                    shadow-bias={-0.0004}
                />
                <directionalLight position={[4, 2, -3]} intensity={0.45} color="#F2AEBC" />
                <Ground colors={colors} />
                <Tree tree={tree} colors={colors} animate={animate} onHoverChange={setHovering} />
            </Canvas>
        </div>
    );
};

export default ContactTree;
