import express from "express";
import bodyParser from 'body-parser';
import path from "path";
import dotenv from "dotenv";
import JsonDeviceManager from "./services/JsonDeviceManager";
import IDeviceManager from "./services/IDeviceManager";
import DeviceFactory from "./helpers/DeviceFactory";
import ConfigurationManager from "./services/ConfigurationManager";
import SceneManager from "./services/SceneManager";
import ControllerV3 from "./ControllerV3";
import { exit } from "process";

// initialise configuration.
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.SERVER_PORT || 25741;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

const deviceFilename = process.env.DEVICE_FILE;
const config = new ConfigurationManager();
let deviceManager: IDeviceManager;
const sceneManager = new SceneManager(config);

const factory = new DeviceFactory(config, sceneManager);

if (deviceFilename) {
    console.log(`Devices file: '${deviceFilename}'`);
    deviceManager = new JsonDeviceManager(path.join(__dirname, deviceFilename), factory);

    deviceManager.loadDevices();

} else {
    console.log('Please specify a devices file in "__dirname/.env" using the key DEVICE_FILE=<filename>');
    exit();
}

const controllerV3 = new ControllerV3(app, deviceManager);
controllerV3.map_endpoints();

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});