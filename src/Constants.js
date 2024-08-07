
export const WATER_GEOMETRY_SIZE = 10000;
export const WATER_TEXTURE_SIZE = 512;
export const WATER_COLOR = 0x001e0f;
export const SUN_COLOR = 0xffffff;

export const CAMERA_POSITION = { x: 20, y: 30, z: 100 };
export const MODELS = [
    {
        path: "/Submarine/scene.gltf",
        position: { y: -2 },
        scale: 10,
        texturePath: "/images/metal2.png"
    },
    {
        path: "/Island1/scene.gltf",
        position: { y: -50, x: 500 },
        scale: 300,

    },
    {
        path: "/Island2/scene.gltf",
        position: { y: 20, x: -500 },
        scale: 50,
    },


];

export const forwardSpeed = 0.5;
export const rotationStep = 0.02;
export const rotationStep2 = 0.02;
export const rotationStep3 = 0.02;
