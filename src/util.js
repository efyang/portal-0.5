// general math and utilty functions
import * as THREE from 'three'
import {consts, globals} from 'globals'
import CONGRATS_HTML from './congrats.html'
import LEVELCHANGE_HTML from './levelChange.html'
import {playCongrats} from './audio'

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

export function congrats() {
    let instructionsContainer = document.getElementById('instructions-container')
    instructionsContainer.innerHTML = CONGRATS_HTML
    instructionsContainer.style.opacity = '0'
    instructionsContainer.style.display = 'block'
    setTimeout(() => {
        instructionsContainer.style.opacity = '1'
    }, 1000)

    playCongrats()
}

export function levelChange(name) {
    let instructionsContainer = document.getElementById('instructions-container')
    instructionsContainer.innerHTML = LEVELCHANGE_HTML
    instructionsContainer.style.display = 'block'
    let levelchange = document.getElementById('levelchange')
    instructionsContainer.style.opacity = '0'
    levelchange.style.opacity = '0'
    setTimeout(() => {
        levelchange.style.opacity = '1'
        instructionsContainer.style.opacity = '1'
    }, 1000)

    setTimeout(() => {
        levelchange.style.opacity = '0'
        instructionsContainer.style.opacity = '0'
    }, 6000)

    setTimeout(() => {
        instructionsContainer.style.display = 'none'
    }, 7000)
    let label = document.getElementById('levelname')
    label.innerHTML = name
}