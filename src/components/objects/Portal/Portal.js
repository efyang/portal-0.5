import * as THREE from 'three'
import { GeneralBB } from 'objects'
import * as util from '../../../util'
import { Group, Vector3 } from 'three'

// width = x
// height = y
// depth = z
const PORTAL_WIDTH = 1.5
const PORTAL_DEPTH = 2
const PORTAL_CDBB_HEIGHT = 0.5
const PORTAL_HEIGHT = 0.01

class Portal extends Group {
    // position - the center position (vector3)
    // normal - the normal of the host surface
    // playerDirection - the direction the player is facing
    // output - portal that this portal is paired with
    // hostObjects - object that this portal is on
    constructor(parent, position, normal, playerDirection, output, hostObjects) {
        super()
        this.parent = parent
        this.pos = position.clone()
        this.output = output
        this.hostObjects = hostObjects

        // create onb for bb transformations
        let ty = normal.clone().normalize()
        let tz = playerDirection.clone().projectOnPlane(ty)
        if (tz.length() < 0.1) {
            tz = new Vector3(0, 1, 0)
        }
        let tx = tz.clone().cross(ty)
        let tRot = new THREE.Matrix4().makeBasis(tx, ty, tz)

        this.transform = tRot.clone().setPosition(position)

        // create the 3d model
        const geometry = new THREE.BoxGeometry( PORTAL_WIDTH, PORTAL_HEIGHT, PORTAL_DEPTH );
        const material = new THREE.MeshStandardMaterial( {color: 0x00ff00, opacity: 0.5, transparent: true} );
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.position.set(0, 0, 0)
        this.mesh.applyMatrix4(this.transform)
        this.add(this.mesh)

        // CDBB: collision disable BB
        // STBB: should teleport BB

        // matrix for the CDBB
        // CDBB is centered at portal
        let tCDBB = this.transform.clone()
        // STBB is centered at 1/4 height of CDBB behind the portal
        // because height of STBB is half height of CDBB
        let pSTBB = position.clone().add(normal.clone().multiplyScalar(-PORTAL_CDBB_HEIGHT / 4))
        let tSTBB = tRot.clone().setPosition(pSTBB)

        this.CDBB = new GeneralBB(PORTAL_WIDTH, PORTAL_CDBB_HEIGHT, PORTAL_DEPTH, tCDBB)
        this.STBB = new GeneralBB(PORTAL_WIDTH, PORTAL_CDBB_HEIGHT/2, PORTAL_DEPTH, tSTBB)
       
        // if valid placement, add and render
        parent.addToUpdateList( this );
    }

    update(timeStamp) {
        // update parent collision groups based on bb
    }

    // apply teleportation to the output portal to the vector
    // could be a velocity or position, is Vector3
    // no side effects
    getTeleportedVector(v) {
        let f = new THREE.Matrix4().makeScale(-1, -1, 1)
        let m = this.CDBB.inverse_t.clone().premultiply(f).premultiply(this.output.CDBB.t)
        let v4 = util.threeToFour(v).applyMatrix4(m)
        return util.fourToThree(v4)
    }
}

export default Portal;