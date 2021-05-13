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
    playBGMusic(consts.BGMUSIC_SOUNDS[index].sound, consts.BGMUSIC_SOUNDS[index].volume)
}

export function playBGMusic(sound, volume) {
    sound.then((sound) => {
        if (globals.BGMUSIC_PLAYER) {
            globals.BGMUSIC_PLAYER.onEnded = () => {}
            globals.BGMUSIC_PLAYER.stop()
        }

        let player = new Audio(consts.LISTENER)
        globals.BGMUSIC_PLAYER = player

        player.setBuffer(sound)
        player.setLoop(false)
        player.setVolume(volume)
        player.onEnded = () => {
            playBGMusicCarousel()
        }
        player.play()
    })
}

export function playCongrats() {
    consts.CONGRATS_SOUND.sound.then((sound) => {
        if (globals.BGMUSIC_PLAYER) {
            globals.BGMUSIC_PLAYER.onEnded = () => {}
            globals.BGMUSIC_PLAYER.stop()
        }

        let player = new Audio(consts.LISTENER)
        globals.BGMUSIC_PLAYER = player
        player.setBuffer(sound)
        player.setLoop(false)
        player.setVolume(consts.CONGRATS_SOUND.volume)
        player.onEnded = () => {
            playBGMusicCarousel()
        }
        player.play()
    })
}

export function startPlayWindSound() {
    consts.WIND_LOOP_SOUND.then((buffer) => {
        let player = new Audio(consts.LISTENER)
        player.setBuffer(buffer)
        player.setLoop(true)
        player.setVolume(0)
        player.play()
        globals.WIND_SOUND_PLAYER = player
    })
}

export function playWind(playerVelocity) {
    const magnitude = playerVelocity.length()
    const volume = Math.min(0.3, Math.max(0, (magnitude - 7)/40 ))
    if (globals.WIND_SOUND_PLAYER) {
        globals.WIND_SOUND_PLAYER.setVolume(volume)
    }
}