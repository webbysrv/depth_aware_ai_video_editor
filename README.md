# Lumina Sense AI - Depth-Aware Lighting Editor

Lumina Sense AI is a proof-of-concept Next.js application that demonstrates real-time, AI-driven, depth-aware video compositing running entirely in the browser. Emphasizing a zero-cost server architecture, it leverages WebGPU and React-Three-Fiber to extract depth maps from video streams and dynamically occlude 3D elements (like lens flares) behind foreground objects.

## 🚀 Features

*   **Real-Time Depth Estimation**: Utilizes `@huggingface/transformers` (v3) to run the `Xenova/depth-anything-small-hf` model directly in the client.
*   **WebGPU Accelerated**: AI inference is fully hardware-accelerated using your device's GPU, decoupled from the main UI thread via a Web Worker.
*   **React-Three-Fiber Integration**: Synchronizes standard HTML5 `<video>` textures with asynchronous AI depth maps inside a WebGL context.
*   **Custom Depth-Aware Shader**: A bespoke WebGL Fragment Shader intelligently blends and occludes simulated lighting (lens flares) based on the AI's understanding of the scene's 3D geometry.
*   **Zero Server Compute**: All AI processing happens locally in the browser—no API keys, no cloud compute costs, and completely private.
*   **Boutique Cinema UI**: A premium, dark-mode minimalist interface built with Tailwind CSS.

## 🛠 Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router, React, TypeScript)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **AI Engine**: [Transformers.js](https://huggingface.co/docs/transformers.js/index) by Hugging Face (WebGPU enabled)
*   **3D Rendering**: [Three.js](https://threejs.org/) & [React-Three-Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
*   **Icons**: [Lucide React](https://lucide.dev/)

## 🏃‍♂️ Getting Started

### Prerequisites

Ensure you have Node.js (v18+) and npm installed. Note that WebGPU is required for optimal performance (currently supported in Chrome/Edge 113+ and Safari Technology Preview).

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/webbysrv/depth_aware_ai_video_editor.git
    cd depth_aware_ai_video_editor
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧠 Architecture Overview

The core of the application relies on an asynchronous synchronization loop:

1.  **Video Stream**: An HTML5 video element plays a sample video.
2.  **Depth Worker**: The current video frame is captured and sent to a dedicated Web Worker running the `depth-anything` model. It computes a grayscale depth map where light pixels represent closer objects and dark pixels represent distant objects.
3.  **R3F Canvas**: The main React thread receives the depth map, updates a `THREE.DataTexture`, and passes both the original video frame and the dynamic depth map into a custom `ShaderMaterial`.
4.  **Shader Logic**: For every pixel, the fragment shader compares the Z-depth of a simulated lens flare against the AI's depth map, calculating a smoothstep occlusion factor to create a realistic screen-blend effect behind foreground actors.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
