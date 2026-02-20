'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { VideoCanvas } from './VideoCanvas';
import { Play, Pause } from 'lucide-react';
import { useDepthWorker } from '@/app/utils/useDepthWorker';

export function VideoEditor() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const depthTextureRef = useRef<THREE.DataTexture | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDepthEnabled, setIsDepthEnabled] = useState(true);

    const { isReady, depthData, processFrame } = useDepthWorker();
    const requestRef = useRef<number | null>(null);

    // Update depth texture when new data arrives
    useEffect(() => {
        if (depthData) {
            const tex = new THREE.DataTexture(depthData.data, depthData.width, depthData.height, THREE.RedFormat);
            // Flip Y because Three.js textures expect bottom-left origin by default, 
            // but the canvas image data is top-left origin.
            tex.flipY = true;
            tex.needsUpdate = true;
            depthTextureRef.current = tex;
        }
    }, [depthData]);

    // Keep processing frames
    const loop = useCallback(() => {
        if (isPlaying && isDepthEnabled && videoRef.current && isReady) {
            processFrame(videoRef.current);
        }
        requestRef.current = requestAnimationFrame(loop);
    }, [isPlaying, isDepthEnabled, isReady, processFrame]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(loop);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [loop]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!videoRef.current.paused);
        }
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full mx-auto">

            {/* Video Container */}
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden glass-panel shadow-[0_0_100px_rgba(255,100,50,0.05)] border-white/5">
                {/* Underlying Video */}
                <video
                    ref={videoRef}
                    src="https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
                    crossOrigin="anonymous"
                    loop
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* R3F Canvas Override */}
                <VideoCanvas
                    videoRef={videoRef}
                    isDepthEnabled={isDepthEnabled}
                    depthTextureRef={depthTextureRef}
                />

                {/* Controls Overlay */}
                <div className="absolute bottom-6 left-6 z-20 flex gap-4">
                    <button
                        onClick={togglePlay}
                        className="p-4 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md transition-all border border-white/10 flex items-center justify-center cursor-pointer"
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" fill="white" />}
                    </button>
                </div>
            </div>

            {/* Controls Container */}
            <div className="flex flex-col sm:flex-row items-center justify-between w-full p-6 sm:p-8 glass-panel rounded-3xl text-white">
                <div>
                    <h2 className="text-xl font-light tracking-wide text-white">Depth-Aware Lighting</h2>
                    <p className="text-sm text-color-muted-foreground mt-2 max-w-md font-light leading-relaxed">
                        Toggle the AI depth engine. The simulated lens flare is automatically occluded by objects that move closer to the camera.
                    </p>
                </div>

                <div className="mt-6 sm:mt-0 flex items-center gap-6">
                    <span className={`text-xs tracking-[0.2em] font-mono uppercase transition-colors ${isDepthEnabled ? 'text-white' : 'text-zinc-600'}`}>
                        {isDepthEnabled ? 'Active' : 'Bypassed'}
                    </span>
                    <button
                        onClick={() => setIsDepthEnabled(!isDepthEnabled)}
                        className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${isDepthEnabled ? 'bg-white' : 'bg-zinc-800'}`}
                    >
                        <div className={`w-6 h-6 rounded-full transition-transform duration-300 ${isDepthEnabled ? 'translate-x-8 bg-black' : 'translate-x-0 bg-zinc-500'}`} />
                    </button>
                </div>
            </div>

        </div>
    );
}
