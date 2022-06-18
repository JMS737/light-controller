import { DeviceType } from "../../helpers/DeviceType";
import { IRgbLight } from "../Abstract/IVirtualLights";
import DeviceGroup from "../Abstract/DeviceGroup";

export default class RgbLightGroup extends DeviceGroup<IRgbLight> implements IRgbLight {
    type: DeviceType = DeviceType.RgbLightGroup;

    get state(): boolean {
        return this.devices[0].state;
    }

    get brightness(): number {
        return this.devices[0].brightness;
    }

    get hue(): number {
        return this.devices[0].hue;
    }
    
    get saturation(): number {
        return this.devices[0].saturation;
    }

    constructor(id: number, name: string, lights: IRgbLight[]) {
        super(id, name, lights);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public initialise(): void {
        
    }

    public async identify(): Promise<void> {
        await Promise.all(this.devices.map(async p => await p.identify()));
    }

    setState(state: boolean): void {
        this.devices.map(p => p.setState(state));
    }
    
    
    setBrightness(brightness: number): void {
        this.devices.map(p => p.setBrightness(brightness));
    }
    
    async setBrightnessSmooth(brightness: number): Promise<void> {
        Promise.all(this.devices.map(p => p.setBrightnessSmooth(brightness)));
    }


    setColour(hue?: number, saturation?: number, value?: number): void {
        this.devices.map(p => p.setColour(hue, saturation, value));
    }

    async setColourSmooth(hue?: number, saturation?: number, value?: number): Promise<void> {
        await Promise.all(this.devices.map(p => p.setColourSmooth(hue, saturation, value)));
    }
}