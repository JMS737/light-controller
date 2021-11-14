import Palette from "../models/Effects/Palette";
import Scene from "../models/Effects/Scene";
import Rgb from "../models/Rgb";
import IConfiguration from "./IConfiguraiton";
import { promises as fs } from "fs";
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
        await fs.mkdir(this._configPath);
        await fs.mkdir(this._presetPath);
        await fs.mkdir(this._palettePath);
        await fs.mkdir(this._scenePath);
    }

    public async getPresets(deviceId: number): Promise<string[]> {
        const presetPath = path.join(this._presetPath, deviceId.toString());

        const files = await fs.readdir(presetPath);
        for (let i = 0; i < files.length; i++) {
            files[i] = files[i].replace(".json", "");
        }

        return files;
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

    getPalettes(): Promise<Palette[]> {
        throw new Error("Method not implemented.");
    }
    getPalette(name: string): Promise<Palette> {
        throw new Error("Method not implemented.");
    }
    savePalette(palette: Palette): Promise<void> {
        throw new Error("Method not implemented.");
    }
    deletePalette(palette: Palette): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getScenes(): Promise<Scene[]> {
        throw new Error("Method not implemented.");
    }
    getScene(name: string): Promise<Scene> {
        throw new Error("Method not implemented.");
    }
    saveScene(scene: Scene): Promise<void> {
        throw new Error("Method not implemented.");
    }
    deleteScene(scene: Scene): Promise<void> {
        throw new Error("Method not implemented.");
    }

}