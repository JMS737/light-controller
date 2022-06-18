import { delay } from "../../helpers/AsyncHelpers";
import CancellationToken from "../../helpers/CancellationToken";
import { DeviceType } from "../../helpers/DeviceType";
import { constrain, Round } from "../../helpers/MathHelper";
import Effect from "../../models/Effects/Effect";
import { Blink, Pulse } from "../../models/Effects/LightingEffects";
import { IDimmableLight } from "../Abstract/IVirtualLights";
import { IPhysicalDevice } from "../Abstract/IPhysicalDevice";
import Light, { LightState } from "./Light";

export class DimmableLightState extends LightState {
    public brightness: number;

    constructor(on: boolean, brightness: number) {
        super(on);
        this.brightness = brightness;
    }
}

export default class DimmableLight extends Light implements IDimmableLight {
    protected STEPS = 50;
    protected FADE_TIME = 500; // Milliseconds

    brightness = 100;
    stateTransition = this.state ? 1 : 0;
    type: DeviceType = DeviceType.DimmableLight;

    private currentStateTask: Promise<void> | undefined;
    private currentStateToken: CancellationToken | undefined;

    private currentBrightnessTask: Promise<void> | undefined;
    private currentBrightnessToken: CancellationToken | undefined;

    constructor(id: number, name: string, physical: IPhysicalDevice) {
        super(id, name, physical);
    }

    public async identify(): Promise<void> {
        const originalState = this.state;
        const originalBrightness = this.brightness;
        
        this.brightness = 100;

        this.state = true;
        this.updateChannels();
        await delay(1000);
        this.state = false;
        this.updateChannels();
        await delay(1000);
        this.state = true;
        this.updateChannels();
        await delay(1000);
        this.state = false;
        this.updateChannels();
        await delay(1000);
        this.state = true;
        this.updateChannels();
        await delay(1000);

        this.state = originalState;
        this.brightness = originalBrightness;
        this.updateChannels();
    }

    async setState(state: boolean): Promise<void> {
        this.state = state;
        if (this.currentStateTask && this.currentStateToken) {
            this.currentStateToken.cancel();
            await this.currentStateTask;
        }
        
        if (this.state == false && this._currentEffect) {
            await this._currentEffect.cancel(true);
        }
        
        this.currentStateToken = new CancellationToken();
        this.currentStateTask = this.setStateAsync(this.currentStateToken);
    }

    async setStateAsync(token: CancellationToken): Promise<void> {
        const stateIncrement = ((this.state ? 1 : 0) - this.stateTransition) / this.STEPS;

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
        const brightnessIncrement = (targetBrightness - this.brightness) / this.STEPS;

        for (let i = 0; i < this.STEPS; i++) {
            if (token.isCancellationRequested) {
                break;
            }

            this.setBrightness(this.brightness + brightnessIncrement);
            await delay(this.FADE_TIME / this.STEPS);
        }

        this.setBrightness(Round(this.brightness, 0));
    }

    public getEffects(): Effect[] {
        const effects = super.getEffects();
        effects.push(
            new Blink(),
            new Pulse()
        );

        return effects;
    }

    async setEffect(effectName: string): Promise<void> {
        const effect = this.CreateEffect(effectName);

        if (effect?.affectsBrightness ?? true) {
            this.currentBrightnessToken?.cancel(true);
        }

        await super.setEffect(effectName);
    }

    protected getState(): DimmableLightState {
        return new DimmableLightState(this.state, this.brightness);
    }

    updateChannels(): void {
        const properties = {
            brightness: this.stateTransition * (this.brightness / 100)
        };

        this.physical.update(properties);
    }
}