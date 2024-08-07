import Vector3 from "./Library";
import * as THREE from "three";

class Submarine {
    constructor() {
        this.position = new Vector3();
        this.velocity = new Vector3();
        this.acceleration = new Vector3();
        this.mass = 7900000; // Mass of the submarine in kg
        this.volume = 7707.32; // Volume of the submarine in cubic meters
        this.density = 1025; // Density of water in kg/m^3
        this.area = 121.35; // Total reference area in square meters
        this.upperArea = 25; // Upper part reference area in square meters
        this.lowerArea = 96.35; // Lower part reference area in square meters
        this.airDensity = 1.225; // Density of air in kg/m^3
        this.CdAir = 0.3; // Drag coefficient for air
        this.CdWater = 0.025; // Drag coefficient for water
        this.maxEnginePower = 29828000; // Max power output in watts (40,000 shp)
        this.propellerEfficiency = 0.7; // Propeller efficiency (dimensionless)
        this.desiredSpeed = null; // Desired speed set by the captain
        this.desiredThrust = null; // Desired thrust set by the captain
        this.desiredDepth = 0; // Desired depth set by the captain in meters
        this.ballastStatus = "empty"; // Ballast tank status
        this.ballastPercentage = 0; // Ballast tank fill percentage
        this.maxDepth = 490; // Maximum depth the submarine can reach with full ballast tanks
        this.maxY = 2000; // Maximum Y position for rising
        this.minY = -2000; // Minimum Y position for sinking
        this.currentDepth = 0; // Current depth of the submarine
    }

    // update() {
    //     // Update ballast tank status based on desired depth
    //     this.updateBallastTank();

    //     // Calculate the total force
    //     const totalForce = this.totalForce();

    //     // Calculate the linear acceleration
    //     this.acceleration = totalForce.divideScalar(this.mass);

    //     // Calculate the linear velocity
    //     this.velocity = this.velocity.addVector(this.acceleration.clone().multiplyScalar(0.05)); // Faster movement
    //     this.velocityLength = this.velocity.length();

    //     // Calculate the position
    //     this.position = this.position.addVector(this.velocity.clone().multiplyScalar(0.05)); // Faster movement

    //     // Update current depth for GUI
    //     this.currentDepth = Math.abs(this.position.y);

    //     // Adjust position and velocity if near the desired depth to prevent overshooting
    //     if (Math.abs(this.position.y + this.desiredDepth) < 0.1 && this.velocity.y !== 0) {
    //         this.velocity.y = 0; // Stop vertical movement
    //         this.position.y = -this.desiredDepth; // Snap to the desired depth
    //     }

    //     // If at the surface, reset ballast tanks to 0%
    //     if (this.position.y >= 0) {
    //         this.ballastPercentage = 0;
    //         this.ballastStatus = "empty";
    //         this.position.y = 0;
    //     }
    // }

    // updateBallastTank() {
    //     // Calculate the required ballast percentage to reach the desired depth
    //     const targetPercentage = this.desiredDepth / this.maxDepth;

    //     if (this.position.y > -this.desiredDepth) {
    //         if (this.ballastPercentage < targetPercentage) {
    //             this.ballastStatus = "filling";
    //             this.ballastPercentage = Math.min(this.ballastPercentage + 0.03, targetPercentage); // Faster filling
    //         } else {
    //             this.ballastStatus = "filled with " + Math.round(this.ballastPercentage * 100) + "%";
    //         }
    //     } else if (this.position.y < -this.desiredDepth) {
    //         if (this.ballastPercentage > targetPercentage) {
    //             this.ballastStatus = "emptying";
    //             this.ballastPercentage = Math.max(this.ballastPercentage - 0.03, targetPercentage); // Faster emptying
    //         } else {
    //             this.ballastStatus = "filled with " + Math.round(this.ballastPercentage * 100) + "%";
    //         }
    //     } else {
    //         this.ballastStatus = "filled with " + Math.round(this.ballastPercentage * 100) + "%";
    //     }
    // }
    update() {
        // Update ballast tank status based on desired depth
        this.updateBallastTank();

        // Calculate the total force
        const totalForce = this.totalForce();

        // Calculate the linear acceleration
        this.acceleration = totalForce.divideScalar(this.mass);

        // Calculate the linear velocity
        this.velocity = this.velocity.addVector(this.acceleration.clone().multiplyScalar(0.02));
        this.velocityLength = this.velocity.length();

        // Calculate the position
        this.position = this.position.addVector(this.velocity.clone().multiplyScalar(0.02));

        // Adjust position and velocity if near the desired depth to prevent overshooting
        if (Math.abs(this.position.y + this.desiredDepth) < 0.1 && this.velocity.y !== 0) {
            this.velocity.y = 0; // Stop vertical movement
            this.position.y = -this.desiredDepth; // Snap to the desired depth
        }
    }

    updateBallastTank() {
        // Calculate the required ballast percentage to reach the desired depth
        const targetPercentage = this.desiredDepth / this.maxDepth;

        if (this.position.y > -this.desiredDepth) {
            if (this.ballastPercentage < targetPercentage) {
                this.ballastStatus = "filling";
                this.ballastPercentage = Math.min(this.ballastPercentage + 0.01, targetPercentage); // Simulate filling
            } else {
                this.ballastStatus = "filled with " + Math.round(this.ballastPercentage * 100) + "%";
            }
        } else if (this.position.y < -this.desiredDepth) {
            if (this.ballastPercentage > targetPercentage) {
                this.ballastStatus = "emptying";
                this.ballastPercentage = Math.max(this.ballastPercentage - 0.01, targetPercentage); // Simulate emptying
            } else {
                this.ballastStatus = "filled with " + Math.round(this.ballastPercentage * 100) + "%";
            }
        } else {
            this.ballastStatus = "filled with " + Math.round(this.ballastPercentage * 100) + "%";
        }
    }
    totalForce() {
        let tf = new Vector3();
        tf = tf.addVector(this.gravityForce());
        tf = tf.addVector(this.buoyancyForce());
        tf = tf.addVector(this.dragForce());
        tf = tf.addVector(this.thrustForce());
        return tf;
    }

    gravityForce() {
        // Gravity force
        return new Vector3(0, -9.81 * this.mass, 0);
    }

    buoyancyForce() {
        // Adjust the buoyancy force based on the ballast percentage
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


    setMass(newMass) {
        this.mass = newMass;
    }
}

export default Submarine;
