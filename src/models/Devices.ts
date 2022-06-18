import { DeviceType } from "../helpers/DeviceType";
import Device from "./Device";

export default class Devices {
    devices!: Device[];
    groups!: Group[];
}

class Group {
    id!: number;
    name!: string;
    type!: DeviceType;
    devices!: number[];
}