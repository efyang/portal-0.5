import { Audio } from "three";
import {consts} from 'globals'

export function playSound(sound, loop, volume) {
    sound.then((buffer) => {
        let player = new Audio(consts.LISTENER)
        player.setBuffer(buffer)
        player.setLoop(loop)
        player.setVolume(volume)
        player.play()
    })
}