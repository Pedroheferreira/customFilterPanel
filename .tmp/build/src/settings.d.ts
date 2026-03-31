import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
declare class TriggerBtnCard extends FormattingSettingsCard {
    label: formattingSettings.TextInput;
    bgColor: formattingSettings.ColorPicker;
    textColor: formattingSettings.ColorPicker;
    borderColor: formattingSettings.ColorPicker;
    borderRadius: formattingSettings.NumUpDown;
    alignment: formattingSettings.ItemDropdown;
    name: string;
    displayName: string;
    slices: FormattingSettingsSlice[];
}
declare class PanelCard extends FormattingSettingsCard {
    title: formattingSettings.TextInput;
    bgColor: formattingSettings.ColorPicker;
    headerBgColor: formattingSettings.ColorPicker;
    headerTextColor: formattingSettings.ColorPicker;
    showSearch: formattingSettings.ToggleSwitch;
    name: string;
    displayName: string;
    slices: FormattingSettingsSlice[];
}
declare class GroupsCard extends FormattingSettingsCard {
    titleColor: formattingSettings.ColorPicker;
    itemTextColor: formattingSettings.ColorPicker;
    itemHoverBg: formattingSettings.ColorPicker;
    itemSelectedBg: formattingSettings.ColorPicker;
    name: string;
    displayName: string;
    slices: FormattingSettingsSlice[];
}
declare class ApplyBtnCard extends FormattingSettingsCard {
    label: formattingSettings.TextInput;
    bgColor: formattingSettings.ColorPicker;
    textColor: formattingSettings.ColorPicker;
    borderColor: formattingSettings.ColorPicker;
    hoverBgColor: formattingSettings.ColorPicker;
    hoverTextColor: formattingSettings.ColorPicker;
    hoverBorderColor: formattingSettings.ColorPicker;
    borderRadius: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: FormattingSettingsSlice[];
}
declare class CheckboxCard extends FormattingSettingsCard {
    checkedColor: formattingSettings.ColorPicker;
    multiSelect: formattingSettings.ToggleSwitch;
    name: string;
    displayName: string;
    slices: FormattingSettingsSlice[];
}
declare class FieldConfigCard extends FormattingSettingsCard {
    field0multiSelect: formattingSettings.ToggleSwitch;
    field1multiSelect: formattingSettings.ToggleSwitch;
    field2multiSelect: formattingSettings.ToggleSwitch;
    field3multiSelect: formattingSettings.ToggleSwitch;
    field4multiSelect: formattingSettings.ToggleSwitch;
    field5multiSelect: formattingSettings.ToggleSwitch;
    field6multiSelect: formattingSettings.ToggleSwitch;
    field7multiSelect: formattingSettings.ToggleSwitch;
    field8multiSelect: formattingSettings.ToggleSwitch;
    field9multiSelect: formattingSettings.ToggleSwitch;
    field10multiSelect: formattingSettings.ToggleSwitch;
    field11multiSelect: formattingSettings.ToggleSwitch;
    field12multiSelect: formattingSettings.ToggleSwitch;
    field13multiSelect: formattingSettings.ToggleSwitch;
    field14multiSelect: formattingSettings.ToggleSwitch;
    name: string;
    displayName: string;
    slices: FormattingSettingsSlice[];
}
export declare class FilterSlicerSettingsModel extends FormattingSettingsModel {
    triggerBtn: TriggerBtnCard;
    panel: PanelCard;
    groups: GroupsCard;
    applyBtn: ApplyBtnCard;
    checkbox: CheckboxCard;
    fieldConfig: FieldConfigCard;
    cards: FormattingSettingsCard[];
}
export {};
