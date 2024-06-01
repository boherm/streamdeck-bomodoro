/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />

$PI.onConnected((jsn) => {
    document.querySelector('#reset-statistics').addEventListener('click', () => {
        $PI.sendToPlugin({ event: StatisticsEvents.ResetStats });
    });
});
