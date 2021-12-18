import { Animations } from "../../models/Animations";
import Hsv from "../../models/Hsv";
import Rgb from "../../models/Rgb";
import VirtualDevice from "./VirtualDevice";

export interface ILight extends VirtualDevice {
    state: boolean;

    setState(state: boolean): void;
}

export interface IDimmableLight extends ILight {
    brightness: number; // Range 0-100

    setBrightness(brightness: number): void;
    setBrightnessSmooth(brightness: number): Promise<void>;
}

export interface IRgbLight extends IDimmableLight {
    hue: number; // Range 0-359
    saturation: number; // Range 0-100

    setColour(hue?: number, saturation?: number, value?: number): void;
    setColourSmooth(hue?: number, saturation?: number, value?: number): Promise<void>;
}

export interface IAddressableRgbLight extends IRgbLight {
    pixelCount: number;
    pixels: Rgb[];

    setPixels(pixels: Rgb[]): void;
    setPixelsSmooth(pixels: Rgb[]): Promise<void>;
    setColours(colours: Hsv[], interpolationType: string): void;
    setColoursSmooth(colours: Hsv[], interpolationType: string): Promise<void>;
    setAnimation(animation: Animations): void;
    getPresets(): Promise<string[]>;
    savePreset(name: string): Promise<void>;
    loadPreset(name: string): Promise<void>;
    deletePreset(name: string): Promise<void>;
}