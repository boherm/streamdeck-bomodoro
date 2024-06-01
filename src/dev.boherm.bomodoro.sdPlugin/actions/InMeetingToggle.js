class InMeetingToggle {

    constructor() {
        this._action = new Action(Actions.InMeetingToggle);
        this._mainTimer = new Action(Actions.Timer);
        this._active = false;
        this._currentTime = 0;
        this._interval = null;
        this._tick = 1;
        this._context = null;
        this._registerEvents();

        this._hueAction = new Action(Actions.Hue);
        this._statsAction = new Action(Actions.Statistics);
    }

    _registerEvents() {
        this._action.onWillAppear(jsn => {
            this._context = jsn.context;
            this.redraw();
        });

        this._action.onKeyUp(() => {
            this.toggleTimer();
        });

        this._action.on(InMeetingEvents.Redraw, () => {
            this.redraw();
        });
    }

    toggleTimer() {
        if (!this._active) {
            this._hueAction.emit(HueEvents.Busy);
            this._action.emit(InMeetingEvents.Start);
            this._currentTime = 0;
            this._tick = 1;
            this._interval = setInterval(() => {
                if (this._tick % 4 === 0)
                    this._currentTime++;
                this._action.emit(InMeetingEvents.Redraw);
                this._tick++;
            }, 250);
            this._active = true;
            this._mainTimer.emit(TimerEvents.Hold);
        } else {
            this._action.emit(InMeetingEvents.Stop);
            clearInterval(this._interval);
            this._active = false;

            const { hours, minutes } = this._formatTime();
            this._currentTime = hours * 3600 + minutes * 60;

            this._statsAction.emit(StatisticsEvents.AddEntry, { type: 'meeting', duration: this._currentTime });
            this._action.emit(InMeetingEvents.Redraw);
            this._mainTimer.emit(TimerEvents.Unhold);
        }
    }

    redraw() {
        let canvas = document.createElement('canvas');
        canvas.width = 72;
        canvas.height = 72;
        let ctx = canvas.getContext('2d');

        if (this._active) {
            this._drawActive(ctx);
        } else {
            this._drawInactive(ctx);
        }

        $SD.setImage(this._context, canvas.toDataURL());
    }

    _drawActive(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this._tick % 2 ? 'red' : 'black';
        ctx.rect(0, 0, 72, 72);
        ctx.fill();

        ctx.fillStyle = this._tick % 2 ? 'black' : 'red';
        ctx.textAlign = "center";
        ctx.font = "bold 10px Verdana";
        ctx.fillText("IN", 36, 17);
        ctx.fillText("MEETING", 36, 30);

        ctx.font = "14px Verdana";
        ctx.fillStyle = "white";
        ctx.fillText(this._formatHoursMinutes(), 36, 50);

        ctx.font = "11px Verdana";
        ctx.fillStyle = this._tick % 2 ? 'black' : '#AAA';
        ctx.fillText(this._formatSecondes(), 36, 64);
    }

    _drawInactive(ctx) {
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.rect(0, 0, 72, 72);
        ctx.fill();

        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.font = "bold 10px Verdana";
        ctx.fillText("OUT", 36, 17);
        ctx.fillText("MEETING", 36, 30);

        ctx.font = "14px Verdana";
        ctx.fillStyle = "white";
        ctx.fillText(this._formatHoursMinutes(), 36, 50);
    }

    _formatTime() {
        let hours = Math.floor(this._currentTime / 3600)
        let minutes = Math.floor((this._currentTime - (hours * 3600)) / 60);
        let seconds = this._currentTime - (minutes * 60) - (hours * 3600);
        return { hours, minutes, seconds };
    }

    _formatHoursMinutes() {
        const { hours, minutes } = this._formatTime();
        return (hours < 10 ? '0' + hours : hours) + ':' +
            (minutes < 10 ? '0' + minutes : minutes);
    }

    _formatSecondes() {
        const { seconds } = this._formatTime();
        return (seconds < 10 ? '0' + seconds : seconds);
    }
}
const inMeetingToggle = new InMeetingToggle();
