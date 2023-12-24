var UNITY_MAPPING_KEYBOARD = {};
var UNITY_MAPPING_MOUSE = {};

kc = (key, unitykey) => UNITY_MAPPING_KEYBOARD[key] = unitykey;
mc = (button, unitykey) => UNITY_MAPPING_MOUSE[button] = unitykey;

// comments provide the Unity KeyCode name

kc("Digit0", 48); // Alpha0
kc("Digit1", 49); // Alpha1
kc("Digit2", 50); // Alpha2
kc("Digit3", 51); // Alpha3
kc("Digit4", 52); // Alpha4
kc("Digit5", 53); // Alpha5
kc("Digit6", 54); // Alpha6
kc("Digit7", 55); // Alpha7
kc("Digit8", 56); // Alpha8
kc("Digit9", 57); // Alpha9
kc("Minus", 45); // Minus
kc("Equal", 61); // Equals

kc("KeyA", 97); // A
kc("KeyB", 98); // B
kc("KeyC", 99); // C
kc("KeyD", 100); // D
kc("KeyE", 101); // E
kc("KeyF", 102); // F
kc("KeyG", 103); // G
kc("KeyH", 104); // H
kc("KeyI", 105); // I
kc("KeyJ", 106); // J
kc("KeyK", 107); // K
kc("KeyL", 108); // L
kc("KeyM", 109); // M
kc("KeyN", 110); // N
kc("KeyO", 111); // O
kc("KeyP", 112); // P
kc("KeyQ", 113); // Q
kc("KeyR", 114); // R
kc("KeyS", 115); // S
kc("KeyT", 116); // T
kc("KeyU", 117); // U
kc("KeyV", 118); // V
kc("KeyW", 119); // W
kc("KeyX", 120); // X
kc("KeyY", 121); // Y
kc("KeyZ", 122); // Z

kc("Escape", 27); // Escape
kc("Backquote", 96); // BackQuote
kc("Backspace", 57); // BackSpace
kc("Tab", 9); // Tab
kc("BracketLeft", 91); // LeftBracket
kc("BracketRight", 93); // RightBracket
kc("Backslash", 92); // Backslash
kc("CapsLock", 301); // CapsLock
kc("Semicolon", 59); // Semicolon
kc("Quote", 39); // Tab
kc("Enter", 13); // Return
kc("ShiftLeft", 304); // LeftShift
kc("ShiftRight", 303); // RightShift
kc("Comma", 44); // Comma
kc("Period", 46); // Period
kc("Slash", 47); // Slash
kc("ControlLeft", 306); // LeftControl
kc("ControlRight", 305); // RightControl
kc("AltLeft", 308); // LeftAlt
kc("AltRight", 307); // RightAlt
kc("MetaLeft", 310); // LeftMeta
kc("MetaRight", 309); // RightMeta
kc("Space", 32); // Space

kc("ContextMenu", 319); // Menu
kc("ScrollLock", 302); // ScrollLock
kc("PrintScreen", 316); // Print
kc("IntlBackslash", 92); // Backslash

kc("F1", 282); // F1
kc("F2", 283); // F2
kc("F3", 284); // F3
kc("F4", 285); // F4
kc("F5", 286); // F5
kc("F6", 287); // F6
kc("F7", 288); // F7
kc("F8", 289); // F8
kc("F9", 290); // F9
kc("F10", 291); // F10
kc("F11", 292); // F11
kc("F12", 293); // F12
kc("F13", 294); // F13
kc("F14", 295); // F14
kc("F15", 296); // F15

kc("Insert", 277); // Insert
kc("Delete", 127); // Delete
kc("Home", 278); // Home
kc("End", 279); // End
kc("PageUp", 280); // PageUp
kc("PageDown", 281); // PageDown

kc("NumLock", 300); // Numlock
kc("NumpadDivide", 267); // KeypadDivide
kc("NumpadMultiply", 268); // KeypadMultiply
kc("NumpadSubtract", 269); // KeypadMinus
kc("NumpadAdd", 270); // KeypadPlus
kc("NumpadDecimal", 266); // KeypadPeriod
kc("NumpadEnter", 271); // KeypadEnter
kc("NumpadEquals", 272); // KeypadEquals
// numlock off
kc("Numpad0", 256); // Keypad0
kc("Numpad1", 257); // Keypad1
kc("Numpad2", 258); // Keypad2
kc("Numpad3", 259); // Keypad3
kc("Numpad4", 260); // Keypad4
kc("Numpad5", 261); // Keypad5
kc("Numpad6", 262); // Keypad6
kc("Numpad7", 263); // Keypad7
kc("Numpad8", 264); // Keypad8
kc("Numpad9", 265); // Keypad9
// numlock on (no difference to Unity)
kc("NumpadInsert", 256); // Keypad0
kc("NumpadEnd", 257); // Keypad1
kc("NumpadArrowDown", 258); // Keypad2
kc("NumpadPageDown", 259); // Keypad3
kc("NumpadArrowLeft", 260); // Keypad4
kc("NumpadClear", 261); // Keypad5
kc("NumpadArrowRight", 262); // Keypad6
kc("NumpadHome", 263); // Keypad7
kc("NumpadArrowUp", 264); // Keypad8
kc("NumpadPageUp", 265); // Keypad9

// TODO: check if numlock matters!!

mc(0, 323); // Mouse0   (left/primary)
mc(2, 324); // Mouse1   (right/secondary)
mc(1, 325); // Mouse2   (middle)
mc(3, 326); // Mouse3   ()
mc(4, 327); // Mouse4   ()

function keyToUnity(e) {
    let key = e.code;
    console.log('keyToUnity: e.code:', key);

    if (key.indexOf("Numpad") >= 0 && /^[0-9]$/g.test(key.slice(-1))) {
        // Numpad0 through Numpad9 are special when the numlock is on.
        // Example:
        //      Regular arrow left key:  e.key='ArrowLeft'  e.code='ArrowLeft'
        //      Numpad4  no numlock:     e.key='4'          e.code='Numpad4'
        //      Numpad4 and numlock:     e.key='ArrowLeft'  e.code='Numpad4'
        // so the following code:
        //      if no numlock,  ex. Numpad4 -> 'Numpad' + '4' -> Numpad4
        //      if yes numlock, ex. Numpad4 -> 'Numpad' + 'ArrowLeft' -> NumpadArrowLeft
        key = key.slice(0, -1) + e.key;
    }
    console.log('keyToUnity: mapped:', UNITY_MAPPING_KEYBOARD[key]);
    if (UNITY_MAPPING_KEYBOARD.hasOwnProperty(key))
        return UNITY_MAPPING_KEYBOARD[key];
    else
        return null;
}

function mouseToUnity(e) {
    let button = e.button;
    // Note: Browser Back (3) and Browser Forward (4) may not be captured in all browsers
    console.log('mouseToUnity: e.button:', button);
    console.log('mouseToUnity: mapped:', UNITY_MAPPING_MOUSE[button]);
    if (UNITY_MAPPING_MOUSE.hasOwnProperty(button))
        return UNITY_MAPPING_MOUSE[button];
    else
        return null;
}