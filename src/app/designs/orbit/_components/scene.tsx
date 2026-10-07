"use client";

// Everything that imports three lives in this module, loaded with next/dynamic (ssr: false)
// so the WebGL weight only lands on this route, after first paint. Plain three.js, driven
// imperatively: @react-three/fiber's global JSX types clash with other designs' polymorphic tags.
import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { usePalette } from "@/components/palette";
import type { Crop, Hex, ToolSlug } from "@/content";
import { CAMERA, RACHIS, clusters, cropHex, particleWorld, ringWorld, spikelets } from "./geometry";

/** Written by the hero's pointer handlers, read every frame. `over` slows the scene so clusters are easy to hover. */
export type Drag = { x: number; y: number; dragging: boolean; over: boolean };

type Palette = readonly [Hex, Hex, Hex, Hex];

const useInk = () => (useTheme().resolvedTheme === "dark" ? "#b4b4b4" : "#4a4a4a");

const lineGeometry = (points: number[][]) =>
  new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(points.flat(), 3));

/** Renderer, resize handling and a frame loop on a container; returns a disposer. */
function mount(
  container: HTMLElement,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  frame: (dt: number, t: number) => void,
) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.display = "block";
  container.append(renderer.domElement);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  const timer = new THREE.Timer();
  renderer.setAnimationLoop((time) => {
    timer.update(time);
    frame(Math.min(timer.getDelta(), 0.1), timer.getElapsed());
    renderer.render(scene, camera);
  });

  return () => {
    renderer.setAnimationLoop(null);
    observer.disconnect();
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Line) {
        o.geometry.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m: THREE.Material) => m.dispose());
      }
    });
    renderer.dispose();
    renderer.domElement.remove();
  };
}

/** Hero scene: grain head with one particle per thousand accessions orbiting it, by crop. */
export function OrbitScene({
  drag,
  active,
  onHover,
  onReady,
}: {
  drag: RefObject<Drag>;
  active: Crop | null;
  onHover: (crop: Crop | null) => void;
  onReady: () => void;
}) {
  const { colors } = usePalette();
  const ink = useInk();
  const box = useRef<HTMLDivElement>(null);
  const api = useRef<{ paint: (colors: Palette, ink: string) => void; focus: (crop: Crop | null) => void } | null>(null);
  // Latest callbacks, so the scene is built once.
  const hoverRef = useRef(onHover);
  const readyRef = useRef(onReady);
  useEffect(() => {
    hoverRef.current = onHover;
    readyRef.current = onReady;
  });

  useEffect(() => {
    const container = box.current;
    if (!container) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.1, 100);
    camera.position.set(...CAMERA.position);
    camera.lookAt(0, 0, 0);

    const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 4, 5);
    const fill = new THREE.PointLight(0xffffff, 18);
    fill.position.set(-3, -2, 3);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2), hemi, key, fill);

    const rig = new THREE.Group();
    scene.add(rig);

    // Grain head: rachis, spikelets in four rows, awns.
    const grainMat = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.1 });
    const rachis = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, RACHIS.top - RACHIS.bottom, 8), grainMat);
    rachis.position.y = (RACHIS.top + RACHIS.bottom) / 2;
    rig.add(rachis);
    const spikeletGeo = new THREE.SphereGeometry(1, 24, 16);
    for (const s of spikelets) {
      const turn = new THREE.Group();
      turn.rotation.y = s.turn;
      const mesh = new THREE.Mesh(spikeletGeo, grainMat);
      mesh.position.set(s.x, s.y, 0);
      mesh.rotation.z = s.tilt;
      mesh.scale.set(...s.scale);
      turn.add(mesh);
      rig.add(turn);
    }
    const awnMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.55 });
    rig.add(new THREE.LineSegments(lineGeometry(spikelets.flatMap((s) => [s.tip3, s.awn3])), awnMat));

    // One orbit per crop: ring, visible dots, and larger invisible dots as hover targets.
    const dummy = new THREE.Object3D();
    const orbits = clusters.map((cluster) => {
      const tilt = new THREE.Group();
      tilt.rotation.set(cluster.tiltX, 0, cluster.tiltZ);
      const flat = { ...cluster, tiltX: 0, tiltZ: 0 };
      const ringMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35 });
      tilt.add(
        new THREE.LineLoop(
          lineGeometry(Array.from({ length: 128 }, (_, i) => ringWorld(flat, (i / 128) * Math.PI * 2))),
          ringMat,
        ),
      );
      const spin = new THREE.Group();
      const n = cluster.particles.length;
      const dotMat = new THREE.MeshBasicMaterial({ transparent: true });
      const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 12, 8), dotMat, n);
      const hits = new THREE.InstancedMesh(
        new THREE.SphereGeometry(0.3, 8, 6),
        new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }),
        n,
      );
      hits.userData.crop = cluster.crop;
      const place = (scale: number) => {
        cluster.particles.forEach((p, i) => {
          dummy.position.set(...particleWorld(flat, p));
          dummy.scale.setScalar(scale);
          dummy.updateMatrix();
          dots.setMatrixAt(i, dummy.matrix);
          hits.setMatrixAt(i, dummy.matrix);
        });
        dots.instanceMatrix.needsUpdate = true;
        hits.instanceMatrix.needsUpdate = true;
        hits.computeBoundingSphere();
      };
      place(1);
      spin.add(dots, hits);
      tilt.add(spin);
      rig.add(tilt);
      return { cluster, spin, hits, ringMat, dotMat, place };
    });

    api.current = {
      paint: (pal, inkHex) => {
        hemi.color.set(pal[0]);
        hemi.groundColor.set(pal[1]);
        key.color.set(pal[0]);
        fill.color.set(pal[2]);
        grainMat.color.set(inkHex);
        awnMat.color.set(inkHex);
        for (const o of orbits) {
          const c = cropHex(o.cluster.index, pal);
          o.ringMat.color.set(c);
          o.dotMat.color.set(c);
        }
      },
      focus: (crop) => {
        for (const o of orbits) {
          const lit = crop === o.cluster.crop;
          const dim = crop !== null && !lit;
          o.ringMat.opacity = lit ? 0.9 : dim ? 0.12 : 0.35;
          o.dotMat.opacity = dim ? 0.3 : 1;
          o.place(lit ? 1.5 : 1);
        }
      },
    };

    // Hover by raycasting against the invisible targets, once per frame.
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerIn = false;
    let hovered: Crop | null = null;
    const report = (crop: Crop | null) => {
      if (crop === hovered) return;
      hovered = crop;
      hoverRef.current(crop);
    };
    const onMove = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      pointerIn = true;
    };
    const onLeave = () => {
      pointerIn = false;
      report(null);
    };
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);

    let idle = 0;
    let first = true;
    const dispose = mount(container, scene, camera, (dt) => {
      const d = drag.current;
      const pace = d.over ? 0.15 : 1;
      if (!d.dragging) idle += dt * 0.08 * pace;
      // Ease toward the dragged angle so release feels soft.
      rig.rotation.y += (d.y + idle - rig.rotation.y) * Math.min(1, dt * 8);
      rig.rotation.x += (d.x - rig.rotation.x) * Math.min(1, dt * 8);
      for (const o of orbits) o.spin.rotation.y += dt * o.cluster.speed * pace;

      if (pointerIn && !d.dragging) {
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(
          orbits.map((o) => o.hits),
          false,
        )[0];
        report((hit?.object.userData.crop as Crop | undefined) ?? null);
      }
      if (first) {
        first = false;
        readyRef.current();
      }
    });

    return () => {
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      dispose();
      api.current = null;
    };
  }, [drag]);

  useEffect(() => api.current?.paint(colors, ink), [colors, ink]);
  useEffect(() => api.current?.focus(active), [active]);

  return <div ref={box} className="size-full" aria-hidden />;
}

