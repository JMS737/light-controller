import { InterpolateHsv, InterpolateHsvLong, InterpolateHsvShort, InterpolateRgb, InterpolateRgbSingle } from "../../helpers/GradientHelper";
import Effect, { ExternalEffect } from "../../models/Effects/Effect";
import Hsv from "../../models/Hsv";
import Rgb from "../../models/Rgb";
import { IAddressableRgbLight as IAddressableRgbLight } from "../Abstract/IVirtualLights";
import WS2812B from "../Physical/WS2812B";
import RgbLight from "./RgbLight";
import colorsys from 'colorsys';
import { Animations } from "../../models/Animations";
import fs from "fs";
import path from "path";
import CancellationToken from "../../helpers/CancellationToken";
import { delay } from "../../helpers/AsyncHelpers";
import { constrain } from "../../helpers/MathHelper";
import { DeviceType } from "../../helpers/DeviceType";
import { Flow, Scroll } from "../../models/Effects/AddressableLightEffects";

export default class AddressableRgbStrip extends RgbLight implements IAddressableRgbLight {

    physical: WS2812B;

    pixelCount = 0;
    pixels: Rgb[] = [];

    effects: string[] = [];

    presetPath!: string;

    constructor(id: number, physical: WS2812B) {
        super(id, physical);

        this.type = DeviceType.WS2812B;
        this.physical = physical;

        this.initializePresets();
    }

    initializePresets(): void {
        this.presetPath = path.join("presets", this.id.toString());
        fs.mkdir("presets", err => {
            if (err) console.log(err);
        });
        fs.mkdir(this.presetPath, err => {
            if (err) console.log(err);
        });
    }

    setColour(hue?: number, saturation?: number, value?: number): void {
        const hsv = this.validateHsv(hue, saturation, value);
        this.hue = hsv.h;
        this.saturation = hsv.s;
        this.setColours([hsv]);
    }

    async setColourSmooth(hue?: number, saturation?: number, value?: number): Promise<void> {
        const hsv = this.validateHsv(hue, saturation, value);
        
        this.hue = hsv.h;
        this.saturation = hsv.s;

        if (value != undefined)
            this.setBrightnessSmooth(hsv.v);

        return this.setColoursSmooth([hsv]);
    }

    setPixels(pixels: Rgb[]): void {
        if (!this.state) this.setState(true);

        if (this.pixels.length != this.pixelCount) {
            this.pixels = new Array<Rgb>(this.pixelCount);
            for (let i = 0; i < this.pixels.length; i++) {
                this.pixels[i] = new Rgb(0, 0, 0);
            }
        }

        for (let i = 0; i < Math.min(this.pixelCount, pixels.length); i++) {
            this.pixels[i] = pixels[i];
        }

        this.updateChannels();
    }

    async setPixelsSmooth(pixels: Rgb[]): Promise<void> {
        if (!this.state) this.setState(true);
        
        if (this._currentEffect?.affectsColour && !this._currentEffect?.isCancelled) {
            await this._currentEffect.cancel(true);
        }

        if (this.currentColourTask && this.currentColourToken) {
            this.currentColourToken?.cancel(true);
            await this.currentColourTask;
        }

        this.currentColourToken = new CancellationToken();
        this.currentColourTask = this.setPixelsAsync(pixels, this.currentColourToken);
        await this.currentColourTask;
    }

    async setPixelsAsync(targetPixels: Rgb[], token: CancellationToken): Promise<void> {
        const currentPixels = [...this.pixels];

        for (let t = 1; t <= this.STEPS; t++) {
            if (token.isCancellationRequested) {
                break;
            }

            for (let i = 0; i < this.pixels.length; i++) {
                this.pixels[i] = InterpolateRgbSingle(currentPixels[i], targetPixels[i], t / this.STEPS);
            }

            this.updateChannels();
            await delay(this.FADE_TIME / this.STEPS);
        }
    }

    initialise(): void {
        super.initialise();

        this.pixelCount = this.physical.pixelCount;
        this.pixels = new Array<Rgb>(this.pixelCount);
        for (let i = 0; i < this.pixels.length; i++) {
            this.pixels[i] = new Rgb(255, 68, 0);
        }

        this.effects = this.physical.effects;
    }

