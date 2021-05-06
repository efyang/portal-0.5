// general math and utilty functions
import * as THREE from 'three'

// convert vector3 to vector4
export function threeToFour(v) {
    return new THREE.Vector4(v.x, v.y, v.z, 1)
}

export function fourToThree(v) {
    return new THREE.Vector3(v.x, v.y, v.z).multiplyScalar(1 / v.w)
}

export function threeToCannonVector3(v3) {
    return new CANNON.Vec3().copy(v3)
}

export function cannonToThreeVector3(v3) {
    return new THREE.Vector3().copy(v3)
}