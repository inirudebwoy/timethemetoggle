const ExtensionUtils = imports.misc.extensionUtils;
const { Adw, Gtk } = imports.gi;
const { gettext: _ } = ExtensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const constants = Me.imports.constants;

function formatValue(button) {
  let value = button.get_value();
  if (!Number.isInteger(value)) {
    value = 0;
  }
  button.set_text(value.toString().padStart(2, "0"));
  return true;
}

function init() {
  ExtensionUtils.initTranslations();
}

function fillPreferencesWindow(window) {
  const page = new Adw.PreferencesPage({
    title: "General",
    icon_name: "dialog-information-symbolic",
  });
  window.add(page);
  window._settings = ExtensionUtils.getSettings();

  let [startTimeHourValue, startTimeMinuteValue] = window._settings
    .get_string(constants.LIGHT_THEME_START_TIME_KEY)
    .split(":");
  let [endTimeHourValue, endTimeMinuteValue] = window._settings
    .get_string(constants.DARK_THEME_START_TIME_KEY)
    .split(":");

  const timeGroup = new Adw.PreferencesGroup({
    title: _("Time Settings"),
    description: _("Please choose time when light theme wil be enabled"),
  });

  const fromLabel = new Gtk.Label({
    label: _("From"),
  });

  const startTimeBox = new Gtk.Box({
    orientation: Gtk.Orientation.HORIZONTAL,
    spacing: 10,
  });

  const startTimeHour = new Gtk.SpinButton({
    adjustment: new Gtk.Adjustment({
      lower: 0,
      upper: 23,
      step_increment: 1,
    }),
  });
  startTimeHour.set_value(parseInt(startTimeHourValue));

  const startTimeMinute = new Gtk.SpinButton({
    adjustment: new Gtk.Adjustment({
      lower: 0,
      upper: 59,
      step_increment: 15,
    }),
  });
  startTimeMinute.set_value(parseInt(startTimeMinuteValue));

  const startColonLabel = new Gtk.Label({
    label: ":",
  });

  startTimeBox.append(fromLabel);
  startTimeBox.append(startTimeHour);
  startTimeBox.append(startColonLabel);
  startTimeBox.append(startTimeMinute);

  const toLabel = new Gtk.Label({
    label: _("To"),
  });

  const endTimeBox = new Gtk.Box({
    orientation: Gtk.Orientation.HORIZONTAL,
    spacing: 10,
  });

  const endTimeHour = new Gtk.SpinButton({
    adjustment: new Gtk.Adjustment({
      lower: 0,
      upper: 23,
      step_increment: 1,
    }),
  });
  endTimeHour.set_value(parseInt(endTimeHourValue));

  const endTimeMinute = new Gtk.SpinButton({
    adjustment: new Gtk.Adjustment({
      lower: 0,
      upper: 59,
      step_increment: 15,
    }),
  });
  endTimeMinute.set_value(parseInt(endTimeMinuteValue));

  const endColonLabel = new Gtk.Label({
    label: ":",
  });

  endTimeBox.append(toLabel);
  endTimeBox.append(endTimeHour);
  endTimeBox.append(endColonLabel);
  endTimeBox.append(endTimeMinute);

  startTimeHour.connect("value-changed", (button) => {
    window._settings.set_string(
      constants.LIGHT_THEME_START_TIME_KEY,
      `${startTimeHour.get_value()}:${startTimeMinute.get_value()}`
    );
  });

  startTimeMinute.connect("value-changed", (button) => {
    window._settings.set_string(
      constants.LIGHT_THEME_START_TIME_KEY,
      `${startTimeHour.get_value()}:${startTimeMinute.get_value()}`
    );
  });

  endTimeHour.connect("value-changed", (button) => {
    window._settings.set_string(
      constants.DARK_THEME_START_TIME_KEY,
      `${endTimeHour.get_value()}:${endTimeMinute.get_value()}`
    );
  });

  endTimeMinute.connect("value-changed", (button) => {
    window._settings.set_string(
      constants.DARK_THEME_START_TIME_KEY,
      `${endTimeHour.get_value()}:${endTimeMinute.get_value()}`
    );
  });

  startTimeHour.connect("output", formatValue);
  startTimeMinute.connect("output", formatValue);
  endTimeHour.connect("output", formatValue);
  endTimeMinute.connect("output", formatValue);

  timeGroup.add(startTimeBox);
  timeGroup.add(endTimeBox);
  page.add(timeGroup);
}
