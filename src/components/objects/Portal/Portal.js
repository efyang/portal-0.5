import * as THREE from 'three'
import { GeneralBB } from 'objects'
import * as util from '../../../util'
import { Group, Vector3 } from 'three'
import { consts, globals } from '../../../globals';
import { Line2, LineGeometry, LineMaterial } from 'three-fatline';

const portal_width = consts.PORTAL_WIDTH
const portal_depth = consts.PORTAL_DEPTH
const portal_cdbb_height = consts.PORTAL_CDBB_HEIGHT
const portal_height = consts.PORTAL_HEIGHT
const portal_eps = consts.PORTAL_EPS

class Portal extends Group {
    // position - the center position (vector3)
    // normal - the normal of the host surface
    // playerDirection - the direction the player is facing
    // output - portal that this portal is paired with
    // hostObjects - object that this portal is on
    // ringColor - the color of the ring, portal1: orange, portal2: blue
    // portalPoints - the positions of the corners of the portals
    constructor(parent, position, normal, playerUpDirection, output, hostObjects, ringColor, portalPoints = []) {
        super()
        this.parent = parent
        this.pos = position.clone()
        this.output = output
        this.hostObjects = hostObjects
        this.plane = new THREE.Plane(new Vector3(0, 1, 0), 0)

        // create onb for bb transformations
        this.ty = normal.clone().normalize()
        this.tz = playerUpDirection.clone().projectOnPlane(this.ty).normalize()
        if (this.tz.length() < 0.1) {
            this.tz = new Vector3(0, 1, 0)
        }
        this.tx = this.tz.clone().cross(this.ty)

        // set portal corner points
        this.portalPoints = portalPoints;
        if (portalPoints === undefined || portalPoints.length == 0) {
            this.portalPoints = [this.pos.clone().add(this.tz.clone().multiplyScalar(portal_depth/2 + 2*portal_eps).add(this.tx.clone().multiplyScalar(portal_width/2 + 2*portal_eps))), 
                this.pos.clone().add(this.tz.clone().multiplyScalar(-portal_depth/2 - 2*portal_eps).add(this.tx.clone().multiplyScalar(portal_width/2 + 2*portal_eps))), 
                this.pos.clone().add(this.tz.clone().multiplyScalar(-portal_depth/2 - 2*portal_eps).add(this.tx.clone().multiplyScalar(-portal_width/2 - 2*portal_eps))), 
                this.pos.clone().add(this.tz.clone().multiplyScalar(portal_depth/2 + 2*portal_eps).add(this.tx.clone().multiplyScalar(-portal_width/2 - 2*portal_eps)))]
        }

        // for visualization purposes
        if (globals.DEBUG) {
            let xHelper = new THREE.ArrowHelper(this.tx, position, 1, 0xff0000)
            let yHelper = new THREE.ArrowHelper(this.ty, position, 1, 0x00ff00)
            let zHelper = new THREE.ArrowHelper(this.tz, position, 1, 0x0000ff)
            this.add(xHelper, yHelper, zHelper)
        }

        let tRot = new THREE.Matrix4().makeBasis(this.tx, this.ty, this.tz)

        this.transform = tRot.clone().setPosition(position)
        this.plane.applyMatrix4(this.transform)
        this.plane.translate(normal.clone().multiplyScalar(0.0001));

        // create the 3d model for the portal
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

        const geometry = new THREE.BoxGeometry( portal_width, portal_height, portal_depth );
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

        // constructing the portal borders
        const geometryLine = new LineGeometry();
       
        geometryLine.setPositions( [this.portalPoints[0].x, this.portalPoints[0].y, this.portalPoints[0].z, 
                                    this.portalPoints[1].x, this.portalPoints[1].y, this.portalPoints[1].z,
                                    this.portalPoints[1].x, this.portalPoints[1].y, this.portalPoints[1].z,
                                    this.portalPoints[2].x, this.portalPoints[2].y, this.portalPoints[2].z,
                                    this.portalPoints[2].x, this.portalPoints[2].y, this.portalPoints[2].z,
                                    this.portalPoints[3].x, this.portalPoints[3].y, this.portalPoints[3].z,
                                    this.portalPoints[3].x, this.portalPoints[3].y, this.portalPoints[3].z,
                                    this.portalPoints[0].x, this.portalPoints[0].y, this.portalPoints[0].z])

        const matLine = new LineMaterial( {
            color: ringColor,
            linewidth: 1, // in pixels
            resolution: new THREE.Vector2(640, 480) // resolution of the viewport
        } );

        const line = new Line2( geometryLine, matLine );
        line.computeLineDistances();
        this.add( line );

        this.add(this.mesh)

        // CDBB: collision disable BB
        // STBB: should teleport BB

        // matrix for the CDBB
        // CDBB is centered at portal
        let tCDBB = this.transform.clone()
        // STBB is centered at 1/4 height of CDBB behind the portal
        // because height of STBB is half height of CDBB
        let pSTBB = position.clone().add(normal.clone().multiplyScalar(-portal_cdbb_height / 4))
        let tSTBB = tRot.clone().setPosition(pSTBB)

        this.CDBB = new GeneralBB(portal_width, portal_cdbb_height, portal_depth, tCDBB)
        this.STBB = new GeneralBB(portal_width, portal_cdbb_height/2, portal_depth, tSTBB)
       
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