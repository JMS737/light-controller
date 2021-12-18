import AddressableRgbStrip from "src/devices/Virtual/AddressableRgbStrip";
import CancellationToken from "../../helpers/CancellationToken";
import Motion, { MotionParameter } from "./Motion";
import Palette from "./Palette";

export default class Scene {
    private _name: string;
    private _palette: Palette;
    private _motion: Motion;
    private _motionParameters: MotionParameter[];

    public get name(): string {
        return this._name;
    }

    public get palette(): Palette {
        return this._palette;
    }

    public get motion(): Motion {
        return this._motion;
    }

    public get parameters(): MotionParameter[] {
        return this._motionParameters;
    }

    constructor(name: string, palette: Palette, motion: Motion, parameters?: MotionParameter[]) {
        this._name = name;
        this._palette = palette;
        this._motion = motion;
        this._motionParameters = parameters ?? [];
    }

    public run(light: AddressableRgbStrip, cst: CancellationToken): Promise<void> {
        return this._motion.action(light, this._palette, this._motionParameters, cst);
    }
}

export class SceneDto {
    public name: string;
    public palette: string;
    public motion: string;
    public parameters: MotionParameter[];

    constructor(name: string, palette: string, motion: string, parameters?: MotionParameter[])
    {
        this.name = name;
        this.palette = palette;
        this.motion = motion;
        this.parameters = parameters ?? [];
    }
}