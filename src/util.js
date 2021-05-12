// general math and utilty functions
import * as THREE from 'three'
import {consts, globals} from 'globals'

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

export function portalIsVisibleInCamera(camera, portal, clippingPlane) {
    camera.updateMatrix();
    camera.updateMatrixWorld();
    let frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));  

    // in frustum,
    // in front of clipping plane,
    // camera is in front of the portal
    return frustum.intersectsObject( portal.mesh ) &&
           (clippingPlane === null || clippingPlane.distanceToPoint(portal.mesh.position) > 0) &&
           portal.plane.distanceToPoint(camera.position) > 0;
}

export function notifyPageLoadAsset(a) {
    globals.N_ASSETS_LOADED++
    const bar = document.getElementById("assets_progressbar")
    const label = document.getElementById("assets_label")
    if (bar === null) {
        return a
    }
    bar.value = globals.N_ASSETS_LOADED / consts.N_ASSETS
    if (bar.value >= 1) {
        label.innerText = "Loading: done."
        bar.style.display = 'none'
    } else {
        label.innerText = `Loaded asset: ${a.toString()}: ${(bar.value * 100).toFixed(2)}% complete. `
    }
    return a
}