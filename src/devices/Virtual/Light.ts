import { DeviceType } from "../../helpers/DeviceType";
import VirtualDevice, { DeviceState } from "../Abstract/VirtualDevice";
import { ILight } from "../Abstract/IVirtualLights";
import { IPhysicalDevice } from "../Abstract/IPhysicalDevice";
import { delay } from "../../helpers/AsyncHelpers";

export class LightState extends DeviceState {
    public on: boolean;

    constructor(on: boolean) {
        super();
        this.on = on;
    }
}

export default class Light extends VirtualDevice implements ILight {
    type: DeviceType = DeviceType.BasicLight;
    state = false;

    physical: IPhysicalDevice;

    constructor(id: number, name: string, physical: IPhysicalDevice) {
        super(id, name);
        this.physical = physical;
    }

    public initialise(): void {
        this.updateChannels();
    }

    public async identify(): Promise<void> {
        const originalState = this.state;

        this.setState(true);
        await delay(1000);
        this.setState(false);
        await delay(1000);
        this.setState(true);
        await delay(1000);
        this.setState(false);
        await delay(1000);
        this.setState(true);
        await delay(1000);
        this.setState(originalState);
    }

    protected getState(): LightState {
        return new LightState(this.state);
    }

    setState(state: boolean): void {
        this.state = state;
        this.updateChannels();
    }

    updateChannels(): void {
        const properties = {
            brightness: this.state ? 1 : 0
        };

        this.physical.update(properties);
    }
}