import * as THREE from "three";
("use strict");

class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  } // Addition

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  addVector(vector) {
    return new Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
  } // Subtraction

  addScalar(scalar) {
    return new Vector3(
      (this.x += scalar),
      (this.y += scalar),
      (this.z += scalar)
    );
  }

  subVector(vector) {
    return new Vector3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
  } // Multiplication by scalar

  multiplyScalar(scalar) {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
  } // Division by scalar

  multiply(vector) {
    return new Vector3(this.x * vector.x, this.y * vector.y, this.z * vector.z);
  }

  divide(scalar) {
    return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
  } // Dot product

  divideScalar(scalar) {
    return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
  }
  // Dot product
  dot(vector) {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  }

  angle(front) {
    var AB = this.dot(front);
    var t = this.length();
    var n = front.length();

    var tn = t * n;
    if (tn < 0.001) {
      return 0;
    } else {
      var cost = AB / (t * n);
      return Math.acos(cost);
    }
  }

  cross(vector) {
    const x = this.y * vector.z - this.z * vector.y;
    const y = this.z * vector.x - this.x * vector.z;
    const z = this.x * vector.y - this.y * vector.x;
    return new Vector3(x, y, z);
  } // Magnitude (length) of the vector

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  } // Normalize the vector

  lengthSqu() {
    return this.length() * this.length();
  }

  normalize() {
    const length = this.length();
    if (length < 0.00001) return new Vector3(0, 0, 0);
    else return new Vector3(this.x / length, this.y / length, this.z / length);
  }

  log() {
    console.log(this.x + "  , " + this.y + "  , " + this.z);
  }




}

export default Vector3;
