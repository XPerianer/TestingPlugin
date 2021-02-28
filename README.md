# TestingPlugin 
[![Build Status](https://dev.azure.com/domeier/TestingPlugin/_apis/build/status/XPerianer.TestingPlugin?branchName=main)](https://dev.azure.com/domeier/TestingPlugin/_build/latest?definitionId=1&branchName=main)

<img src="https://user-images.githubusercontent.com/5360508/109419414-a1847080-79cd-11eb-8160-c3a9dc72c8d6.png" width="40%">


## Features

This plugin enables the visualization of relevance and immediate feedback information in the visual studio code source code editor.
It is part of the [ImmediateTestFeedback](https://github.com/XPerianer/ImmediateTestFeedback) ecosystem.
[This annotated screencast](https://vimeo.com/512282859/04ed6920bd) shows some of the basic functionalities.

# Installing and executing TestingPlugin
## Requirements

* A correctly setup and running [TestingBackend](https://github.com/XPerianer/TestingBackend) is needed for the plugin to be run.
* `npm` needs to be available for Visual Studio Code to install and compile the typescript extension.
    An installed nodejs should be detected automatically by Visual Studio Code.


## Loading the extension into the editor

The easiest way to load the extension is by opening up this repository folder inside Visual Studio Code.
Now, the dependencies can be installed in the console integration of Visual Studio Code by executing
```
npm install --production=false
```
(The `--production=false` option might be necessary, if the nodeenv variables are configured to only install production dependencies)
The repository contains the subfolder `.vscode` which already holds the information on how to start the plugin.
Pressing `F5` triggers the editor to open a Visual Studio `Extension Development Host` window.
This looks like another Visual Studio Code editor window, but has `TestingPlugin` loaded.

## Starting the extension in the editor

Before starting the extension, open the repository folder that you want to use the plugin for with the plugin. (That can be configured in the configuration of [TestingBackend](https://github.com/XPerianer/TestingBackend))

TestingPlugin provides the editor action `testingplugin.start` to open a panel with the additional visualization.
Call it by typing in 'Activate Testingplugin' after the `CTRL-SHIFT-P` visual studio code action window opens.
Rearrange the panel to the side by dragging it to the right side of the editor.
In case of flask, it should look somehow similar to this:
![Screenshot of loaded tests](https://user-images.githubusercontent.com/5360508/109419414-a1847080-79cd-11eb-8160-c3a9dc72c8d6.png)

The action `testingplugin.save` is meant to be used for saving the current status of the source code and receiving immediate feedback.
For testing purposes, it can be activated by typing in the command after hitting `CTRL-SHIFT-P`.
To really use the plugin, this command should better be rebinded to, e.g. `CTRL-S`.
Rebinding this inside the editor can be done via the Keyboard Shortcut Settings.
Run `Preferences: Open Keyboard Shortcuts(JSON)` via `CTRL-SHIFT-P`, and insert the following entry inside the JSON:
```
    {
        "key": "ctrl+alt+s",
        "command": "testingPlugin.save"
    },
```
If the source code is modified and tests fail, they should turn red quickly after hitting `CTRL-S`:
![ctrls_red](https://user-images.githubusercontent.com/5360508/109419674-e361e680-79ce-11eb-8500-c593ee2c454d.png)

## Debug Information
Errors inside the plugin code are printed in the Debug Console of the main Visual Studio Code window that was used to start the plugin.
Errors inside the webview can be debugged using the `CTRL-SHIFT-P` dialog and opening the "Webview Developer Tools".

## Settings

###### Be aware that most settings require a restart of the plugin. This can be done by closing the TestingPlugin Panel and then reopening it.`

Settings can be found in the settings ui with `CTRL-SHIFT-P`:Settings.
They are under Extensions -> TestingPlugin.

Different visualization options are possible:
* `Scatter` uses an xy-Scatter plot to display on the y-Axis the relevance of the test for the context, and on the x-Axis the overall failure rate.
* `Table` shows a tabular overview of the failing tests, sorted after relevance.
* `Embedding` uses an embedding of the tests based on their correllation. The relevance is mapped to the size of the circle.

Other options:
* `testingPlugin.desaturateAccordingToTimestamps`: Enables tests that have not been exexuted for a long time to get desaturated color.

