import Palette from "../models/Effects/Palette";
import { SceneDto } from "../models/Effects/Scene";
import Rgb from "../models/Rgb";
import IConfiguration from "./IConfiguraiton";
import { close, promises as fs } from "fs";
import path from "path";

export default class ConfigurationManager implements IConfiguration {
    private readonly _configPath: string;
    private readonly _presetPath: string;
    private readonly _palettePath: string;
    private readonly _scenePath: string;

    constructor() {
        this._configPath = ".config";
        this._presetPath = path.join(this._configPath, "presets");
        this._palettePath = path.join(this._configPath, "palettes");
        this._scenePath = path.join(this._configPath, "scenes");
        this.init();
    }

    private async init() {
        try {
            await fs.mkdir(this._configPath);
        } catch (error) {
            // Do nothing
        }
        try {
            await fs.mkdir(this._presetPath);
        } catch (error) {
            // Do nothing
        }
        try {
            await fs.mkdir(this._palettePath);
        } catch (error) {
            // Do nothing
        }
        try {
            await fs.mkdir(this._scenePath);
        } catch (error) {
            // Do nothing
        }
    }

    //#region Presets

    public getPresets(deviceId: number): Promise<string[]> {
        const presetPath = path.join(this._presetPath, deviceId.toString());

        return this.getJsonFilenamesInDirectory(presetPath);
    }

    public async getPreset(deviceId: number, name: string): Promise<Rgb[]> {
        const presetPath = path.join(this._presetPath, deviceId.toString());

        const filename = path.join(presetPath, name + ".json");

        const data = await fs.readFile(filename);
        return JSON.parse(data.toString());
    }

    public async savePreset(deviceId: number, name: string, values: Rgb[]): Promise<void> {
        if (name == null || name == "") return;

        try {
            await fs.mkdir(path.join(this._presetPath, deviceId.toString()));
        } catch (error) {
            // Do nothing
        }

        const filename = path.join(this._presetPath, deviceId.toString(), name + ".json");

        await fs.writeFile(filename, JSON.stringify(values));
    }

    public async deletePreset(deviceId: number, name: string): Promise<void> {
        if (name == null || name == "") return;

        const filename = path.join(this._presetPath, deviceId.toString(), name + ".json");
        await fs.rm(filename);
    }

    //#endregion

    //#region Palettes

    public async getPalettes(): Promise<Palette[]> {
        const files = await fs.readdir(this._palettePath);
        const palettes: Palette[] = [];
        for (let i = 0; i < files.length; i++) {
            const palette = await this.getPaletteFromFile(files[i]);

            palettes.push(palette);
        }

        return palettes;
    }

    public async getPalette(name: string): Promise<Palette> {
        return this.getPaletteFromFile(name + ".json");
    }

    public async savePalette(palette: Palette): Promise<void> {
        const filename = path.join(this._palettePath, palette.id + ".json");
        await fs.writeFile(filename, JSON.stringify(palette.colors));
    }

    public async deletePalette(palette: Palette): Promise<void> {
        const filename = path.join(this._palettePath, palette.id + ".json");
        await fs.rm(filename);
    }

    private async getPaletteFromFile(filename: string): Promise<Palette> {
        const data = await fs.readFile(path.join(this._palettePath, filename));
        return new Palette(JSON.parse(data.toString()), filename.replace(".json", ""));
    }

    //#endregion

    //#region Scenes

    public async getScenes(): Promise<SceneDto[]> {
        const files = await fs.readdir(this._scenePath);
        const scenes: SceneDto[] = [];

        for (let i = 0; i < files.length; i++) {
            const scene = await this.getSceneFromFile(files[i]);
            scenes.push(scene);
        }

        return scenes;
    }

    public getScene(name: string): Promise<SceneDto> {
        return this.getSceneFromFile(name + ".json");
    }

    public async saveScene(scene: SceneDto): Promise<void> {
        const filename = path.join(this._scenePath, scene.name + ".json");

        await fs.writeFile(filename, JSON.stringify(scene));
    }

    public async deleteScene(scene: SceneDto): Promise<void> {
        const filename = path.join(this._scenePath, scene.name + ".json");
        await fs.rm(filename);
    }

    private async getSceneFromFile(filename: string): Promise<SceneDto> {
        const data = await fs.readFile(path.join(this._scenePath, filename));

        return JSON.parse(data.toString());
    }

    //#endregion

    private async getJsonFilenamesInDirectory(directory: string): Promise<string[]> {
        const files = await fs.readdir(directory);
        for (let i = 0; i < files.length; i++) {
            files[i] = files[i].replace(".json", "");
        }

        return files;
    }
}