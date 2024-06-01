class Timer {

    Status = {
        Running: 'running',
        Stopped: 'stopped',
        Ended: 'ended'
    }

    constructor() {
        this._action = new Action(Actions.Timer);

        this._status = this.Status.Stopped;
        this._currentPhase = 0;
        this._phases = ['WORK', 'BREAK', 'WORK', 'BREAK', 'WORK', 'L. BREAK'];
        this._phasesColors = ['#ff0000', '#007eff', '#ff0000', '#007eff', '#ff0000', '#ffcc00'];
        this._phasesDuration = [25, 5, 25, 5, 25, 15];
        this._phasesBusy = [true, false, true, false, true, false];
        this._elapsedTime = 0;
        this._hold = false;

        this._interval = null;
        this._tick = null;
        this._context = null;
        this._initAudio();

        this._timeoutLongPress = null;
        this._longPress = false;

        this._hueAction = new Action(Actions.Hue);
        this._configAction = new Action(Actions.Config);
        this._statsAction = new Action(Actions.Statistics);
        this._registerEvents();
    }

    _registerEvents() {
        this._action.onWillAppear(jsn => {
            this._context = jsn.context;
            this.redraw();
        });

        this._action.onKeyUp(() => {
            if (!this._longPress) {
                this.toggleTimer();
                clearTimeout(this._timeoutLongPress);
            } else {
                if (this._status === this.Status.Running) {
                    this.forceStop();
                } else if(this._status === this.Status.Stopped) {
                    this.nextPhase();
                }
                this._longPress = false;
            }
            this._timeoutLongPress = null;
        });

        this._action.onKeyDown(() => {
            this._timeoutLongPress = setTimeout(() => {
                this._longPress = true;
            }, 300);
        });

        this._action.on(TimerEvents.Redraw, () => {
            this.redraw();
        });

        this._action.on(TimerEvents.Hold, () => {
            this._hold = true;
        });

        this._action.on(TimerEvents.Unhold, () => {
            this._hold = false;
            if (this._status === this.Status.Running) {
                this._hueAction.emit(this._phasesBusy[this._currentPhase] ? HueEvents.Busy : HueEvents.Available);
            } else {
                this._hueAction.emit(HueEvents.Available);
            }
        });

        this._configAction.on(ConfigEvents.UpdatedTimerData, () => {
            this.forceStop();
            let timerConfig = config.getTimerConfig();
            this._phasesDuration = [
                timerConfig.durations.work,
                timerConfig.durations.short,
                timerConfig.durations.work,
                timerConfig.durations.short,
                timerConfig.durations.work,
                timerConfig.durations.long
            ];
            this._action.emit(TimerEvents.Redraw);
        });
    }

    toggleTimer() {
        if (this._status === this.Status.Stopped) {
            this._status = this.Status.Running;
            this._elapsedTime = 0;
            this._tick = 1;

            this._hueAction.emit(this._phasesBusy[this._currentPhase] ? HueEvents.Busy : HueEvents.Available);

            this._interval = setInterval(() => {
                if (this._status === this.Status.Running) {
                    if (this._elapsedTime === this._phasesDuration[this._currentPhase] * 60) {
                        this._status = this.Status.Ended;
                        this.playAudio();
                    } else {
                        if (!this._hold && this._tick % 4 === 0)
                            this._elapsedTime++;
                    }
                }

                this._action.emit(TimerEvents.Redraw);
                this._tick++;
            }, 250);

            this._action.emit(TimerEvents.Redraw);
        } else if (this._status === this.Status.Ended) {

            if (this._phases[this._currentPhase] === 'WORK') {
                this._statsAction.emit(StatisticsEvents.AddEntry, { type: 'work', duration: this._phasesDuration[this._currentPhase] * 60  });
            }

            this.stopAudio();
            this._status = this.Status.Stopped;
            clearInterval(this._interval);
            this.nextPhase();
            if (!this._phasesBusy[this._currentPhase]) {
                this._hueAction.emit(this._phasesBusy[this._currentPhase] ? HueEvents.Busy : HueEvents.Available);
            }
        } else if (this._status === this.Status.Running) {
            if (!this._hold) {
                this._hold = true;
            } else {
                this._hold = false;
            }
            this._action.emit(TimerEvents.Redraw);
        }
    }

    forceStop() {
        this._hueAction.emit(HueEvents.Available);
        this._status = this.Status.Stopped;
        clearInterval(this._interval);
        this._elapsedTime = 0;
        this._tick = 1;
        this._action.emit(TimerEvents.Redraw);
    }

    nextPhase() {
        this._hold = false;
        this._currentPhase = this._currentPhase === this._phases.length - 1 ? 0 : this._currentPhase + 1;
        this._elapsedTime = 0;
        this._tick = 1;
        this._action.emit(TimerEvents.Redraw);
    }

    _initAudio() {
        this._audio = document.createElement('audio');
        let source = document.createElement('source');
        source.src = 'alert.mp3';
        this._audio.appendChild(source);
    }

    playAudio() {
        this._audio.play();
    }

    stopAudio() {
        this._audio.pause();
        this._audio.currentTime = 0;
    }

    redraw() {
        let canvas = document.createElement('canvas');
        canvas.width = 72;
        canvas.height = 72;
        let ctx = canvas.getContext('2d');

        if (this._status === this.Status.Ended) {
            ctx.beginPath();
            ctx.rect(0, 0, 72, 72);
            ctx.fillStyle = this._tick % 4 ? this._phasesColors[this._currentPhase] : 'black';
            ctx.fill();

            ctx.fillStyle = this._tick % 4 ? 'black' : this._phasesColors[this._currentPhase];
            ctx.font = "bold 9px Verdana";
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText(this._phases[this._currentPhase], 36, 24);
            ctx.fillText('OVER', 36, 36);

            ctx.beginPath();
            ctx.fillStyle = this._tick % 4 ? 'black' : 'gray';
            ctx.font = "bold 8px Verdana";
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText((this._currentPhase+1) + "/6", 36, 57);

        } else {
            ctx.arc(36, 36, 32, 3 * Math.PI / 2, -Math.PI / 2);
            ctx.lineWidth = 6;
            ctx.strokeStyle = "#373737";
            ctx.stroke();

            let ratioTime = 2 - (this._elapsedTime / (this._phasesDuration[this._currentPhase] * 60));
            ctx.beginPath();
            ctx.arc(36, 36, 32, (3 * Math.PI / 2)-((2 * Math.PI) * ratioTime), -Math.PI / 2);
            ctx.lineWidth = 6;
            ctx.strokeStyle = this._phasesColors[this._currentPhase];
            ctx.stroke();

            let hasSubText = false;
            if (this._status === this.Status.Stopped) {
                hasSubText = true;
                ctx.beginPath();
                ctx.fillStyle = this._phasesColors[this._currentPhase];
                ctx.font = "bold 9px Verdana";
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.fillText('NEXT:', 36, 20);
            } else if (this._hold){
                hasSubText = true;
                ctx.beginPath();
                ctx.fillStyle = this._tick % 2 ? 'red' : 'transparent';
                ctx.fillRect(20, 14, ctx.measureText('HOLD').width + 3, 9);
                ctx.fillStyle = 'black';
                ctx.font = "bold 9px Verdana";
                ctx.textBaseline = 'top';
                ctx.fillText('HOLD', 21, 15);

                if (this._tick % 2) {
                    ctx.beginPath();
                    ctx.arc(36, 36, 32, 3 * Math.PI / 2, -Math.PI / 2);
                    ctx.lineWidth = 6;
                    ctx.strokeStyle = 'red';
                    ctx.stroke();
                }
            }

            ctx.fillStyle = this._phasesColors[this._currentPhase];
            ctx.font = "bold 9px Verdana";
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText(this._phases[this._currentPhase], 36, hasSubText ? 30 : 26);

            ctx.fillStyle = 'white';
            ctx.font = " 13px Verdana";
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText(this._formatTime(), 36, 45);

            ctx.beginPath();
            ctx.fillStyle = 'gray';
            ctx.font = "bold 8px Verdana";
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText((this._currentPhase+1) + "/6", 36, 57);
        }

        $SD.setImage(this._context, canvas.toDataURL());
    }

    _formatTime() {
        let duration = this._phasesDuration[this._currentPhase] * 60;
        let countdown = duration - this._elapsedTime;

        let minutes = Math.floor(countdown / 60);
        let seconds = countdown - (minutes * 60);
        return (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
    }
}
const timer = new Timer();