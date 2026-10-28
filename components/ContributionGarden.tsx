'use client';

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Day } from '../lib/github';
import { AdaptiveResolution } from './Petals3D';
import { Animals, CursorBird, PondCritters, POND_SQUASH, SkyBirds } from './GardenLife';

// A 3D blossom garden: one spot per day, shared by GitHub and LeetCode.
// GitHub activity grows a cherry tree (pink), LeetCode activity a jacaranda
// (periwinkle); on days with both, the two stand side by side. Busier days grow
// bigger trees with fuller blossom clouds and petals on the ground; quiet days
// are a tuft of grass, and big clearings of quiet days become small ponds.
// The year is planted in two beds (older half behind,
// recent half in front) so trees stay large on screen, and the lawn fades into
// the page so the garden sits on the page rather than in a box. The camera is
// fixed: no rotation, no sway.
// Loaded with next/dynamic so three.js only downloads when the section is near.

const PITCH = 0.42;
const ELEVATION = 0.45; // camera angle above the ground; the view is a fixed, straight-on front view

export type Kind = 'github' | 'leetcode';

export interface GardenDay {
    date: string;
    github: Day | null; // null when that source has no data
    leetcode: Day | null;
}

export type GardenWeek = (GardenDay | null)[];

export interface HoverInfo {
    day: GardenDay;
    // Set when hovering a pond: the stretch of quiet days it stands in for
    quiet?: { from: string; to: string; days: number };
    x: number;
    y: number;
}

export interface GardenColors {
    background: string; // page background, for the fade and haze
    ground: string;
    grass: string;
    trunk: string;
    github: string[]; // blossom colour for levels 1-4
    leetcode: string[];
    blossom: string;
    fruit: string;
    water: string;
    waterEdge: string;
    stone: string;
    lily: string;
}

interface GardenProps {
    weeks: GardenWeek[];
    colors: GardenColors;
    animate: boolean; // false under reduced motion: trees appear fully grown, animals hold still
    cursorBird: boolean; // a kingfisher follows the mouse (fine pointers only)
    active: boolean; // section on screen; pauses rendering when not
    onHover: (info: HoverInfo | null) => void;
}

interface Puff {
    offset: THREE.Vector3; // from the canopy centre, in canopy radii
    size: number; // in canopy radii
    tint: number; // 0..1 mix toward the blossom colour
}

interface Tree {
    day: GardenDay;
    kind: Kind;
    level: number;
    x: number;
    z: number;
    trunk: number;
    radius: number;
    delay: number; // 0..1, oldest to newest
    puffs: Puff[];
    blossoms: THREE.Vector3[]; // points on the canopy surface, in canopy radii
    fruits: THREE.Vector3[];
    petals: { x: number; z: number; rot: number }[]; // fallen petals, relative to the trunk
}

interface Tuft {
    day: GardenDay;
    x: number;
    z: number;
    delay: number;
}

interface PondSpot {
    x: number;
    z: number;
    r: number;
    seed: number;
    quiet?: HoverInfo['quiet']; // dates of the empty days the pond covers
}

const MAX_PONDS = 3;
const MIN_CLEARANCE = 0.62; // a clearing this wide (no trees within it) gets a pond

// Ponds go in the widest clearings: for each empty day, measure how far it is to
// the nearest tree (or the edge of the beds); the roomiest spots that don't
// crowd an earlier pond win
const findPonds = (empty: { x: number; z: number }[], trees: Tree[], halfW: number, halfD: number): PondSpot[] => {
    const scored = empty.map((p, i) => {
        let clearance = Math.min(halfW + 0.15 - Math.abs(p.x), halfD + 0.15 - Math.abs(p.z));
        for (const t of trees) clearance = Math.min(clearance, Math.hypot(t.x - p.x, t.z - p.z) - t.radius * 0.6);
        return { ...p, clearance, i };
    }).sort((a, b) => b.clearance - a.clearance);
    const ponds: PondSpot[] = [];
    for (const c of scored) {
        if (ponds.length >= MAX_PONDS || c.clearance < MIN_CLEARANCE) break;
        const r = Math.min(0.72, c.clearance - 0.22);
        if (ponds.every((o) => Math.hypot(o.x - c.x, o.z - c.z) > o.r + r + 0.4)) ponds.push({ x: c.x, z: c.z, r, seed: c.i + 1 });
    }
    return ponds;
};

