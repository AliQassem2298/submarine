import Vector3 from "./Library";
class GMath {
static sign(n) {
  //  Allegedly fastest if we check for number type
  return typeof n === "number"
    ? n
      ? n < 0
        ? -1
        : 1
      : n === n
      ? 0
      : NaN
    : NaN;
}

// هي القيمة المحصورة بين المين و الماكس n
static clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

/**  Always positive modulus */
static pmod(n, m) {
  return ((n % m) + m) % m;
}

static GetForceDirection(vector,  Angle)
{
  var x = vector.x * Math.cos(Angle) - vector.z * Math.sin(Angle);
  var z = vector.x * Math.sin(Angle) + vector.z * Math.cos(Angle);
  return new Vector3(x, vector.y, z);
}



}export default GMath;
