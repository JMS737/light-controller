import Rgb from "../models/Rgb";
import Motion, { MotionParameter } from "../models/Effects/Motion";
import Palette from "../models/Effects/Palette";
import { Flow, Highlight } from "../models/Effects/PredefinedMotions";
import Scene, { SceneDto } from "../models/Effects/Scene";
import IConfiguration from "./IConfiguraiton";

export default class SceneManager {
    private _scenes: Scene[] = [];
    private _motions: Motion[] = [];
    private _palettes: Palette[] = [];

    private _initializing: Promise<void>;
    public get initializing(): Promise<void> {
        return this._initializing;
    }

    private readonly _config: IConfiguration;

    public get scenes(): Scene[] {
        return this._scenes;
    }

    public get palettes(): Palette[] {
        return this._palettes;
    }

    public get motions(): Motion[] {
        return this._motions;
    }

    constructor(config: IConfiguration) {
        this._config = config;
        this._initializing = this.init();
    }

    private async init(): Promise<void> {
        await this.load();
    }

    public async seed(): Promise<void> {
        await this.addPalette(new Palette([
            new Rgb(0,0,0),
            new Rgb(255,0,0),
            new Rgb(0,255,0),
            new Rgb(0,0,255)
        ], "default_0"));

        await this.addPalette(new Palette([
            new Rgb(225, 0, 0),
            new Rgb(255, 128, 0),
            new Rgb(128, 255, 0),
            new Rgb(0, 255, 0),
            new Rgb(0, 255, 128),
            new Rgb(0, 128, 255),
            new Rgb(0, 0, 255),
            new Rgb(128,0, 255),
            new Rgb(255, 0, 128)
        ], "default_rainbow"));

        await this.addScene(new Scene(
            "Rainbow Flow",
            this._palettes.filter(p => p.id == "default_rainbow")[0],
            this._motions.filter(p => p.name == "Flow")[0],
            [new MotionParameter("Speed", 10)]));
    }

    public async addPalette(palette: Palette): Promise<void> {
        this._palettes.push(palette);
        this._config.savePalette(palette);
    }

    public async addScene(scene: Scene): Promise<void> {
        this.scenes.push(scene);
        this._config.saveScene(new SceneDto(scene.name, scene.palette.id, scene.motion.name, scene.parameters));
    }

    public async load(): Promise<void>
    {
        await this.loadPalettes();
        await this.loadMotions();
        await this.loadScenes();
    }

    private async loadPalettes(): Promise<void> {
        const palettes = await this._config.getPalettes();

        palettes.forEach(p => this._palettes.push(p));
    }

    private loadMotions(): Promise<void> {
        this._motions.push(new Motion("Flow", [
            new MotionParameter("Speed"),
            new MotionParameter("Reversed"),
        ], Flow));
        this._motions.push(new Motion("Highlight", [
            new MotionParameter("Speed"),
            new MotionParameter("First Colour Frequency")
        ], Highlight));
        
        return Promise.resolve();
    }

    private async loadScenes(): Promise<void> {
        const sceneDtos = await this._config.getScenes();
        sceneDtos.forEach(s => {
            this._scenes.push(new Scene(
                s.name,
                this._palettes.filter(p => p.id == s.palette)[0],
                this._motions.filter(p => p.name == s.motion)[0],
                s.parameters
            ));
        });
    }
}