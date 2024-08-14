// import { Renderer } from './Renderer.js';
// import { Scene } from './Scene.js';
// import { CameraAndLighting } from './CameraAndLighting.js';
// import { WaterAndSky } from './WaterAndSky.js';
// // import { Clouds } from './Clouds.js';
// import { Controls } from './Controls.js';
// import { ModelLoader } from './ModelLoader.js';
// import { Lighting } from './Lighting.js';
// import { EventHandlers } from './EventHandlers.js';
// import { GUIControls } from './GUI.js';
// import { MODELS } from './Constants.js';
// import Submarine from './Submarine'; // Import the Submarine class

// export class Main {
//     constructor() {
//         this.renderer = new Renderer().renderer;
//         this.scene = new Scene().scene;
//         this.cameraAndLighting = new CameraAndLighting();
//         this.waterAndSky = new WaterAndSky(this.scene, this.renderer);
//         this.controls = new Controls(this.cameraAndLighting.defaultCamera, this.renderer); // Initialize with default camera
//         this.modelLoader = new ModelLoader(this.scene);
//         this.lighting = new Lighting(this.scene);
//         this.eventHandlers = null;
//         // this.clouds = new Clouds(this.scene);
//         this.islands = []; // Array to hold island models
//         this.submarine = new Submarine(); // Create the submarine instance
//     }

//     async init() {
//         await this.modelLoader.loadModels(MODELS);
//         this.cameraAndLighting.addToScene(this.scene);

//         // Collect island models from the scene
//         for (const model of MODELS) {
//             if (model.path.includes('Island')) {
//                 const islandModel = this.modelLoader.getModel(model.path);
//                 if (islandModel) {
//                     this.islands.push(islandModel);
//                 }
//             }
//         }

//         // Get the submarine model from the model loader
//         this.submarineModel = this.modelLoader.getModel('/Submarine/scene.gltf');

//         // Initialize EventHandlers after the submarine model is loaded
//         this.eventHandlers = new EventHandlers(
//             this.cameraAndLighting,
//             this.renderer,
//             this.submarineModel,
//             this.lighting.setLighting.bind(this.lighting),
//             this.islands
//         );

//         // Initialize GUI controls and pass it to the submarine
//         const guiControls = new GUIControls(this.waterAndSky.water, this.waterAndSky.sky, this.waterAndSky.updateSun.bind(this.waterAndSky), this.submarine);

//         // Set the GUIControls instance in the Submarine class
//         this.submarine.setGUIControls(guiControls);

//         this.animate();
//     }

//     animate() {
//         requestAnimationFrame(this.animate.bind(this));

//         if (this.eventHandlers) {
//             this.eventHandlers.update();
//         }
//         this.controls.update();

//         // Update submarine physics
//         this.submarine.update();

//         // Update submarine model position
//         if (this.submarineModel) {
//             /////////////// don't delete me ....
//             // this.submarine.position.set(
//             //     this.submarineModel.position.x,
//             //     this.submarineModel.position.y,
//             //     this.submarineModel.position.z
//             // );
//             this.submarineModel.position.x = this.submarine.position.x;
//             this.submarineModel.position.y = this.submarine.position.y - 4; // The underwater adjustment
//             this.submarineModel.position.z = this.submarine.position.z;
//             console.log("position submarine", this.submarineModel.position);
//         }

//         // this.clouds.cloudMesh.material.uniforms.time.value += 0.01;
//         this.waterAndSky.water.material.uniforms['time'].value += 1.0 / 60.0;
//         this.renderer.render(this.scene, this.cameraAndLighting.currentCamera); // Use current camera for rendering
//     }
// }

// const main = new Main();
// main.init();


import { Renderer } from './Renderer.js';
import { Scene } from './Scene.js';
import { CameraAndLighting } from './CameraAndLighting.js';
import { WaterAndSky } from './WaterAndSky.js';
import { Controls } from './Controls.js';
import { ModelLoader } from './ModelLoader.js';
import { Lighting } from './Lighting.js';
import { EventHandlers } from './EventHandlers.js';
import { GUIControls } from './GUI.js';
import { MODELS } from './Constants.js';
import Submarine from './Submarine'; // Import the Submarine class

