'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Wildlife for the 3D garden, in the same low-poly style as the trees:
//  - CursorBird: a kingfisher that flies to wherever the mouse is over the garden
//  - SkyBirds: two birds circling above the trees
//  - Animals: two bunnies hopping across the lawn
// Birds wear the site palette: sky blue, sakura pink and periwinkle on cream.
// All of it ignores the pointer, so hovering still reaches the trees for the tooltip.
// Under reduced motion the animals and sky birds hold still.

interface BirdPalette {
    back: string;
    belly: string;
    wing: string;
    beak: string;
}

const CURSOR_BIRD: BirdPalette = { back: '#9BD0ED', belly: '#F2AEBC', wing: '#5E93C9', beak: '#021D38' }; // sky blue, pink breast
const SAKURA_BIRD: BirdPalette = { back: '#F2AEBC', belly: '#FFFDE7', wing: '#D9789A', beak: '#021D38' };
const PERIWINKLE_BIRD: BirdPalette = { back: '#A7B5EE', belly: '#FFFDE7', wing: '#7F88D4', beak: '#021D38' };

const Mat = ({ color }: { color: string }) => <meshStandardMaterial color={color} flatShading roughness={0.7} />;

// Decoration never catches the pointer
const useNoRaycast = (ref: React.RefObject<THREE.Object3D | null>) => {
    useLayoutEffect(() => {
        ref.current?.traverse((o) => {
            o.raycast = () => {};
        });
    }, [ref]);
};

const smoothAngle = (from: number, to: number, t: number) => {
    const d = Math.atan2(Math.sin(to - from), Math.cos(to - from));
    return from + d * t;
};

// A low-poly bird facing +x. Wings flap at `flapSpeed` (radians/sec); 0 holds them half-open.
// `drink` (0..1) blends into a drinking pose: body tipped forward, wings tucked, head dipping.
const Bird = ({ palette, flapSpeed, phase = 0, drink }: { palette: BirdPalette; flapSpeed: React.RefObject<number>; phase?: number; drink?: React.RefObject<number> }) => {
    const root = useRef<THREE.Group>(null);
    const head = useRef<THREE.Group>(null);
    const left = useRef<THREE.Group>(null);
    const right = useRef<THREE.Group>(null);
    const angle = useRef(phase);
    const flapping = useRef(flapSpeed.current ? 1 : 0); // eases between flapping and wings held open
    useFrame(({ clock }, delta) => {
        const dt = Math.min(delta, 1 / 30);
        angle.current += dt * flapSpeed.current;
        flapping.current = THREE.MathUtils.damp(flapping.current, flapSpeed.current ? 1 : 0, 10, dt);
        const a = THREE.MathUtils.lerp(0.35, Math.sin(angle.current) * 0.8, flapping.current);
        const d = drink?.current ?? 0;
        if (left.current) {
            left.current.rotation.x = THREE.MathUtils.lerp(-a, 0.35, d);
            left.current.scale.z = THREE.MathUtils.lerp(1, 0.45, d);
        }
        if (right.current) {
            right.current.rotation.x = THREE.MathUtils.lerp(a, -0.35, d);
            right.current.scale.z = THREE.MathUtils.lerp(1, 0.45, d);
        }
        if (root.current) root.current.rotation.z = -0.3 * d;
        // Sip: the head dips into the water and comes back up
        const sip = Math.pow(Math.max(0, Math.sin(clock.elapsedTime * 2.6)), 2);
        if (head.current) head.current.rotation.z = -d * (0.35 + 0.75 * sip);
    });
    return (
        <group ref={root}>
            {/* body and breast */}
            <mesh scale={[1.5, 0.95, 0.95]} castShadow>
                <icosahedronGeometry args={[0.09, 1]} />
                <Mat color={palette.back} />
            </mesh>
            <mesh position={[0.03, -0.03, 0]} scale={[1.15, 0.72, 0.85]}>
                <icosahedronGeometry args={[0.08, 1]} />
                <Mat color={palette.belly} />
            </mesh>
            {/* head, beak, eyes, pivoting at the neck */}
            <group ref={head} position={[0.09, 0.03, 0]}>
                <mesh position={[0.03, 0.025, 0]} castShadow>
                    <icosahedronGeometry args={[0.066, 1]} />
                    <Mat color={palette.back} />
                </mesh>
                <mesh position={[0.11, 0.015, 0]} rotation={[0, 0, -Math.PI / 2]}>
                    <coneGeometry args={[0.02, 0.08, 6]} />
                    <Mat color={palette.beak} />
                </mesh>
                {[1, -1].map((s) => (
                    <mesh key={s} position={[0.075, 0.045, 0.042 * s]}>
                        <sphereGeometry args={[0.012, 6, 6]} />
                        <meshBasicMaterial color="#141414" />
                    </mesh>
                ))}
            </group>
            {/* tail */}
            <mesh position={[-0.17, 0.025, 0]} rotation={[0, 0, -Math.PI / 2 - 0.25]} scale={[1, 1, 0.35]}>
                <coneGeometry args={[0.055, 0.13, 4]} />
                <Mat color={palette.wing} />
            </mesh>
            {/* wings, hinged at the shoulders */}
            <group ref={left} position={[0, 0.045, 0.05]}>
                <mesh position={[-0.01, 0, 0.1]} scale={[1, 0.14, 1.15]} castShadow>
                    <icosahedronGeometry args={[0.09, 0]} />
                    <Mat color={palette.wing} />
                </mesh>
            </group>
            <group ref={right} position={[0, 0.045, -0.05]}>
                <mesh position={[-0.01, 0, -0.1]} scale={[1, 0.14, 1.15]} castShadow>
                    <icosahedronGeometry args={[0.09, 0]} />
                    <Mat color={palette.wing} />
                </mesh>
            </group>
        </group>
    );
};

