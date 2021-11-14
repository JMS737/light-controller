import express from "express";
import bodyParser from 'body-parser';
import path from "path";
import dotenv from "dotenv";
import JsonDeviceManager from "./services/JsonDeviceManager";
import IDeviceManager from "./services/IDeviceManager";
import { IDimmableLight, ILight, IRgbLight, IAddressableRgbLight } from "./devices/Abstract/IVirtualLights";
import Hsv from "./models/Hsv";
import DeviceFactory from "./helpers/DeviceFactory";
import ConfigurationManager from "./services/ConfigurationManager";
import SceneManager from "./services/SceneManager";

// initialise configuration.
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.SERVER_PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

const deviceFilename = process.env.DEVICE_FILE;

let deviceManager: IDeviceManager | undefined;
const sceneManager = new SceneManager(new ConfigurationManager());

const factory = new DeviceFactory(new ConfigurationManager(), sceneManager);

if (deviceFilename) {
    console.log(`Devices file: '${deviceFilename}'`);
    deviceManager = new JsonDeviceManager(path.join(__dirname, deviceFilename), factory);
    deviceManager.loadDevices((devices) => {
        console.log(`Loaded ${devices.length} devices.`);
    });
    
} else {
    console.log('Please specify a devices file in "__dirname/.env" using the key DEVICE_FILE=<filename>');
}

//#region v1

// GET /api/v1/lights
app.get('/api/v1/lights', (req, res) => {
    const devices = deviceManager?.devices;

    const deviceInfos: any[] = [];
    devices?.map(d => deviceInfos.push(d.getProperties()));

    return res.status(200).send({
        success: 'true',
        message: 'Devices retrieved sucessfully',
        lights: deviceInfos
    });
});

// GET /api/v1/lights/{id}
app.get('/api/v1/lights/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (!id) {
        return res.status(400).send({
            success: 'false',
            message: 'Invalid ID'
        });
    }

    const device = deviceManager?.getDevice(id);

    if (device) {
        const properties = device.getProperties();
        if (properties.state) {
            properties.switch = properties.state ? 1 : 0;
        }

        if (properties.brightness) {
            properties.brightness /= 100;
        }

        return res.status(200).send({
            success: 'true',
            message: 'light retrieved successfully',
            light: properties
        });
    } else {
        return res.status(404).send({
            success: 'false',
            message: 'light does not exist'
        });
    }
});

// // PUT /api/v1/lights/switch/{id}
app.put('/api/v1/lights/switch/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (!id) {
        return res.status(400).send({
            success: 'false',
            message: 'Invalid ID'
        });
    } else if (!req.body.switch && req.body.switch != 0) {
        return res.status(400).send({
            success: 'false',
            message: 'switch is required'
        });
    }

    const device = deviceManager?.getDevice<ILight>(id);

    if (device) {
        device.setState(req.body.switch == 1);
        return res.status(200).send({
            success: 'true',
            message: 'Light updated'
        });
    } else {
        return res.status(500).send({
            success: 'false',
            message: 'Light does not exist'
        });
    }
});

// PUT /api/v1/lights/brightness/{id}
app.put('/api/v1/lights/brightness/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (!id) {
        return res.status(400).send({
            success: 'false',
            message: 'Invalid ID'
        });
    } else if (!req.body.brightness && req.body.brightness != 0) {
        return res.status(400).send({
            success: 'false',
            message: 'brightness is required'
        });
    }

    const device = deviceManager?.getDevice<IDimmableLight>(id);

    if (device) {
        device.setBrightness(req.body.brightness * 100);
        return res.status(200).send({
            success: 'true',
            message: 'Light updated'
        });
    } else {
        return res.status(500).send({
            success: 'false',
            message: 'Light does not exist'
        });
    }
});

// PUT /api/v1/lights/colour/{id}
app.put('/api/v1/lights/colour/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (!id) {
        return res.status(400).send({
            success: 'false',
            message: 'Invalid ID'
        });
    }

    if (!req.body.hsv) {
        return res.status(400).send({
            success: 'false',
            message: 'hsv is required'
        });
    }

    const device = deviceManager?.getDevice<IRgbLight>(id);

    if (device) {
        device.setColour(req.body.hsv.h, req.body.hsv.s);
        return res.status(200).send({
            success: 'true',
            message: 'Light updated'
        });
    } else {
        return res.status(500).send({
            success: 'false',
            message: 'Light does not exist'
        });
    }
});

//#endregion

//#region v2

// GET /api/v2/devices
app.get('/api/v2/devices', (req, res) => {
    const devices = deviceManager?.devices;

    const deviceInfos: any[] = [];
    devices?.map(d => deviceInfos.push(d.getProperties()));

    return res.status(200).send({
        success: 'true',
        message: 'Devices retrieved sucessfully',
        devices: deviceInfos
    });
});

// GET /api/v2/device/{id}
app.get('/api/v2/devices/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (id == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'id required'
        });
    }

    const device = deviceManager?.getDevice(id);

    if (device) {
        return res.status(200).send({
            success: 'true',
            message: 'device retrieved successfully',
            device: device.getProperties()
        });
    } else {
        return res.status(404).send({
            success: 'false',
            message: 'device does not exist'
        });
    }
});

// // PUT /api/v2/lights/state/{id}
app.put('/api/v2/lights/state/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (id == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'id required'
        });
    } else if (req.body.state == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'state is required'
        });
    }

    const device = deviceManager?.getDevice<ILight>(id);

    if (device) {
        device.setState(req.body.state);
        return res.status(200).send({
            success: 'true',
            message: 'Light updated'
        });
    } else {
        return res.status(500).send({
            success: 'false',
            message: 'Light does not exist'
        });
    }
});

