import { DeviceType } from "../helpers/DeviceType";

export default class Device {
    id!: number;
    name!: string;
    type!: DeviceType;
    physicalInfo!: any
}