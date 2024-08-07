import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Controls {
    constructor(camera, renderer) {
        this.controls = new OrbitControls(camera, renderer.domElement);
        this.controls.maxPolarAngle = Math.PI * 0.495;
        this.controls.target.set(0, 10, 0);
        this.controls.minDistance = 40.0;
        this.controls.maxDistance = 200.0;

        // Enable damping (inertia) for smoother movements
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05; // Adjust damping factor for smoothness

        // Adjust zoom speed for smoother zooming
        this.controls.zoomSpeed = 0.3;

        // Additional adjustments for smoother control
        this.controls.rotateSpeed = 0.5; // Adjust rotation speed
        this.controls.panSpeed = 0.5; // Adjust pan speed

        this.controls.update();
    }

    update() {
        this.controls.update(); // Update the controls to apply damping
    }
}
