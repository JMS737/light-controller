import AddressableRgbStrip from "src/devices/Virtual/AddressableRgbStrip";
import VirtualDevice from "../../devices/Abstract/VirtualDevice";
import CancellationToken from "../../helpers/CancellationToken";
import Scene from "./Scene";

export default abstract class Effect {
    public id: string;

    public abstract affectsBrightness: boolean;
    public abstract affectsColour: boolean;

    public get isCancelled(): boolean {
        return this.cst?.isCancellationRequested ?? false;
    }

    private cst: CancellationToken | undefined;
    private work: Promise<void> | undefined;

    constructor(id: string) {
        this.id = id;
    }

    public execute(device: VirtualDevice): void
    {
        this.cst = new CancellationToken();

        this.work = this.doWork(device, this.cst);
    }

    public async cancel(immediate = false, callback?: () => any): Promise<void> {
        this.cst?.cancel(immediate);

        await this.work;
        
        if (callback)
            callback();
    }

    protected abstract doWork(device: VirtualDevice, cst: CancellationToken): Promise<void>;
}

export class ExternalEffect extends Effect {
    public affectsBrightness = true;
    public affectsColour = true;

    protected async doWork(device: VirtualDevice, cst: CancellationToken): Promise<void> {
        // Do nothing, the effect is handled by the child process
    }
}

export class SceneEffect extends Effect {
    public affectsBrightness = false;
    public affectsColour = true;

    private readonly _scene: Scene;

    constructor(scene: Scene) {
        super(scene.name);
        this._scene = scene;
    }

    protected async doWork(device: VirtualDevice, cst: CancellationToken): Promise<void> {
        await this._scene.run(device as AddressableRgbStrip, cst);
    }
}

export class NoEffect extends Effect {
    public affectsBrightness = false;
    public affectsColour = false;

    constructor() {
        super("No Effect");
    }
    
    protected async doWork(device: VirtualDevice, cst: CancellationToken): Promise<void> {
        // Do nothing
    }

}