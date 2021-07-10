import { IDimmableLight, IRgbLight } from "../../devices/Abstract/IVirtualLights";
import { delay } from "../../helpers/AsyncHelpers";
import CancellationToken from "../../helpers/CancellationToken";
import Effect from "./Effect";

export class Blink extends Effect {
    public affectsBrightness = true;
    public affectsColour = false;

    constructor() {
        super("Blink");
    }

    protected async doWork(device: IDimmableLight, cst: CancellationToken): Promise<void> {
        device.setState(true);
        
        const originalBrightness = device.brightness;
        
        while (!cst.isCancellationRequested) {
            device.setBrightness(100);

            await delay(1000);
            if (cst.isCancellationRequested) break;
            
            device.setBrightness(0);
            await delay(1000);
        }
        
        if (!cst?.immediate)
            await device.setBrightnessSmooth(originalBrightness);
    }

}

export class Pulse extends Effect {
    public affectsBrightness = true;
    public affectsColour = false;

    private PULSE_DELAY = (2.0 / 100.0) * 1000;

    constructor() {
        super("Pulse");
    }

    protected async doWork(device: IDimmableLight, cst: CancellationToken): Promise<void> {
        device.setState(true);

        const originalBrightness = device.brightness;
        let direction = 1;

        while (!cst.isCancellationRequested) {
            if (direction > 0 && device.brightness >= 100) {
                direction = -1;
            } else if (direction < 0 && device.brightness <= 0) {
                direction = 1;
            }

            device.setBrightness(device.brightness + direction);
            await delay(this.PULSE_DELAY);
        }
        
        if (!cst?.immediate)
            await device.setBrightnessSmooth(originalBrightness);
        // else
        //     device.brightness = originalBrightness;
    }
}

export class Rainbow extends Effect {
    public affectsBrightness = false;
    public affectsColour = true;

    private HUE_DELAY = (10.0 / 360.0) * 1000;

    constructor() {
        super("Rainbow");
    }

    protected async doWork(device: IRgbLight, cst: CancellationToken): Promise<void> {
        device.setState(true);

        const originalHue = device.hue;
        const originalSaturation = device.saturation;

        while(!cst.isCancellationRequested && device.saturation < 100) {
            device.setColour(undefined, device.saturation + 1);
            await delay(10);
        }

        while (!cst.isCancellationRequested) {
            if (device.hue >= 359) {
                device.setColour(0, 100);
            } else {
                device.setColour(device.hue + 1, 100);
            }

            await delay(this.HUE_DELAY);
        }

        if (!cst?.immediate)
            await device.setColourSmooth(originalHue, originalSaturation);
        // else {
        //     device.hue = originalHue;
        //     device.saturation = originalSaturation;
    }
}