import Motion, { MotionParameter } from "../models/Effects/Motion";
import Palette from "../models/Effects/Palette";
import { Flow, Highlight } from "../models/Effects/PredefinedMotions";
import {palettes as predefinedPalettes} from "../models/Effects/PredefinedPalettes";
import Scene from "../models/Effects/Scene";
import Rgb from "../models/Rgb";

export default class SceneManager {
    private _scenes: Scene[] = [];
    private _motions: Motion[] = [];
    private _palettes: Palette[] = [];

    public async load(): Promise<void>
    {
        await this.getPalettes();
        await this.getMotions();
        await this.getScenes();
    }

    private getPalettes(): Promise<void> {
        this._palettes = predefinedPalettes;
        return Promise.resolve();
    }

    private getMotions(): Promise<void> {
        this._motions.push(new Motion("Flow", [
            new MotionParameter("Speed"),
            new MotionParameter("Reversed"),
        ], Flow));
        this._motions.push(new Motion("Hightlight", [
            new MotionParameter("Speed"),
            new MotionParameter("First Colour Frequency")
        ], Highlight));
        
        return Promise.resolve();
    }

    private getScenes(): Promise<void> {
        this._scenes.push(new Scene(this._palettes.filter(p => p.id)[0], this._motions.filter(p => p.name == "Flow")[0]));
        return Promise.resolve();
    }
}