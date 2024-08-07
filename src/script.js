// import './style.css';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { Water } from 'three/examples/jsm/objects/Water.js';
// import { Sky } from 'three/examples/jsm/objects/Sky.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// // Global variables
// let camera, scene, renderer, controls, water, sun, cloudMesh;
// const WATER_GEOMETRY_SIZE = 10000;
// const WATER_TEXTURE_SIZE = 512;
// const WATER_COLOR = 0x001e0f;
// const SUN_COLOR = 0xffffff;
// const CAMERA_POSITION = { x: 20, y: 30, z: 100 };
// const MODELS = [
//   { path: "/Submarine/scene.gltf", position: { y: 2 }, scale: 10 },
//   { path: "/Island1/scene.gltf", position: { y: -50, x: 500 }, scale: 300 },
//   { path: "/Island2/scene.gltf", position: { y: 20, x: -500 }, scale: 50 }
// ];

// let submarineModel;
// let velocity = 0;
// let rotationSpeed = 0;
// let rotationSpeed2 = 0;
// let rotationSpeed3 = 0;

// const forwardSpeed = 0.5;
// const rotationStep = 0.02;
// const rotationStep2 = 0.02;
// const rotationStep3 = 0.02;

// // Initialize the scene
// init();
// animate();

// function init() {
//   setupRenderer();
//   setupScene();
//   setupCameraAndLighting();
//   setupWaterAndSky();
//   setupClouds();
//   setupControls();
//   loadModels();
//   setLighting('morning');
//   window.addEventListener('resize', onWindowResize);
//   window.addEventListener('keydown', onKeyDown);
//   window.addEventListener('keyup', onKeyUp);
// }

// function setupRenderer() {
//   renderer = new THREE.WebGLRenderer({ antialias: true });
//   renderer.setPixelRatio(window.devicePixelRatio);
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   renderer.toneMapping = THREE.ACESFilmicToneMapping;
//   renderer.shadowMap.enabled = true;
//   renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//   document.body.appendChild(renderer.domElement);
// }

// function setupScene() {
//   scene = new THREE.Scene();
//   scene.fog = new THREE.FogExp2(0xaabbbb, 0.001);
// }

// function setupCameraAndLighting() {
//   camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
//   camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);

//   // Ambient Light
//   const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Increased intensity
//   scene.add(ambientLight);

//   // Directional Light (Sunlight)
//   const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
//   directionalLight.position.set(50, 200, 100);
//   directionalLight.castShadow = true;
//   directionalLight.shadow.camera.top = 180;
//   directionalLight.shadow.camera.bottom = -100;
//   directionalLight.shadow.camera.left = -120;
//   directionalLight.shadow.camera.right = 120;
//   scene.add(directionalLight);

//   // Additional Lights for more realism
//   const pointLight = new THREE.PointLight(0xffe4b5, 0.8, 500);
//   pointLight.position.set(0, 50, 0);
//   scene.add(pointLight);

//   const spotLight = new THREE.SpotLight(0xffffff, 0.5);
//   spotLight.position.set(-100, 200, -100);
//   spotLight.castShadow = true;
//   scene.add(spotLight);

//   sun = new THREE.Vector3();
// }


// function setupWaterAndSky() {
//   const waterGeometry = new THREE.PlaneGeometry(WATER_GEOMETRY_SIZE, WATER_GEOMETRY_SIZE);
//   water = new Water(
//     waterGeometry,
//     {
//       textureWidth: WATER_TEXTURE_SIZE,
//       textureHeight: WATER_TEXTURE_SIZE,
//       waterNormals: new THREE.TextureLoader().load('./images/3.jpg', function (texture) {
//         texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//       }),
//       sunDirection: new THREE.Vector3(),
//       sunColor: SUN_COLOR,
//       waterColor: WATER_COLOR,
//       distortionScale: 3.7,
//       fog: scene.fog !== undefined
//     }
//   );
//   water.rotation.x = -Math.PI / 2;
//   scene.add(water);

//   const sky = new Sky();
//   sky.scale.setScalar(10000);
//   scene.add(sky);

//   const parameters = {
//     elevation: 2,
//     azimuth: 180
//   };