// Small spinning objects, one per tool. `color` takes the tool's palette slot, `ink` the theme ink.
function buildTool(slug: ToolSlug, color: THREE.MeshStandardMaterial, ink: THREE.MeshStandardMaterial, line: THREE.LineBasicMaterial) {
  const group = new THREE.Group();
  if (slug === "pretzel") {
    group.add(new THREE.Mesh(new THREE.TorusKnotGeometry(0.62, 0.2, 160, 20, 2, 3), color));
  } else if (slug === "genolink") {
    const a = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.13, 20, 64), color);
    a.position.x = -0.35;
    const b = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.13, 20, 64), ink);
    b.position.x = 0.35;
    b.rotation.x = Math.PI / 2;
    group.add(a, b);
  } else if (slug === "fairybread") {
    // Three PCA clusters.
    const cloud = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 10, 8), color, 90);
    const dummy = new THREE.Object3D();
    let seed = 3;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 2;
    for (let i = 0; i < 90; i++) {
      const c = i % 3;
      dummy.position.set(r() * 0.35 + (c - 1) * 0.55, r() * 0.3 + (c === 1 ? 0.35 : -0.15), r() * 0.3);
      dummy.updateMatrix();
      cloud.setMatrixAt(i, dummy.matrix);
    }
    group.add(cloud);
  } else {
    // Brioche: an old and a new reference, with markers remapped between them.
    const bar = (y: number, mat: THREE.Material) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2, 12), mat);
      m.position.y = y;
      m.rotation.z = Math.PI / 2;
      return m;
    };
    const links = lineGeometry(
      Array.from({ length: 7 }, (_, i) => {
        const x = -0.9 + i * 0.3;
        return [
          [x, 0.5, 0],
          [x + (i % 3) * 0.15 - 0.15, -0.5, 0],
        ];
      }).flat(),
    );
    group.add(bar(0.55, ink), bar(-0.55, color), new THREE.LineSegments(links, line));
  }
  return group;
}

/** Thumbnail scene for one tool. */
export function ToolScene({ slug, index }: { slug: ToolSlug; index: number }) {
  const { colors } = usePalette();
  const ink = useInk();
  const box = useRef<HTMLDivElement>(null);
  const api = useRef<((colors: Palette, ink: string) => void) | null>(null);

  useEffect(() => {
    const container = box.current;
    if (!container) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0, 3.6);
    const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.2);
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(2, 3, 4);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6), hemi, key);

    const colorMat = new THREE.MeshStandardMaterial({ roughness: 0.4 });
    const inkMat = new THREE.MeshStandardMaterial({ roughness: 0.4 });
    const lineMat = new THREE.LineBasicMaterial();
    const group = buildTool(slug, colorMat, inkMat, lineMat);
    group.rotation.x = 0.35;
    scene.add(group);

    api.current = (pal, inkHex) => {
      hemi.color.set(pal[(index + 1) % 4]);
      hemi.groundColor.set(pal[(index + 2) % 4]);
      colorMat.color.set(pal[index % 4]);
      lineMat.color.set(pal[index % 4]);
      inkMat.color.set(inkHex);
    };

    const dispose = mount(container, scene, camera, (dt, t) => {
      // Brioche is flat, so it rocks instead of turning edge-on.
      if (slug === "brioche") group.rotation.y = Math.sin(t * 0.6) * 0.7;
      else group.rotation.y += dt * 0.4;
    });
    return () => {
      dispose();
      api.current = null;
    };
  }, [slug, index]);

  useEffect(() => api.current?.(colors, ink), [colors, ink]);

  return <div ref={box} className="size-full" aria-hidden />;
}