    getProperties(): unknown {
        const properties = super.getProperties();
        properties.pixelCount = this.pixelCount;
        properties.pixels = this.pixels;

        return properties;
    }

    getEffects(): Effect[] {
        const effects = super.getEffects();
        effects.push(new Scroll());
        effects.push(new Flow());

        this.effects.map(e => effects.push(new ExternalEffect(e)));

        return effects;
    }

    setEffect(effectName: string): boolean {
        this.physical.setEffect("no effect");
        if (super.setEffect(effectName)) {
            return true;
        }

        this.physical.setEffect(effectName);
        return true;
    }

    setColours(colours: Hsv[], interpolationType = "rgb"): void {
        if (colours.length == 0) return;

        this.pixels = new Array<Rgb>(this.pixelCount);

        for (let i = 0; i < this.pixels.length; i++) {
            const t = i / (this.pixels.length);
            let hsv: Hsv;
            if (colours.length > 1) {
                hsv = this.interpolate(colours, t, interpolationType);
            }
            else {
                hsv = colours[0];
            }
            const rgb = colorsys.hsv2Rgb(hsv.h, hsv.s, hsv.v);

            this.pixels[i] = rgb;
        }

        this.updateChannels();
    }

    setColoursSmooth(colours: Hsv[], interpolationType = "rgb"): Promise<void> {
        if (colours.length == 0) return Promise.resolve();

        const pixelsTarget = new Array<Rgb>(this.pixelCount);

        for (let i = 0; i < pixelsTarget.length; i++) {
            const t = i / (pixelsTarget.length);
            let hsv: Hsv;
            if (colours.length > 1) {
                hsv = this.interpolate(colours, t, interpolationType);
            }
            else {
                hsv = colours[0];
            }
            const rgb = colorsys.hsv2Rgb(hsv.h, hsv.s, hsv.v);

            pixelsTarget[i] = rgb;
        }

        return this.setPixelsSmooth(pixelsTarget);
    }

    interpolate(colours: Hsv[], t: number, interpolationType: string): Hsv {
        switch (interpolationType) {
            case "rgb":
                return InterpolateRgb(colours, t);
            case "hsv":
                return InterpolateHsv(colours, t);
            case "hsv-short":
                return InterpolateHsvShort(colours, t);
            case "hsv-long":
                return InterpolateHsvLong(colours, t);
            default:
                return InterpolateRgb(colours, t);
        }
    }

    setAnimation(animation: Animations): void {
        throw new Error("Method not implemented.");
    }

    updateChannels(): void {
        const pixels = new Array<Rgb>(this.pixelCount);
        for (let i = 0; i < this.pixels.length; i++) {
            pixels[i] = new Rgb(
                constrain(Math.round(this.pixels[i].r * (this.brightness / 100) * this.stateTransition), 0, 255),
                constrain(Math.round(this.pixels[i].g * (this.brightness / 100) * this.stateTransition), 0, 255),
                constrain(Math.round(this.pixels[i].b * (this.brightness / 100) * this.stateTransition), 0, 255));
        }

        this.physical.setPixels(pixels);
    }

    getPresets(): string[] {
        const files = fs.readdirSync(this.presetPath);
        for (let i = 0; i < files.length; i++) {
            files[i] = files[i].replace(".json", "");
        }

        return files;
    }

    savePreset(name: string): void {
        if (name == null || name == "") return;

        const filename = path.join(this.presetPath, name + ".json");
        fs.writeFile(filename, JSON.stringify(this.pixels), err => console.log(err));
    }

    loadPreset(name: string): void {
        if (name == null || name == "") return;

        const filename = path.join(this.presetPath, name + ".json");
        fs.readFile(filename, (err, data) => {
            if (err) {
                console.log(err);
            }
            else {
                this.setPixelsSmooth(JSON.parse(data.toString()));

            }
        });
    }

    deletePreset(name: string): void {
        if (name == null || name == "") return;

        const filename = path.join(this.presetPath, name + ".json");
        fs.rm(filename, err => console.log(err));
    }
}