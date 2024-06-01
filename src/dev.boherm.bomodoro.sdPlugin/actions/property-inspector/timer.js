/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />

$PI.onConnected(async (jsn) => {
    /** Initialisation */
    const formDurations = document.querySelector('#form-durations');
    const formHue = document.querySelector('#form-hue');

    /** Get the global settings */
    let globalConfig = {};
    $PI.getGlobalSettings();

    $PI.onDidReceiveGlobalSettings((jsn) => {
        globalConfig = jsn.payload.settings;

        // Set the timer form values
        Utils.setFormValue(globalConfig.timer?.durations ?? {
            work: 25,
            short: 5,
            long: 15
        }, formDurations);

        // Set the timer form values
        Utils.setFormValue(globalConfig.hue ?? {
            active: 'off',
            bridgeHost: '',
            bridgeUsername: '',
            idRoom: '',
            idSceneAvailable: '',
            idSceneBusy: ''
        }, formHue);
    });

    /** Form for the timer durations */

    formDurations.addEventListener('submit', (e) => {
        e.preventDefault();
        const values = Utils.getFormValue(formDurations);
        values['work'] = isNaN(parseInt(values['work'])) ? 25 : parseInt(values['work']);
        values['short'] = isNaN(parseInt(values['short'])) ? 5 : parseInt(values['short']);
        values['long'] = isNaN(parseInt(values['long'])) ? 15 : parseInt(values['long']);

        globalConfig.timer = { durations: values };

        Utils.setFormValue(globalConfig.timer.durations, formDurations);
        $PI.setGlobalSettings(globalConfig);
        $PI.sendToPlugin({ event: ConfigEvents.UpdatedTimerData });
    });

    /** Form for the hue settings */
    formHue.addEventListener('submit', (e) => {
        e.preventDefault();
        globalConfig.hue = Utils.getFormValue(formHue);
        $PI.setGlobalSettings(globalConfig);
        $PI.sendToPlugin({ event: ConfigEvents.UpdatedHueData });
    });
});

/**
 * TABS
 * ----
 * 
 * This will make the tabs interactive:
 * - clicking on a tab will make it active
 * - clicking on a tab will show the corresponding content
 * - clicking on a tab will hide the content of all other tabs
 * - a tab must have the class "tab"
 * - a tab must have a data-target attribute that points to the id of the content
 * - the content must have the class "tab-content"
 * - the content must have an id that matches the data-target attribute of the tab
 * 
 *  <div class="tab selected" data-target="#tab1" title="Show some inputs">Inputs</div>
 *  <div class="tab" data-target="#tab2" title="Here's some text-areas">Text</div>
 * a complete tab-example can be found in the index.html
   <div type="tabs" class="sdpi-item">
      <div class="sdpi-item-label empty"></div>
      <div class="tabs">
        <div class="tab selected" data-target="#tab1" title="Show some inputs">Inputs</div>
        <div class="tab" data-target="#tab2" title="Here's some text-areas">Text</div>
      </div>
    </div>
    <hr class="tab-separator" />
 * You can use the code below to activate the tabs (`activateTabs` and `clickTab` are required)
 */

function activateTabs(activeTab) {
    const allTabs = Array.from(document.querySelectorAll('.tab'));
    let activeTabEl = null;
    allTabs.forEach((el, i) => {
        el.onclick = () => clickTab(el);
        if(el.dataset?.target === activeTab) {
            activeTabEl = el;
        }
    });
    if(activeTabEl) {
        clickTab(activeTabEl);
    } else if(allTabs.length) {
        clickTab(allTabs[0]);
    }
}

function clickTab(clickedTab) {
    const allTabs = Array.from(document.querySelectorAll('.tab'));
    allTabs.forEach((el, i) => el.classList.remove('selected'));
    clickedTab.classList.add('selected');
    activeTab = clickedTab.dataset?.target;
    allTabs.forEach((el, i) => {
        if(el.dataset.target) {
            const t = document.querySelector(el.dataset.target);
            if(t) {
                t.style.display = el == clickedTab ? 'block' : 'none';
            }
        }
    });
}

activateTabs();
