import VirtualDevice from "../devices/Abstract/VirtualDevice";

export default interface IDeviceManager {
    devices: VirtualDevice[];
    loadDevices(callback?: (devices: VirtualDevice[]) => any): void;
    getDevice<T extends VirtualDevice>(id: number): T;
}