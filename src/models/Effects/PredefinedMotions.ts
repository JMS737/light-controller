import AddressableRgbStrip from "../../devices/Virtual/AddressableRgbStrip";
import { delay } from "../../helpers/AsyncHelpers";
import CancellationToken from "../../helpers/CancellationToken";
import { InterpolateRgbRaw } from "../../helpers/GradientHelper";
import Rgb from "../Rgb";
import { MotionParameter } from "./Motion";
import Palette from "./Palette";

export async function Flow(light: AddressableRgbStrip, palette: Palette, args: MotionParameter[], cst: CancellationToken): Promise<void> {
    const speed = args.filter(p => p._name == "Speed")[0]._value as number;
    const reversed = args.filter(p => p._name == "Reversed")[0]._value as boolean;
    const STEPS = 50;

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
            
            t = (i / light.pixelCount + tOffset) % 1;
            pixels[i] = InterpolateRgbRaw(palette.colors, t);
        }
        light.setPixels(pixels);
        await delay(1 / STEPS);
        tOffset += (speed / STEPS) % 1;

    }

    if (!cst.immediate) {
        await light.setPixelsSmooth(originalPixels);
    }
}

export async function Hightlight(light: AddressableRgbStrip, palette: Palette, args: MotionParameter[], cst: CancellationToken): Promise<void> {
    // Do stuff
}