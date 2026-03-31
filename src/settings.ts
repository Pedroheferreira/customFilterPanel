import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

// ─── Botão Filtrar ────────────────────────────────────────────────────────────

class TriggerBtnCard extends FormattingSettingsCard {
    label = new formattingSettings.TextInput({
        name: "label",
        displayName: "Texto",
        placeholder: "Filtrar",
        value: "Filtros",
    });
    bgColor = new formattingSettings.ColorPicker({
        name: "bgColor",
        displayName: "Cor de fundo",
        value: { value: "transparent" },
    });
    textColor = new formattingSettings.ColorPicker({
        name: "textColor",
        displayName: "Cor do texto",
        value: { value: "#2a2d36" },
    });
    borderColor = new formattingSettings.ColorPicker({
        name: "borderColor",
        displayName: "Cor da borda",
        value: { value: "#c8ccd4" },
    });
    borderRadius = new formattingSettings.NumUpDown({
        name: "borderRadius",
        displayName: "Arredondamento (px)",
        value: 8,
    });
    alignment = new formattingSettings.ItemDropdown({
        name: "alignment",
        displayName: "Alinhamento",
        items: [
            { value: "flex-start", displayName: "Esquerda" },
            { value: "center",     displayName: "Centro"   },
            { value: "flex-end",   displayName: "Direita"  },
        ],
        value: { value: "flex-start", displayName: "Esquerda" },
    });

    name: string = "triggerBtn";
    displayName: string = "Botão Filtrar";
    slices: FormattingSettingsSlice[] = [
        this.label, this.bgColor, this.textColor,
        this.borderColor, this.borderRadius, this.alignment
    ];
}

// ─── Painel de Filtros ────────────────────────────────────────────────────────

class PanelCard extends FormattingSettingsCard {
    title = new formattingSettings.TextInput({
        name: "title",
        displayName: "Título",
        placeholder: "Filtros",
        value: "Filtros",
    });
    bgColor = new formattingSettings.ColorPicker({
        name: "bgColor",
        displayName: "Cor de fundo",
        value: { value: "#ffffff" },
    });
    headerBgColor = new formattingSettings.ColorPicker({
        name: "headerBgColor",
        displayName: "Cor de fundo do cabeçalho",
        value: { value: "#ffffff" },
    });
    headerTextColor = new formattingSettings.ColorPicker({
        name: "headerTextColor",
        displayName: "Cor do texto do cabeçalho",
        value: { value: "#1e2029" },
    });
    showSearch = new formattingSettings.ToggleSwitch({
        name: "showSearch",
        displayName: "Mostrar busca",
        value: true,
    });

    name: string = "panel";
    displayName: string = "Painel de Filtros";
    slices: FormattingSettingsSlice[] = [
        this.title, this.bgColor, this.headerBgColor, this.headerTextColor, this.showSearch
    ];
}

// ─── Grupos ───────────────────────────────────────────────────────────────────

class GroupsCard extends FormattingSettingsCard {
    titleColor = new formattingSettings.ColorPicker({
        name: "titleColor",
        displayName: "Cor do título do grupo",
        value: { value: "#A020F0" },
    });
    itemTextColor = new formattingSettings.ColorPicker({
        name: "itemTextColor",
        displayName: "Cor dos itens",
        value: { value: "#444444" },
    });
    itemHoverBg = new formattingSettings.ColorPicker({
        name: "itemHoverBg",
        displayName: "Cor de fundo hover",
        value: { value: "#f5f6f8" },
    });
    itemSelectedBg = new formattingSettings.ColorPicker({
        name: "itemSelectedBg",
        displayName: "Cor de fundo selecionado",
        value: { value: "#fef2f3" },
    });

    name: string = "groups";
    displayName: string = "Grupos";
    slices: FormattingSettingsSlice[] = [
        this.titleColor, this.itemTextColor, this.itemHoverBg, this.itemSelectedBg
    ];
}

// ─── Botão Limpar ────────────────────────────────────────────────────────────

class ApplyBtnCard extends FormattingSettingsCard {
    label = new formattingSettings.TextInput({
        name: "label",
        displayName: "Texto",
        placeholder: "Limpar",
        value: "Limpar Filtros"
    });
    bgColor = new formattingSettings.ColorPicker({
        name: "bgColor",
        displayName: "Cor de fundo",
        value: { value: "#ffffff" }
    });
    textColor = new formattingSettings.ColorPicker({
        name: "textColor",
        displayName: "Cor do texto",
        value: { value: "#060606ff" },
    });
    borderColor = new formattingSettings.ColorPicker({
        name: "borderColor",
        displayName: "Cor da borda",
        value: { value: "#e0e3ea" },
    });
    // ── Hover ──
    hoverBgColor = new formattingSettings.ColorPicker({
        name: "hoverBgColor",
        displayName: "Cor de fundo (hover)",
        value: { value: "#fef2f3" },
    });
    hoverTextColor = new formattingSettings.ColorPicker({
        name: "hoverTextColor",
        displayName: "Cor do texto (hover)",
        value: { value: "#A020F0" },
    });
    hoverBorderColor = new formattingSettings.ColorPicker({
        name: "hoverBorderColor",
        displayName: "Cor da borda (hover)",
        value: { value: "#A020F0" },
    });
    borderRadius = new formattingSettings.NumUpDown({
        name: "borderRadius",
        displayName: "Arredondamento (px)",
        value: 6,
    });

