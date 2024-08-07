import './style.css';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MODELS } from './Constants.js';
import * as THREE from 'three';

export class ModelLoader {
    constructor(scene) {
        this.scene = scene;
        this.models = {};  // Store models by their path
        this.submarineModel = null;
    }

    loadModels(models) {
        const loader = new GLTFLoader();
        return Promise.all(models.map(model =>
            new Promise((resolve, reject) => {
                loader.load(model.path, gltf => {
                    gltf.scene.position.set(model.position.x || 0, model.position.y || 0, model.position.z || 0);
                    gltf.scene.scale.set(model.scale, model.scale, model.scale);

                    gltf.scene.traverse(node => {
                        if (node.isMesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;

                            // Apply texture if texturePath is defined
                            if (model.texturePath) {
                                const textureLoader = new THREE.TextureLoader();
                                textureLoader.load(model.texturePath, texture => {
                                    const material = new THREE.MeshStandardMaterial({ map: texture });
                                    node.material = material;
                                });
                            }
                        }
                    });

                    if (model.path.includes("Submarine")) {
                        this.submarineModel = gltf.scene;
                    }

                    this.scene.add(gltf.scene);
                    this.models[model.path] = gltf.scene;  // Store the model by its path
                    resolve();
                }, undefined, error => {
                    console.error(`Error loading model ${model.path}:`, error);
                    reject(error);
                });
            })
        ));
    }

    getModel(path) {
        return this.models[path];  // Retrieve the model by its path
    }
}