export interface PondInfo {
    x: number;
    z: number;
    r: number;
}

export const POND_SQUASH = 0.78; // ponds are a little wider than deep
const BIRD_SCALE = 1.25;
const PERCH_Y = 0.12; // bird's body height when standing on the pond's stones

// Bird that flies to the pointer: it sits on a plane just above the treetops,
// so on screen it lands right under the cursor. Over a pond it flies down,
// perches on the stones at the water's edge facing the water, and drinks.
export const CursorBird = ({ ponds, height = 1.25 }: { ponds: PondInfo[]; height?: number }) => {
    const group = useRef<THREE.Group>(null);
    const inside = useRef(false);
    const placed = useRef(false);
    const flap = useRef(10);
    const drink = useRef(0);
    const yaw = useRef(0);
    const bank = useRef(0);
    const scale = useRef(0);
    const ray = useMemo(() => new THREE.Raycaster(), []);
    const sky = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -height), [height]);
    const ground = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
    const base = useMemo(() => new THREE.Vector3(), []); // smoothed position, before the hover bob
    const goal = useMemo(() => new THREE.Vector3(), []);
    const groundHit = useMemo(() => new THREE.Vector3(), []);
    const step = useMemo(() => new THREE.Vector3(), []);
    useNoRaycast(group);

    useFrame((state, frameDelta) => {
        const g = group.current;
        if (!g) return;
        const delta = Math.min(frameDelta, 1 / 30); // no lurch after a stalled frame
        ray.setFromCamera(state.pointer, state.camera);

        // Is the pointer over a pond?
        let pond: PondInfo | null = null;
        let around = 0;
        if (ray.ray.intersectPlane(ground, groundHit)) {
            for (const p of ponds) {
                const dx = groundHit.x - p.x;
                const dz = (groundHit.z - p.z) / POND_SQUASH;
                if (Math.hypot(dx, dz) < p.r * 1.2) {
                    pond = p;
                    around = Math.atan2(dz, dx);
                    break;
                }
            }
        }

        const flying = !pond;
        const hit = pond
            ? goal.set(pond.x + Math.cos(around) * pond.r * 1.03, PERCH_Y, pond.z + Math.sin(around) * pond.r * 1.03 * POND_SQUASH)
            : ray.ray.intersectPlane(sky, goal);

        if (hit && inside.current) {
            if (!placed.current) {
                base.copy(goal);
                placed.current = true;
            }
            step.copy(goal).sub(base);
            const distance = step.length();
            const speed = distance / Math.max(delta, 0.001);
            base.lerp(goal, 1 - Math.exp(-delta * (flying ? 12 : 6)));

            let targetYaw = yaw.current;
            if (pond) {
                targetYaw = Math.atan2(-(pond.z - goal.z), pond.x - goal.x); // face the water
            } else if (step.lengthSq() > 1e-6) {
                targetYaw = Math.atan2(-step.z, step.x); // face the direction of travel
            }
            const before = yaw.current;
            yaw.current = smoothAngle(yaw.current, targetYaw, 1 - Math.exp(-delta * 8));
            // bank into turns by turning rate (per second, so it's the same at any refresh rate)
            const turn = flying ? THREE.MathUtils.clamp(((yaw.current - before) / delta) * 0.13, -0.6, 0.6) : 0;
            bank.current = THREE.MathUtils.damp(bank.current, turn, 9, delta);

            // Landed on the rim: fold up and drink; otherwise keep flying
            const landed = !!pond && distance < 0.06;
            drink.current += ((landed ? 1 : 0) - drink.current) * (1 - Math.exp(-delta * 6));
            const flapGoal = 9 + Math.min(14, speed * 4);
            flap.current = landed ? 0 : THREE.MathUtils.damp(flap.current || flapGoal, flapGoal, 5, delta);
        }

        scale.current += ((inside.current && placed.current ? BIRD_SCALE : 0) - scale.current) * (1 - Math.exp(-delta * 10));
        g.visible = scale.current > 0.01;
        g.scale.setScalar(scale.current);
        g.rotation.set(bank.current, yaw.current, 0, 'YXZ');
        // gentle hover bob while flying
        g.position.copy(base);
        g.position.y += Math.sin(state.clock.elapsedTime * 3) * 0.02 * (1 - drink.current);
    });

    return (
        <>
            <PointerTracker inside={inside} placed={placed} />
            <group ref={group} visible={false}>
                <Bird palette={CURSOR_BIRD} flapSpeed={flap} drink={drink} />
            </group>
        </>
    );
};