// A small pond: see-through water with a shallow rim, a ring of stones, lily pads,
// a few tiny koi and a frog
const Pond = ({ pond, colors, animate, onHover }: { pond: PondSpot; colors: GardenColors; animate: boolean; onHover: GardenProps['onHover'] }) => {
    const group = useRef<THREE.Group>(null);
    const surface = useRef<THREE.Mesh>(null);
    const { r, seed } = pond;
    const stones = useMemo(() => {
        const n = Math.round(10 + r * 18);
        return Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2 + rand(seed + i) * 0.25;
            const k = 1.06 + rand(seed + i * 3.7) * 0.08;
            return { x: Math.cos(a) * r * k, z: Math.sin(a) * r * k * POND_SQUASH, s: 0.028 + rand(seed + i * 1.9) * 0.03, rot: rand(seed + i) * 6 };
        });
    }, [r, seed]);
    const pads = useMemo(() => Array.from({ length: r > 0.45 ? 3 : 2 }, (_, i) => {
        const a = rand(seed + i * 11) * Math.PI * 2;
        const d = r * (0.25 + rand(seed + i * 5) * 0.4);
        return { x: Math.cos(a) * d, z: Math.sin(a) * d * POND_SQUASH, s: r * (0.13 + rand(seed + i * 7) * 0.05), rot: a, flower: i === 0 };
    }), [r, seed]);
    // Stones, pads and critters ignore the pointer; only the pond's outer surface catches
    // it, so hovering the water shows the quiet stretch instead of reaching grass tufts behind it
    useLayoutEffect(() => {
        group.current?.traverse((o) => { if (o !== surface.current) o.raycast = () => {}; });
    }, []);
    return (
        <group ref={group} position={[pond.x, 0, pond.z]}>
            <mesh
                ref={surface}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.002, 0]}
                scale={[1.1, 1.1 * POND_SQUASH, 1]}
                receiveShadow
                onPointerMove={(e) => {
                    e.stopPropagation();
                    onHover(pond.quiet
                        ? { day: { date: pond.quiet.from, github: null, leetcode: null }, quiet: pond.quiet, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }
                        : null);
                }}
                onPointerOut={() => onHover(null)}
            >
                <circleGeometry args={[r, 32]} />
                <meshStandardMaterial color={colors.waterEdge} roughness={0.6} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} scale={[1, POND_SQUASH, 1]} receiveShadow>
                <circleGeometry args={[r, 32]} />
                <meshStandardMaterial color={colors.water} roughness={0.12} metalness={0.3} transparent opacity={0.72} depthWrite={false} />
            </mesh>
            {stones.map((st, i) => (
                <mesh key={i} position={[st.x, st.s * 0.4, st.z]} rotation={[st.rot, st.rot * 2, 0]} scale={[1, 0.6, 1]} castShadow>
                    <icosahedronGeometry args={[st.s, 0]} />
                    <meshStandardMaterial color={colors.stone} flatShading roughness={0.9} />
                </mesh>
            ))}
            <PondCritters r={r} pads={pads} animate={animate} seed={seed} />
            {pads.map((pad, i) => (
                <group key={i} position={[pad.x, 0.016, pad.z]}>
                    <mesh rotation={[-Math.PI / 2, 0, pad.rot]}>
                        <circleGeometry args={[pad.s, 12, 0.4, Math.PI * 2 - 0.8]} />
                        <meshStandardMaterial color={colors.lily} roughness={0.7} side={THREE.DoubleSide} />
                    </mesh>
                    {pad.flower && (
                        <mesh position={[0, 0.02, 0]} scale={[1, 0.6, 1]}>
                            <icosahedronGeometry args={[pad.s * 0.4, 0]} />
                            <meshStandardMaterial color={colors.github[2]} flatShading roughness={0.5} />
                        </mesh>
                    )}
                </group>
            ))}
        </group>
    );
};

// Deterministic pseudo-random numbers so a day always grows the same tree
const rand = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
};

const onSphere = (seed: number, minY: number) => {
    const theta = rand(seed) * Math.PI * 2;
    const y = minY + rand(seed + 1.7) * (1 - minY);
    const r = Math.sqrt(1 - y * y);
    return new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r);
};

