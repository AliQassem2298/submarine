// import './style.css';
// import * as THREE from 'three';

// export class Clouds {
//     constructor(scene) {
//         this.scene = scene;
//         this.cloudMesh = this.setupClouds();
//         this.scene.add(this.cloudMesh);
//     }

//     setupClouds() {
//         const vertexShader = `
//     varying vec2 vUv;
//     void main() {
//       vUv = uv;
//       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
//   `;

//         const fragmentShader = `
//     uniform sampler2D cloudTexture;
//     uniform float time;
//     varying vec2 vUv;

//     void main() {
//       vec2 uv = vUv;
//       uv.y += time * 0.005; // Animate the clouds
//       vec4 color = texture2D(cloudTexture, uv);
//       gl_FragColor = vec4(color.rgb, color.a);
//     }
//   `;

//         const cloudTexture = new THREE.TextureLoader().load('./images/image3.png');
//         const cloudMaterial = new THREE.ShaderMaterial({
//             uniforms: {
//                 cloudTexture: { value: cloudTexture },
//                 time: { value: 500 }
//             },
//             vertexShader: vertexShader,
//             fragmentShader: fragmentShader,
//             transparent: true,
//             side: THREE.DoubleSide
//         });
//         const cloudGeometry = new THREE.PlaneGeometry(10000, 10000);
//         const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
//         cloudMesh.position.y = 500; // Adjust height as necessary
//         cloudMesh.rotation.x = -Math.PI / 2;
//         return cloudMesh;
//     }
// }
