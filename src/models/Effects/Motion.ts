import AddressableRgbStrip from "src/devices/Virtual/AddressableRgbStrip";
import CancellationToken from "src/helpers/CancellationToken";
import Palette from "./Palette";

export class MotionParameter {
    public _name: string;
    public _value: any;

    constructor(name: string, value?: any)
    {
        this._name = name;
        this._value = value;
    }
}

export interface MotionAction {
    (light: AddressableRgbStrip, palette: Palette, args: MotionParameter[], cst: CancellationToken): Promise<void>;
}

export default class Motion {
    private _name: string;
    private _parameters: MotionParameter[];
    private _action: MotionAction;

    public get name(): string {
        return this._name;
    }

    public get parameters(): MotionParameter[] {
        return this._parameters;
    }

    public get action(): MotionAction {
        return this._action;
    }

    constructor(name: string, parameters: MotionParameter[], action: MotionAction) {
        this._name = name;
        this._parameters = parameters;
        this._action = action;
    }
}