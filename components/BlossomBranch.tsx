'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { rng, buildBark, Blossoms, type Segment, type Bloom } from './ContactTree';
import { useGardenColors } from '../lib/gardenColors';
import { Html } from '@react-three/drei';
import { setBlossomSource } from '../lib/blossomSource';
import type { GardenColors } from './ContributionGarden';
import HangingTag from './HangingTag';
import { ThemeLantern } from './HeroLantern';
import { STATS } from './heroShared';

// The hero's centrepiece: one cherry-blossom branch reaching in from the right
// edge, built from the same flowers and bark as the contact tree. The base holds
// still; only the blossoming tip sways gently from side to side. It publishes
// where its flowers sit on the page, and the site's falling petals (Petals3D)
// are released from there. Loaded lazily by Hero.

// Grows a bough: a long main limb that droops as it reaches left, with side
// shoots along it that split again into flowering twigs
const growBranch = () => {
    const random = rng(2026);
    const segments: Segment[] = [];
    const flowering: { a: THREE.Vector3; b: THREE.Vector3; depth: number }[] = [];
    const joints: THREE.Vector3[] = []; // along the main limb, base to tip

    const grow = (start: THREE.Vector3, dir: THREE.Vector3, length: number, radius: number, depth: number) => {
        const steps = depth === 0 ? 6 : 4;
        let p = start.clone();
        const d = dir.clone();
        let r = radius;
        for (let s = 0; s < steps; s++) {
            // gentle wander; only the main limb droops a little under its weight
            d.add(new THREE.Vector3((random() - 0.5) * 0.22, (random() - 0.5) * 0.28 - (depth === 0 ? 0.04 : 0.01), (random() - 0.5) * 0.25)).normalize();
            const next = p.clone().addScaledVector(d, length / steps);
            const rNext = radius * (1 - ((s + 1) / steps) * 0.55);
            segments.push({ a: p, b: next, r0: r, r1: rNext });
            if (depth === 0) joints.push(next);
            // flowers crowd the thinner wood: side shoots, and the outer part of the main limb
            if (depth > 0 || s >= 2) flowering.push({ a: p, b: next, depth });
            // side shoots along the limb, alternating up and down
            if (depth < 2 && s > 0 && random() < (depth === 0 ? 0.85 : 0.6)) {
                // shoots mostly reach up and forward, a few angle down, like a real bough
                const up = random() < 0.68;
                const side = up ? 0.55 + random() * 0.45 : -(0.35 + random() * 0.3);
                const axis = new THREE.Vector3(0, 0, 1);
                const childDir = d.clone().applyAxisAngle(axis, side).add(new THREE.Vector3(0, 0, (random() - 0.4) * 0.6)).normalize();
                grow(next, childDir, length * (depth === 0 ? 0.42 : 0.5) * (0.8 + random() * 0.4), rNext * 0.65, depth + 1);
            }
            p = next;
            r = rNext;
        }
    };

    // a bare stretch of bough running off past the right edge of the screen
    segments.push({ a: new THREE.Vector3(7.5, 1.75, -0.45), b: new THREE.Vector3(3.4, 1.3, -0.3), r0: 0.13, r1: 0.1 });
    grow(new THREE.Vector3(3.4, 1.3, -0.3), new THREE.Vector3(-1, -0.12, 0.12).normalize(), 5.0, 0.1, 0);

    // Flowers face the viewer (give or take), clustered along the flowering wood
    const flowers: Bloom[] = [];
    const leaves: Bloom[] = [];
    const z = new THREE.Vector3(0, 0, 1);
    for (const f of flowering) {
        const n = f.depth === 2 ? 25 : f.depth === 1 ? 19 : 10;
        for (let i = 0; i < n; i++) {
            const pos = f.a.clone().lerp(f.b, random()).add(new THREE.Vector3(random() - 0.5, random() - 0.45, random() - 0.5).multiplyScalar(0.32));
            const facing = new THREE.Vector3((random() - 0.5) * 1.4, (random() - 0.3) * 1.2, 0.6 + random() * 0.6).normalize();
            const quat = new THREE.Quaternion().setFromUnitVectors(z, facing).multiply(new THREE.Quaternion().setFromAxisAngle(z, random() * Math.PI * 2));
            flowers.push({ pos, quat, scale: 0.07 + random() * 0.045, shade: random() });
        }
        if (random() < 0.35) {
            const pos = f.b.clone().add(new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(0.12));
            const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(random() * 6, random() * 6, random() * 6));
            leaves.push({ pos, quat, scale: 0.06 + random() * 0.03, shade: random() });
        }
    }
    const box = new THREE.Box3();
    flowers.forEach((fl) => box.expandByPoint(fl.pos));
    const hangs = pickHangPoints(flowering, box);
    return { bark: buildBark(segments), flowers, leaves, box, hangs, lantern: pickLanternPoint(joints, hangs) };
};

