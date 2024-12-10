// import {EKeycodeDefault, EKeycodeV10, EKeycodeV11, EKeycodeV12, EKeycapType } from '../../model'

import {EKeycapType, EKeycodeDefault, EKeycodeV10, EKeycodeV11, EKeycodeV12} from "../../model/enum";
export class KeycodeEnumService {
    static prototol = 0;
    static getKeycodeEnum (): any {
        switch( KeycodeEnumService.prototol ) {
            case 13 :
            case 12 :
                return EKeycodeV12
                break;

            case 11 :
                return EKeycodeV11
                break
            case 10 :
                return EKeycodeV10
                break
            default: {
                return EKeycodeDefault
            }
        }
    }

    private static keycapTypeCacheExist = false  ;
    private static keycapTypeCache: any = {
        [EKeycapType.Normal]: [],
        [EKeycapType.Spec]: [],
        [EKeycapType.Combo]: [],
    }

    static keyeventCode2Keycode (): any {
        const EKeycode = KeycodeEnumService.getKeycodeEnum()
        const result: any =  {
            Digit1: [EKeycode.KC_1, EKeycapType.Normal],
            Digit2: [EKeycode.KC_2, EKeycapType.Normal],
            Digit3: [EKeycode.KC_3, EKeycapType.Normal],
            Digit4: [EKeycode.KC_4, EKeycapType.Normal],
            Digit5: [EKeycode.KC_5, EKeycapType.Normal],
            Digit6: [EKeycode.KC_6, EKeycapType.Normal],
            Digit7: [EKeycode.KC_7, EKeycapType.Normal],
            Digit8: [EKeycode.KC_8, EKeycapType.Normal],
            Digit9: [EKeycode.KC_9, EKeycapType.Normal],
            Digit0: [EKeycode.KC_0, EKeycapType.Normal],
            KeyA: [EKeycode.KC_A ,EKeycapType.Normal],
            KeyB: [EKeycode.KC_B, EKeycapType.Normal],
            KeyC: [EKeycode.KC_C, EKeycapType.Normal],
            KeyD: [EKeycode.KC_D, EKeycapType.Normal],
            KeyE: [EKeycode.KC_E, EKeycapType.Normal],
            KeyF: [EKeycode.KC_F, EKeycapType.Normal],
            KeyG: [EKeycode.KC_G, EKeycapType.Normal],
            KeyH: [EKeycode.KC_H, EKeycapType.Normal],
            KeyI: [EKeycode.KC_I, EKeycapType.Normal],
            KeyJ: [EKeycode.KC_J, EKeycapType.Normal],
            KeyK: [EKeycode.KC_K, EKeycapType.Normal],
            KeyL: [EKeycode.KC_L, EKeycapType.Normal],
            KeyM: [EKeycode.KC_M, EKeycapType.Normal],
            KeyN: [EKeycode.KC_N, EKeycapType.Normal],
            KeyO: [EKeycode.KC_O, EKeycapType.Normal],
            KeyP: [EKeycode.KC_P, EKeycapType.Normal],
            KeyQ: [EKeycode.KC_Q, EKeycapType.Normal],
            KeyR: [EKeycode.KC_R, EKeycapType.Normal],
            KeyS: [EKeycode.KC_S, EKeycapType.Normal],
            KeyT: [EKeycode.KC_T, EKeycapType.Normal],
            KeyU: [EKeycode.KC_U, EKeycapType.Normal],
            KeyV: [EKeycode.KC_V, EKeycapType.Normal],
            KeyW: [EKeycode.KC_W, EKeycapType.Normal],
            KeyX: [EKeycode.KC_X, EKeycapType.Normal],
            KeyY: [EKeycode.KC_Y, EKeycapType.Normal],
            KeyZ: [EKeycode.KC_Z, EKeycapType.Normal],
            Comma: [EKeycode.KC_COMM, EKeycapType.Normal],
            Period: [EKeycode.KC_DOT, EKeycapType.Normal],
            Semicolon: [EKeycode.KC_SCLN, EKeycapType.Normal],
            Quote: [EKeycode.KC_QUOT, EKeycapType.Normal],
            BracketLeft: [EKeycode.KC_LBRC, EKeycapType.Normal],
            BracketRight: [EKeycode.KC_RBRC, EKeycapType.Normal],
            Backspace: [EKeycode.KC_BSPC,EKeycapType.Normal],
            Backquote: [EKeycode.KC_GRV,EKeycapType.Normal],
            Slash: [EKeycode.KC_SLSH,EKeycapType.Normal],
            Backslash: [EKeycode.KC_BSLS,EKeycapType.Normal],
            Minus: [EKeycode.KC_MINS,EKeycapType.Normal],
            Equal: [EKeycode.KC_EQL,EKeycapType.Normal],
            IntlRo: [EKeycode.KC_RO,EKeycapType.Normal],
            IntlYen: [EKeycode.KC_JYEN,EKeycapType.Normal],
            AltLeft: [EKeycode.KC_LALT, EKeycapType.Combo],
            AltRight: [EKeycode.KC_RALT, EKeycapType.Combo],
            CapsLock: [EKeycode.KC_CAPS, EKeycapType.Combo],
            ControlLeft: [EKeycode.KC_LCTL, EKeycapType.Spec],
            ControlRight: [EKeycode.KC_RCTL, EKeycapType.Spec],
            MetaLeft: [EKeycode.KC_LGUI, EKeycapType.Spec],
            MetaRight: [EKeycode.KC_RGUI, EKeycapType.Spec],
            OSLeft: [EKeycode.KC_LGUI, EKeycapType.Spec],
            OSRight: [EKeycode.KC_RGUI, EKeycapType.Spec],
            ShiftLeft: [EKeycode.KC_LSFT, EKeycapType.Combo],
            ShiftRight: [EKeycode.KC_RSFT, EKeycapType.Combo],
            ContextMenu: [EKeycode.KC_APP, EKeycapType.Spec],
            Enter: [EKeycode.KC_ENT, EKeycapType.Normal],
            Space: [EKeycode.KC_SPC, EKeycapType.Normal],
            Tab: [EKeycode.KC_TAB, EKeycapType.Normal],
            Delete: [EKeycode.KC_DEL, EKeycapType.Normal],
            End: [EKeycode.KC_END, EKeycapType.Spec],
            Help: [EKeycode.KC_HELP, EKeycapType.Spec],
            Home: [EKeycode.KC_HOME, EKeycapType.Spec],
            Insert: [EKeycode.KC_INS, EKeycapType.Spec],
            PageDown: [EKeycode.KC_PGDN, EKeycapType.Spec],
            PageUp: [EKeycode.KC_PGUP, EKeycapType.Spec],
            ArrowDown: [EKeycode.KC_DOWN, EKeycapType.Normal],
            ArrowLeft: [EKeycode.KC_LEFT, EKeycapType.Normal],
            ArrowRight: [EKeycode.KC_RGHT, EKeycapType.Normal],
            ArrowUp: [EKeycode.KC_UP, EKeycapType.Normal],
            Escape: [EKeycode.KC_ESC, EKeycapType.Spec],
            PrintScreen: [EKeycode.KC_PSCR, EKeycapType.Spec],
            ScrollLock: [EKeycode.KC_SLCK, EKeycapType.Spec],
            AudioVolumeUp: [EKeycode.KC_VOLU, EKeycapType.Spec],
            AudioVolumeDown: [EKeycode.KC_VOLD, EKeycapType.Spec],
            AudioVolumeMute: [EKeycode.KC_MUTE, EKeycapType.Spec],
            Pause: [EKeycode.KC_PAUS, EKeycapType.Spec],
            F1: [EKeycode.KC_F1, EKeycapType.Normal],
            F2: [EKeycode.KC_F2, EKeycapType.Normal],
            F3: [EKeycode.KC_F3, EKeycapType.Normal],
            F4: [EKeycode.KC_F4, EKeycapType.Normal],
            F5: [EKeycode.KC_F5, EKeycapType.Normal],
            F6: [EKeycode.KC_F6, EKeycapType.Normal],
            F7: [EKeycode.KC_F7, EKeycapType.Normal],
            F8: [EKeycode.KC_F8, EKeycapType.Normal],
            F9: [EKeycode.KC_F9, EKeycapType.Normal],
            F10: [EKeycode.KC_F10, EKeycapType.Normal],
            F11: [EKeycode.KC_F11, EKeycapType.Normal],
            F12: [EKeycode.KC_F12, EKeycapType.Normal],
            F13: [EKeycode.KC_F13, EKeycapType.Spec],
            F14: [EKeycode.KC_F14, EKeycapType.Spec],
            F15: [EKeycode.KC_F15, EKeycapType.Spec],
            F16: [EKeycode.KC_F16, EKeycapType.Spec],
            F17: [EKeycode.KC_F17, EKeycapType.Spec],
            F18: [EKeycode.KC_F18, EKeycapType.Spec],
            F19: [EKeycode.KC_F19, EKeycapType.Spec],
            F20: [EKeycode.KC_F20, EKeycapType.Spec],
            F21: [EKeycode.KC_F21, EKeycapType.Spec],
            F22: [EKeycode.KC_F22, EKeycapType.Spec],
            F23: [EKeycode.KC_F23, EKeycapType.Spec],
            F24: [EKeycode.KC_F24, EKeycapType.Spec],
            NumLock: [EKeycode.KC_NLCK, EKeycapType.Spec],
            Numpad0: [EKeycode.KC_P0,EKeycapType.Spec],
            Numpad1: [EKeycode.KC_P1,EKeycapType.Spec],
            Numpad2: [EKeycode.KC_P2,EKeycapType.Spec],
            Numpad3: [EKeycode.KC_P3,EKeycapType.Spec],
            Numpad4: [EKeycode.KC_P4,EKeycapType.Spec],
            Numpad5: [EKeycode.KC_P5,EKeycapType.Spec],
            Numpad6: [EKeycode.KC_P6,EKeycapType.Spec],
            Numpad7: [EKeycode.KC_P7,EKeycapType.Spec],
            Numpad8: [EKeycode.KC_P8,EKeycapType.Spec],
            Numpad9: [EKeycode.KC_P9,EKeycapType.Spec],
            NumpadAdd: [EKeycode.KC_PPLS, EKeycapType.Spec],
            NumpadComma: [EKeycode.KC_COMM, EKeycapType.Spec],
            NumpadDecimal: [EKeycode.KC_PDOT, EKeycapType.Spec],
            NumpadDivide: [EKeycode.KC_PSLS, EKeycapType.Spec],
            NumpadEnter: [EKeycode.KC_PENT, EKeycapType.Spec],
            NumpadEqual: [EKeycode.KC_PEQL, EKeycapType.Spec],
            NumpadMultiply: [EKeycode.KC_PAST, EKeycapType.Spec],
            NumpadSubtract: [EKeycode.KC_PMNS, EKeycapType.Spec],
        };

        if(!KeycodeEnumService.keycapTypeCacheExist) {
            KeycodeEnumService.keycapTypeCacheExist = true
            Object.keys(result).forEach( k => {
                const type = result[k][1] ;
                KeycodeEnumService.keycapTypeCache[type].push({eventKeyCode: k})
            })
        }
        return result
    }

    static getEventKeyType (eventKeyCode: any): any {
        if( !KeycodeEnumService.keycapTypeCacheExist) {
            KeycodeEnumService.keyeventCode2Keycode()
        }

        const r = Object
                    .keys(KeycodeEnumService.keycapTypeCache)
                    .filter(
                        k => !!KeycodeEnumService.keycapTypeCache[k].find( (j: any) => j.eventKeyCode === eventKeyCode)
                    ).map( k => Number(k))
        return r[0] ?? EKeycapType.Normal
     }
}