// Your friend's imports
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Main {

    constructor() {
        this.renderer = new Renderer().renderer;
        this.scene = new Scene().scene;
        this.cameraAndLighting = new CameraAndLighting();
        this.waterAndSky = new WaterAndSky(this.scene, this.renderer);
        this.controls = new Controls(this.cameraAndLighting.defaultCamera, this.renderer);
        this.modelLoader = new ModelLoader(this.scene);
        this.lighting = new Lighting(this.scene);
        this.eventHandlers = null;
        this.islands = [];
        this.submarine = new Submarine();
        this.fishes = [];
        this.jellyfishes = [];
        this.sharks = [];
    }

    async init() {
        await this.modelLoader.loadModels(MODELS);
        this.cameraAndLighting.addToScene(this.scene);

        // Collect island models from the scene
        for (const model of MODELS) {
            if (model.path.includes('Island')) {
                const islandModel = this.modelLoader.getModel(model.path);
                if (islandModel) {
                    this.islands.push(islandModel);
                }
            }
        }

        this.submarineModel = this.modelLoader.getModel('/Submarine/scene.gltf');
        this.eventHandlers = new EventHandlers(
            this.cameraAndLighting,
            this.renderer,
            this.submarineModel,
            this.lighting.setLighting.bind(this.lighting),
            this.islands
        );

        // Initialize GUI controls and pass it to the submarine
        const guiControls = new GUIControls(
            this.waterAndSky.water,
            this.waterAndSky.sky,
            this.waterAndSky.updateSun.bind(this.waterAndSky),
            this.submarine
        );

        this.submarine.setGUIControls(guiControls);

        // Initialize underwater scene
        this.initUnderwaterScene();

        this.animate();
    }

    initUnderwaterScene() {
        const textureLoader = new THREE.TextureLoader();
        const skyboxTexture = textureLoader.load('/models/textures/img.jpg');
        const sphereGeometry = new THREE.SphereGeometry(1000, 60, 40);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            map: skyboxTexture,
            side: THREE.BackSide,
        });
        const skybox = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.scene.add(skybox);

        // Load and animate fishes
        this.loadFishes();

        // Load and animate jellyfishes
        this.loadJellyfishes();

        // Load and animate sharks
        this.loadSharks();
    }



    loadFishes() {
        // Assuming water level is at y = 0
        const waterLevel = -50;
        const fishLoader = new GLTFLoader();
        const fishBoundary = 300;
        const numFishes = 50;

        for (let i = 0; i < numFishes; i++) {
            fishLoader.load('/models/fish/scene.gltf', (gltf) => {
                const fish = gltf.scene;
                fish.scale.set(1.2, 1.2, 1.2);

                // Position the fish below the water surface
                fish.position.set(
                    (Math.random() - 0.5) * 2 * fishBoundary,
                    waterLevel - Math.random() * 50,  // Ensure it's below the water level
                    (Math.random() - 0.5) * 2 * fishBoundary
                );

                fish.userData = {
                    direction: new THREE.Vector3(
                        Math.random() - 0.5,
                        0,  // Keep y direction neutral to avoid fish swimming upwards
                        Math.random() - 0.5
                    ).normalize(),
                    speed: Math.random() * 0.05 + 0.02,
                };

                this.scene.add(fish);
                this.fishes.push(fish);
            });
        }
    }

    loadJellyfishes() {
        // Assuming water level is at y = 0
        const waterLevel = -50;
        const jellyfishLoader = new GLTFLoader();
        const jellyfishBoundary = 300;
        const numJellyfishes = 50;

        for (let i = 0; i < numJellyfishes; i++) {
            jellyfishLoader.load('/models/jellyfish/scene.gltf', (gltf) => {
                const jellyfish = gltf.scene;
                jellyfish.scale.set(1, 1, 1);

                // Position the jellyfish below the water surface
                jellyfish.position.set(
                    (Math.random() - 0.5) * 2 * jellyfishBoundary,
                    waterLevel - Math.random() * 50,  // Ensure it's below the water level
                    (Math.random() - 0.5) * 2 * jellyfishBoundary
                );

                jellyfish.userData = {
                    speed: Math.random() * 0.02 + 0.01,
                    direction: new THREE.Vector3(
                        Math.random() - 0.5,
                        0,  // Keep y direction neutral or slightly downwards
                        Math.random() - 0.5
                    ).normalize(),
                    bobbing: Math.random() * 0.05 + 0.02,
                };

                this.scene.add(jellyfish);
                this.jellyfishes.push(jellyfish);
            });
        }
    }

    loadSharks() {
        // Assuming water level is at y = 0
        const waterLevel = -50;
        const sharkLoader = new GLTFLoader();
        const sharkBoundary = 300;

        for (let i = 0; i < 2; i++) {
            sharkLoader.load('/models/shark/scene.gltf', (gltf) => {
                const shark = gltf.scene;
                shark.scale.set(0.1, 0.1, 0.1);

                // Position the shark below the water surface
                shark.position.set(
                    (Math.random() - 0.5) * 2 * sharkBoundary,
                    waterLevel - Math.random() * 25,  // Ensure it's below the water level
                    (Math.random() - 0.5) * 2 * sharkBoundary
                );

                shark.userData = {
                    speed: 0.1,
                    direction: new THREE.Vector3(
                        Math.random() - 0.5,
                        0,  // Keep y direction neutral to avoid shark swimming upwards
                        Math.random() - 0.5
                    ).normalize(),
                };

                this.scene.add(shark);
                this.sharks.push(shark);
            });
        }
    }


    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Update underwater creatures
        this.animateFishes();
        this.animateJellyfishes();
        this.animateSharks();

        if (this.eventHandlers) {
            this.eventHandlers.update();
        }
        this.controls.update();

        // Update submarine physics
        this.submarine.update();

        // Update submarine model position
        if (this.submarineModel) {
            this.submarineModel.position.set(
                this.submarine.position.x,
                this.submarine.position.y - 4,
                this.submarine.position.z
            );
        }

        this.waterAndSky.water.material.uniforms['time'].value += 1.0 / 60.0;
        this.renderer.render(this.scene, this.cameraAndLighting.currentCamera);
    }

    animateFishes() {
        const now = Date.now();
        this.fishes.forEach(fish => {
            const userData = fish.userData;

            // Change direction and move the fish
            fish.position.add(userData.direction.clone().multiplyScalar(userData.speed));
            fish.position.y += Math.sin(now * 0.001) * 0.01;
            fish.lookAt(fish.position.clone().add(userData.direction));
        });
    }

    animateJellyfishes() {
        const now = Date.now();
        this.jellyfishes.forEach(jellyfish => {
            const userData = jellyfish.userData;

            // Gentle up and down bobbing motion
            jellyfish.position.y += Math.sin(now * 0.001) * userData.bobbing;

            // Move the jellyfish
            jellyfish.position.add(userData.direction.clone().multiplyScalar(userData.speed));

            // Rotate the jellyfish to face the direction of movement
            jellyfish.lookAt(jellyfish.position.clone().add(userData.direction));
        });
    }

    animateSharks() {
        this.sharks.forEach(shark => {
            const sharkData = shark.userData;

            // Move the shark in a straight line
            shark.position.add(sharkData.direction.clone().multiplyScalar(sharkData.speed));

            // Ensure the shark faces the direction it's moving in
            shark.lookAt(shark.position.clone().add(sharkData.direction));

            // Reverse direction if close to the edge of the skybox
            if (shark.position.length() > 900) {
                sharkData.direction.negate();
            }
        });
    }
}

const main = new Main();
main.init();