// Where the tanzaku tags are tied: the lowest twig tips, spread out along the
// bough, left to right
const pickHangPoints = (flowering: { b: THREE.Vector3; depth: number }[], box: THREE.Box3) => {
    const gap = (box.max.x - box.min.x) / 6;
    const tips = flowering.filter((f) => f.depth > 0 && f.b.x < 2.6).map((f) => f.b).sort((a, b) => a.y - b.y);
    const picked: THREE.Vector3[] = [];
    for (const t of tips) {
        if (picked.length === 4) break;
        if (picked.every((p) => Math.abs(p.x - t.x) > gap)) picked.push(t);
    }
    return picked.sort((a, b) => a.x - b.x);
};

// Where the lantern hangs: a joint of the main limb out toward the base, well
// clear of the tags, so it has the bough to itself
const pickLanternPoint = (joints: THREE.Vector3[], hangs: THREE.Vector3[]) => {
    const rightmostTag = Math.max(...hangs.map((h) => h.x));
    const target = rightmostTag + (BASE_X - rightmostTag) * 0.55;
    return joints.reduce((best, j) => (Math.abs(j.x - target) < Math.abs(best.x - target) ? j : best), joints[0]);
};

// The tip sway: a vertex-shader bend that is zero where the bough enters (off the
// right edge) and grows toward the tip, so the base stays put and only the
// blossoming end waves. Applied to the bark and to every flower and leaf.
const BASE_X = 3.4; // where the bough enters
const REACH = 5.2; // distance from the base to the tip
const SWAY = 0.1; // how far the very tip travels, either side

const bendShader = (time: { value: number }, amp: number) => (shader: THREE.WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;')
        .replace('#include <project_vertex>', `
            vec4 mvPosition = vec4( transformed, 1.0 );
            #ifdef USE_INSTANCING
                mvPosition = instanceMatrix * mvPosition;
            #endif
            float bend = clamp((${BASE_X.toFixed(2)} - mvPosition.x) / ${REACH.toFixed(2)}, 0.0, 1.0);
            bend *= bend; // stiff near the base, supple at the tip
            float wave = sin(uTime * 0.9 + bend * 1.6);
            mvPosition.x += bend * ${amp.toFixed(3)} * wave;
            mvPosition.y += bend * ${(amp * 0.3).toFixed(3)} * sin(uTime * 0.9 + 1.1 + bend * 1.6);
            mvPosition = modelViewMatrix * mvPosition;
            gl_Position = projectionMatrix * mvPosition;
        `);
};

// The same bend on the CPU, for the knots the tags hang from
const bendAt = (x: number, t: number, amp: number) => {
    const bend = Math.min(Math.max((BASE_X - x) / REACH, 0), 1) ** 2;
    return [bend * amp * Math.sin(t * 0.9 + bend * 1.6), bend * amp * 0.3 * Math.sin(t * 0.9 + 1.1 + bend * 1.6)];
};

// How far each tag's thread drops below its twig, px
const THREADS = [34, 58, 22, 46];

export type ThemeSwitch = { theme: 'light' | 'dark'; onToggleTheme: (origin: { x: number; y: number }) => void };

type BoughProps = {
    branch: ReturnType<typeof growBranch>;
    colors: GardenColors;
    animate: boolean;
    tagLayer?: React.RefObject<HTMLElement | null>;
    themeSwitch?: ThemeSwitch;
};

const Bough = ({ branch, colors, animate, tagLayer, themeSwitch }: BoughProps) => {
    const group = useRef<THREE.Group>(null);
    const time = useRef({ value: 0 }); // shader uniform, ticked every frame
    const knots = useRef<(THREE.Group | null)[]>([]);
    const lanternKnot = useRef<THREE.Group>(null);

    // Patch every material in the bough with the bend (again whenever colours change)
    useLayoutEffect(() => {
        const patch = bendShader(time.current, animate ? SWAY : 0);
        group.current?.traverse((o) => {
            const mesh = o as THREE.Mesh;
            const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
            if (!mat || !('onBeforeCompile' in mat)) return;
            mat.onBeforeCompile = patch;
            mat.customProgramCacheKey = () => `bough-bend-${animate}`;
            mat.needsUpdate = true;
        });
    }, [colors, time, animate]);

    useFrame((_, delta) => {
        time.current.value += Math.min(delta, 0.05);
        if (!animate) return;
        branch.hangs.forEach((p, i) => {
            const [dx, dy] = bendAt(p.x, time.current.value, SWAY);
            knots.current[i]?.position.set(p.x + dx, p.y + dy, p.z);
        });
        const l = branch.lantern;
        const [lx, ly] = bendAt(l.x, time.current.value, SWAY);
        lanternKnot.current?.position.set(l.x + lx, l.y + ly, l.z);
    });

    return (
        <>
            <group ref={group}>
                <mesh geometry={branch.bark}>
                    <meshStandardMaterial color={colors.trunk} roughness={0.9} />
                </mesh>
                <Blossoms flowers={branch.flowers} leaves={branch.leaves} colors={colors} />
            </group>
            {/* the tags live in a DOM layer above the hero text, pinned to their twigs */}
            {tagLayer && branch.hangs.map((p, i) => (
                <group key={i} ref={(el) => { knots.current[i] = el; }} position={p}>
                    <Html portal={tagLayer as React.RefObject<HTMLElement>} zIndexRange={[10, 0]} pointerEvents="none">
                        <HangingTag stat={STATS[i]} index={i} thread={THREADS[i]} />
                    </Html>
                </group>
            ))}
            {/* the lantern: the page's light switch */}
            {tagLayer && themeSwitch && (
                <group ref={lanternKnot} position={branch.lantern}>
                    <Html portal={tagLayer as React.RefObject<HTMLElement>} zIndexRange={[11, 0]} pointerEvents="none">
                        <ThemeLantern theme={themeSwitch.theme} onToggle={themeSwitch.onToggleTheme} cord={88} />
                    </Html>
                </group>
            )}
        </>
    );
};

