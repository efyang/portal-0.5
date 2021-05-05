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
    // ringColor - the color of the ring, portal1: blue, portal2: orange
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
            stencilWrite: true, // stencil optimization, only for culling portal
            stencilFunc: THREE.EqualStencilFunc,
            stencilRef: 1,
            stencilFail: THREE.ReplaceStencilOp,
        });

        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.applyMatrix4(this.transform)
        this.mesh.updateMatrix()
        this.mesh.matrixAutoUpdate = false

        // define ringpoints for portal border lines
        const ringPoints = [];
        let EPS = 0.01
        ringPoints.push( new THREE.Vector3( portal_width / 2 + portal_eps, 0, portal_depth / 2 + portal_eps ) );
        ringPoints.push( new THREE.Vector3( -portal_width / 2 - portal_eps, 0, portal_depth / 2 + portal_eps ) );
        ringPoints.push( new THREE.Vector3( -portal_width / 2 - portal_eps, 0, portal_depth / 2 + portal_eps ) );
        ringPoints.push( new THREE.Vector3( -portal_width / 2 - portal_eps, 0, -portal_depth / 2 - portal_eps ) );
        ringPoints.push( new THREE.Vector3( -portal_width / 2 - portal_eps, 0, -portal_depth / 2 - portal_eps ) );
        ringPoints.push( new THREE.Vector3( portal_width / 2 + portal_eps, 0, -portal_depth / 2 - portal_eps) );
        ringPoints.push( new THREE.Vector3( portal_width / 2 + portal_eps, 0, -portal_depth / 2 - portal_eps) );
        ringPoints.push( new THREE.Vector3( portal_width / 2 + portal_eps, 0, portal_depth / 2 + portal_eps ) );
        
        // apply matrix so borders are on portals
        for (let rpoint of ringPoints) {
            rpoint.applyMatrix4(this.transform)
        }

        // create line meshes for borders
        const geometryLine = new LineGeometry();
        geometryLine.setPositions( [ringPoints[0].x, ringPoints[0].y, ringPoints[0].z, 
                                    ringPoints[1].x, ringPoints[1].y, ringPoints[1].z,
                                    ringPoints[2].x, ringPoints[2].y, ringPoints[2].z,
                                    ringPoints[3].x, ringPoints[3].y, ringPoints[3].z,
                                    ringPoints[4].x, ringPoints[4].y, ringPoints[4].z, 
                                    ringPoints[5].x, ringPoints[5].y, ringPoints[5].z,
                                    ringPoints[6].x, ringPoints[6].y, ringPoints[6].z,
                                    ringPoints[7].x, ringPoints[7].y, ringPoints[7].z] );
        
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