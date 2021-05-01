import Color from 'color';

export class TimestampsPlugin {
    getMinMax() {
        const { timestamps } = this;

        this.min = timestamps.reduce((acc, { timestamp }) => timestamp < acc ? timestamp : acc, min);
        this.max = timestamps.reduce((acc, { timestamp }) => timestamp > acc ? timestamp : acc, max);

        return { min, max };
    }

    set(timestamps, update = true) {
        this.timestamps = timestamps.map(({ color, ...rest }) => ({
            ...rest,
            color: new Color(color).alpha(ALPHA).rgb().toString()
        }));

        if (update) {
            this.update();
        }
    }

    calcTimestampBlockPosition(position, prevEnding) {
        if (position > 0) {
            if (prevEnding > position) {
                return prevEnding;
            } else {
                return position;
            }
        } else {
            return position;
        }
    }

    renderTimestamps() {
        this.clear(this.width, this.charHeight);
        const timesHeight = this.charHeight + 4;

        this.timestamps.slice()
            .sort((a, b) => a.timestamp - b.timestamp)
            .reduce((prevEnding, node) => {
                const { timestamp, color, shortName } = node;
                const { width } = this.ctx.measureText(shortName);
                const fullWidth = width + this.blockPadding * 2;
                const position = this.timeToPosition(timestamp);
                const blockPosition = this.calcTimestampBlockPosition(position, prevEnding, width);

                this.ctx.strokeStyle = color;
                this.ctx.beginPath();
                this.ctx.setLineDash([8, 7]);
                this.ctx.moveTo(position, 0);
                this.ctx.lineTo(position, this.height);
                this.ctx.stroke();

                this.setCtxColor(color);
                this.ctx.fillRect(blockPosition, timesHeight, fullWidth, this.charHeight + this.blockPadding);

                this.setCtxColor('black');
                this.ctx.fillText(shortName, blockPosition + this.blockPadding, timesHeight + this.charHeight);

                this.addHitRegion('timestamp', node, blockPosition, timesHeight, fullWidth, this.charHeight + this.blockPadding);

                return blockPosition + fullWidth;
            }, 0)
    }

    renderTooltip(hoveredRegion) {
        if (hoveredRegion.type === 'timestamp') {
            const { data: { fullName, timestamp } } = hoveredRegion;

            const timestampsAccuracy = this.timelineAccuracy + 2;
            const header = `${fullName}`;
            const time = `${timestamp.toFixed(timestampsAccuracy)} ${this.timeUnits}`;

            this.renderTooltipFromData(header, [time]);

            return true;
        }
    }
}
