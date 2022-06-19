import IDeviceManager from "./IDeviceManager";
import * as fs from 'fs/promises';
import Devices from "../models/Devices";
import VirtualDevice from "../devices/Abstract/VirtualDevice";
import DeviceFactory from "../helpers/DeviceFactory";
import GroupFactory from "../helpers/GroupFactory";

export default class JsonDeviceManager implements IDeviceManager {
    public devices: VirtualDevice[] = [];
    private filename: string;
    private _factory: DeviceFactory;

    constructor(filename: string, factory: DeviceFactory) {
        this.filename = filename;
        this._factory = factory;
    }

    getDevice<T extends VirtualDevice>(id: number): T {
        return this.devices.find(d => d.id === id) as T;
    }

    async loadDevices(): Promise<void> {
        const content = await fs.readFile(this.filename, { encoding: "utf8"});

        const devicesDetails = JSON.parse(content) as Devices;

        devicesDetails.devices.map(info => {
            const device = this._factory.Create(info);

            if (device) {
                device.initialise();
                this.devices.push(device);
            } else {
                console.log(`Failed to create device from: ${info}`);
            }
        });

        devicesDetails.groups.map(info => {
            const group = GroupFactory.Create(info.type, info.id, info.name, this.devices.filter(d => info.devices.includes(d.id)));

            if (group) {
                group.initialise();
                this.devices.push(group);
            } else {
                console.log(`Failed to create group from: ${info}`);
            }
        });

        console.log(`Loaded ${this.devices.length} devices.`);

    }
}