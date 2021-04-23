import * as THREE from 'three'
import * as util from '../../../util'

class GeneralBB {
    // width, depth, height numbers
    // t Matrix4, the transformation matrix
    constructor(width, depth, height, t) {
        let halfDiag = new THREE.Vector3(width, height, depth).multiplyScalar(1/2)
        // Box3
        this.baseBB = new THREE.Box3(halfDiag.clone().negate(), halfDiag.clone())
        // Matrix4
        this.t = t
        this.inverse_t = this.t.clone().invert()
    }

    // @param {THREE.Vector3} point
    containsPoint(point) {
        let p4 = util.threeToFour(point)
        p4.applyMatrix4(this.inverse_t)
        let p3 = util.fourToThree(p4)
        return this.baseBB.containsPoint(p3)
    }
}