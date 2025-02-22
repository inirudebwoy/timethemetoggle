const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

var LIGHT_THEME = "prefer-light";
var DARK_THEME = "prefer-dark";
var LIGHT_THEME_START_TIME_KEY = "light-theme-start-time";
var DARK_THEME_START_TIME_KEY = "dark-theme-start-time";
var SCHEME_SETTINGS_PATH = "org.gnome.desktop.interface";
var SCHEME_SETTINGS_KEY = "color-scheme";
