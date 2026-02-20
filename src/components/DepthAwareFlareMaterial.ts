import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Note for Agent: Depth-Anything V2 outputs lighter pixels for closer objects (1.0) and darker for further (0.0).
export const DepthAwareFlareMaterial = shaderMaterial(
    {
        tVideo: null,     // The current video frame texture
        tDepth: null,     // The AI-generated depth map texture
        tFlare: null,     // The lens flare texture (must have alpha channel)
        flareZ: 0.5,      // Simulated Z-depth of the flare (0.0 = far background, 1.0 = camera lens)
    },
    // Vertex Shader: Standard 2D passthrough
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader: The Occlusion & Blending Logic
    `
    uniform sampler2D tVideo;
    uniform sampler2D tDepth;
    uniform sampler2D tFlare;
    uniform float flareZ;
    
    varying vec2 vUv;

    void main() {
      // 1. Sample the original video color
      vec4 videoColor = texture2D(tVideo, vUv);
      
      // 2. Sample the AI depth map (Grayscale, so we just take the red channel)
      float sceneDepth = texture2D(tDepth, vUv).r;
      
      // 3. Sample the Flare texture
      vec4 flareColor = texture2D(tFlare, vUv);
      
      // 4. Depth Occlusion Logic with Edge Softening
      // If the scene pixel is CLOSER than the flare (sceneDepth > flareZ), it occludes the flare.
      // smoothstep creates a soft transition rather than a jagged 1-pixel cut.
      float occlusion = smoothstep(flareZ - 0.05, flareZ + 0.05, sceneDepth);
      
      // Invert occlusion: 1.0 means flare is fully visible, 0.0 means fully hidden by foreground
      float visibility = 1.0 - occlusion;
      
      // 5. Screen Blend Mode (to mimic real light adding to the scene)
      vec3 finalColor = videoColor.rgb + (flareColor.rgb * flareColor.a * visibility);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);
