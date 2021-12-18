import { DeviceType } from "../../helpers/DeviceType";
import Effect, { ExternalEffect, NoEffect } from "../../models/Effects/Effect";

export default abstract class VirtualDevice {
    public id: number;
    abstract type: DeviceType;
    
    protected _currentEffect: Effect | undefined;

    constructor(id: number) {
        this.id = id;
    }

    public abstract initialise(): void;

    public getEffects(): Effect[] {
        return [new NoEffect()];
    }

    public setEffect(effectName: string): boolean {
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
            return true;
        } else {
            if (this._currentEffect) {
                this._currentEffect.cancel();
            }
            return false;
        }
    }

    public stopEffect(): void {
        this._currentEffect?.cancel();
    }

    protected CreateEffect(effectName: string) {
        return this.getEffects().filter(eff => eff.id == effectName)[0];
    }

    getProperties(): any {
        return {
            id: this.id,
            type: this.type
        };
    }
}