//   const pmremGenerator = new THREE.PMREMGenerator(renderer);

//   function updateSun() {
//     const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
//     const theta = THREE.MathUtils.degToRad(parameters.azimuth);

//     sun.setFromSphericalCoords(1, phi, theta);

//     sky.material.uniforms['sunPosition'].value.copy(sun);
//     water.material.uniforms['sunDirection'].value.copy(sun).normalize();

//     scene.environment = pmremGenerator.fromScene(sky).texture;
//   }

//   updateSun();
// }

// function setupClouds() {
//   // Vertex Shader
//   const vertexShader = `
//   varying vec2 vUv;
//   void main() {
//     vUv = uv;
//     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//   }
// `;

//   // Fragment Shader
//   const fragmentShader = `
//   uniform sampler2D cloudTexture;
//   uniform float time;
//   varying vec2 vUv;

//   void main() {
//     vec2 uv = vUv;
//     uv.y += time * 0.005; // Animate the clouds
//     vec4 color = texture2D(cloudTexture, uv);
//     gl_FragColor = vec4(color.rgb, color.a);
//   }
// `;

//   const cloudTexture = new THREE.TextureLoader().load('./images/image3.png');
//   const cloudMaterial = new THREE.ShaderMaterial({
//     uniforms: {
//       cloudTexture: { value: cloudTexture },
//       time: { value: 0 }
//     },
//     vertexShader: vertexShader,
//     fragmentShader: fragmentShader,
//     transparent: true,
//     side: THREE.DoubleSide
//   });
//   const cloudGeometry = new THREE.PlaneGeometry(10000, 10000);
//   cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
//   cloudMesh.position.y = 300; // Adjust height as necessary
//   cloudMesh.rotation.x = -Math.PI / 2;
//   scene.add(cloudMesh);
// }

// function setupControls() {
//   controls = new OrbitControls(camera, renderer.domElement);
//   controls.maxPolarAngle = Math.PI * 0.495;
//   controls.target.set(0, 10, 0);
//   controls.minDistance = 40.0;
//   controls.maxDistance = 200.0;
//   controls.update();
// }

// function loadModels() {
//   const loader = new GLTFLoader();
//   Promise.all(MODELS.map(model =>
//     new Promise((resolve, reject) => {
//       loader.load(model.path, gltf => {
//         gltf.scene.position.set(model.position.x || 0, model.position.y || 0, model.position.z || 0);
//         gltf.scene.scale.set(model.scale, model.scale, model.scale);
//         const material = new THREE.MeshStandardMaterial({
//           color: 0xaaaaaa,
//           metalness: 0.7,
//           roughness: 0.3
//         });

//         gltf.scene.traverse(node => {
//           if (node.isMesh) {
//             node.castShadow = true;
//             node.receiveShadow = true;
//           }
//         });
//         scene.add(gltf.scene);
//         if (model.path.includes("Submarine")) {
//           submarineModel = gltf.scene;
//         }
//         resolve();
//       }, undefined, error => {
//         console.error(`Error loading model ${model.path}:`, error);
//         reject(error);
//       });
//     })
//   )).then(() => console.log('All models loaded'))
//     .catch(error => console.error('Error loading models:', error));
// }

// function setLighting(timeOfDay) {
//   // Remove existing lights
//   const oldDirectionalLight = scene.getObjectByName('directionalLight');
//   const oldAmbientLight = scene.getObjectByName('ambientLight');
//   if (oldDirectionalLight) scene.remove(oldDirectionalLight);
//   if (oldAmbientLight) scene.remove(oldAmbientLight);

//   // Add new lights
//   const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
//   ambientLight.name = 'ambientLight';
//   scene.add(ambientLight);

//   const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
//   directionalLight.name = 'directionalLight';

//   switch (timeOfDay) {
//     case 'morning':
//       directionalLight.color.setHex(0xffd700);
//       directionalLight.position.set(50, 50, 50);
//       break;
//     case 'noon':
//       directionalLight.color.setHex(0xffffff);
//       directionalLight.position.set(0, 100, 0);
//       break;
//     case 'evening':
//       directionalLight.color.setHex(0xff8c00);
//       directionalLight.position.set(-50, 50, -50);
//       break;
//     case 'night':
//       directionalLight.color.setHex(0x1e90ff);
//       directionalLight.position.set(0, 10, 0);
//       ambientLight.intensity = 0.2;
//       break;
//   }

