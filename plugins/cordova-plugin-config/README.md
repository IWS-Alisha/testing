cordova_plugin_config
=====================

This plugin has been inspired by cordova_app_version_plugin available at https://github.com/Binarypark/cordova_app_version_plugin. Currently, it reads a couple of Cordova config.xml global settings, specifically the widget version and the name, and makes them available to www JavaScript.

The settigns are accessible via the cordova.config object that exposes the two functions: getAppVersion and getAppName.

Example:
var nnn = cordova.config.getAppName();

The functions are accessible immediately, with no need to wait for the deviceReady event, since their return values are generated into a JavaScript module, rather that retrieved from the platform environment at run time.

Currently, the support of Android, iOS and Windows is declared.

## Installation

cordova plugin add /local/path/cordova_plugin_config

## Usage

For the following config.xml:

<?xml version='1.0' encoding='utf-8'?>
<widget id="my.app.id" version="1.2.3">
  <name>MyApp</name>
  ...
</widget>

a call to cordova.config.getAppVersion() will return "1.2.3",
a call to cordova.config.getAppName() will return "MyApp".

## How does it work?

The plugin uses a few appropriate hooks, such as 'after_prepare' to generate the 'module.js' under the target platform folder. The file has a plugin implemenation with the exposed setting values generated into it. The 'module.js' file which comes with the plugin provides the plugin module "default" implementation with the version = "0.0.0" and the name = "Unknown", which appearance at run time indicates a plugin hook failure.
The implememtation idea behind the plugin should, in theory, work on any platform (since it does not rely on any native code), but unfortunately it's not the case: the plugin hooks do not fire similarly for all platforms. In fact, it seems that for some platforms they do not fire at all (e.g., blackberry10).
