import VirtualDevice from "../../devices/Abstract/VirtualDevice";
import CancellationToken from "../../helpers/CancellationToken";

export default abstract class Effect {
    public id: string;

    public abstract affectsBrightness: boolean;
    public abstract affectsColour: boolean;

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