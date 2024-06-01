class Hue {
    constructor() {
        this._action = new Action(Actions.Hue);
        this._meetingAction = new Action(Actions.InMeetingToggle);
        this._forced = false;
        this._configHue = { active: 'off' };

        this._configAction = new Action(Actions.Config);
        this._registerEvents();
    }

    _getBridgeHost() {
        return `http://${this._configHue.bridgeHost}/api/${this._configHue.bridgeUsername}`;
    }

    _registerEvents() {
        this._configAction.on(ConfigEvents.UpdatedHueData, () => {
            this._configHue = config.getHueConfig();
        });
        this._meetingAction.on(InMeetingEvents.Start, () => {
            this._forced = true;
        });
        this._meetingAction.on(InMeetingEvents.Stop, () => {
            this._forced = false;
        });
        this._action.on(HueEvents.Busy, () => {
            if (this._configHue.active !== 'on') return;
            fetch(`${this._getBridgeHost()}/groups/${this._configHue.idRoom}/action`, {
                method: 'put',
                body: JSON.stringify({ scene: this._configHue.idSceneBusy })}
            );
        });
        this._action.on(HueEvents.Available, () => {
            if (this._configHue.active !== 'on' || this._forced) return;
            fetch(`${this._getBridgeHost()}/groups/${this._configHue.idRoom}/action`, {
                method: 'put',
                body: JSON.stringify({ scene: this._configHue.idSceneAvailable })}
            );
        });
    }

}
const hue = new Hue();