//   scene.add(directionalLight);
//   updateSunPosition(timeOfDay);
// }

// function updateSunPosition(timeOfDay) {
//   const parameters = {
//     morning: { elevation: 10, azimuth: 90, skyColor: 0xffd700 },
//     noon: { elevation: 90, azimuth: 180, skyColor: 0x87ceeb },
//     evening: { elevation: 10, azimuth: 270, skyColor: 0xff8c00 },
//     night: { elevation: -10, azimuth: 0, skyColor: 0x1e90ff }
//   };

//   const { elevation, azimuth, skyColor } = parameters[timeOfDay];
//   const phi = THREE.MathUtils.degToRad(90 - elevation);
//   const theta = THREE.MathUtils.degToRad(azimuth);

//   sun.setFromSphericalCoords(1, phi, theta);

//   const sky = scene.getObjectByName('sky');
//   const water = scene.getObjectByName('water');

//   if (sky) {
//     sky.material.uniforms['sunPosition'].value.copy(sun);
//     sky.material.uniforms['turbidity'].value = 10;
//     sky.material.uniforms['rayleigh'].value = 2;
//     sky.material.uniforms['mieCoefficient'].value = 0.005;
//     sky.material.uniforms['mieDirectionalG'].value = 0.8;
//     sky.material.uniforms['sunPosition'].value.copy(sun);
//     sky.material.uniforms['up'].value.set(0, 1, 0);
//     sky.material.uniforms['sunColor'].value.setHex(skyColor);
//   }
//   if (water) {
//     water.material.uniforms['sunDirection'].value.copy(sun).normalize();
//   }
// }

// function onWindowResize() {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize(window.innerWidth, window.innerHeight);
// }

// function onKeyDown(event) {
//   switch (event.key) {
//     case 'ArrowUp':
//     case 'w':
//       velocity = forwardSpeed;
//       break;
//     case 'ArrowDown':
//     case 's':
//       velocity = -forwardSpeed;
//       break;
//     case 'ArrowLeft':
//     case 'a':
//       rotationSpeed = rotationStep * 0.5;
//       break;
//     case 'ArrowRight':
//     case 'd':
//       rotationSpeed = -rotationStep * 0.5;
//       break;
//     case 'z':
//       rotationSpeed2 = -rotationStep2 * 0.5;
//       break;
//     case 'x':
//       rotationSpeed2 = rotationStep2 * 0.5;
//       break;
//     case 'c':
//       rotationSpeed3 = rotationStep3 * 0.5;
//       break;
//     case 'v':
//       rotationSpeed3 = -rotationStep3 * 0.5;
//       break;
//     case '1':
//       setLighting('morning');
//       break;
//     case '2':
//       setLighting('noon');
//       break;
//     case '3':
//       setLighting('evening');
//       break;
//     case '4':
//       setLighting('night');
//       break;
//   }
// }
// function onKeyUp(event) {
//   switch (event.key) {
//     case 'ArrowUp':
//     case 'ArrowDown':
//     case 'w':
//     case 's':
//       velocity = 0;
//       break;
//     case 'ArrowLeft':
//     case 'ArrowRight':
//     case 'a':
//     case 'd':
//     case 'z':
//     case 'x':
//     case 'c':
//     case 'v':
//       rotationSpeed = 0;
//       rotationSpeed2 = 0;
//       rotationSpeed3 = 0;



//       break;
//   }
// }

// function animate() {
//   requestAnimationFrame(animate);
//   if (submarineModel) {
//     submarineModel.translateZ(velocity);
//     submarineModel.rotation.y += rotationSpeed * 0.5;
//     submarineModel.rotation.x += rotationSpeed2 * 0.5;
//     submarineModel.rotation.z += rotationSpeed3 * 0.5;

//   }
//   render();
// }

// function render() {
//   cloudMesh.material.uniforms.time.value += 0.01; // Update time for cloud animation
//   water.material.uniforms['time'].value += 1.0 / 60.0;
//   renderer.render(scene, camera);
// }
