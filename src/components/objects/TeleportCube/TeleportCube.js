import * as THREE from 'three'
import { GeneralBB } from 'objects';
import {consts, globals} from 'globals'
import {playSound} from '../../../audio'
import {congrats, levelChange} from '../../../util'

class TeleportCube extends THREE.Group {
    constructor(parent, geo, matrix, color, outputCube, isVictory, levelName) {
        // Call parent Group() constructor
        super();

        this.parent = parent
        this.width = geo.width;
        this.height = geo.height;
        this.depth = geo.depth;
        this.outputCube = outputCube
        this.objectWasInsideLast = {}
        this.isVictory = isVictory
        this.levelName = levelName

        // create geometry
        const geometry = new THREE.BoxGeometry( this.width, this.height, this.depth );
        const material = new THREE.MeshBasicMaterial({side: THREE.FrontSide ,color: color, opacity: 0.2, transparent: true})

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
                o.physicsBody.velocity.set(0, 0, 0)
                o.physicsBody.force.set(0, 0, 0)
                // will be auto teleported to the output
                globals.PLAYER_RESPAWN_POS.copy(this.cube.position)
                levelChange(this.outputCube.levelName)
                this.playTeleportSound()
                // dispose of all environment objects
                // can just dispose of current level, and then will be reloaded if we return
                // https://threejs.org/docs/index.html?q=poi#manual/en/introduction/How-to-dispose-of-objects
                for (let e of this.parent.environmentObjects) {
                    for (let c of e.children) {
                        c.geometry.dispose()
                    }
                }
                for (let l of this.parent.pointLights) {
                    l.dispose()
                }
                if (globals.PORTALS[0])
                    this.parent.deletePortal(0)
                if (globals.PORTALS[1])
                    this.parent.deletePortal(1)
            } else if (!this.objectWasInsideLast[o] && o.physicsBody && this.bb.containsPoint(o.physicsBody.position) && this.isVictory) {
                this.objectWasInsideLast[o] = true
                globals.IN_VICTORY = true
                congrats()
            }
            if (o.physicsBody && this.objectWasInsideLast[o] && !this.bb.containsPoint(o.physicsBody.position)) {
                this.objectWasInsideLast[o] = false
                if (this.isVictory) {
                    globals.IN_VICTORY = false
                }
            }
        }
    }

    playTeleportSound() {
        playSound(consts.LEVEL_TELEPORT_SOUND, false, 0.2)
    }
}

export default TeleportCube;