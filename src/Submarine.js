import Vector3 from "./Library";
import * as THREE from "three";

class Submarine {
    constructor() {
        this.position = new Vector3(0, 0, 0); // Submarine's position
        this.velocity = new Vector3(); // Submarine's velocity
        this.acceleration = new Vector3(); // Submarine's acceleration
        this.mass = 7900000; // Mass of the submarine in kg
        this.volume = 7707.32; // Volume of the submarine in cubic meters
        this.density = 1025; // Density of water in kg/m^3
        this.airDensity = 1.225; // Density of air in kg/m^3
        this.CdAir = 0.3; // Drag coefficient for air
        this.CdWater = 0.025; // Drag coefficient for water
        this.area = 121.35; // Total reference area in square meters
        this.upperArea = 25; // Upper part reference area in square meters
        this.lowerArea = 96.35; // Lower part reference area in square meters
        this.maxEnginePower = 29828000; // Max power output in watts (40,000 shp)
        this.propellerEfficiency = 0.7; // Propeller efficiency (dimensionless)
        this.desiredSpeed = null; // Desired speed set by the captain
        this.desiredThrust = null; // Desired thrust set by the captain
        this.desiredDepth = 0; // Desired depth set by the captain in meters
        this.ballastPercentage = 0; // Ballast tank fill percentage
        this.maxDepth = 490; // Maximum depth the submarine can reach with full ballast tanks
        this.currentDepth = 0; // Current depth of the submarine
        this.timeStep = 1; // Time step in seconds for each update
        this.guiControls = null;  // Placeholder for the GUIControls instance

    }
    setGUIControls(guiControls) {
        this.guiControls = guiControls;
    }
    update() {
        // Update ballast tank status based on desired depth
        this.updateBallastTank();

        // Calculate the total force acting on the submarine
        const totalForce = this.totalForce();

        // Update acceleration (Newton's 2nd Law: F = ma)
        this.acceleration = totalForce.divideScalar(this.mass);

        // Update velocity based on acceleration
        this.velocity = this.velocity.addVector(this.acceleration.clone().multiplyScalar(this.timeStep));

        // Apply realistic ascent/descent rates
        this.applyAscentDescentRates();

        // Update position based on velocity
        this.position = this.position.addVector(this.velocity.clone().multiplyScalar(this.timeStep));

        // Update the current depth for GUI
        this.currentDepth = Math.abs(this.position.y);

        // Stop at desired depth
        this.adjustForDesiredDepth();

        // Calculate pressure at current depth
        const pressure = this.calculatePressure();
        console.log(`Pressure at depth ${this.currentDepth}: ${pressure} Pa`);
        console.log(`Ballast Percentage: ${this.ballastPercentage * 100} %`);
        // Call updateOverlay from the GUIControls instance
        if (this.guiControls) {
            this.guiControls.updateOverlay();
        }

    }

    applyAscentDescentRates() {
        // Adjust the vertical velocity based on the ascent/descent rates
        const depthDifference = this.desiredDepth - this.currentDepth;

        if (depthDifference > 0) {
            // Descending
            this.velocity.y = -Math.min(0.5, depthDifference / this.timeStep);
        } else if (depthDifference < 0) {
            // Ascending
            this.velocity.y = Math.min(0.2, Math.abs(depthDifference) / this.timeStep);
        } else {
            // Stop vertical movement if at desired depth
            this.velocity.y = 0;
        }
    }

    adjustForDesiredDepth() {
        // Prevent overshooting the desired depth
        if (Math.abs(this.currentDepth - this.desiredDepth) < 0.1) {
            this.velocity.y = 0; // Stop vertical movement
            this.position.y = -this.desiredDepth; // Snap to the desired depth
        }

        // Prevent going below max depth
        if (this.currentDepth >= this.maxDepth) {
            this.velocity.y = 0;
            this.position.y = -this.maxDepth;
            this.ballastPercentage = 1.0; // Ballast tanks filled 100%
        }

        // Surface if desired depth is 0
        if (this.desiredDepth === 0 && this.currentDepth < 0.1) {
            this.ballastPercentage = 0;
            this.position.y = 0; // Snap to surface
        }
    }

