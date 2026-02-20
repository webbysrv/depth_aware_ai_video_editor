import { pipeline, env, DepthEstimationPipeline } from '@huggingface/transformers';

// Strict CDN usage: Do not look for local weights
env.allowLocalModels = false;

// We use a singleton pattern to ensure the model is only loaded once
class PipelineSingleton {
    static task = 'depth-estimation' as const;
    static model = 'Xenova/depth-anything-small-hf';
    static instance: Promise<DepthEstimationPipeline> | null = null;

    static getInstance(progress_callback?: any) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, {
                device: 'webgpu', // Force WebGPU for hardware acceleration
                progress_callback,
            }) as any as Promise<DepthEstimationPipeline>;
        }
        return this.instance;
    }
}

// Listen for messages from the main React thread
self.addEventListener('message', async (event) => {
    const { type, data } = event.data;

    if (type === 'init') {
        // Start loading the model immediately when requested
        await PipelineSingleton.getInstance((progress: any) => {
            self.postMessage({ status: 'progress', data: progress });
        });
        self.postMessage({ status: 'ready' });
    }

    if (type === 'predict') {
        const { imageBuffer, width, height } = data;

        try {
            const estimator = await PipelineSingleton.getInstance();

            // Run the frame through Depth-Anything
            // Note: transformers.js handles the canvas/imageData conversion internally 
            // when passing a RawImage or ImageData object.
            const result = await estimator(imageBuffer) as any;

            // result.depth is a raw tensor/image data of the depth map
            self.postMessage({
                status: 'complete',
                depthMap: result.depth
            });
        } catch (error) {
            self.postMessage({ status: 'error', data: error });
        }
    }
});