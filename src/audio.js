import { Audio } from "three";
import {consts, globals} from 'globals'

export function playSound(sound, loop, volume) {
    sound.then((buffer) => {
        let player = new Audio(consts.LISTENER)
        player.setBuffer(buffer)
        player.setLoop(loop)
        player.setVolume(volume)
        player.play()
    })
}

export function playBGMusicCarousel() {
    const index = Math.floor(Math.random() * consts.BGMUSIC_SOUNDS.length)
    consts.BGMUSIC_SOUNDS[index].sound.then((sound) => {
        let player = new Audio(consts.LISTENER)
        globals.PLAYER = player

        player.setBuffer(sound)
        player.setLoop(false)
        player.setVolume(consts.BGMUSIC_SOUNDS[index].volume)
        player.onEnded = () => {
            playBGMusicCarousel()
        }
        player.play()
    })
}

export function playCongrats() {
    consts.CONGRATS_SOUND.sound.then((sound) => {
        if (globals.PLAYER) {
            globals.PLAYER.onEnded = () => {}
            globals.PLAYER.stop()
        }

        let player = new Audio(consts.LISTENER)
        globals.PLAYER = player
        player.setBuffer(sound)
        player.setLoop(false)
        player.setVolume(consts.CONGRATS_SOUND.volume)
        player.onEnded = () => {
            playBGMusicCarousel()
        }
        player.play()
    })
}