const easeOutBack = (t: number) => {
    const c = 1.4;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

const plantTree = (day: GardenDay, kind: Kind, source: Day, x: number, z: number, delay: number, seed: number, max: number, shared: boolean): Tree => {
    // Two trees sharing a spot are a little smaller so they don't merge into one
    const size = (0.45 + 0.55 * Math.sqrt(source.count / max)) * (shared ? 0.85 : 1);
    const level = source.level;
    // A blossom cloud: a crown puff plus a ring of overlapping puffs; busier days get more
    const ring = 1 + level + Math.round(rand(seed + 3) * 1.5);
    const puffs: Puff[] = [{ offset: new THREE.Vector3(0, 0.25, 0), size: 0.78, tint: rand(seed + 4) * 0.18 }];
    for (let i = 0; i < ring; i++) {
        const a = (i / ring) * Math.PI * 2 + rand(seed + i) * 0.8;
        puffs.push({
            offset: new THREE.Vector3(Math.cos(a) * 0.55, -0.1 + rand(seed + i * 5.1) * 0.35, Math.sin(a) * 0.55),
            size: 0.5 + rand(seed + i * 2.3) * 0.22,
            tint: rand(seed + i * 9.7) * 0.22,
        });
    }
    const blossoms = Array.from({ length: 6 + level * 7 }, (_, i) => onSphere(seed * 3.1 + i * 7.7, -0.25));
    const fruits = level === 4
        ? Array.from({ length: 3 }, (_, i) => onSphere(seed * 1.9 + i * 4.3, -0.7)).map((p) => p.setY(Math.min(p.y, -0.15)))
        : [];
    const petals = level >= 3
        ? Array.from({ length: level * 3 }, (_, i) => {
            const a = rand(seed + i * 1.3) * Math.PI * 2;
            const r = 0.15 + rand(seed + i * 2.9) * 0.45;
            return { x: Math.cos(a) * r, z: Math.sin(a) * r, rot: rand(seed + i) * Math.PI };
        })
        : [];
    return {
        day,
        kind,
        level,
        x,
        z,
        delay,
        trunk: 0.22 + 0.62 * size,
        radius: 0.17 + 0.2 * size,
        puffs,
        blossoms,
        fruits,
        petals,
    };
};

// Soft lawn: solid in the middle, fading to transparent at the edges
const makeGroundTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.95)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
};