// Mouse enter/leave on the canvas decides when the bird shows
const PointerTracker = ({ inside, placed }: { inside: React.RefObject<boolean>; placed: React.RefObject<boolean> }) => {
    const canvas = useThree((state) => state.gl.domElement);
    useEffect(() => {
        const move = (e: PointerEvent) => {
            if (e.pointerType === 'mouse') inside.current = true;
        };
        const leave = () => {
            inside.current = false;
            placed.current = false;
        };
        canvas.addEventListener('pointermove', move);
        canvas.addEventListener('pointerleave', leave);
        return () => {
            canvas.removeEventListener('pointermove', move);
            canvas.removeEventListener('pointerleave', leave);
        };
    }, [canvas, inside, placed]);
    return null;
};

// A bird circling above the garden on a tilted ellipse
const SkyBird = ({ palette, rx, rz, cx, cz, y, speed, phase, size, animate }: {
    palette: BirdPalette; rx: number; rz: number; cx: number; cz: number; y: number; speed: number; phase: number; size: number; animate: boolean;
}) => {
    const group = useRef<THREE.Group>(null);
    const flap = useRef(animate ? 11 : 0);
    useNoRaycast(group);
    useFrame(({ clock }) => {
        const g = group.current;
        if (!g) return;
        const t = (animate ? clock.elapsedTime * speed : 0) + phase;
        g.position.set(cx + Math.cos(t) * rx, y + Math.sin(t * 2) * 0.08, cz + Math.sin(t) * rz);
        // heading along the ellipse, banked into the circle
        g.rotation.set(-0.35 * Math.sign(speed), Math.atan2(-Math.cos(t) * rz * Math.sign(speed), -Math.sin(t) * rx * Math.sign(speed)), 0, 'YXZ');
        // glide every few seconds, like real birds
        flap.current = animate ? (Math.sin(t * 1.7) > 0.55 ? 0 : 11) : 0;
    });
    return (
        <group ref={group} scale={size}>
            <Bird palette={palette} flapSpeed={flap} phase={phase * 5} />
        </group>
    );
};

export const SkyBirds = ({ width, depth, animate }: { width: number; depth: number; animate: boolean }) => (
    <>
        <SkyBird palette={SAKURA_BIRD} rx={width * 0.3} rz={depth * 0.2} cx={-width * 0.1} cz={-depth * 0.12} y={1.85} speed={0.3} phase={0} size={0.75} animate={animate} />
        <SkyBird palette={PERIWINKLE_BIRD} rx={width * 0.26} rz={depth * 0.16} cx={width * 0.16} cz={-depth * 0.2} y={2.05} speed={-0.26} phase={2.2} size={0.68} animate={animate} />
    </>
);

// ---------- Animals ----------

