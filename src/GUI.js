import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export class GUIControls {
    constructor(water, sky, updateSun, submarine) {
        this.water = water;
        this.sky = sky;
        this.updateSun = updateSun;
        this.submarine = submarine;
        this.initGUI();
        this.initOverlay();
    }

    initGUI() {
        const parameters = {
            elevation: 2,
            azimuth: 180,
            distortionScale: this.water.material.uniforms.distortionScale.value,
            size: this.water.material.uniforms.size.value,
            mass: this.submarine.mass,
            desiredSpeed: this.submarine.desiredSpeed || 0, // Initialize with the submarine's current desiredSpeed
            desiredDepth: this.submarine.desiredDepth || 0 // Initialize with the submarine's current desiredDepth
        };

        const gui = new GUI();

        // Sky folder
        const folderSky = gui.addFolder('Sky');
        folderSky.add(parameters, 'elevation', 0, 90, 0.1).onChange((value) => {
            this.updateSun(value, parameters.azimuth);
        });
        folderSky.add(parameters, 'azimuth', -180, 180, 0.1).onChange((value) => {
            this.updateSun(parameters.elevation, value);
        });
        folderSky.open();

        // Water folder
        const waterUniforms = this.water.material.uniforms;
        const folderWater = gui.addFolder('Water');
        folderWater.add(waterUniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale');
        folderWater.add(waterUniforms.size, 'value', 0.1, 10, 0.1).name('size');
        folderWater.open();

        // Submarine folder
        const folderSubmarine = gui.addFolder('Submarine');
        folderSubmarine.add(parameters, 'mass', 1000000, 15000000, 100000).name('Mass').onChange((value) => {
            this.submarine.setMass(value);
            this.updateOverlay();
        });

        const desiredSpeedController = folderSubmarine.add(parameters, 'desiredSpeed', -500, 500, 0.1).name('Desired Speed').onChange((value) => {
            this.submarine.desiredSpeed = value;
            this.updateOverlay();
        });

        // Customizing the desiredSpeed control
        const desiredSpeedWrapper = desiredSpeedController.domElement.parentElement;
        const desiredSpeedInput = desiredSpeedWrapper.querySelector('input');

        // Create custom label for R and F
        const customLabel = document.createElement('div');
        customLabel.style.position = 'relative';
        customLabel.style.top = '-25px';
        desiredSpeedWrapper.appendChild(customLabel);

        // Convert input to display only positive values
        desiredSpeedInput.addEventListener('input', (event) => {
            const value = Math.abs(parseFloat(event.target.value) || 0);
            event.target.value = value.toFixed(1);
        });

        // Adjust input step behavior
        desiredSpeedInput.addEventListener('wheel', (event) => {
            event.preventDefault();
            let value = parseFloat(desiredSpeedInput.value) || 0;
            const step = parseFloat(desiredSpeedInput.step) || 1;
            if (event.deltaY < 0) {
                value += step;
            } else {
                value -= step;
            }
            desiredSpeedInput.value = Math.abs(value).toFixed(1);
            desiredSpeedController.setValue(value);
        });

        const desiredDepthController = folderSubmarine.add(parameters, 'desiredDepth', -1, 490, 0.1).name('Desired Depth').onChange((value) => {
            this.submarine.desiredDepth = value;
            this.updateOverlay();
        });

        folderSubmarine.open();
    }

    initOverlay() {
        // Create the overlay container
        const overlay = document.createElement('div');
        overlay.id = 'gui-overlay';
        document.body.appendChild(overlay);

        // Style the overlay
        const style = document.createElement('style');
        style.innerHTML = `
            #gui-overlay {
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.8);
                padding: 10px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                color: white;
            }
            #gui-overlay h3 {
                margin: 0 0 10px;
                color: #FFD700; /* Gold color for the title */
            }
            #gui-overlay p {
                margin: 0 0 5px;
            }
        `;
        document.head.appendChild(style);

        // Add content to the overlay
        overlay.innerHTML = `
            <h3>Submarine Data</h3>
            <div id="submarine-data">
                <p><strong>Mass:</strong> <span id="mass-value">${this.submarine.mass}</span></p>
                <p><strong>Desired Speed:</strong> <span id="desired-speed-value">${this.submarine.desiredSpeed || 0}</span></p>
                <p><strong>Desired Depth:</strong> <span id="desired-depth-value">${this.submarine.desiredDepth || 0}</span></p>
                <p><strong>Power Output:</strong> <span id="power-output-value">${this.calculatePowerOutput()}</span></p>
                <p><strong>Ballast Status:</strong> <span id="ballast-status-value">${this.submarine.ballastStatus}</span></p>
                <p><strong>Ballast Percentage:</strong> <span id="ballast-percentage-value">${(this.submarine.ballastPercentage * 100).toFixed(2)}%</span></p>
                <p><strong>Pressure:</strong> <span id="pressure-value">${this.submarine.calculatePressure().toFixed(2)}</span> Pa</p>
            </div>
        `;
    }

    updateOverlay() {
        document.getElementById('mass-value').textContent = this.submarine.mass;
        document.getElementById('desired-speed-value').textContent = this.submarine.desiredSpeed;
        document.getElementById('desired-depth-value').textContent = this.submarine.desiredDepth;
        document.getElementById('power-output-value').textContent = this.calculatePowerOutput();
        document.getElementById('ballast-status-value').textContent = this.submarine.ballastStatus;
        document.getElementById('ballast-percentage-value').textContent = (this.submarine.ballastPercentage * 100).toFixed(2) + '%';
        document.getElementById('pressure-value').textContent = this.submarine.calculatePressure().toFixed(2);
    }

    calculatePowerOutput() {
        const thrustForce = this.submarine.thrustForce().length();
        const velocity = this.submarine.velocity.length();
        return (thrustForce * velocity / this.submarine.propellerEfficiency).toFixed(2);
    }
}