const Garden = ({ trees, tufts, colors, animate, onHover }: { trees: Tree[]; tufts: Tuft[]; colors: GardenColors; animate: boolean; onHover: GardenProps['onHover'] }) => {
    const trunkMesh = useRef<THREE.InstancedMesh>(null);
    const puffMesh = useRef<THREE.InstancedMesh>(null);
    const blossomMesh = useRef<THREE.InstancedMesh>(null);
    const fruitMesh = useRef<THREE.InstancedMesh>(null);
    const petalMesh = useRef<THREE.InstancedMesh>(null);
    const tuftMesh = useRef<THREE.InstancedMesh>(null);
    const puffMaterial = useRef<THREE.MeshStandardMaterial>(null);
    const petalMaterial = useRef<THREE.MeshStandardMaterial>(null);
    const progress = useRef(animate ? 0 : 1);
    const settled = useRef(false);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const counts = useMemo(() => ({
        puffs: trees.reduce((n, t) => n + t.puffs.length, 0),
        blossoms: trees.reduce((n, t) => n + t.blossoms.length, 0),
        fruits: trees.reduce((n, t) => n + t.fruits.length, 0),
        petals: trees.reduce((n, t) => n + t.petals.length, 0),
    }), [trees]);
    // Which tree each puff belongs to, for hover
    const puffOwner = useMemo(() => trees.flatMap((t, i) => t.puffs.map(() => i)), [trees]);

    // Puffs take their tree's palette (pink for GitHub, periwinkle for LeetCode),
    // some lightened toward white so each cloud looks full; petals match their tree
    useLayoutEffect(() => {
        const color = new THREE.Color();
        const white = new THREE.Color(colors.blossom);
        const palette = (t: Tree) => (t.kind === 'github' ? colors.github : colors.leetcode);
        const puffs = puffMesh.current;
        const petals = petalMesh.current;
        let i = 0;
        let j = 0;
        trees.forEach((t) => {
            t.puffs.forEach((p) => puffs?.setColorAt(i++, color.set(palette(t)[t.level - 1]).lerp(white, p.tint)));
            t.petals.forEach(() => petals?.setColorAt(j++, color.set(palette(t)[2])));
        });
        for (const [m, mat] of [[puffs, puffMaterial.current], [petals, petalMaterial.current]] as const) {
            if (m?.instanceColor) m.instanceColor.needsUpdate = true;
            if (mat) mat.needsUpdate = true;
        }
    }, [trees, colors]);

    useLayoutEffect(() => {
        settled.current = false;
    }, [trees, tufts]);

    useFrame((_, delta) => {
        if (settled.current) return;
        // clamped so a slow first frame (shaders compiling) doesn't skip the start of the growth
        progress.current = Math.min(1, progress.current + Math.min(delta, 1 / 30) / 2.4);
        const spread = 0.7;
        const growth = (delay: number) => clamp01(progress.current * (1 + spread) - delay * spread);
        const tiny = 0.0001;

        let pi = 0;
        let bi = 0;
        let fi = 0;
        let li = 0;
        trees.forEach((t, i) => {
            const g = growth(t.delay);
            const grow = g === 0 ? tiny : Math.max(tiny, easeOutBack(g));
            const trunk = t.trunk * grow;
            const r = t.radius * grow;
            const cy = trunk + r * 0.35;

            dummy.rotation.set(0, 0, 0);
            dummy.position.set(t.x, trunk / 2, t.z);
            dummy.scale.set(1, trunk, 1);
            dummy.updateMatrix();
            trunkMesh.current?.setMatrixAt(i, dummy.matrix);

            t.puffs.forEach((p) => {
                dummy.position.set(t.x + p.offset.x * r, cy + p.offset.y * r, t.z + p.offset.z * r);
                dummy.rotation.set(p.tint * 9, p.tint * 13, 0);
                dummy.scale.setScalar(Math.max(tiny, p.size * r));
                dummy.updateMatrix();
                puffMesh.current?.setMatrixAt(pi++, dummy.matrix);
            });

            // Flowers open once the tree has mostly grown; fruit and fallen petals after
            const bloom = clamp01((g - 0.55) / 0.45);
            dummy.rotation.set(0, 0, 0);
            t.blossoms.forEach((p) => {
                dummy.position.set(t.x + p.x * r * 1.02, cy + 0.12 * r + p.y * r * 0.95, t.z + p.z * r * 1.02);
                dummy.scale.setScalar(Math.max(tiny, 0.03 * bloom));
                dummy.updateMatrix();
                blossomMesh.current?.setMatrixAt(bi++, dummy.matrix);
            });
            const ripe = clamp01((g - 0.8) / 0.2);
            t.fruits.forEach((p) => {
                dummy.position.set(t.x + p.x * r, cy + p.y * r * 0.9, t.z + p.z * r);
                dummy.scale.setScalar(Math.max(tiny, 0.04 * ripe));
                dummy.updateMatrix();
                fruitMesh.current?.setMatrixAt(fi++, dummy.matrix);
            });
            t.petals.forEach((p) => {
                dummy.position.set(t.x + p.x, 0.006, t.z + p.z);
                dummy.rotation.set(-Math.PI / 2, 0, p.rot);
                dummy.scale.set(Math.max(tiny, 0.035 * ripe), Math.max(tiny, 0.022 * ripe), 1);
                dummy.updateMatrix();
                petalMesh.current?.setMatrixAt(li++, dummy.matrix);
            });
        });

        tufts.forEach((t, i) => {
            const g = growth(t.delay);
            dummy.position.set(t.x, 0.03, t.z);
            dummy.rotation.set(0, t.delay * 25, 0);
            dummy.scale.setScalar(Math.max(tiny, 0.07 * easeOutBack(g)));
            dummy.updateMatrix();
            tuftMesh.current?.setMatrixAt(i, dummy.matrix);
        });

        const done = progress.current >= 1;
        for (const m of [trunkMesh, puffMesh, blossomMesh, fruitMesh, petalMesh, tuftMesh]) {
            if (!m.current) continue;
            m.current.instanceMatrix.needsUpdate = true;
            // the garden sits in view while it grows; size the bounds once, when it's done,
            // rather than walking every instance each frame
            if (done) m.current.computeBoundingSphere();
        }
        if (done) settled.current = true;
    });

    const hover = (day: GardenDay, e: { stopPropagation: () => void; nativeEvent: PointerEvent }) => {
        e.stopPropagation();
        onHover({ day, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    };
    const leave = () => onHover(null);

    return (
        <>
            <instancedMesh ref={trunkMesh} args={[undefined, undefined, Math.max(1, trees.length)]} castShadow
                onPointerMove={(e) => e.instanceId !== undefined && hover(trees[e.instanceId].day, e)} onPointerOut={leave}>
                <cylinderGeometry args={[0.03, 0.055, 1, 6]} />
                <meshStandardMaterial color={colors.trunk} roughness={0.9} />
            </instancedMesh>
            <instancedMesh ref={puffMesh} args={[undefined, undefined, Math.max(1, counts.puffs)]} castShadow
                onPointerMove={(e) => e.instanceId !== undefined && hover(trees[puffOwner[e.instanceId]].day, e)} onPointerOut={leave}>
                <icosahedronGeometry args={[1, 1]} />
                <meshStandardMaterial ref={puffMaterial} flatShading roughness={0.8} />
            </instancedMesh>
            <instancedMesh ref={blossomMesh} args={[undefined, undefined, Math.max(1, counts.blossoms)]}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color={colors.blossom} roughness={0.5} emissive={colors.blossom} emissiveIntensity={0.25} />
            </instancedMesh>
            <instancedMesh ref={fruitMesh} args={[undefined, undefined, Math.max(1, counts.fruits)]}>
                <sphereGeometry args={[1, 8, 6]} />
                <meshStandardMaterial color={colors.fruit} roughness={0.35} />
            </instancedMesh>
            <instancedMesh ref={petalMesh} args={[undefined, undefined, Math.max(1, counts.petals)]} receiveShadow>
                <circleGeometry args={[1, 6]} />
                <meshStandardMaterial ref={petalMaterial} roughness={0.8} side={THREE.DoubleSide} />
            </instancedMesh>
            <instancedMesh ref={tuftMesh} args={[undefined, undefined, Math.max(1, tufts.length)]}
                onPointerMove={(e) => e.instanceId !== undefined && hover(tufts[e.instanceId].day, e)} onPointerOut={leave}>
                <coneGeometry args={[0.8, 1, 5]} />
                <meshStandardMaterial color={colors.grass} flatShading roughness={0.9} />
            </instancedMesh>
        </>
    );
};

// Frames the garden straight on: moves the camera back until the planted area
// fills the width and stays inside the height (corners are checked at ground
// level and at the height trees actually reach near the edges); then sets the haze.
const FitCamera = ({ width, depth, edgeHeight, haze }: { width: number; depth: number; edgeHeight: number; haze: string }) => {
    const { camera, size, scene } = useThree();
    useLayoutEffect(() => {
        const cam = camera as THREE.PerspectiveCamera;
        const dir = new THREE.Vector3(0, Math.sin(ELEVATION), Math.cos(ELEVATION));
        const target = new THREE.Vector3(0, 0.45, 0);
        const corners: THREE.Vector3[] = [];
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [0, edgeHeight]) {
            corners.push(new THREE.Vector3((sx * width) / 2, y, (sz * depth) / 2));
        }
        const p = new THREE.Vector3();
        let distance = 2;
        for (; distance < 120; distance += 0.05) {
            cam.position.copy(dir).multiplyScalar(distance).add(target);
            cam.lookAt(target);
            cam.updateMatrixWorld();
            cam.updateProjectionMatrix();
            if (corners.every((c) => {
                p.copy(c).project(cam);
                return Math.abs(p.x) <= 0.92 && Math.abs(p.y) <= 0.86;
            })) break;
        }
        // Haze in the page colour: the back bed softens into the background like distance
        scene.fog = new THREE.Fog(haze, distance * 0.95, distance + depth * 2.4);
    }, [camera, scene, size.width, size.height, width, depth, edgeHeight, haze]);
    return null;
};

const ContributionGarden = ({ weeks, colors, animate, cursorBird, active, onHover }: GardenProps) => {
    const groundTexture = useMemo(() => makeGroundTexture(), []);

    const { trees, tufts, ponds, width, depth, edgeHeight } = useMemo(() => {
        const days = weeks.flat().filter((d): d is GardenDay => !!d);
        const maxOf = (k: Kind) => Math.max(1, ...days.map((d) => d[k]?.count ?? 0));
        const max = { github: maxOf('github'), leetcode: maxOf('leetcode') };
        const cols = Math.ceil(weeks.length / 2);
        const rows = 7 * 2 + 1; // two beds of 7 days with a path between
        const treeList: Tree[] = [];
        const tuftList: Tuft[] = [];
        let edge = 0;
        weeks.forEach((week, w) => {
            const bed = w < cols ? 0 : 1; // older half at the back
            const col = w % cols;
            week.forEach((day, d) => {
                if (!day) return;
                const seed = w * 7 + d + 1;
                const row = bed * 8 + d;
                // a little jitter so it reads as a garden, not a spreadsheet
                const x = (col - (cols - 1) / 2) * PITCH + (rand(seed) - 0.5) * 0.08;
                const z = (row - (rows - 1) / 2) * PITCH + (rand(seed + 0.5) - 0.5) * 0.08;
                const delay = weeks.length > 1 ? w / (weeks.length - 1) : 0;
                const gh = day.github?.count ? day.github : null;
                const lc = day.leetcode?.count ? day.leetcode : null;
                if (!gh && !lc) {
                    tuftList.push({ day, x, z, delay });
                    return;
                }
                const shared = !!gh && !!lc;
                // On shared days the cherry steps back-left and the jacaranda forward-right
                const nudge = shared ? 0.11 : 0;
                if (gh) treeList.push(plantTree(day, 'github', gh, x - nudge, z - nudge * 0.6, delay, seed, max.github, shared));
                if (lc) treeList.push(plantTree(day, 'leetcode', lc, x + nudge, z + nudge * 0.6, delay, seed + 500, max.leetcode, shared));
                if (col === 0 || col === cols - 1 || row === 0 || row === rows - 1) {
                    for (const t of treeList.slice(shared ? -2 : -1)) edge = Math.max(edge, t.trunk + t.radius * 1.4);
                }
            });
        });
        const width = cols * PITCH;
        const depth = rows * PITCH;
        // Big clearings of quiet days become ponds; their grass tufts make way for the water
        const pondList = findPonds(tuftList, treeList, width / 2, depth / 2);
        const inPond = (t: Tuft, p: PondSpot) => Math.hypot(t.x - p.x, (t.z - p.z) / POND_SQUASH) <= p.r * 1.2;
        const dry = tuftList.filter((t) => pondList.every((p) => !inPond(t, p)));
        for (const p of pondList) {
            const dates = tuftList.filter((t) => inPond(t, p)).map((t) => t.day.date).sort();
            if (dates.length) p.quiet = { from: dates[0], to: dates[dates.length - 1], days: dates.length };
        }
        return { trees: treeList, tufts: dry, ponds: pondList, width, depth, edgeHeight: Math.max(0.4, edge) };
    }, [weeks]);

    return (
        <Canvas
            shadows
            dpr={[1, 2]}
            frameloop={active ? 'always' : 'never'}
            camera={{ fov: 30, near: 0.1, far: 200 }}
            gl={{ antialias: true, alpha: true }}
            style={{ touchAction: 'pan-y' }}
            onPointerMissed={() => onHover(null)}
        >
            <AdaptiveResolution />
            <FitCamera width={width} depth={depth} edgeHeight={edgeHeight} haze={colors.background} />
            <hemisphereLight args={['#FFF6F9', colors.ground, 1.25]} />
            <directionalLight
                position={[-5, 10, 7]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={8}
                shadow-camera-bottom={-8}
                shadow-bias={-0.0005}
            />
            <directionalLight position={[8, 4, -6]} intensity={0.4} color="#F2AEBC" />

            <group>
                {/* Lawn that fades out into the page */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[width * 1.3, depth * 1.45]} />
                    <meshStandardMaterial color={colors.ground} map={groundTexture} transparent depthWrite={false} roughness={1} />
                </mesh>
                {ponds.map((p) => <Pond key={`${p.x},${p.z}`} pond={p} colors={colors} animate={animate} onHover={onHover} />)}
                <Garden trees={trees} tufts={tufts} colors={colors} animate={animate} onHover={onHover} />
                <Animals width={width} depth={depth} ponds={ponds} animate={animate} />
                <SkyBirds width={width} depth={depth} animate={animate} />
                {cursorBird && <CursorBird ponds={ponds} />}
            </group>

        </Canvas>
    );
};

export default ContributionGarden;
