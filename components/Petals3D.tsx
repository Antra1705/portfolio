'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { getBlossomSource, onBlossomSource } from '../lib/blossomSource';

// Falling cherry-blossom petals drawn in WebGL: each petal is a cupped, notched
// sakura petal, pale at the base and pinker at the tip, tumbling in 3D so it
// catches the light as it turns. Every petal is released from a flower on the
// hero branch (see lib/blossomSource), streams out and fans across the width,
// then drifts down the whole length of the page before returning to the branch.
// Petals live in page coordinates; the fixed canvas draws the ones in view.
// Loaded lazily by FallingPetals once the page is idle.

export interface Petals3DProps {
    perScreen: number; // petals per viewport-height of page, on average
    minSize: number; // on-screen size range in CSS pixels
    maxSize: number;
    opacity: number;
    onReady?: () => void;
}

// Keeps a scene at full sharpness while it runs smoothly, and steps its pixel
// ratio down (in half steps, so it rarely resizes) when frames start to drop.
// Only for canvases that draw every frame: on 'demand' the sparse frames read as slow.
export const AdaptiveResolution = ({ max = 2 }: { max?: number }) => {
    const setDpr = useThree((s) => s.setDpr);
    const best = Math.min(max, window.devicePixelRatio || 1);
    return (
        <PerformanceMonitor
            factor={1}
            flipflops={3}
            onChange={({ factor }) => setDpr(Math.max(1, Math.round((1 + (best - 1) * factor) * 2) / 2))}
            onFallback={() => setDpr(1)}
        />
    );
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

// A sakura petal: rounded sides, a small notch at the tip, cupped like a spoon
// `detail` is the curve resolution: lower it for petals drawn in their thousands (the contact tree)
export const makePetalGeometry = (detail = 12) => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.3, 0.14, 0.38, 0.62, 0.17, 0.97);
    s.quadraticCurveTo(0.09, 0.92, 0, 0.84); // notch
    s.quadraticCurveTo(-0.09, 0.92, -0.17, 0.97);
    s.bezierCurveTo(-0.38, 0.62, -0.3, 0.14, 0, 0);
    const geometry = new THREE.ShapeGeometry(s, detail);

    const pos = geometry.attributes.position;
    const colors: number[] = [];
    const base = new THREE.Color('#FFF1F5');
    const tip = new THREE.Color('#F48DAE');
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        // cup across the width and curl gently along the length
        pos.setZ(i, x * x * 1.3 + Math.sin(y * Math.PI) * 0.08);
        c.copy(base).lerp(tip, Math.min(1, y * 1.05));
        colors.push(c.r, c.g, c.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.translate(0, -0.5, 0); // spin around the petal's middle
    geometry.computeVertexNormals();
    return geometry;
};

interface Petal {
    sx: number; sy: number; // release point on the branch, page px
    tx: number; // the column it settles into as it falls, page px
    y: number; // current height on the page, page px
    life: number; // how far it falls before fading out, px (Infinity: all the way down the page)
    speed: number; // fall speed, px/s
    z: number;
    sway: number; // px
    swaySpeed: number;
    phase: number;
    size: number; // px
    rot: THREE.Euler;
    spin: THREE.Vector3; // radians/sec around each axis
}

const FAN = 1.4; // viewport-heights of fall over which a petal fans out to its column

const pickSource = (): [number, number] => {
    const pts = getBlossomSource();
    if (pts && pts.length) {
        const [x, y] = pts[Math.floor(Math.random() * pts.length)];
        return [x + rand(-12, 12), y + rand(-8, 8)];
    }
    // the branch hasn't reported yet: its usual place, top right of the hero
    return [window.innerWidth * rand(0.55, 0.85), window.innerHeight * rand(0.25, 0.55)];
};

// Two kinds of petal: travellers drift down the whole page; flutterers fall a
// screen or two and fade, so the shower is thickest right under the branch
const spawn = (minSize: number, maxSize: number, docH: number, anywhere: boolean, traveller: boolean): Petal => {
    const [sx, sy] = pickSource();
    const life = traveller ? Infinity : window.innerHeight * rand(0.7, 2.2);
    return {
        sx,
        sy,
        tx: rand(0.02, 0.98) * window.innerWidth,
        // starting part-way along means the page is already sprinkled when it loads
        y: anywhere ? rand(sy, traveller ? docH : sy + life) : sy,
        life,
        speed: rand(38, 64),
        z: rand(-3, 2),
        sway: rand(12, 34),
        swaySpeed: rand(0.6, 1.4),
        phase: rand(0, Math.PI * 2),
        size: rand(minSize, maxSize),
        rot: new THREE.Euler(rand(0, 6.28), rand(0, 6.28), rand(0, 6.28)),
        spin: new THREE.Vector3(rand(-1.6, 1.6), rand(-1.2, 1.2), rand(-0.8, 0.8)),
    };
};

const smoothstep = (t: number) => t * t * (3 - 2 * t);

const pageHeight = () => document.documentElement.scrollHeight;

