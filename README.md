# testingplugin README
[![Build Status](https://dev.azure.com/domeier/TestingPlugin/_apis/build/status/XPerianer.TestingPlugin?branchName=main)](https://dev.azure.com/domeier/TestingPlugin/_build/latest?definitionId=1&branchName=main)

This plugin enables the visualization of relevance and immediate feedback information in the visual studio code source code editor.
It is part of the [ImmediateTestFeedback](https://github.com/XPerianer/ImmediateTestFeedback) ecosystem.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Running the Extension

TestingPlugin provides the editor action `testingplugin.start` to open a panel with the additional visualization.
The easiest way to call it is by typing in 'Activate Testingplugin' after the `CTRL-SHIF-P` visual studio code action window open.
In case of flask, it should look somehow similar to this:
# TODO add picture

The action `testingplugin.save` is meant to be used for saving the current status of the source code and receiving immediate feedback. For testing purposes, it can also be activated by typing in the command after hitting `CTRL-SHIFT-P`.
To really use the plugin, this command should better be rebinded to, e.g. `CTRL-S`.
Rebinding this inside the editor is easy.
Run `Preferences: Open Keyboard Shortcuts(JSON)` via `CTRL-SHIFT-P`, and insert the following entry inside the JSON:
```
    {
        "key": "ctrl+alt+s",
        "command": "testingPlugin.save"
    },
```
Now, test should turn red if executed, like this
# TODO add picture

## Settings

Different visualization options are possible:

* `testingPlugin.enable`: enable/disable this extension
* `testingPlugin.thing`: set to `blah` to do something

