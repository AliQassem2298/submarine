import './style.css';
import * as THREE from 'three';

export class Lighting {
    constructor(scene) {
        this.scene = scene;
        this.sun = new THREE.Vector3();
    }

    setLighting(timeOfDay) {
        const oldDirectionalLight = this.scene.getObjectByName('directionalLight');
        const oldAmbientLight = this.scene.getObjectByName('ambientLight');
        if (oldDirectionalLight) this.scene.remove(oldDirectionalLight);
        if (oldAmbientLight) this.scene.remove(oldAmbientLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        ambientLight.name = 'ambientLight';
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.name = 'directionalLight';

        switch (timeOfDay) {
            case 'morning':
                directionalLight.color.setHex(0xffd700);
                directionalLight.position.set(50, 50, 50);
                break;
            case 'noon':
                directionalLight.color.setHex(0xffffff);
                directionalLight.position.set(0, 100, 0);
                break;
            case 'evening':
                directionalLight.color.setHex(0xff8c00);
                directionalLight.position.set(-50, 50, -50);
                break;
            case 'night':
                directionalLight.color.setHex(0x1e90ff);
                directionalLight.position.set(0, 10, 0);
                ambientLight.intensity = 0.2;
                break;
        }

        this.scene.add(directionalLight);
        this.updateSunPosition(timeOfDay);
    }

    updateSunPosition(timeOfDay) {
        const parameters = {
            morning: { elevation: 10, azimuth: 90, skyColor: 0xffd700 },
            noon: { elevation: 90, azimuth: 180, skyColor: 0x87ceeb },
            evening: { elevation: 10, azimuth: 270, skyColor: 0xff8c00 },
            night: { elevation: -10, azimuth: 0, skyColor: 0x1e90ff }
        };

        const { elevation, azimuth, skyColor } = parameters[timeOfDay];
        const phi = THREE.MathUtils.degToRad(90 - elevation);
        const theta = THREE.MathUtils.degToRad(azimuth);

        this.sun.setFromSphericalCoords(1, phi, theta);

        const sky = this.scene.getObjectByName('sky');
        const water = this.scene.getObjectByName('water');

        if (sky) {
            sky.material.uniforms['sunPosition'].value.copy(this.sun);
            sky.material.uniforms['turbidity'].value = 10;
            sky.material.uniforms['rayleigh'].value = 2;
            sky.material.uniforms['mieCoefficient'].value = 0.005;
            sky.material.uniforms['mieDirectionalG'].value = 0.8;
            sky.material.uniforms['sunPosition'].value.copy(this.sun);
            sky.material.uniforms['up'].value.set(0, 1, 0);
            sky.material.uniforms['sunColor'].value.setHex(skyColor);
        }
        if (water) {
            water.material.uniforms['sunDirection'].value.copy(this.sun).normalize();
        }
    }
}