    updateBallastTank() {
        // Adjust ballast percentage based on desired depth
        const targetPercentage = Math.min(1, this.desiredDepth / this.maxDepth);

        if (this.currentDepth < this.desiredDepth) {
            // Filling ballast tanks
            this.ballastPercentage = Math.min(this.ballastPercentage + 0.01, targetPercentage);
        } else if (this.currentDepth > this.desiredDepth) {
            // Emptying ballast tanks
            this.ballastPercentage = Math.max(this.ballastPercentage - 0.01, targetPercentage);
        }
    }

    totalForce() {
        // Calculate total forces: gravity + buoyancy + drag + thrust
        let totalForce = new Vector3();
        totalForce = totalForce.addVector(this.gravityForce());
        totalForce = totalForce.addVector(this.buoyancyForce());
        totalForce = totalForce.addVector(this.dragForce());
        totalForce = totalForce.addVector(this.thrustForce());
        return totalForce;
    }

    gravityForce() {
        // Calculate gravitational force
        return new Vector3(0, -9.81 * this.mass, 0);
    }

    buoyancyForce() {
        // Adjust buoyancy force based on ballast percentage
        const effectiveVolume = this.volume * (1 - this.ballastPercentage);
        return new Vector3(0, 9.81 * effectiveVolume * this.density, 0);
    }

    dragForce() {
        // Calculate the drag force
        const vLength = this.velocity.length();
        const vDirection = vLength > 0 ? this.velocity.normalize() : new Vector3(0, 0, 1);
        let dragForce;

        if (this.position.y >= 0) { // On the surface
            const FDragAir = 0.5 * this.airDensity * Math.pow(vLength, 2) * this.upperArea * this.CdAir;
            const FDragWater = 0.5 * this.density * Math.pow(vLength, 2) * this.lowerArea * this.CdWater;
            dragForce = FDragAir + FDragWater;
        } else { // Under the surface
            const FDragWaterUpper = 0.5 * this.density * Math.pow(vLength, 2) * this.upperArea * this.CdWater;
            const FDragWaterLower = 0.5 * this.density * Math.pow(vLength, 2) * this.lowerArea * this.CdWater;
            dragForce = FDragWaterUpper + FDragWaterLower;
        }

        // Apply the drag force in the opposite direction of the velocity
        return vDirection.multiplyScalar(-dragForce);
    }

    thrustForce() {
        // Calculate the thrust force based on desired speed or thrust
        if (this.desiredSpeed !== null) {
            return this.calculateThrustForSpeed(this.desiredSpeed);
        } else if (this.desiredThrust !== null) {
            return this.calculateThrustForce(this.desiredThrust);
        } else {
            return new Vector3(0, 0, 0);
        }
    }

    calculateThrustForSpeed(desiredSpeed) {
        // Calculate the thrust required to achieve the desired speed
        const vDirection = new Vector3(0, 0, desiredSpeed >= 0 ? 1 : -1);
        const desiredSpeedMagnitude = Math.abs(desiredSpeed);
        const dragAtDesiredSpeed = 0.5 * this.density * Math.pow(desiredSpeedMagnitude, 2) * this.lowerArea * this.CdWater;
        return vDirection.multiplyScalar(dragAtDesiredSpeed);
    }

    calculateThrustForce(desiredThrust) {
        // Calculate the thrust force based on the desired thrust
        const vDirection = new Vector3(0, 0, desiredThrust >= 0 ? 1 : -1);
        return vDirection.multiplyScalar(Math.abs(desiredThrust));
    }

    calculatePowerOutput() {
        // Calculate the power output required for the current velocity
        const thrustForce = this.thrustForce().length();
        const velocity = this.velocity.length();
        return (thrustForce * velocity) / this.propellerEfficiency;
    }

    calculatePressure() {
        // Calculate the pressure at the current depth
        return this.density * 9.81 * this.currentDepth;
    }
}

export default Submarine;
