import { EventEmitter } from 'events';

export default class UIPlugin extends EventEmitter {
    static count = 0;

    static getId() {
        return UIPlugin.count++;
    }

    constructor() {
        super();
        this.id = UIPlugin.getId();
    }

    init() {}

    postInit() {}

    render() {}

    setSettings() {}

    renderTooltip() {}

    postRender() {}
}