// PUT /api/v2/lights/brightness/{id}
app.put('/api/v2/lights/brightness/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (id == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'id required'
        });
    } else if (req.body.brightness == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'brightness is required'
        });
    }

    const device = deviceManager?.getDevice<IDimmableLight>(id);

    if (device) {
        device.setBrightnessSmooth(req.body.brightness);
        return res.status(200).send({
            success: 'true',
            message: 'Light updated'
        });
    } else {
        return res.status(500).send({
            success: 'false',
            message: 'Light does not exist'
        });
    }
});

// PUT /api/v2/lights/colour/{id}
app.put('/api/v2/lights/colour/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (id == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'id required'
        });
    }

    if (req.body.hsv == undefined || req.body.hsv.h == undefined || req.body.hsv.s == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'hsv is required'
        });
    }

    const device = deviceManager?.getDevice<IRgbLight>(id);

    if (device) {
        device.setColourSmooth(req.body.hsv.h, req.body.hsv.s);
        return res.status(200).send({
            success: 'true',
            message: 'Light updated'
        });
    } else {
        return res.status(500).send({
            success: 'false',
            message: 'Light does not exist'
        });
    }
});

// PUT /api/v2/lights/pixels/{id}
app.put('/api/v2/lights/pixels/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (id == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'id required'
        });
    }

    if (req.body.pixels == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'pixels is required'
        });
    }

    const device = deviceManager?.getDevice<IAddressableRgbLight>(id);

    if (device) {
        device.setPixelsSmooth(req.body.pixels);
        return res.status(200).send({
            success: 'true',
            message: 'Light updated'
        });
    } else {
        return res.status(500).send({
            success: 'false',
            message: 'Light does not exist'
        });
    }
});

// GET /api/v2/effects/{id}
app.get('/api/v2/effects/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (id == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'id required'
        });
    }

    const device = deviceManager?.getDevice(id);

    if (device) {

        const effects: string[] = [];
        device.getEffects().forEach(eff => effects.push(eff.id));
        
        return res.status(200).send(effects);
    } else {
        return res.status(500).send({
            success: 'false',
            message: 'Light does not exist'
        });
    }
});

// PUT /api/v2/effects/{id}
app.put('/api/v2/effects/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (id == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'id required'
        });
    }

    if (req.body.effect == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'effect is required'
        });
    }

    const device = deviceManager?.getDevice(id);

    if (device) {
        device.setEffect(req.body.effect);
        return res.status(200).send({
            success: 'true',
            message: 'Light updated'
        });
    } else {
        return res.status(500).send({
            success: 'false',
            message: 'Light does not exist'
        });
    }
});

// PUT /api/v3/lights/{id}
app.put('/api/v3/lights/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (id == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'id required'
        });
    }

    const device = deviceManager?.getDevice<IAddressableRgbLight>(id);

    if (device) {
        const colours: Hsv[] = req.body.colours;
        const interpolationType: string = req.body.interpolation;
        device.setColoursSmooth(colours, interpolationType);
        return res.status(200).send({
            success: 'true',
            message: 'Light updated'
        });
    } else {
        return res.status(500).send({
            success: 'false',
            message: 'Light does not exist'
        });
    }
});

// GET /api/v3/lights/{id}/presets
app.get('/api/v3/lights/:id/presets', async (req, res) => {
    const id = parseInt(req.params.id);

    if (id == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'id required'
        });
    }

    const device = deviceManager?.getDevice<IAddressableRgbLight>(id);

    if (device) {
        const presets = await device.getPresets();
        return res.status(200).send(presets);
    } else {
        return res.status(500).send({
            success: 'false',
            message: 'Light does not exist'
        });
    }
});

// PUT /api/v3/lights/{id}/presets
app.put('/api/v3/lights/:id/presets/save', async (req, res) => {
    const id = parseInt(req.params.id);
    const name = req.body.name;

    if (id == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'id required'
        });
    }

    if (name == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'name required'
        });
    }

    const device = deviceManager?.getDevice<IAddressableRgbLight>(id);

    if (device) {
        const presets = await device.savePreset(name);
        return res.status(200).send(presets);
    } else {
        return res.status(500).send({
            success: 'false',
            message: 'Light does not exist'
        });
    }
});

// DELETE /api/v3/lights/{id}/presets
app.delete('/api/v3/lights/:id/presets/delete', async (req, res) => {
    const id = parseInt(req.params.id);
    const name = req.body.name;

    if (id == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'id required'
        });
    }

    if (name == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'name required'
        });
    }

    const device = deviceManager?.getDevice<IAddressableRgbLight>(id);

    if (device) {
        const presets = await device.deletePreset(name);
        return res.status(200).send(presets);
    } else {
        return res.status(500).send({
            success: 'false',
            message: 'Light does not exist'
        });
    }
});

// PUT /api/v3/lights/{id}/presets
app.put('/api/v3/lights/:id/presets', async (req, res) => {
    const id = parseInt(req.params.id);
    const name = req.body.name;

    if (id == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'id required'
        });
    }

    if (name == undefined) {
        return res.status(400).send({
            success: 'false',
            message: 'name required'
        });
    }

    const device = deviceManager?.getDevice<IAddressableRgbLight>(id);

    if (device) {
        const presets = await device.loadPreset(name);
        return res.status(200).send(presets);
    } else {
        return res.status(500).send({
            success: 'false',
            message: 'Light does not exist'
        });
    }
});

//#endregion

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});