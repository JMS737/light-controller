import Rgb from "../Rgb";
import { v4 as uuid } from 'uuid';

export default class Palette {
    private _id: string;
    private _colors: Rgb[];

    public get id(): string {
        return this._id;
    }

    public get colors(): Rgb[]
    {
        return this._colors;
    }

    constructor(colors: Rgb[], id?: string) {
        this._id = id ?? uuid();
        this._colors = colors;
    }
}