const Petals = ({ perScreen, minSize, maxSize, opacity, onReady, light }: Petals3DProps & { light: boolean }) => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const geometry = useMemo(() => makePetalGeometry(), []);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const { camera, size } = useThree();
    const reported = useRef(false);
    const docH = useRef(pageHeight());
    // enough travellers that every screenful of the page has about `perScreen`,
    // plus flutterers near the branch
    const [travellers] = useState(() => Math.min(320, Math.ceil((pageHeight() / window.innerHeight) * perScreen)));
    const flutterers = Math.round(perScreen * 3);
    const count = travellers + flutterers;
    const petalsRef = useRef<Petal[] | null>(null);

    useEffect(() => {
        const spread = () => {
            petalsRef.current = Array.from({ length: count }, (_, i) => spawn(minSize, maxSize, docH.current, true, i < travellers));
        };
        spread();
        // once the branch reports its flowers, re-release the petals from there
        const off = onBlossomSource(spread);
        // the page grows as sections load; keep the fall running to the very end
        const ro = new ResizeObserver(() => { docH.current = pageHeight(); });
        ro.observe(document.body);
        return () => {
            off();
            ro.disconnect();
        };
    }, [count, travellers, minSize, maxSize]);

    useFrame((state, delta) => {
        const m = mesh.current;
        const petals = petalsRef.current;
        if (!m || !petals) return;
        const dt = Math.min(delta, 0.05); // no jumps after a stalled frame
        const cam = camera as THREE.PerspectiveCamera;
        const t = state.clock.elapsedTime;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const scrollY = window.scrollY;
        petals.forEach((p, i) => {
            p.y += p.speed * dt;
            const fallen = p.y - p.sy;
            if (p.y > docH.current + 40 || fallen > p.life) Object.assign(p, spawn(minSize, maxSize, docH.current, false, p.life === Infinity));
            // out of view: park it at zero scale
            const sy = p.y - scrollY;
            if (sy < -80 || sy > vh + 80) {
                dummy.scale.setScalar(0);
                dummy.updateMatrix();
                m.setMatrixAt(i, dummy.matrix);
                return;
            }
            // from the branch, ease out to its column over the first stretch of the fall
            const fan = smoothstep(Math.min(1, (p.y - p.sy) / (vh * FAN)));
            const x = p.sx + (p.tx - p.sx) * fan + Math.sin(t * p.swaySpeed + p.phase) * p.sway * (0.3 + 0.7 * fan);
            // visible area at this petal's depth, so page px map onto the screen
            const halfH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * (cam.position.z - p.z);
            const halfW = halfH * cam.aspect;
            dummy.position.set((x / vw - 0.5) * halfW * 2, (0.5 - sy / vh) * halfH * 2, p.z);
            dummy.rotation.set(p.rot.x + p.spin.x * t, p.rot.y + p.spin.y * t, p.rot.z + p.spin.z * t);
            // petals grow from bud-size as they leave the flower; flutterers shrink away at the end
            const grow = (0.4 + 0.6 * Math.min(1, fallen / 60)) * Math.min(1, (p.life - fallen) / 140);
            dummy.scale.setScalar((p.size / size.height) * halfH * 2 * grow);
            dummy.updateMatrix();
            m.setMatrixAt(i, dummy.matrix);
        });
        m.instanceMatrix.needsUpdate = true;
        if (!reported.current) {
            reported.current = true;
            onReady?.();
        }
    });

    return (
        <instancedMesh ref={mesh} args={[geometry, undefined, count]} frustumCulled={false}>
            <meshStandardMaterial
                vertexColors
                // On the cream light theme pale petals vanish, so tint them deeper pink
                color={light ? '#F27DA2' : '#FFFFFF'}
                side={THREE.DoubleSide}
                roughness={0.45}
                emissive="#F7B8CA"
                emissiveIntensity={light ? 0.1 : 0.28}
                transparent
                opacity={opacity}
            />
        </instancedMesh>
    );
};

const Petals3D = (props: Petals3DProps) => {
    const holder = useRef<HTMLDivElement>(null);
    const [onScreen, setOnScreen] = useState(true);
    const [light, setLight] = useState(() => document.documentElement.dataset.theme === 'light');

    // Follow the theme toggle
    useEffect(() => {
        const observer = new MutationObserver(() => setLight(document.documentElement.dataset.theme === 'light'));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    // Stop drawing when the layer is scrolled out of view (matters for the contained variant)
    useEffect(() => {
        const el = holder.current;
        if (!el) return;
        const observer = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={holder} className="petals-3d absolute inset-0">
            <Canvas
                dpr={[1, 1.5]}
                frameloop={onScreen ? 'always' : 'never'}
                camera={{ position: [0, 0, 10], fov: 40 }}
                gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
                style={{ pointerEvents: 'none' }}
            >
                <AdaptiveResolution max={1.5} />
                <hemisphereLight args={['#FFFFFF', '#F7C6D4', 1.25]} />
                <directionalLight position={[-4, 6, 8]} intensity={1.6} />
                <directionalLight position={[5, -3, 5]} intensity={0.6} color="#FFD6E2" />
                <Petals {...props} light={light} />
            </Canvas>
        </div>
    );
};

export default Petals3D;