// Frames the branch so it fills the canvas, its base tucked past the right edge
const FitCamera = ({ box }: { box: THREE.Box3 }) => {
    const { camera, size } = useThree();
    useLayoutEffect(() => {
        const cam = camera as THREE.PerspectiveCamera;
        const centre = box.getCenter(new THREE.Vector3());
        const target = new THREE.Vector3(centre.x + (box.max.x - centre.x) * 0.45, centre.y, 0);
        const p = new THREE.Vector3();
        const corners: THREE.Vector3[] = [];
        for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const zz of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(x, y, zz));
        for (let d = 2; d < 40; d += 0.04) {
            cam.position.set(target.x, target.y + 0.2, d);
            cam.lookAt(target);
            cam.updateMatrixWorld();
            cam.updateProjectionMatrix();
            // the left (blossom) end must fit; the base may run off the right edge
            if (corners.every((c) => {
                p.copy(c).project(cam);
                return p.x >= -0.94 && Math.abs(p.y) <= 0.9;
            })) break;
        }
    }, [camera, size.width, size.height, box]);
    return null;
};

// Projects a sample of the flowers to the screen and publishes them in page
// pixels, as the starting points for the site's falling petals
const PublishSource = ({ flowers }: { flowers: Bloom[] }) => {
    const { camera, size, gl } = useThree();
    useLayoutEffect(() => {
        const publish = () => {
            const rect = gl.domElement.getBoundingClientRect();
            if (!rect.width) return;
            const p = new THREE.Vector3();
            const pts = flowers.filter((_, i) => i % 4 === 0).map((f) => {
                p.copy(f.pos).project(camera);
                return [
                    rect.left + window.scrollX + ((p.x + 1) / 2) * rect.width,
                    rect.top + window.scrollY + ((1 - p.y) / 2) * rect.height,
                ] as [number, number];
            });
            setBlossomSource(pts);
        };
        publish();
        // the hero fades in and settles; publish again once layout is final
        const id = setTimeout(publish, 1200);
        return () => clearTimeout(id);
    }, [camera, size.width, size.height, gl, flowers]);
    return null;
};

// tagLayer: a DOM box laid exactly over this canvas, above the hero text, that
// the hanging stat tags render into
// themeSwitch: the page's theme and its toggle, for the lantern
const BlossomBranch = ({ tagLayer, themeSwitch }: { tagLayer?: React.RefObject<HTMLElement | null>; themeSwitch?: ThemeSwitch }) => {
    const holder = useRef<HTMLDivElement>(null);
    const [onScreen, setOnScreen] = useState(true);
    const [animate] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    // Only animate the sway while the hero is on screen
    useEffect(() => {
        const el = holder.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const colors = useGardenColors(); // re-renders when the theme flips
    const branch = useMemo(() => growBranch(), []);
    return (
        <div ref={holder} aria-hidden className="h-full w-full">
            <Canvas
                dpr={[1, 2]}
                frameloop={animate && onScreen ? 'always' : 'demand'}
                camera={{ fov: 32, near: 0.1, far: 100 }}
                gl={{ antialias: true, alpha: true }}
                style={{ pointerEvents: 'none' }}
            >
                <FitCamera box={branch.box} />
                {/* same lights as the background petals, so flowers and petals match */}
                <hemisphereLight args={['#FFFFFF', '#F7C6D4', 1.25]} />
                <directionalLight position={[-4, 6, 8]} intensity={1.6} />
                <directionalLight position={[5, -3, 5]} intensity={0.6} color="#FFD6E2" />
                <Bough branch={branch} colors={colors} animate={animate} tagLayer={tagLayer} themeSwitch={themeSwitch} />
                <PublishSource flowers={branch.flowers} />
            </Canvas>
        </div>
    );
};

export default BlossomBranch;
