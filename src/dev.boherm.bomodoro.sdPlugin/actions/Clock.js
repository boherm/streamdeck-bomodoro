class Clock {

    constructor() {
        this._action = new Action(Actions.Clock);
        this._context = null;
        this._startTicking();
        this._blinking = false;
        this._tick = 0;
        this._durationWork = [
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Sunday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Monday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Tuesday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Wednesday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Thursday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Friday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Saturday
        ];

        this._configAction = new Action(Actions.Config);
        this._registerEvents();
        this._initAudio();
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

    _fromTimeToSecondes(time) {
        let hours = parseInt(time.split(':')[0]);
        let minutes = parseInt(time.split(':')[1]);
        return hours * 3600 + minutes * 60;
    }

    _formatTime(timeEnd, time) {
        let countdown = timeEnd - time;

        let hours = Math.floor(countdown / 3600)
        let minutes = Math.floor((countdown - (hours * 3600)) / 60);
        let seconds = countdown - (minutes * 60) - (hours * 3600);

        if (hours > 0) {
            minutes += (seconds > 0 ? 1 : 0);
            hours += (minutes > 59 ? 1 : 0);
            minutes = (minutes > 59 ? 0 : minutes);
            return this._formatWithZero(hours) + ':' + this._formatWithZero(minutes);
        }

        return this._formatWithZero(minutes) + ':' + this._formatWithZero(seconds);
    }

    _registerEvents() {
        this._action.onWillAppear(jsn => {
            this._context = jsn.context;
            this.redraw();
        });

        this._action.onKeyUp(() => {
            this._blinking = false;
            this._tick = 0;
            this.stopAudio();
        });

        this._configAction.on(ConfigEvents.UpdatedClockData, () => {
            this._durationWork = config.getClockConfig();
            this.redraw();
        });
    }

    _startTicking() {
        setInterval(() => {
            this.redraw();
        }, 250);
    }

    _formatWithZero(time) {
        return time < 10 ? '0' + time : time;
    }

    _getDay(day) {
        switch (day) {
            case 0:
                return 'Sun.';
            case 1:
                return 'Mon.';
            case 2:
                return 'Tue.';
            case 3:
                return 'Wed.';
            case 4:
                return 'Thu.';
            case 5:
                return 'Fri.';
            case 6:
                return 'Sat.';
        }
    }

    _getFormattedTime(hours, minutes, seconds) {
        return hours * 3600 + minutes * 60 + seconds;
    }

    _getWidthElapsed(duration, start, stop) {
        start = this._fromTimeToSecondes(start);
        stop = this._fromTimeToSecondes(stop);

        let width = (duration - start) / (stop - start) * 36;
        return width > 0 ? (width > 36 ? 36 : width) : 0;
    }

    redraw() {

        let now = new Date();

        let canvas = document.createElement('canvas');
        canvas.width = 72;
        canvas.height = 72;
        let ctx = canvas.getContext('2d');

        let noHat = true;
        let noHatSubtext = true;
        let timeNow = this._getFormattedTime(now.getHours(), now.getMinutes(), now.getSeconds());
        let durationWork = this._durationWork[now.getDay()];

        if (this._blinking) {
            this._tick++;
        }

        if (this._blinking && this._tick % 2) {
            ctx.beginPath()
            ctx.fillStyle = "#62df16";
            ctx.rect(0, 5, 72, 67);
            ctx.fill();
        }

        if (durationWork.morning.start !== '' && durationWork.morning.end !== '') {
            noHat = false;
            let startedMorning = timeNow >= this._fromTimeToSecondes(durationWork.morning.start);
            let widthMorning = this._getWidthElapsed(timeNow, durationWork.morning.start, durationWork.morning.end);

            ctx.beginPath()
            ctx.fillStyle = startedMorning ? "darkred" : "#373737";
            ctx.rect(0, 0, 36, 5);
            ctx.fill();

            ctx.beginPath()
            ctx.fillStyle = widthMorning >= 36 ? "#62df16" : "#ffcc00";
            ctx.rect(0, 0, widthMorning > 36 ? 36 : widthMorning, 6);
            ctx.fill();

            if (startedMorning && widthMorning < 36) {
                noHatSubtext = false;
                ctx.beginPath();
                ctx.font = "9px Verdana";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.fillStyle = this._blinking && this._tick % 2 ? "black" : "#bfbfbf";
                ctx.fillText(this._formatTime(this._fromTimeToSecondes(durationWork.morning.end), timeNow), 18, 13);
            }

            if (timeNow === this._fromTimeToSecondes(durationWork.morning.end) && !this._blinking) {
                this._blinking = true;
                this.playAudio();
            }
        }

        if (durationWork.afternoon.start !== '' && durationWork.afternoon.end !== '') {
            noHat = false;
            let startedAfternoon = timeNow >= this._fromTimeToSecondes(durationWork.afternoon.start);
            let widthAfternoon = this._getWidthElapsed(timeNow, durationWork.afternoon.start, durationWork.afternoon.end);

            ctx.beginPath()
            ctx.fillStyle = timeNow >= this._fromTimeToSecondes(durationWork.afternoon.start) ? "darkred" : "#373737";
            ctx.rect(36, 0, 36, 5);
            ctx.fill();

            ctx.beginPath()
            ctx.fillStyle = widthAfternoon >= 36 ? "#62df16" : "#ffcc00";
            ctx.rect(36, 0, widthAfternoon > 36 ? 36 : widthAfternoon, 6);
            ctx.fill();

            if (startedAfternoon && widthAfternoon < 36) {
                noHatSubtext = false;
                ctx.beginPath();
                ctx.font = "9px Verdana";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.fillStyle = this._blinking && this._tick % 2 ? "black" : "#bfbfbf";
                ctx.fillText(this._formatTime(this._fromTimeToSecondes(durationWork.afternoon.end), timeNow), 54, 13);
            }

            if (timeNow === this._fromTimeToSecondes(durationWork.afternoon.end) && !this._blinking) {
                this._blinking = true;
                this.playAudio();
            }
        }

        if (!noHat) {
            ctx.beginPath()
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.moveTo(36, 0);
            ctx.lineTo(36, 6);
            ctx.stroke();

            ctx.beginPath()
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.moveTo(0, 6);
            ctx.lineTo(72, 6);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.font = "17px Verdana";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = this._blinking && this._tick % 2 ? "black" : "#bfbfbf";
        ctx.fillText(this._formatWithZero(now.getHours()) + ':' + this._formatWithZero(now.getMinutes()), 36, noHat ? 24 : (noHatSubtext ? 28 : 32));

        ctx.font = "11px Verdana";
        ctx.fillStyle = this._blinking && this._tick % 2 ? "black" : "#979797";
        ctx.fillText(this._formatWithZero(now.getSeconds()), 36, noHat ? 42 : (noHatSubtext ? 44 : 48));

        ctx.font = "10px Verdana";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = this._blinking && this._tick % 2 ? "black" : "#979797";
        ctx.fillText(this._getDay(now.getDay()) + " " + this._formatWithZero(now.getDate()) + '/' + this._formatWithZero(now.getMonth() + 1), 36, 68);

        $SD.setImage(this._context, canvas.toDataURL());
    }
}
const clock = new Clock();
