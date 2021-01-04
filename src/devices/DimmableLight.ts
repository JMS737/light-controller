import { delay } from "../helpers/AsyncHelpers";
import CancellationToken from "../helpers/CancellationToken";
import { DeviceType } from "../helpers/DeviceType";
import { constrain } from "../helpers/MathHelper";
import Effect from "../models/Effects/Effect";
import { Blink, Pulse } from "../models/Effects/LightingEffects";
import { IDimmableLight } from "./Abstract/ILights";
import Light from "./Light";

export default class DimmableLight extends Light implements IDimmableLight {
    protected STEPS: number = 50;
    protected FADE_TIME: number = 500; // Milliseconds

    brightness = 100;
    stateTransition = this.state ? 1 : 0;
    type: DeviceType = DeviceType.DimmableLight;

    private currentStateTask: Promise<void> | undefined;
    private currentStateToken: CancellationToken | undefined;

    private currentBrightnessTask: Promise<void> | undefined;
    private currentBrightnessToken: CancellationToken | undefined;

    constructor(id: number, pin: number) {
        super(id, pin);
    }

    async setState(state: boolean): Promise<void> {
        this.state = state;

        if (this.currentStateTask && this.currentStateToken) {
            this.currentStateToken.cancel();
            await this.currentStateTask;
        }

        this.currentStateToken = new CancellationToken();
        this.currentStateTask = this.setStateAsync(this.currentStateToken);
    }

    async setStateAsync(token: CancellationToken): Promise<void> {
        var stateIncrement = ((this.state ? 1 : 0) - this.stateTransition) / this.STEPS;

        for (let i = 0; i < this.STEPS; i++) {
            if (token.isCancellationRequested) {
                break;
            }

            this.stateTransition = constrain(this.stateTransition + stateIncrement, 0, 1);
            this.updateChannels();
            await delay(this.FADE_TIME / this.STEPS);
        }
    }

    setBrightness(brightness: number): void {
        if (brightness < 0 || brightness > 100) {
            console.warn("Brightness must be between 0 and 100.");
            brightness = constrain(brightness, 0, 100);
        }

        this.brightness = brightness;
        this.updateChannels();
    }

    async setBrightnessSmooth(brightness: number): Promise<void> {
        if (brightness < 0 || brightness > 100) {
            console.warn("Brightness must be between 0 and 100.");
            brightness = constrain(brightness, 0, 100);
        }

        if (this._currentEffect?.affectsBrightness) {
            await this._currentEffect.cancel(true);
        }

        if (this.currentBrightnessTask && this.currentBrightnessToken) {
            this.currentBrightnessToken?.cancel(true);
            await this.currentBrightnessTask;
        }

        this.currentBrightnessToken = new CancellationToken();
        this.currentBrightnessTask = this.setBrightnessAsync(brightness, this.currentBrightnessToken);

        return this.currentBrightnessTask;
    }

    async setBrightnessAsync(targetBrightness: number, token: CancellationToken): Promise<void> {
        var brightnessIncrement = (targetBrightness - this.brightness) / this.STEPS;

        for (let i = 0; i < this.STEPS; i++) {
            if (token.isCancellationRequested) {
                break;
            }

            this.setBrightness(this.brightness + brightnessIncrement);
            await delay(this.FADE_TIME / this.STEPS);
        }
    }

    public getEffects(): Effect[] {
        let effects = super.getEffects();
        effects.push(
            new Blink(),
            new Pulse()
        );

        return effects;
    }

    setEffect(effectName: string): void {
        let effect = this.CreateEffect(effectName);

        if (effect.affectsBrightness) {
            this.currentBrightnessToken?.cancel(true);
        }

        super.setEffect(effectName);
    }

    getProperties() {
        const properties: any = super.getProperties();
        properties.brightness = this.brightness;

        return properties;
    }

    updateChannels() {
        const value = this.stateTransition * this.brightness / 100;
        this.channels.one.setValue(value);
        this.writePins();
    }
}