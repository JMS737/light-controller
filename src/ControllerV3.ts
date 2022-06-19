import express from "express";
import {v4 as uuid} from 'uuid'
import { IAddressableRgbLight, IDimmableLight, ILight, IRgbLight } from "./devices/Abstract/IVirtualLights";
import { DeviceInfo } from "./devices/Abstract/VirtualDevice";
import Hsv from "./models/Hsv";
import Rgb from "./models/Rgb";
import IDeviceManager from "./services/IDeviceManager";

export default class ControllerV3 {
    private _app: express.Application;
    private _deviceManager: IDeviceManager

    constructor(express: express.Application, deviceManager: IDeviceManager) {
        this._deviceManager = deviceManager;
        this._app = express;
    }

    public async map_endpoints(): Promise<void> {
        this._app.get('/api/v3', (req, res) => this.GetAll(req,res));
        this._app.get('/api/v3/:id', (req, res) => this.Get(req,res));
        this._app.put('/api/v3/:id/state', (req, res) => this.PutState(req,res));
        this._app.put('/api/v3/:id/effects', (req, res) => this.PutEffect(req,res));
        this._app.put('/api/v3/:id/identify', (req, res) => this.PutIdentify(req,res));
        this._app.put('/api/v3/:id/presets', (req, res) => this.PutSavePreset(req,res));
        this._app.delete('/api/v3/:id/presets', (req, res) => this.DeletePreset(req,res));
    }

    // GET /api/v3
    private async GetAll(req: any, res: any): Promise<void> {
        const devices = this._deviceManager.devices;

        if (devices == undefined) {
            return res.status(500).send({
                success: 'false',
                message: 'Devices not found.'
            });
        }

        const deviceInfos: DeviceInfo[] = [];
        await Promise.all(devices.map(async d => deviceInfos.push(await d.getProperties())));

        return res.status(200).send({
            success: true,
            message: 'Devices retrieved sucessfully',
            devices: deviceInfos
        });
    }

    // Information Endpoint for a device
    // GET /api/v3/{id}
    private async Get(req: any, res: any): Promise<void> {
        const id = parseInt(req.params.id);
        const device = this._deviceManager.getDevice(id);

        if (device) {
            return res.status(200).send(await device.getProperties());
        }
        else {
            return res.status(500).send({
                message: 'Device not found.'
            });
        }
    }

    // PUT /api/v3/{id}/state
    private PutState(req: any, res: any): void {
        const guid = uuid();
        const id = parseInt(req.params.id);
        const device = this._deviceManager.getDevice(id);
        // console.log(`[${guid}] Received state update for device '${id}'`);
        
        if (device) {
            // console.log(`[${guid}] Device found for '${id}'`);

            let on: boolean | undefined;
            let brightness: number | undefined;
            let hue: number | undefined;
            let saturation: number | undefined;
            let pixels: Rgb[] | undefined;
            let colors: Hsv[] | undefined;
            let interpolation = "rgb";

            if (req.body.on)
                on = req.body.on.value as boolean;
            if (req.body.brightness)
                brightness = req.body.brightness.value as number;
            if (req.body.hue)
                hue = req.body.hue.value as number;
            if (req.body.saturation)
                saturation = req.body.saturation.value as number;
            if (req.body.pixels)
                pixels = req.body.pixels as Rgb[];
            if (req.body.colors)
                colors = req.body.colors.values as Hsv[];
            if (req.body.colors)
                interpolation = req.body.colors.interpolation as string ?? "rgb";

            if (on != undefined) {
                (device as ILight).setState(on);
            }
            if (brightness != undefined) {
                (device as IDimmableLight).setBrightnessSmooth(brightness);
            }
            if (hue != undefined && saturation != undefined) {
                (device as IRgbLight).setColourSmooth(hue, saturation);
            }
            if (hue != undefined) {
                (device as IRgbLight).setColourSmooth(hue);
            }
            if (saturation != undefined) {
                (device as IRgbLight).setColourSmooth(undefined, saturation);
            }
            if (pixels != undefined) {
                (device as IAddressableRgbLight).setPixelsSmooth(pixels);
            }
            if (colors != undefined) {
                (device as IAddressableRgbLight).setColoursSmooth(colors, interpolation);
            }
        }
        else {
            return res.status(500).send({
                message: 'Device not found.'
            });
        }

        res.status(200).send();
    }

    // PUT /api/v3/{id}/effects
    private PutEffect(req: any, res: any): void {
        const id = parseInt(req.params.id);
        const device = this._deviceManager.getDevice(id);

        if (device) {
            const effect = req.body.select as string;

            if (effect) {
                device.setEffect(effect);
            }
        }
        else {
            return res.status(500).send({
                message: 'Device not found.'
            });
        }

        res.status(200).send();
    }

    // PUT /api/v3/{id}/identify
    private PutIdentify(req: any, res: any): void {
        const id = parseInt(req.params.id);
        const device = this._deviceManager.getDevice(id);

        if (device) {
            device.identify();
        }
        else {
            return res.status(500).send({
                message: 'Device not found.'
            });
        }

        res.status(200).send();
    }

    // PUT /api/v3/{id}/presets
    private async PutSavePreset(req: any, res: any): Promise<void> {
        const id = parseInt(req.params.id);
        const name = req.body.name as string;

        if (id == undefined) {
            return res.status(400).send({
                message: 'id required'
            });
        }

        if (name == undefined) {
            return res.status(400).send({
                message: 'name required'
            });
        }

        const device = this._deviceManager.getDevice<IAddressableRgbLight>(id);

        if (device) {
            const presets = await device.savePreset(name);
            return res.status(200).send(presets);
        } else {
            return res.status(500).send({
                message: 'Device not found.'
            });
        }
    }

    // DELETE /api/v3/{id}/presets
    private async DeletePreset(req: any, res: any): Promise<void> {
        const id = parseInt(req.params.id);
        const name = req.body.name as string;

        if (id == undefined) {
            return res.status(400).send({
                message: 'id required'
            });
        }

        if (name == undefined) {
            return res.status(400).send({
                message: 'name required'
            });
        }

        const device = this._deviceManager.getDevice<IAddressableRgbLight>(id);

        if (device) {
            const presets = await device.deletePreset(name);
            return res.status(200).send(presets);
        } else {
            return res.status(500).send({
                message: 'Device not found.'
            });
        }
    }
}