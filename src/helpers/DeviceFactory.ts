import VirtualDevice from "../devices/Abstract/VirtualDevice";
import DimmableLight from "../devices/Virtual/DimmableLight";
import Light from "../devices/Virtual/Light";
import RgbLight from "../devices/Virtual/RgbLight";
import { DeviceType } from "./DeviceType";
import AddressableRgbStrip from "../devices/Virtual/AddressableRgbStrip";
import WS2812B from "../devices/Physical/WS2812B";
import { PwmLight, PwmRgbLight } from "../devices/Physical/PwmLights";
import Device from "../models/Device";
import IConfiguration from "../services/IConfiguraiton";
import SceneManager from "src/services/SceneManager";

export default class DeviceFactory {
    private readonly _config: IConfiguration;
    private readonly _scenes: SceneManager;

    constructor(config: IConfiguration, scenes: SceneManager) {
        this._config = config;
        this._scenes = scenes;
    }

    Create(info: Device): VirtualDevice | undefined {
        switch (info.type) {
            case DeviceType.BasicLight:
                return new Light(info.id, new PwmLight(info.physicalInfo.pins));
            case DeviceType.DimmableLight:
                return new DimmableLight(info.id, new PwmLight(info.physicalInfo.pins));
            case DeviceType.RgbLight:
                return new RgbLight(info.id, new PwmRgbLight(info.physicalInfo.pins));
            case DeviceType.WS2812B:
                return new AddressableRgbStrip(info.id, new WS2812B(info.physicalInfo.pin, info.physicalInfo.pixelCount), this._config, this._scenes);

            default:
                console.log(`Device type '${info.type}' is unsupported.`);
                return undefined;
        }
    }
}