import * as THREE from 'three'
import { GeneralBB } from '../GeneralBB'
import * as util from '../../../util'

// width = x
// height = y
// depth = z
const PORTAL_WIDTH = 0.5
const PORTAL_DEPTH = 1
const PORTAL_CDBB_HEIGHT = 0.5

class Portal extends Group {
    // position - the center position (vector3)
    // normal - the normal of the host surface
    // playerDirection - the direction the player is facing
    // output - portal that this portal is paired with
    // hostObject - object that this portal is on
    constructor(parent, position, normal, playerDirection, output, hostObject) {
        this.parent = parent
        this.position = position.clone()
        this.output = output
        this.hostObject = hostObject

        // create onb for bb transformations
        let ty = normal.clone().normalize()
        let tz = playerDirection.clone().projectOnPlane(ty)
        let tx = tz.clone().cross(ty)
        let tRot = new THREE.Matrix4().makeBasis(tx, ty, tz)

        // CDBB: collision disable BB
        // STBB: should teleport BB

        // matrix for the CDBB
        // CDBB is centered at portal
        let tCDBB = rRot.clone().setPosition(position)
        // STBB is centered at 1/4 height of CDBB behind the portal
        // because height of STBB is half height of CDBB
        let pSTBB = position.clone().add(normal.clone().multiplyScalar(-PORTAL_CDBB_HEIGHT / 4))
        let tSTBB = rRot.clone().setPosition(pSTBB)

        this.CDBB = new GeneralBB(PORTAL_WIDTH, PORTAL_CDBB_HEIGHT, PORTAL_DEPTH, tCDBB)
        this.STBB = new GeneralBB(PORTAL_WIDTH, PORTAL_CDBB_HEIGHT/2, PORTAL_DEPTH, tSTBB)
    }

    update(timeStamp) {
        // update parent collision groups based on bb
    }

    // apply teleportation to the output portal to the vector
    // could be a postion or velocity, is Vector3
    // no side effects
    getTeleported(v) {
        let f = new THREE.Matrix4().makeScale(1, -1, 1)
        let m = this.CDBB.inverse_t.clone().premultiply(f).premultiply(this.output.CDBB.t)
        let v4 = util.threeToFour(v).applyMatrix4(m)
        return util.fourToThree(v4)
    }
}

export default Portal