    name: string = "applyBtn";
    displayName: string = "Botão Limpar";
    slices: FormattingSettingsSlice[] = [
        this.label,
        this.bgColor, this.textColor, this.borderColor,
        this.hoverBgColor, this.hoverTextColor, this.hoverBorderColor,
        this.borderRadius
    ];
}

// ─── Checkbox ────────────────────────────────────────────────────────────────

class CheckboxCard extends FormattingSettingsCard {
    checkedColor = new formattingSettings.ColorPicker({
        name: "checkedColor",
        displayName: "Cor quando marcado",
        value: { value: "#A020F0" },
    });
    multiSelect = new formattingSettings.ToggleSwitch({
        name: "multiSelect",
        displayName: "Seleção múltipla",
        value: true,   // true = multi por padrão
    });

    name: string = "checkbox";
    displayName: string = "Checkbox";
    slices: FormattingSettingsSlice[] = [
        this.checkedColor,
        this.multiSelect,
    ];
}

// ─── Seleção por Campo ────────────────────────────────────────────────────────

class FieldConfigCard extends FormattingSettingsCard {
    field0multiSelect  = new formattingSettings.ToggleSwitch({ name: "field0multiSelect",  displayName: "Campo 1 — Multi Seleção",  value: true });
    field1multiSelect  = new formattingSettings.ToggleSwitch({ name: "field1multiSelect",  displayName: "Campo 2 — Multi Seleção",  value: true });
    field2multiSelect  = new formattingSettings.ToggleSwitch({ name: "field2multiSelect",  displayName: "Campo 3 — Multi Seleção",  value: true });
    field3multiSelect  = new formattingSettings.ToggleSwitch({ name: "field3multiSelect",  displayName: "Campo 4 — Multi Seleção",  value: true });
    field4multiSelect  = new formattingSettings.ToggleSwitch({ name: "field4multiSelect",  displayName: "Campo 5 — Multi Seleção",  value: true });
    field5multiSelect  = new formattingSettings.ToggleSwitch({ name: "field5multiSelect",  displayName: "Campo 6 — Multi Seleção",  value: true });
    field6multiSelect  = new formattingSettings.ToggleSwitch({ name: "field6multiSelect",  displayName: "Campo 7 — Multi Seleção",  value: true });
    field7multiSelect  = new formattingSettings.ToggleSwitch({ name: "field7multiSelect",  displayName: "Campo 8 — Multi Seleção",  value: true });
    field8multiSelect  = new formattingSettings.ToggleSwitch({ name: "field8multiSelect",  displayName: "Campo 9 — Multi Seleção",  value: true });
    field9multiSelect  = new formattingSettings.ToggleSwitch({ name: "field9multiSelect",  displayName: "Campo 10 — Multi Seleção", value: true });
    field10multiSelect = new formattingSettings.ToggleSwitch({ name: "field10multiSelect", displayName: "Campo 11 — Multi Seleção", value: true });
    field11multiSelect = new formattingSettings.ToggleSwitch({ name: "field11multiSelect", displayName: "Campo 12 — Multi Seleção", value: true });
    field12multiSelect = new formattingSettings.ToggleSwitch({ name: "field12multiSelect", displayName: "Campo 13 — Multi Seleção", value: true });
    field13multiSelect = new formattingSettings.ToggleSwitch({ name: "field13multiSelect", displayName: "Campo 14 — Multi Seleção", value: true });
    field14multiSelect = new formattingSettings.ToggleSwitch({ name: "field14multiSelect", displayName: "Campo 15 — Multi Seleção", value: true });

    name: string = "fieldConfig";
    displayName: string = "Seleção por Campo";
    slices: FormattingSettingsSlice[] = [
        this.field0multiSelect,  this.field1multiSelect,  this.field2multiSelect,
        this.field3multiSelect,  this.field4multiSelect,  this.field5multiSelect,
        this.field6multiSelect,  this.field7multiSelect,  this.field8multiSelect,
        this.field9multiSelect,  this.field10multiSelect, this.field11multiSelect,
        this.field12multiSelect, this.field13multiSelect, this.field14multiSelect,
    ];
}

// ─── Model completo ───────────────────────────────────────────────────────────

export class FilterSlicerSettingsModel extends FormattingSettingsModel {
    triggerBtn  = new TriggerBtnCard();
    panel       = new PanelCard();
    groups      = new GroupsCard();
    applyBtn    = new ApplyBtnCard();
    checkbox    = new CheckboxCard();
    fieldConfig = new FieldConfigCard();  // ← adicionado

    cards: FormattingSettingsCard[] = [
        this.triggerBtn, this.panel, this.groups,
        this.applyBtn, this.checkbox, this.fieldConfig  // ← adicionado
    ];
}