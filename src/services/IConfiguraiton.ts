import Palette from "../models/Effects/Palette";
import Scene from "../models/Effects/Scene";
import Rgb from "../models/Rgb";

export default interface IConfiguration {
    getPresets(deviceId: number): Promise<string[]>;
    getPreset(deviceId: number, name: string): Promise<Rgb[]>;
    savePreset(deviceId: number, name: string, values: Rgb[]): Promise<void>;
    deletePreset(deviceId: number, name: string): Promise<void>;

    getPalettes(): Promise<Palette[]>;
    getPalette(name: string): Promise<Palette>;
    savePalette(palette: Palette): Promise<void>;
    deletePalette(palette: Palette): Promise<void>;
    
    getScenes(): Promise<Scene[]>;
    getScene(name: string): Promise<Scene>;
    saveScene(scene: Scene): Promise<void>;
    deleteScene(scene: Scene): Promise<void>;
}