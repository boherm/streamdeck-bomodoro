class Statistics {

    Pages = {
        NumberWork: 'work.number',
        TimeWork: 'work.duration',
        NumberMeetings: 'meeting.number',
        TimeMeetings: 'meeting.duration',
    }

    constructor() {
        this._action = new Action(Actions.Statistics);
        this._pages = [
            this.Pages.NumberWork,
            this.Pages.TimeWork,
            this.Pages.NumberMeetings,
            this.Pages.TimeMeetings
        ];
        this._currentPage = 0;
        this._context = null;
        this._statsData = {};
        this._statsDataCalculated = {
            days: { work: { number: 0, duration: 0 }, meeting: { number: 0, duration: 0 }},
            week: { work: { number: 0, duration: 0 }, meeting: { number: 0, duration: 0 }},
            month: { work: { number: 0, duration: 0 }, meeting: { number: 0, duration: 0 }},
        };

        this._configAction = new Action(Actions.Config);
        this._registerEvents();
    }

    _registerEvents() {
        this._action.onWillAppear(jsn => {
            this._context = jsn.context;
        });

        this._action.onKeyUp(() => {
            this._currentPage = (this._currentPage + 1) > (this._pages.length - 1) ? 0 : this._currentPage + 1;
            this._action.emit(StatisticsEvents.Redraw);
        });

        this._action.on(StatisticsEvents.Redraw, () => {
            this.redraw();
        });

        this._action.on(StatisticsEvents.RefreshData, () => {
            this.calculateGlobalStats();
            this.redraw();
        });

        this._action.on(StatisticsEvents.AddEntry, jsn => {
            const { type, duration } = jsn;
            if (duration > 0) {
                this.addEntry(new Date().toISOString().split('T')[0], type, duration);
            }
        });

        this._action.onSendToPlugin(jsn => {
            if (jsn.payload.event === StatisticsEvents.ResetStats) {
                this._action.emit(StatisticsEvents.ResetStats);
            }
        });

        this._action.on(StatisticsEvents.ResetStats, () => {
            this.resetStatsData();
        });

        this._configAction.on(ConfigEvents.UpdatedStatsData, () => {
            this._statsData = config.getStatsData();
            this._action.emit(StatisticsEvents.RefreshData);
        });
    }

    saveStatsData() {
        config.setStatsData(this._statsData);
    }

    resetStatsData() {
        this._statsData = { days: [] };
        this.saveStatsData();
    }

    addEntry(date, type, duration) {
        const limitDate = new Date();
        limitDate.setHours(0,0,0,0);
        limitDate.setDate(limitDate.getDate() - 40);

        this._statsData.days = this._statsData.days.filter(entry => {
            return new Date(entry.date) >= limitDate;
        });

        this._statsData = {
            ...this._statsData,
            days: [
                ...this._statsData.days,
                { date, type, duration }
            ]
        };

        this.saveStatsData();
    }

    _getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
        let yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        return Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    }

    _formatTime(duration) {
        if (!duration) return '00:00';
        let hours = Math.floor(duration / 3600)
        let minutes = Math.floor((duration - (hours * 3600)) / 60);
        return (hours < 10 ? '0' + hours : hours) + ':' +
            (minutes < 10 ? '0' + minutes : minutes);
    }

    calculateGlobalStats() {
        let today = new Date();

        let day = today.toISOString().split('T')[0];
        let week = today.getFullYear() + '-' + this._getWeekNumber(today);
        let month = today.getFullYear() + '-' + (today.getMonth() + 1);

        ['work', 'meeting'].forEach(type => {
            let filtering = this._statsData?.days?.filter(entry => entry.type === type && entry.date === day);
            this._statsDataCalculated.days[type].number = filtering?.length ?? 0;
            this._statsDataCalculated.days[type].duration = this._formatTime(filtering?.reduce((total, entry) => total + entry.duration, 0));

            filtering = this._statsData?.days?.filter(entry => {
                let entryDate = new Date(entry.date);
                return entry.type === type && entryDate.getFullYear() + '-' + this._getWeekNumber(entryDate) === week
            });
            this._statsDataCalculated.week[type].number = filtering?.length ?? 0;
            this._statsDataCalculated.week[type].duration = this._formatTime(filtering?.reduce((total, entry) => total + entry.duration, 0));

            filtering = this._statsData?.days?.filter(entry => {
                let entryDate = new Date(entry.date);
                return entry.type === type && entryDate.getFullYear() + '-' + (entryDate.getMonth() + 1) === month
            });
            this._statsDataCalculated.month[type].number = filtering?.length ?? 0;
            this._statsDataCalculated.month[type].duration = this._formatTime(filtering?.reduce((total, entry) => total + entry.duration, 0));
        });
    }

    drawData() {

        let pageType = this._pages[this._currentPage];
        let type = pageType.split('.')[0];
        let range = pageType.split('.')[1];

        let title = {
            work: 'WORK',
            meeting: 'MEETINGS'
        }[type];

        let colors = {
            work: {
                normal: 'red',
                dark: 'darkred'
            },
            meeting: {
                normal: '#ffcc00',
                dark: '#816d00'
            }
        }[type];


        let currentDay = new Date();
        currentDay.setHours(0,0,0,0);
        currentDay.setDate(currentDay.getDate() + 2);

        let last7days = [];

        for (let i = 0 ; i < 7 ; i++) {
            currentDay.setDate(currentDay.getDate() - 1);
            let isoDate = currentDay.toISOString().split('T')[0];

            let filtering = this._statsData?.days?.filter(entry => entry.type === type && entry.date === isoDate) ?? [];
            let data = range === 'number' ? filtering.length : filtering.reduce((total, entry) => total + entry.duration, 0);

            last7days.unshift({
                date: isoDate,
                data
            });
        }

        return {
            title,
            colors,
            globalData: {
                day: this._statsDataCalculated.days[type][range],
                week: this._statsDataCalculated.week[type][range],
                month: this._statsDataCalculated.month[type][range]
            },
            last7days
        }
    }

    redraw() {
        let canvas = document.createElement('canvas');
        canvas.width = 72;
        canvas.height = 72;
        let ctx = canvas.getContext('2d');

        let data = this.drawData();

        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.strokeStyle = data.colors.normal;

        let day = 0;
        let x = 8;

        let min7days = data.last7days.reduce((previous, current) => {
            return current.data < previous.data ? current : previous;
        }).data;
        let max7days = data.last7days.reduce((previous, current) => {
            return current.data > previous.data ? current : previous;
        }).data;

        while (day < 7) {
            let dayInfos = data.last7days[day];
            let dayObj = new Date(dayInfos.date);
            let y = (dayInfos.data - min7days) / (max7days - min7days) * (55 - 70) + 70;
            let needDark = dayObj.getDay() === 6 || dayObj.getDay() === 0;
            ctx.beginPath();
            ctx.moveTo(x, 72);
            ctx.lineTo(x, isNaN(y) ? 70 : y);
            ctx.strokeStyle = needDark ? data.colors.dark : data.colors.normal;
            ctx.stroke();
            x += 9;
            day++;
        }

        ctx.fillStyle = data.colors.normal;
        ctx.textAlign = "center";
        ctx.font = "bold 8px Verdana";
        ctx.fillText(data.title, 36, 8);

        ctx.font = "bold 10px Verdana";
        ctx.fillText('D', 10, 21);
        ctx.fillText('W', 10, 33);
        ctx.fillText('M', 10, 45);

        ctx.font = "10px Verdana";
        ctx.textAlign = "right";
        ctx.fillStyle = "white";
        ctx.fillText(data.globalData.day, 65, 21);
        ctx.fillText(data.globalData.week, 65, 33);
        ctx.fillText(data.globalData.month, 65, 45);

        $SD.setImage(this._context, canvas.toDataURL());
    }
}
const statistics = new Statistics();