class Config {
    constructor() {
        this._action = new Action(Actions.Config);
        this._globalConfig = {};
        this._registerEvents();
    }

    _getGlobalConfig() {
        $SD.getGlobalSettings();
    }

    _registerEvents() {
        $SD.onConnected(() => {
            this._getGlobalConfig();
        });
        $SD.onDidReceiveGlobalSettings(jsn => {
            this._globalConfig = jsn.payload.settings;
            this._action.emit(ConfigEvents.UpdatedClockData);
            this._action.emit(ConfigEvents.UpdatedStatsData);
            this._action.emit(ConfigEvents.UpdatedTimerData);
            this._action.emit(ConfigEvents.UpdatedHueData);
        });

        this._action.onSendToPlugin(jsn => {
            if (
                jsn.payload.event === ConfigEvents.UpdatedClockData ||
                jsn.payload.event === ConfigEvents.UpdatedTimerData ||
                jsn.payload.event === ConfigEvents.UpdatedHueData
            ) {
                this._action.emit(jsn.payload.event);
            }
        });
    }

    getStatsData() {
        return this._globalConfig.stats ?? { days: [] };
    }

    setStatsData(data) {
        this._globalConfig.stats = data;
        $SD.setGlobalSettings(this._globalConfig);
        this._action.emit(ConfigEvents.UpdatedStatsData);
    }

    getTimerConfig() {
        return this._globalConfig.timer ?? {
            durations: {
                work: 25,
                short: 5,
                long: 15
            }
        };
    }

    getHueConfig() {
        return this._globalConfig.hue ?? {
            active: 'off',
            bridgeHost: '',
            bridgeUsername: '',
            idRoom: '',
            idSceneAvailable: '',
            idSceneBusy: ''
        };
    }

    getClockConfig() {
        return this._globalConfig.clock ?? [
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Sunday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Monday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Tuesday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Wednesday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Thursday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Friday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Saturday
        ];
    }
}
const config = new Config();