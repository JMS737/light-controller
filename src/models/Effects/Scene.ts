import Motion from "./Motion";
import Palette from "./Palette";

export default class Scene {
    private _palette: Palette;
    private _motion: Motion;

    public get palette(): Palette {
        return this._palette;
    }

    public get motion(): Motion {
        return this._motion;
    }

    constructor(palette: Palette, motion: Motion) {
        this._palette = palette;
        this._motion = motion;
    }
}