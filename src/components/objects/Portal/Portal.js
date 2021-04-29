import * as THREE from 'three'
import { GeneralBB } from 'objects'
import * as util from '../../../util'
import { Group, Vector3 } from 'three'
import * as GLOBALS from '../../../globals'

// width = x
// height = y
// depth = z
const PORTAL_WIDTH = 1.5
const PORTAL_DEPTH = 2
const PORTAL_CDBB_HEIGHT = 0.5
const PORTAL_HEIGHT = 0.00001

class Portal extends Group {
    // position - the center position (vector3)
    // normal - the normal of the host surface
    // playerDirection - the direction the player is facing
    // output - portal that this portal is paired with
    // hostObjects - object that this portal is on
    constructor(parent, position, normal, playerUpDirection, output, hostObjects, ringColor) {
        super()
        this.parent = parent
        this.pos = position.clone()
        this.output = output
        this.hostObjects = hostObjects
        this.plane = new THREE.Plane(new Vector3(0, 1, 0), 0)

        // create onb for bb transformations
        let ty = normal.clone().normalize()
        let tz = playerUpDirection.clone().projectOnPlane(ty).normalize()
        if (tz.length() < 0.1) {
            tz = new Vector3(0, 1, 0)
        }
        let tx = tz.clone().cross(ty)

        // for visualization purposes
        if (GLOBALS.DEBUG) {
            let xHelper = new THREE.ArrowHelper(tx, position, 1, 0xff0000)
            let yHelper = new THREE.ArrowHelper(ty, position, 1, 0x00ff00)
            let zHelper = new THREE.ArrowHelper(tz, position, 1, 0x0000ff)
            this.add(xHelper, yHelper, zHelper)
        }

        let tRot = new THREE.Matrix4().makeBasis(tx, ty, tz)

        this.transform = tRot.clone().setPosition(position)
        this.plane.applyMatrix4(this.transform)

        // create the 3d model

        const VERT_SHADER = `
        void main() 
        {
            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * modelViewPosition;
        }
        `

        const FRAG_SHADER = `
        uniform sampler2D texture1;
        uniform float ww;
        uniform float wh;
        void main() {
            gl_FragColor = texture2D(texture1, gl_FragCoord.xy / vec2(ww, wh));
        }
        `

        const geometry = new THREE.BoxGeometry( PORTAL_WIDTH, PORTAL_HEIGHT, PORTAL_DEPTH );
        const uniforms = {
            texture1: {type: 't', value: new THREE.Texture()},
            ww: {type: 'f', value: 1}, // not correct values at time of creation necessarily, will be updated later in render loop
            wh: {type: 'f', value: 1}
        }
        const material = new THREE.ShaderMaterial({
            vertexShader: VERT_SHADER,
            fragmentShader: FRAG_SHADER,
            uniforms: uniforms,
        });

        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.applyMatrix4(this.transform)
        this.mesh.updateMatrix()
        this.mesh.matrixAutoUpdate = false

        const ringPoints = [];
        ringPoints.push( new THREE.Vector3( PORTAL_WIDTH / 2 + 0.01, 0, PORTAL_DEPTH / 2 + 0.01 ) );
        ringPoints.push( new THREE.Vector3( -PORTAL_WIDTH / 2 - 0.01, 0, PORTAL_DEPTH / 2 + 0.01 ) );
        ringPoints.push( new THREE.Vector3( -PORTAL_WIDTH / 2 - 0.01, 0, PORTAL_DEPTH / 2 + 0.01 ) );
        ringPoints.push( new THREE.Vector3( -PORTAL_WIDTH / 2 - 0.01, 0, -PORTAL_DEPTH / 2 - 0.01 ) );
        ringPoints.push( new THREE.Vector3( -PORTAL_WIDTH / 2 - 0.01, 0, -PORTAL_DEPTH / 2 - 0.01 ) );
        ringPoints.push( new THREE.Vector3( PORTAL_WIDTH / 2 + 0.01, 0, -PORTAL_DEPTH / 2 - 0.01) );
        ringPoints.push( new THREE.Vector3( PORTAL_WIDTH / 2 + 0.01, 0, -PORTAL_DEPTH / 2 - 0.01) );
        ringPoints.push( new THREE.Vector3( PORTAL_WIDTH / 2 + 0.01, 0, PORTAL_DEPTH / 2 + 0.01 ) );
        const ringGeometry = new THREE.BufferGeometry().setFromPoints( ringPoints );
        const ringMaterial = new THREE.LineBasicMaterial({color: ringColor});
        this.ring = new THREE.Line( ringGeometry, ringMaterial);
        this.ring.applyMatrix4(this.transform)
        this.add(this.ring)

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
    // no side effects
    getTeleportedPositionalVector(v) {
        let f = new THREE.Matrix4().makeScale(-1, -1, 1)
        let m = this.CDBB.inverse_t.clone().premultiply(f).premultiply(this.output.CDBB.t)
        let v4 = util.threeToFour(v).applyMatrix4(m)
        return util.fourToThree(v4)
    }

    // for directional vectors, it doesn't make sense to translate them
    // we only apply the rotational component of the matrix
    getTeleportedDirectionalVector(v) {
        let f = new THREE.Matrix4().makeScale(-1, -1, 1)
        let it = new THREE.Matrix4()
        it.extractRotation(this.CDBB.inverse_t)
        let to = new THREE.Matrix4()
        to.extractRotation(this.output.CDBB.t)

        let m = it.clone().premultiply(f).premultiply(to)
        let v4 = util.threeToFour(v).applyMatrix4(m)
        return util.fourToThree(v4)
    }

    // teleport a 3D object directly, returns nothing
    // Object3D includes camera, meshes
    teleportObject3D(object) {
        let f = new THREE.Matrix4().makeScale(-1, -1, 1)
        let m = this.CDBB.inverse_t.clone().premultiply(f).premultiply(this.output.CDBB.t)
        object.applyMatrix4(m)
    }
}

export default Portal;