const Bunny = ({ fur }: { fur: string }) => (
    <group>
        <mesh position={[0, 0.06, 0]} scale={[1.35, 1.05, 1]} castShadow>
            <icosahedronGeometry args={[0.055, 1]} />
            <Mat color={fur} />
        </mesh>
        <mesh position={[0.07, 0.11, 0]} castShadow>
            <icosahedronGeometry args={[0.04, 1]} />
            <Mat color={fur} />
        </mesh>
        {[1, -1].map((s) => (
            <group key={s} position={[0.06, 0.15, 0.016 * s]} rotation={[0.15 * s, 0, 0.35]}>
                <mesh position={[0, 0.04, 0]} scale={[0.6, 1, 0.35]}>
                    <icosahedronGeometry args={[0.04, 0]} />
                    <Mat color={fur} />
                </mesh>
                <mesh position={[0.006, 0.04, 0]} scale={[0.35, 0.75, 0.2]}>
                    <icosahedronGeometry args={[0.04, 0]} />
                    <Mat color="#F2AEBC" />
                </mesh>
            </group>
        ))}
        {[1, -1].map((s) => (
            <mesh key={s} position={[0.1, 0.12, 0.022 * s]}>
                <sphereGeometry args={[0.007, 6, 6]} />
                <meshBasicMaterial color="#141414" />
            </mesh>
        ))}
        <mesh position={[-0.075, 0.08, 0]}>
            <icosahedronGeometry args={[0.022, 1]} />
            <Mat color="#FFFFFF" />
        </mesh>
    </group>
);

type Path = (t: number) => { x: number; z: number };

// Pushes a point that falls in a pond out to just beyond its stones
const keepDry = (p: { x: number; z: number }, ponds: PondInfo[]) => {
    for (const pond of ponds) {
        const dx = p.x - pond.x;
        const dz = (p.z - pond.z) / POND_SQUASH;
        const d = Math.hypot(dx, dz);
        const edge = pond.r * 1.28;
        if (d < edge) {
            const k = edge / Math.max(d, 1e-4);
            return { x: pond.x + dx * k, z: pond.z + dz * k * POND_SQUASH };
        }
    }
    return p;
};

// Moves an animal along a path, facing where it is going, with a hop or a trot
const Wanderer = ({ path, ponds, speed, offset, gait, scale, animate, children }: {
    path: Path; ponds: PondInfo[]; speed: number; offset: number; gait: 'hop' | 'run'; scale: number; animate: boolean; children: React.ReactNode;
}) => {
    const outer = useRef<THREE.Group>(null);
    const inner = useRef<THREE.Group>(null);
    useNoRaycast(outer);
    useFrame(({ clock }, delta) => {
        const t = (animate ? clock.elapsedTime * speed : 0) + offset;
        const p = keepDry(path(t), ponds);
        const q = keepDry(path(t + 0.01), ponds);
        outer.current?.position.set(p.x, 0, p.z);
        // turn towards the heading, so skirting a pond doesn't snap it round
        if (outer.current) {
            const heading = Math.atan2(-(q.z - p.z), q.x - p.x);
            outer.current.rotation.y = animate ? smoothAngle(outer.current.rotation.y, heading, 1 - Math.exp(-Math.min(delta, 1 / 30) * 10)) : heading;
        }
        if (!inner.current || !animate) return;
        const e = clock.elapsedTime;
        if (gait === 'hop') {
            const h = Math.max(0, Math.sin(e * 7 + offset));
            inner.current.position.y = h * 0.11;
            inner.current.rotation.z = Math.cos(e * 7 + offset) * h * 0.25; // tips with the hop, level on landing
        } else {
            inner.current.position.y = Math.abs(Math.sin(e * 16 + offset)) * 0.035;
        }
    });
    return (
        <group ref={outer}>
            <group ref={inner} scale={scale}>{children}</group>
        </group>
    );
};

export const Animals = ({ width, depth, ponds, animate }: { width: number; depth: number; ponds: PondInfo[]; animate: boolean }) => {
    const paths = useMemo(() => {
        const w = width / 2;
        const d = depth / 2;
        return {
            // bunnies: one along the path between the beds, one across the front lawn
            middle: ((t) => ({ x: Math.sin(t) * w * 0.85, z: Math.sin(t * 2.3) * 0.08 })) as Path,
            front: ((t) => ({ x: Math.sin(t + 1) * w * 0.8, z: d * 1.06 + Math.sin(t * 1.9) * 0.1 })) as Path,
        };
    }, [width, depth]);

    return (
        <>
            <Wanderer ponds={ponds} path={paths.middle} speed={0.12} offset={0} gait="hop" scale={1.95} animate={animate}><Bunny fur="#F3EDE6" /></Wanderer>
            <Wanderer ponds={ponds} path={paths.front} speed={0.1} offset={2.5} gait="hop" scale={1.95} animate={animate}><Bunny fur="#B88A62" /></Wanderer>
        </>
    );
};

// ---------- Pond life ----------

export interface LilyPad {
    x: number;
    z: number;
    s: number;
    flower: boolean;
}

