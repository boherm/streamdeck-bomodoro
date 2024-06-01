# Bo'modoro
The `Bo'modoro` is a plugin that helps you to focus on your work by using the Pomodoro Technique. The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s.

## Features

### Timer
- Cycle through the Pomodoro Technique (all durations are customizable)
- Reset the current timer to the beginning by holding the button
- If the current timer is already stopped, we can switch to the next phase by holding the button
- The timer will play alert sound when the time is up
- If you use Phillips Hue, you can trigger a scene when you are on work or not

### Meeting Toogle
- The plugin will automatically pause the main timer when you are in a meeting by one click on the Meeting Toogle
- Once you are out of the meeting, you can resume the main timer by one click on the Meeting Toogle
- If you use Phillips Hue, you can trigger a scene when you are busy or not

### Statistics
- The plugin will keep track of the number of Pomodoro and total time spent on cycles you have completed
- The number of meeting and total time spent on meetings are also tracked
- You can switch between the statistics by clicking on the statistics button
- You can reset the statistics in the settings

### Clock
- The plugin will display the current time in the clock button
- You can set begin and end time for your work hours in the settings for each days of the week
- The clock button will change color and play alert sound to indicate that you reach the end of your work hours

## Quick Start Guide

A short guide to help you get started quickly.

### Clone the repo

```
git clone --recursive https://github.com/boherm/streamdeck-bomodoro
```

### Make symlinks into your streamdeck plugins folder

#### Windows
```
# Note: this works inside the cmd, not on PowerShell
# %cd% gets the full absolute path to the plugin folder
mklink /D C:\Users\%USERNAME%\AppData\Roaming\Elgato\StreamDeck\Plugins\dev.boherm.bomodoro.sdPlugin %cd%\src\dev.boherm.bomodoro.sdPlugin
```

#### MacOS
```
# Using $(pwd) to get the full absolute path to the plugin folder
ln -s $(pwd)/src/dev.boherm.bomodoro.sdPlugin ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/
```