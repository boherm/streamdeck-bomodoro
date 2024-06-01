/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />

$PI.onConnected(async (jsn) => {
    /** Initialisation */
    const formClock = document.querySelector('#form-clock');

    /** Get the global settings */
    let globalConfig = {};
    $PI.getGlobalSettings();

    $PI.onDidReceiveGlobalSettings((jsn) => {
        globalConfig = jsn.payload.settings;

        let clockConfig = globalConfig.clock ?? [
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Sunday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Monday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Tuesday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Wednesday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Thursday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Friday
            {morning: { start: '', end: '' }, afternoon: { start: '', end: '' }}, // Saturday
        ];

        clockConfig.forEach((configDay, dayIdx) => {
            document.getElementsByName(`morning[${dayIdx}][start]`)[0].value = configDay.morning.start;
            document.getElementsByName(`morning[${dayIdx}][end]`)[0].value = configDay.morning.end;
            document.getElementsByName(`afternoon[${dayIdx}][start]`)[0].value = configDay.afternoon.start;
            document.getElementsByName(`afternoon[${dayIdx}][end]`)[0].value = configDay.afternoon.end;
        });

        formClock.addEventListener('submit', (e) => {
            e.preventDefault();
            let newClockConfig = [];
            let formData = Utils.getFormValue(formClock);

            for (let i = 0; i < 7; i++) {
                let morning = {
                    start: formData[`morning[${i}][start]`],
                    end: formData[`morning[${i}][end]`]
                };
                let afternoon = {
                    start: formData[`afternoon[${i}][start]`],
                    end: formData[`afternoon[${i}][end]`]
                };
                newClockConfig.push({ morning, afternoon });
            }

            globalConfig.clock = newClockConfig;
            $PI.setGlobalSettings(globalConfig);
            $PI.sendToPlugin({ event: ConfigEvents.UpdatedClockData });
        });
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