// A tiny frog that sits on a lily pad and now and then hops to the next one
const Frog = ({ pads, animate }: { pads: LilyPad[]; animate: boolean }) => {
    const group = useRef<THREE.Group>(null);
    // Prefer the pads without a flower; the frog visits them in turn
    const stops = useMemo(() => {
        const plain = pads.filter((p) => !p.flower);
        return plain.length >= 2 ? plain : pads;
    }, [pads]);
    useFrame(({ clock }, delta) => {
        const g = group.current;
        if (!g || !stops.length) return;
        const period = 4.6; // seconds per stop: sit, then hop
        const hop = 0.6;
        const t = animate ? clock.elapsedTime + 1.3 : 0;
        const i = Math.floor(t / period) % stops.length;
        const from = stops[i];
        const to = stops[(i + 1) % stops.length];
        const local = t % period;
        const k = stops.length > 1 ? Math.max(0, (local - (period - hop)) / hop) : 0;
        const glide = k * k * (3 - 2 * k); // push off and land softly
        g.position.set(
            THREE.MathUtils.lerp(from.x, to.x, glide),
            0.02 + Math.sin(k * Math.PI) * 0.09,
            THREE.MathUtils.lerp(from.z, to.z, glide),
        );
        // turn to face the next pad while sitting, rather than snapping round
        if (stops.length > 1) g.rotation.y = smoothAngle(g.rotation.y, Math.atan2(-(to.z - from.z), to.x - from.x), 1 - Math.exp(-Math.min(delta, 1 / 30) * 5));
    });
    return (
        <group ref={group} scale={1.5}>
            <mesh position={[0, 0.012, 0]} scale={[1.25, 0.72, 1]} castShadow>
                <icosahedronGeometry args={[0.02, 1]} />
                <Mat color="#A6D86A" />
            </mesh>
            <mesh position={[0.006, 0.006, 0]} scale={[1, 0.5, 0.85]}>
                <icosahedronGeometry args={[0.018, 1]} />
                <Mat color="#E3EFAE" />
            </mesh>
            {[1, -1].map((s) => (
                <group key={s}>
                    {/* eye bumps with dark pupils */}
                    <mesh position={[0.012, 0.025, 0.009 * s]}>
                        <sphereGeometry args={[0.0065, 8, 8]} />
                        <Mat color="#A6D86A" />
                    </mesh>
                    <mesh position={[0.017, 0.027, 0.009 * s]}>
                        <sphereGeometry args={[0.0032, 6, 6]} />
                        <meshBasicMaterial color="#141414" />
                    </mesh>
                    {/* folded back legs */}
                    <mesh position={[-0.014, 0.006, 0.017 * s]} scale={[1.4, 0.5, 0.8]}>
                        <icosahedronGeometry args={[0.01, 0]} />
                        <Mat color="#7DBB4C" />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

const KOI = ['#F5925E', '#FFF1DE', '#F2AEBC'];

// A tiny koi circling just under the water's surface, tail swishing
const Fish = ({ color, radius, speed, phase, animate }: { color: string; radius: number; speed: number; phase: number; animate: boolean }) => {
    const group = useRef<THREE.Group>(null);
    const tail = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        const t = (animate ? clock.elapsedTime * speed : 0) + phase;
        const g = group.current;
        if (!g) return;
        // a wobbly loop, so the fish don't move like clock hands
        const r = radius * (1 + Math.sin(t * 2.3) * 0.15);
        g.position.set(Math.cos(t) * r, 0.007, Math.sin(t) * r * POND_SQUASH);
        const dir = Math.sign(speed);
        g.rotation.y = Math.atan2(-Math.cos(t) * POND_SQUASH * dir, -Math.sin(t) * dir);
        if (tail.current) tail.current.rotation.y = Math.sin(clock.elapsedTime * 11 + phase) * (animate ? 0.6 : 0);
    });
    return (
        <group ref={group}>
            <mesh scale={[1.9, 0.55, 0.75]}>
                <icosahedronGeometry args={[0.016, 1]} />
                <Mat color={color} />
            </mesh>
            <group ref={tail} position={[-0.028, 0, 0]}>
                <mesh position={[-0.008, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.3]}>
                    <coneGeometry args={[0.012, 0.018, 4]} />
                    <Mat color={color} />
                </mesh>
            </group>
        </group>
    );
};

export const PondCritters = ({ r, pads, animate, seed }: { r: number; pads: LilyPad[]; animate: boolean; seed: number }) => (
    <>
        {KOI.map((color, i) => (
            <Fish
                key={i}
                color={color}
                radius={r * (0.38 + i * 0.17)}
                speed={(i % 2 ? -1 : 1) * (0.45 + i * 0.12)}
                phase={seed + i * 2.1}
                animate={animate}
            />
        ))}
        <Frog pads={pads} animate={animate} />
    </>
);
