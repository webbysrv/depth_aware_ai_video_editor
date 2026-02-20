import { useEffect, useRef, useState, useCallback } from 'react';

export function useDepthWorker() {
    const workerRef = useRef<Worker | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [depthData, setDepthData] = useState<any>(null);

    useEffect(() => {
        // Initialize the Web Worker
        workerRef.current = new Worker(new URL('./worker.ts', import.meta.url), {
            type: 'module',
        });

        // Listen for replies from the worker
        workerRef.current.onmessage = (event) => {
            const { status, data, depthMap } = event.data;

            if (status === 'ready') {
                setIsReady(true);
            } else if (status === 'complete') {
                // depthMap is what we will push to our Three.js DataTexture
                setDepthData(depthMap);
            } else if (status === 'progress') {
                // Optional: console.log or set UI loading bar here
            }
        };

        // Tell the worker to start downloading the model
        workerRef.current.postMessage({ type: 'init' });

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    // Function to be called inside your requestAnimationFrame loop
    const processFrame = useCallback((videoElement: HTMLVideoElement) => {
        if (!isReady || !workerRef.current) return;

        // Draw the current video frame to an offscreen canvas to get ImageData
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            // We pass the raw ImageData to the worker to avoid structured cloning errors
            const imageData = canvas.toDataURL('image/jpeg', 0.8);

            workerRef.current.postMessage({
                type: 'predict',
                data: { imageBuffer: imageData }
            });
        }
    }, [isReady]);

    return { isReady, depthData, processFrame };
}