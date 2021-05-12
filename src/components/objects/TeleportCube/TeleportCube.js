import * as THREE from 'three'
import { GeneralBB } from 'objects';
import {consts, globals} from 'globals'
import {playSound} from '../../../audio'

class TeleportCube extends THREE.Group {
    constructor(parent, geo, matrix, color, outputCube) {
        // Call parent Group() constructor
        super();

        this.parent = parent
        this.width = geo.width;
        this.height = geo.height;
        this.depth = geo.depth;
        this.outputCube = outputCube
        this.objectWasInsideLast = {}

        // create geometry
        const geometry = new THREE.BoxGeometry( this.width, this.height, this.depth );
        const material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide ,color: color, opacity: 0.2, transparent: true})

        this.cube = new THREE.Mesh( geometry, material );
        // cube.position.copy(pos);
        this.cube.applyMatrix4(matrix)

        this.bb = new GeneralBB(this.width, this.height, this.depth, matrix, color)
        this.add(this.bb.helper)
        this.add(this.cube)
        // Add self to parent's update list
        if (outputCube) {
            outputCube.outputCube = this
        }
        this.parent.debugMeshes.push(this.bb.helper)
        
        parent.addToUpdateList(this);
    }


    update(timeStamp) {
        for (let o of this.parent.dynamicObjects) {
            if (!this.objectWasInsideLast[o] && o.physicsBody && this.bb.containsPoint(o.physicsBody.position) && this.outputCube) {
                this.outputCube.objectWasInsideLast[o] = true
                o.physicsBody.position.copy(this.outputCube.cube.position)
                this.playTeleportSound()
            }
            if (o.physicsBody && this.objectWasInsideLast[o] && !this.bb.containsPoint(o.physicsBody.position)) {
                this.objectWasInsideLast[o] = false
            }
        }
    }

    playTeleportSound() {
        playSound(consts.TELEPORT_SOUND, false, 0.2)
    }
}

export default TeleportCube;