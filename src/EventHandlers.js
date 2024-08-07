import { forwardSpeed, rotationStep, rotationStep2, rotationStep3 } from './Constants.js';
import { Audio, AudioLoader, AudioListener, Box3, Clock } from 'three';

export class EventHandlers {
    constructor(cameraAndLighting, renderer, submarineModel, setLighting, islands) {
        this.cameraAndLighting = cameraAndLighting;
        this.renderer = renderer;
        this.submarineModel = submarineModel;
        this.setLighting = setLighting;
        this.velocity = 0;
        this.rotationSpeed = 0;
        this.rotationSpeed2 = 0;
        this.rotationSpeed3 = 0;
        this.islands = islands;
        this.clock = new Clock();
        this.isCollisionDialogOpen = false; // Flag to indicate if the dialog is open

        this.collisionDialog = document.getElementById('collision-dialog');
        this.dialogOkButton = document.getElementById('dialog-ok-btn');
        this.dialogOkButton.addEventListener('click', this.onDialogOk.bind(this));

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        window.addEventListener('keyup', this.onKeyUp.bind(this), false);

        // Setup audio listener and sound
        this.listener = new AudioListener();
        this.cameraAndLighting.defaultCamera.add(this.listener);

        this.collisionSound = new Audio(this.listener);
        const audioLoader = new AudioLoader();
        audioLoader.load('/sounds/explosion.mp3', buffer => {
            this.collisionSound.setBuffer(buffer);
            this.collisionSound.setLoop(false);
            this.collisionSound.setVolume(0.5);
        });
    }

    onWindowResize() {
        this.cameraAndLighting.currentCamera.aspect = window.innerWidth / window.innerHeight;
        this.cameraAndLighting.currentCamera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onKeyDown(event) {
        if (this.isCollisionDialogOpen) return; // Prevent input when the dialog is open

        switch (event.key) {
            case 'ArrowUp':
            case 'w':
                this.velocity = forwardSpeed;
                break;
            case 'ArrowDown':
            case 's':
                this.velocity = -forwardSpeed;
                break;
            case 'ArrowLeft':
            case 'a':
                this.rotationSpeed = rotationStep * 0.5;
                break;
            case 'ArrowRight':
            case 'd':
                this.rotationSpeed = -rotationStep * 0.5;
                break;
            case 'z':
                this.rotationSpeed2 = -rotationStep2 * 0.5;
                break;
            case 'x':
                this.rotationSpeed2 = rotationStep2 * 0.5;
                break;
            case 'c':
                this.rotationSpeed3 = rotationStep3 * 0.5;
                break;
            case 'v':
                this.rotationSpeed3 = -rotationStep3 * 0.5;
                break;
            case '1':
                this.setLighting('morning');
                break;
            case '2':
                this.setLighting('noon');
                break;
            case '3':
                this.setLighting('evening');
                break;
            case '4':
                this.setLighting('night');
                break;
            case 'b':
                this.cameraAndLighting.currentCamera = this.cameraAndLighting.defaultCamera;
                break;
            case 'n':
                this.cameraAndLighting.currentCamera = this.cameraAndLighting.firstPersonCamera;
                break;
            case 'm':
                this.cameraAndLighting.currentCamera = this.cameraAndLighting.thirdPersonCamera;
                break;
        }
    }

    onKeyUp(event) {
        if (this.isCollisionDialogOpen) return; // Prevent input when the dialog is open

        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'w':
            case 's':
                this.velocity = 0;
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'a':
            case 'd':
            case 'z':
            case 'x':
            case 'c':
            case 'v':
                this.rotationSpeed = 0;
                this.rotationSpeed2 = 0;
                this.rotationSpeed3 = 0;
                break;
        }
    }

    update() {
        const delta = this.clock.getDelta();

        if (this.submarineModel) {
            const previousPosition = this.submarineModel.position.clone();

            this.submarineModel.translateZ(this.velocity);
            this.submarineModel.rotation.y += this.rotationSpeed * 0.5;
            this.submarineModel.rotation.x += this.rotationSpeed2 * 0.5;
            this.submarineModel.rotation.z += this.rotationSpeed3 * 0.5;

            const submarineBox = new Box3().setFromObject(this.submarineModel);
            for (const island of this.islands) {
                const islandBox = new Box3().setFromObject(island);
                if (submarineBox.intersectsBox(islandBox)) {
                    console.log('Collision detected');
                    this.submarineModel.position.copy(previousPosition);
                    this.playCollisionSound();
                    this.showCollisionDialog();
                    break;
                }
            }

            if (this.cameraAndLighting.currentCamera === this.cameraAndLighting.firstPersonCamera) {
                this.cameraAndLighting.updateFirstPersonCamera(this.submarineModel);
            } else if (this.cameraAndLighting.currentCamera === this.cameraAndLighting.thirdPersonCamera) {
                this.cameraAndLighting.updateThirdPersonCamera(this.submarineModel);
            }
        }
    }

    playCollisionSound() {
        if (this.collisionSound.isPlaying) {
            this.collisionSound.stop();
        }
        this.collisionSound.play();
    }

    showCollisionDialog() {
        this.isCollisionDialogOpen = true; // Set the flag to true
        this.submarineModel.visible = false;
        this.velocity = 0; // Stop the submarine
        this.rotationSpeed = 0;
        this.rotationSpeed2 = 0;
        this.rotationSpeed3 = 0;
        this.collisionDialog.style.display = 'block';
    }

    onDialogOk() {
        this.isCollisionDialogOpen = false; // Reset the flag
        this.collisionDialog.style.display = 'none';
    }
}
