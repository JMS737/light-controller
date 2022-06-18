import VirtualDevice from "../devices/Abstract/VirtualDevice";
import RgbLight from "../devices/Virtual/RgbLight";
import RgbLightGroup from "../devices/Groups/RgbLightGroup";
import { DeviceType } from "./DeviceType";

export default class GroupFactory {
    static Create(type: DeviceType, id: number, name: string, devices: VirtualDevice[]): VirtualDevice | undefined {
        switch (type) {
            case DeviceType.RgbLightGroup:
                return new RgbLightGroup(id, name, devices as RgbLight[]);

            default:
                console.log(`Group type '${type}' is unsupported.`);
                return undefined;
        }
    }
}