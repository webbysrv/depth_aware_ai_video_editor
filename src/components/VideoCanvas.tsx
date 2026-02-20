'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { DepthAwareFlareMaterial } from './DepthAwareFlareMaterial';

extend({ DepthAwareFlareMaterial });

function createFlareTexture() {
    if (typeof document === 'undefined') return new THREE.Texture();
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    // Creating a nice, high-end warm lens flare
    gradient.addColorStop(0, 'rgba(255, 230, 200, 1)'); // Hot core
    gradient.addColorStop(0.1, 'rgba(255, 180, 100, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 100, 50, 0.4)');
    gradient.addColorStop(0.6, 'rgba(200, 50, 20, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.premultiplyAlpha = true;
    return texture;
}

interface VideoCanvasProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isDepthEnabled: boolean;
    depthTextureRef: React.MutableRefObject<THREE.DataTexture | null>;
}

function Scene({ videoRef, isDepthEnabled, depthTextureRef }: VideoCanvasProps) {
    const materialRef = useRef<any>(null);

    const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
    const flareTexture = useMemo(() => createFlareTexture(), []);

    // Create an empty depth texture as fallback (far away, no occlusion)
    const fallbackDepth = useMemo(() => {
        const data = new Uint8Array(256 * 256).fill(0);
        const tex = new THREE.DataTexture(data, 256, 256, THREE.RedFormat);
        tex.needsUpdate = true;
        return tex;
    }, []);

    useEffect(() => {
        if (videoRef.current) {
            const tex = new THREE.VideoTexture(videoRef.current);
            tex.colorSpace = THREE.SRGBColorSpace;
            setVideoTexture(tex);
        }
    }, [videoRef]);

    useFrame(() => {
        if (materialRef.current) {
            // Simulate moving flare Z or just static. We place it at 0.5 (mid-depth)
            materialRef.current.flareZ = isDepthEnabled ? 0.5 : -10.0;
            if (depthTextureRef.current) {
                materialRef.current.tDepth = depthTextureRef.current;
            } else {
                materialRef.current.tDepth = fallbackDepth;
            }
        }
    });

    if (!videoTexture) return null;

    return (
        <mesh>
            {/* Full screen quad [-1, 1] NDC */}
            <planeGeometry args={[2, 2]} />
            {/* @ts-ignore */}
            <depthAwareFlareMaterial
                ref={materialRef}
                tVideo={videoTexture}
                tDepth={fallbackDepth}
                tFlare={flareTexture}
                flareZ={0.5}
            />
        </mesh>
    );
}

export function VideoCanvas(props: VideoCanvasProps) {
    return (
        <div className="absolute inset-0 z-10 pointer-events-none">
            <Canvas
                orthographic
                camera={{ position: [0, 0, 1], zoom: 1 }}
                gl={{ antialias: false, alpha: true, preserveDrawingBuffer: false }}
            >
                <Suspense fallback={null}>
                    <Scene {...props} />
                </Suspense>
            </Canvas>
        </div>
    );
}
