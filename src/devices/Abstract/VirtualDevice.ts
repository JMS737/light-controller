import { DeviceType } from "../../helpers/DeviceType";
import Effect, { ExternalEffect, NoEffect } from "../../models/Effects/Effect";

export class EffectInfo {
    public list: string[] = [];
    public select = "";
}

export class DeviceState {

}

export class DeviceInfo {
    public id: number;
    public name: string;
    public model: string;
    public state: DeviceState;
    public effects: EffectInfo;

    constructor(id: number, name: string, model: string, state: DeviceState, effects: EffectInfo) {
        this.id = id;
        this.name = name;
        this.model = model;
        this.state = state;
        this.effects = effects;
    }
}

export default abstract class VirtualDevice {
    public id: number;
    public name: string;
    abstract type: DeviceType;
    
    protected _currentEffect: Effect | undefined;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    public abstract initialise(): void;
    public abstract identify(): Promise<void>;

    public getEffects(): Effect[] {
        return [new NoEffect()];
    }

    public async setEffect(effectName: string): Promise<void> {
        const effect = this.CreateEffect(effectName);
        const isExternal = effect instanceof ExternalEffect;
        if (effect && !isExternal) {
            if (this._currentEffect) {
                this._currentEffect.cancel(true,
                    () => effect.execute(this)
                );
            } else {
                effect.execute(this);
            }

            this._currentEffect = effect;
        } else {
            if (this._currentEffect) {
                this._currentEffect.cancel();
            }
        }
    }

    public stopEffect(): void {
        this._currentEffect?.cancel();
    }

    protected CreateEffect(effectName: string) {
        return this.getEffects().filter(eff => eff.id == effectName)[0];
    }

    async getProperties(): Promise<DeviceInfo> {
        return {
            id: this.id,
            name: this.name,
            model: this.type,
            state: this.getState(),
            effects: {
                list: this.getEffects().map(p => p.id),
                select: this._currentEffect?.id ?? ""
            }
        };
    }

    protected getState(): DeviceState {
        return new DeviceState();
    }
}