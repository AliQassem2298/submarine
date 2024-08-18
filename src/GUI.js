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
            size: 5,  // Set the default water size to 5
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
        folderWater.add(parameters, 'size', 0.1, 10, 0.1).name('size').onChange((value) => {
            waterUniforms.size.value = value;  // Update the water size uniform when the GUI value changes
        });
        folderWater.open();


        // Submarine folder
        const folderSubmarine = gui.addFolder('Submarine');
        const desiredSpeedController = folderSubmarine.add(parameters, 'desiredSpeed', -500, 500, 0.1).name('Desired Speed').onChange((value) => {
            this.submarine.desiredSpeed = value;
            this.updateOverlay();
        });

        const desiredDepthController = folderSubmarine.add(parameters, 'desiredDepth', 0, 490, 0.1).name('Desired Depth').onChange((value) => {
            this.submarine.desiredDepth = value;
            this.updateOverlay();
        });

        folderSubmarine.open();
    }

    initOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'gui-overlay';
        document.body.appendChild(overlay);

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

        overlay.innerHTML = `
            <h3>Submarine Data</h3>
            <div id="submarine-data">
                <p><strong>Current Velocity:</strong> <span id="velocity-value">0</span> m/s</p>
                <p><strong>Current Acceleration:</strong> <span id="acceleration-value">0</span> m/s²</p>
                <p><strong>Thrust Force:</strong> <span id="thrust-force-value">0</span> N</p>
                <p><strong>Drag Force:</strong> <span id="drag-force-value">0</span> N</p>
                <p><strong>Power Output:</strong> <span id="power-output-value">0</span> W</p>
                <p><strong>Power Output:</strong> <span id="power-output-hp-value">0</span> HorsePower</p>
                <p><strong>Gravity Force:</strong> <span id="gravity-force-value">0</span> N</p>
                <p><strong>Buoyancy Force:</strong> <span id="buoyancy-force-value">0</span> N</p>
                <p><strong>Pressure:</strong> <span id="pressure-value">${this.submarine.calculatePressure().toFixed(2)}</span> Pa</p>
                <p><strong>Ballast Percentage:</strong> <span id="ballast-percentage-value">${(this.submarine.ballastPercentage * 100).toFixed(2)}%</span></p>
                <p><strong>Current Depth:</strong> <span id="current-depth-value">${this.submarine.currentDepth.toFixed(2)}</span> m</p>
            </div>
        `;
    }

    updateOverlay() {
        const velocity = this.submarine.velocity.length().toFixed(2);
        const acceleration = this.submarine.acceleration.length().toFixed(5);
        const thrustForce = this.submarine.thrustForce().length().toFixed(2);
        const dragForce = this.submarine.dragForce().length().toFixed(2);
        const powerOutput = Math.abs((this.submarine.velocity.z * thrustForce / this.submarine.propellerEfficiency).toFixed(2));
        const powerOutputHP = Math.abs((powerOutput * 0.00134).toFixed(2));
        const gravityForce = this.submarine.gravityForce().length().toFixed(2);
        const buoyancyForce = this.submarine.buoyancyForce().length().toFixed(2);

        document.getElementById('velocity-value').textContent = velocity;
        document.getElementById('acceleration-value').textContent = acceleration;
        document.getElementById('thrust-force-value').textContent = thrustForce;
        document.getElementById('drag-force-value').textContent = dragForce;
        document.getElementById('power-output-value').textContent = powerOutput;
        document.getElementById('power-output-hp-value').textContent = powerOutputHP;
        document.getElementById('gravity-force-value').textContent = gravityForce;
        document.getElementById('buoyancy-force-value').textContent = buoyancyForce;
        document.getElementById('pressure-value').textContent = this.submarine.calculatePressure().toFixed(2);
        document.getElementById('ballast-percentage-value').textContent = (this.submarine.ballastPercentage * 100).toFixed(2) + '%';
        document.getElementById('current-depth-value').textContent = this.submarine.currentDepth.toFixed(2);
    }
}
