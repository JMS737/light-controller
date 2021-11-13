import { pathToFileURL } from "url";
import AddressableRgbStrip from "../../devices/Virtual/AddressableRgbStrip";
import { delay } from "../../helpers/AsyncHelpers";
import CancellationToken from "../../helpers/CancellationToken";
import { InterpolateRgbRaw } from "../../helpers/GradientHelper";
import Rgb from "../Rgb";
import { MotionParameter } from "./Motion";
import Palette from "./Palette";

export async function Flow(light: AddressableRgbStrip, palette: Palette, args: MotionParameter[], cst: CancellationToken): Promise<void> {
    const speed = args.filter(p => p._name == "Speed")[0]._value as number;
    const reversed = args.filter(p => p._name == "Reversed")[0]?._value as boolean ?? false;
    const DELAY = 20; // This is fixed at 20 milliseconds as going below 10 causing load issues and new requests don't get processed immediately.
    const STEPS = 1000 / DELAY;
    const COLORS_TO_DISPLAY = Math.max(2, Math.min(palette.colors.length, args.filter(p => p._name == "Colours to Display")[0]?._value as number ?? 2));

    await light.setState(true);

    const originalPixels = [...light.pixels];

    const pixels = new Array<Rgb>(light.pixelCount);

    let tOffset = 0;

    while (!cst.isCancellationRequested) {
        if (cst.isCancellationRequested) {
            break;
        }

        let t: number;
        for (let i = 0; i < light.pixelCount; i++) {
            if (cst.isCancellationRequested) {
                break;
            }

            t = (i / (light.pixelCount * Math.ceil(palette.colors.length / COLORS_TO_DISPLAY + 1)) + tOffset) % 1;
            if (reversed) {
                t = 1 - t;
            }

            pixels[i] = InterpolateRgbRaw(palette.colors, t);
        }
        light.setPixels(pixels);
        await delay(DELAY);
        tOffset += ((1 / STEPS) / speed) % 1;

    }

    if (!cst.immediate) {
        await light.setPixelsSmooth(originalPixels);
    }
}

class HighlightPoint {
    private _pixel: number;
    private _radius: number;
    private _color: Rgb;

    public get pixel(): number { return this._pixel; }
    public get radius(): number { return this._radius; }
    public get color(): Rgb { return this._color; }

    constructor(pixel: number, radius: number, color: Rgb) {
        this._pixel = pixel;
        this._radius = radius;
        this._color = color;
    }

    public calculate(pixelNumber: number): Rgb | undefined {
        const factor = 1 - Math.min(1, Math.pow((1 / this._radius) * Math.abs(this.pixel - pixelNumber), 3));
        if (factor == 0) {
            return undefined;
        }

        return new Rgb(this._color.r * factor, this._color.g * factor, this._color.b * factor);
    }
}

export async function Highlight(light: AddressableRgbStrip, palette: Palette, args: MotionParameter[], cst: CancellationToken): Promise<void> {
    const speed = args.filter(p => p._name == "Speed")[0]._value as number;
    const firstFrequency = args.filter(p => p._name == "First Colour Frequency")[0]._value as number;

    // const highlights: HighlightPoint[] = [];

    const DELAY = 20; // This is fixed at 20 milliseconds as going below 10 causing load issues and new requests don't get processed immediately.
    const DELAY_SECONDS = DELAY / 1000;
    const STEPS = 1000 / DELAY;

    await light.setState(true);

    const originalPixels = [...light.pixels];

    const pixels = new Array<Rgb>(light.pixelCount);
    pixels.fill(new Rgb(0, 0, 0));

    while (!cst.isCancellationRequested) {
        if (cst.isCancellationRequested) {
            break;
        }

        let highlight: HighlightPoint | undefined;
        if (Math.random() < DELAY_SECONDS / speed && Math.random() < firstFrequency) {
            const color = palette.colors[1 + Math.floor(Math.random() * palette.colors.length - 1)];
            highlight = new HighlightPoint(Math.round(Math.random() * pixels.length), 8, color);
        }

        for (let i = 0; i < light.pixelCount; i++) {
            if (cst.isCancellationRequested) {
                break;
            }

            pixels[i].r = Math.max(0, pixels[i].r -= 255 / (STEPS * (speed * 5)));
            pixels[i].g = Math.max(0, pixels[i].g -= 255 / (STEPS * (speed * 5)));
            pixels[i].b = Math.max(0, pixels[i].b -= 255 / (STEPS * (speed * 5)));

            if (highlight) {
                const color = highlight.calculate(i);
                if (color) {
                    pixels[i] = color;
                }
            }
        }

        light.setPixels(pixels);
        await delay(DELAY);
    }

    if (!cst.immediate) {
        await light.setPixelsSmooth(originalPixels);
    }
}