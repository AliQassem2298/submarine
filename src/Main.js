import { Renderer } from './Renderer.js';
import { Scene } from './Scene.js';
import { CameraAndLighting } from './CameraAndLighting.js';
import { WaterAndSky } from './WaterAndSky.js';
// import { Clouds } from './Clouds.js';
import { Controls } from './Controls.js';
import { ModelLoader } from './ModelLoader.js';
import { Lighting } from './Lighting.js';
import { EventHandlers } from './EventHandlers.js';
import { GUIControls } from './GUI.js';
import { MODELS } from './Constants.js';
import Submarine from './Submarine'; // Import the Submarine class
var submarine = new Submarine();

export class Main {
    constructor() {
        this.renderer = new Renderer().renderer;
        this.scene = new Scene().scene;
        this.cameraAndLighting = new CameraAndLighting();
        this.waterAndSky = new WaterAndSky(this.scene, this.renderer);
        this.controls = new Controls(this.cameraAndLighting.defaultCamera, this.renderer); // Initialize with default camera
        this.modelLoader = new ModelLoader(this.scene);
        this.lighting = new Lighting(this.scene);
        this.eventHandlers = null;
        // this.clouds = new Clouds(this.scene);
        this.islands = []; // Array to hold island models
        this.submarine = submarine; // Use the global submarine instance
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

        // Get the submarine model from the model loader
        this.submarineModel = this.modelLoader.getModel('/Submarine/scene.gltf');

        // Initialize EventHandlers after the submarine model is loaded
        this.eventHandlers = new EventHandlers(
            this.cameraAndLighting,
            this.renderer,
            this.submarineModel,
            this.lighting.setLighting.bind(this.lighting),
            this.islands
        );

        // Initialize GUI controls
        new GUIControls(this.waterAndSky.water, this.waterAndSky.sky, this.waterAndSky.updateSun.bind(this.waterAndSky), this.submarine);

        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        if (this.eventHandlers) {
            this.eventHandlers.update();
        }
        this.controls.update();

        // Update submarine physics
        this.submarine.update();

        // Update submarine model position
        if (this.submarineModel) {
            /////////////// dont't delete me ....
            // this.submarine.position.set(
            //     this.submarineModel.position.x,
            //     this.submarineModel.position.y,
            //     this.submarineModel.position.z
            // );
            this.submarineModel.position.x = submarine.position.x;
            this.submarineModel.position.y = submarine.position.y; // The underwater adjustment
            this.submarineModel.position.z = submarine.position.z;
            console.log("position submarine", this.submarineModel.position);
        }

        // this.clouds.cloudMesh.material.uniforms.time.value += 0.01;
        this.waterAndSky.water.material.uniforms['time'].value += 1.0 / 60.0;
        this.renderer.render(this.scene, this.cameraAndLighting.currentCamera); // Use current camera for rendering
    }
}

const main = new Main();
main.init();
