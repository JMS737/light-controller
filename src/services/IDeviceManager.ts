import VirtualDevice from "../devices/Abstract/VirtualDevice";

export default interface IDeviceManager {
    devices: VirtualDevice[];
    loadDevices(): Promise<void>;
    getDevice<T extends VirtualDevice>(id: number): T;
}