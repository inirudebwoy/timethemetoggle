const ExtensionUtils = imports.misc.extensionUtils;
const { GLib, Gio } = imports.gi;
const Me = ExtensionUtils.getCurrentExtension();
const constants = Me.imports.constants;

class Extension {
  constructor(uuid) {
    this._uuid = uuid;
    this._loopTaskId = null;
    this._currentTheme = null;
    this._settings = null;
    this._handles = [];

    this.lightThemeStartTime = null;
    this.darkThemeStartTime = null;
  }

  enable() {
    this._settings = ExtensionUtils.getSettings();

    this.lightThemeStartTime = this.loadTimeFromSettings(
      constants.LIGHT_THEME_START_TIME_KEY
    );
    this.darkThemeStartTime = this.loadTimeFromSettings(
      constants.DARK_THEME_START_TIME_KEY
    );

    let interfaceSettings = new Gio.Settings({
      schema_id: constants.SCHEME_SETTINGS_PATH,
    });
    this._currentTheme = interfaceSettings.get_string(
      constants.SCHEME_SETTINGS_KEY
    );

    this.applyTimeBasedTheme(interfaceSettings, this._currentTheme);

    this._loopTaskId = GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      60,
      () => {
        console.log("Checking time");
        let currentScheme = interfaceSettings.get_string(
          constants.SCHEME_SETTINGS_KEY
        );
        this.applyTimeBasedTheme(interfaceSettings, currentScheme);
        return GLib.SOURCE_CONTINUE;
      }
    );

    this._handles.push(
      this._settings.connect("changed::light-theme-start-time", () => {
        this.lightThemeStartTime = this.loadTimeFromSettings(
          constants.LIGHT_THEME_START_TIME_KEY
        );
      }),
      this._settings.connect("changed::dark-theme-start-time", () => {
        this.darkThemeStartTime = this.loadTimeFromSettings(
          constants.DARK_THEME_START_TIME_KEY
        );
      })
    );
  }

  loadTimeFromSettings(key) {
    let timeStr = this._settings.get_string(key);
    return this.fromStringToTime(timeStr);
  }

  fromStringToTime(timeStr) {
    let time = new Date();
    let [hours, minutes] = timeStr.split(":");
    time.setHours(hours);
    time.setMinutes(minutes);
    time.setSeconds(0, 0);

    return time;
  }

  applyTimeBasedTheme(interfaceSettings, currentTheme) {
    const lightThemeTime = this.isItLightThemeTime(
      this.lightThemeStartTime,
      this.darkThemeStartTime
    );
    this.updateColorScheme(currentTheme, lightThemeTime, interfaceSettings);
  }

  updateColorScheme(currentTheme, switchToLightTheme, interfaceSettings) {
    let theme = switchToLightTheme
      ? constants.LIGHT_THEME
      : constants.DARK_THEME;
    if (currentTheme != theme) {
      console.log("Setting new scheme to: " + theme);
      try {
        interfaceSettings.set_string(constants.SCHEME_SETTINGS_KEY, theme);
      } catch (error) {
        console.error("Failed to set color scheme:", error);
      }
    }
  }

  isItLightThemeTime(startTime, endTime) {
    let now = new Date();

    return now >= startTime && now < endTime;
  }

  disable() {
    let interfaceSettings = new Gio.Settings({
      schema_id: constants.SCHEME_SETTINGS_PATH,
    });
    interfaceSettings.set_string(
      constants.SCHEME_SETTINGS_KEY,
      this._currentTheme
    );

    if (this._loopTaskId) {
      GLib.Source.remove(this._loopTaskId);
      this._loopTaskId = null;
    }

    this._handles.forEach((id) => {
      this._settings.disconnect(id);
    });
    this._handles = [];
  }
}

function init(meta) {
  return new Extension(meta.uuid);
}
