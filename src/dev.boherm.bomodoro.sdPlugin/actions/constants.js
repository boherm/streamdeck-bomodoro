const Actions = {
    Clock: 'dev.boherm.bomodoro.clock',
    Timer: 'dev.boherm.bomodoro.timer',
    InMeetingToggle: 'dev.boherm.bomodoro.inmeetingtoggle',
    Statistics: 'dev.boherm.bomodoro.statistics',
    Hue: 'dev.boherm.bomodoro.hue',
    Config: 'dev.boherm.bomodoro.config'
}

const ClockEvents = {
    Redraw: 'clock.redraw'
}

const TimerEvents = {
    Redraw: 'timer.redraw',
    Hold: 'timer.hold',
    Unhold: 'timer.unhold'
}

const InMeetingEvents = {
    Start: 'meeting.startMeeting',
    Stop: 'meeting.stopMeeting',
    Redraw: 'meeting.redraw'
}

const StatisticsEvents = {
    Redraw: 'stats.redraw',
    RefreshData: 'stats.refreshData',
    AddEntry: 'stats.addEntry',
    ResetStats: 'stats.resetData'
}

const HueEvents = {
    Busy: 'hue.busy',
    Available: 'hue.available'
}

const ConfigEvents = {
    UpdatedClockData: 'config.updatedData.clock',
    UpdatedTimerData: 'config.updatedData.timer',
    UpdatedStatsData: 'config.updatedData.stats',
    UpdatedHueData: 'config.updatedData.hue'
}
