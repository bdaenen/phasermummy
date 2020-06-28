import MultiKey from "../plugins/multikey";

export default function controllable(scene, gameObject, keys) {
    const controls = {};

    Object.entries(keys).forEach(([name, keyCodes]) => {
        controls[name] = new MultiKey(scene, keyCodes.map((code) => {
            return Phaser.Input.Keyboard.KeyCodes[code]
        }))
    });

    gameObject.isControllable = true;
    gameObject.controls = controls;

    return gameObject
}
