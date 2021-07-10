import CancellationToken from "../../helpers/CancellationToken";
import { IAddressableRgbLight } from "../..//devices/Abstract/IVirtualLights";
import Effect from "./Effect";
import Rgb from "../Rgb";
import { delay } from "../../helpers/AsyncHelpers";

export class Scroll extends Effect {
    public affectsBrightness = false;
    public affectsColour = true;

    constructor() {
        super("Scroll");
    }

    protected async doWork(device: IAddressableRgbLight, cst: CancellationToken): Promise<void> {
        device.setState(true);

        const originalPixels = [...device.pixels];

        const pixels = new Array<Rgb>(device.pixelCount);
        let j = 0;
        while (!cst.isCancellationRequested) {
            if (cst.isCancellationRequested) {
                break;
            }

            for (let i = 0; i < device.pixelCount; i++) {
                if (cst.isCancellationRequested) {
                    break;
                }
                const pixel_index = Math.floor(i * 256 / device.pixelCount) + j;
                pixels[i] = this.wheel(pixel_index & 255);
            }
            device.setPixels(pixels);
            await delay(10);
            j = ++j % 255;

        }

        if (!cst.immediate) {
            await device.setPixelsSmooth(originalPixels);
        }
    }

    private wheel(pos: number): Rgb {
        const rgb = new Rgb(0, 0, 0);

        if (pos < 0 || pos > 255) {
            return rgb;
        }
        else if (pos < 85) {
            rgb.r = Math.floor(pos * 3);
            rgb.g = Math.floor(255 - pos * 3);
            rgb.b = 0;
        }
        else if (pos < 170) {
            pos -= 85;
            rgb.r = Math.floor(255 - pos * 3);
            rgb.g = 0;
            rgb.b = Math.floor(pos * 3);
        }
        else {
            pos -= 170;
            rgb.r = 0;
            rgb.g = Math.floor(pos * 3);
            rgb.b = Math.floor(255 - pos * 3);
        }

        return rgb;
    }
}