import './style.css';
import * as THREE from 'three';
import { CAMERA_POSITION } from './Constants.js';

export class CameraAndLighting {
    constructor() {
        this.defaultCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
        this.defaultCamera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);

        this.firstPersonCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
        this.thirdPersonCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
        this.thirdPersonCamera.position.set(0, 10, -30); // Initial third-person camera position

        this.currentCamera = this.thirdPersonCamera; // Set default camera
        this.setupLighting();
    }

    setupLighting() {
        this.ambientLight = new THREE.AmbientLight(0x404040, 1.5);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        this.directionalLight.position.set(50, 200, 100);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.camera.top = 180;
        this.directionalLight.shadow.camera.bottom = -100;
        this.directionalLight.shadow.camera.left = -120;
        this.directionalLight.shadow.camera.right = 120;

        this.pointLight = new THREE.PointLight(0xffe4b5, 0.8, 500);
        this.pointLight.position.set(0, 50, 0);

        this.spotLight = new THREE.SpotLight(0xffffff, 0.5);
        this.spotLight.position.set(-100, 200, -100);
        this.spotLight.castShadow = true;
    }

    addToScene(scene) {
        scene.add(this.ambientLight);
        scene.add(this.directionalLight);
        scene.add(this.pointLight);
        scene.add(this.spotLight);
    }

    updateFirstPersonCamera(submarineModel) {
        const offset = new THREE.Vector3(0, 2, 50); // Adjust offset as needed
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(submarineModel.quaternion);
        const position = submarineModel.position.clone().add(direction.multiplyScalar(offset.z)).add(new THREE.Vector3(offset.x, offset.y, 0));
        this.firstPersonCamera.position.copy(position);
        this.firstPersonCamera.quaternion.copy(submarineModel.quaternion);
    }

    updateThirdPersonCamera(submarineModel) {
        const offset = new THREE.Vector3(0, 60, -150); // Adjust offset as needed
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(submarineModel.quaternion);
        const position = submarineModel.position.clone().add(direction.multiplyScalar(offset.z)).add(new THREE.Vector3(offset.x, offset.y, 0));
        this.thirdPersonCamera.position.copy(position);
        this.thirdPersonCamera.lookAt(submarineModel.position);
    }

    // Additional method to modify camera positions
    setFirstPersonCameraOffset(offset) {
        this.firstPersonCameraOffset = offset;
    }

    setThirdPersonCameraOffset(offset) {
        this.thirdPersonCameraOffset = offset;
    }
}
