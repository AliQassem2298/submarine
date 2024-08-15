import './style.css';
import * as THREE from 'three';
import { WATER_GEOMETRY_SIZE, WATER_TEXTURE_SIZE, SUN_COLOR, WATER_COLOR } from './Constants.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

export class WaterAndSky {
    constructor(scene, renderer, camera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.sun = new THREE.Vector3();
        this.parameters = {
            elevation: 2,
            azimuth: 180,
        };
        this.setupWater();
        this.setupSky();

        // Create an underwater layer
        this.createUnderwaterLayer();
    }

    setupWater() {
        const waterGeometry = new THREE.PlaneGeometry(WATER_GEOMETRY_SIZE, WATER_GEOMETRY_SIZE);
        this.water = new Water(
            waterGeometry,
            {
                textureWidth: WATER_TEXTURE_SIZE,
                textureHeight: WATER_TEXTURE_SIZE,
                waterNormals: new THREE.TextureLoader().load('./images/3.jpg', function (texture) {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }),
                sunDirection: this.sun.clone(),
                sunColor: SUN_COLOR,
                waterColor: WATER_COLOR,
                distortionScale: 3.7,
                fog: this.scene.fog !== undefined
            }
        );
        this.water.rotation.x = -Math.PI / 2;
        this.scene.add(this.water);
    }

    setupSky() {
        const sky = new Sky();
        sky.scale.setScalar(10000);
        this.scene.add(sky);

        this.sky = sky;
        this.skyUniforms = sky.material.uniforms;

        this.skyUniforms['turbidity'].value = 10;
        this.skyUniforms['rayleigh'].value = 2;
        this.skyUniforms['mieCoefficient'].value = 0.005;
        this.skyUniforms['mieDirectionalG'].value = 0.8;

        this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);

        this.updateSun();
    }

    createUnderwaterLayer() {
        const underwaterGeometry = new THREE.PlaneGeometry(WATER_GEOMETRY_SIZE, WATER_GEOMETRY_SIZE);
        const underwaterMaterial = new THREE.MeshBasicMaterial({
            color: 0x44B0BC, // Lighter blue color
            side: THREE.DoubleSide,
        });

        this.underwaterLayer = new THREE.Mesh(underwaterGeometry, underwaterMaterial);
        this.underwaterLayer.rotation.x = -Math.PI / 2;
        this.underwaterLayer.position.y = -2; // Position it slightly below the water surface
        this.scene.add(this.underwaterLayer);
    }

    updateSun(elevation = this.parameters.elevation, azimuth = this.parameters.azimuth) {
        this.parameters.elevation = elevation;
        this.parameters.azimuth = azimuth;

        const phi = THREE.MathUtils.degToRad(90 - this.parameters.elevation);
        const theta = THREE.MathUtils.degToRad(this.parameters.azimuth);

        this.sun.setFromSphericalCoords(1, phi, theta);

        this.sky.material.uniforms['sunPosition'].value.copy(this.sun);
        this.water.material.uniforms['sunDirection'].value.copy(this.sun).normalize();

        this.scene.environment = this.pmremGenerator.fromScene(this.sky).texture;
    }
}
