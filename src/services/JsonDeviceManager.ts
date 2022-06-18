import IDeviceManager from "./IDeviceManager";
import fs from 'fs';
import Devices from "../models/Devices";
import VirtualDevice from "../devices/Abstract/VirtualDevice";
import DeviceFactory from "../helpers/DeviceFactory";
import GroupFactory from "../helpers/GroupFactory";

export default class JsonDeviceManager implements IDeviceManager {
    devices: VirtualDevice[] = [];
    private filename: string;
    private _factory: DeviceFactory;

    constructor(filename: string, factory: DeviceFactory) {
        this.filename = filename;
        this._factory = factory;
    }

    getDevice<T extends VirtualDevice>(id: number): T {
        return this.devices.find(d => d.id === id) as T;
    }

    loadDevices(callback: (devices: VirtualDevice[]) => any): void {
        fs.readFile(this.filename, 'utf8', (err, data) => {
            if (err) throw err;

            const devicesDetails = JSON.parse(data) as Devices;

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

            if (callback) {
                callback(this.devices);
            }
        });
    }
}