import Effect from "../../models/Effects/Effect";
import VirtualDevice, { DeviceInfo } from "./VirtualDevice";

export class DeviceGroupInfo extends DeviceInfo {
    public devices: DeviceInfo[];

    constructor(instance: DeviceInfo, devices: DeviceInfo[]) {
        super(instance.id, instance.name, instance.model, instance.state, instance.effects);
        this.devices = devices;
    }
}

export default abstract class DeviceGroup<T extends VirtualDevice> extends VirtualDevice {
    devices: T[];

    constructor(id: number, name: string, devices: T[]) {
        super(id, name);

        this.devices = devices;
    }

    async getProperties(): Promise<DeviceGroupInfo> {
        const properties = await super.getProperties();

        const devices = await Promise.all(this.devices.map(async d => await d.getProperties()));
        return new DeviceGroupInfo(properties, devices);
    }

    public getEffects(): Effect[] {
        return this.devices[0].getEffects();
    }

    public async setEffect(effectName: string): Promise<void> {
        await Promise.all(this.devices.map(async d => await d.setEffect(effectName)));
    }

    public stopEffect(): void {
        this.devices.map(d => d.stopEffect());
    }
}