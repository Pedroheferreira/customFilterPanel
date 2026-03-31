"use strict";

import powerbi from "powerbi-visuals-api";
import DataView                 = powerbi.DataView;
import IVisual                  = powerbi.extensibility.visual.IVisual;
import IVisualHost              = powerbi.extensibility.visual.IVisualHost;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions      = powerbi.extensibility.visual.VisualUpdateOptions;
import FilterAction             = powerbi.FilterAction;

import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { FilterSlicerSettingsModel }  from "./settings";

interface FieldGroup {
    name:        string;
    table:       string;
    column:      string;
    propName:    string;
    items:       FieldItem[];
    isExpanded:  boolean;
    multiSelect: boolean;   // ← NOVO: por campo
}

interface FieldItem {
    label:    string;
    rawValue: powerbi.PrimitiveValue | null;
    selected: boolean;
}

interface Settings {
    triggerLabel:    string;
    triggerBg:       string;
    triggerColor:    string;
    triggerBorder:   string;
    radius:          number;
    panelTitle:      string;
    panelBg:         string;
    panelHeaderBg:   string;
    panelHeaderText: string;
    showSearch:      boolean;
    groupTitleColor: string;
    itemTextColor:   string;
    itemHoverBg:     string;
    itemSelectedBg:  string;
    accentColor:     string;
    multiSelect:     boolean;
    alignment:       string;
}

export class Visual implements IVisual {

    private host:                      IVisualHost;
    private rootEl:                    HTMLElement;
    private triggerEl:                 HTMLElement;
    private panelEl:                   HTMLElement;
    private formattingSettings:        FilterSlicerSettingsModel | null = null;
    private formattingSettingsService: FormattingSettingsService;

    private groups:        FieldGroup[] = [];
    private panelOpen:     boolean      = false;
    private expandedState: Map<string, boolean> = new Map();
    private selected:      Map<string, powerbi.PrimitiveValue | null> = new Map();

    private outsideClickHandler: ((e: MouseEvent) => void) | null = null;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.formattingSettingsService = new FormattingSettingsService();

        this.rootEl = document.createElement("div");
        this.rootEl.style.cssText = "position:relative;width:100%;height:100%;";
        options.element.appendChild(this.rootEl);

        this.triggerEl = document.createElement("div");
        this.rootEl.appendChild(this.triggerEl);

        this.panelEl = document.createElement("div");
        this.panelEl.style.display = "none";
        document.body.appendChild(this.panelEl);

        this.injectStyles();
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────

    public update(options: VisualUpdateOptions): void {
        try {
            const dv = options.dataViews?.[0];

            this.formattingSettings = this.formattingSettingsService
                .populateFormattingSettingsModel(FilterSlicerSettingsModel, dv);

            this.groups = this.buildGroups(dv);
            this.syncFromJsonFilters(options.jsonFilters);
            this.renderTrigger();

            if (this.panelOpen) {
                this.renderPanel();
                this.positionPanel();
            }
        } catch (e) {
            console.error("[FilterPanel] update() error:", e);
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    // ─── SETTINGS ────────────────────────────────────────────────────────────

    private getSettings(): Settings {
        const defaults: Settings = {
            triggerLabel:    "Filtros",
            triggerBg:       "#ffffff",
            triggerColor:    "#2a2d36",
            triggerBorder:   "#c8ccd4",
            radius:          8,
            panelTitle:      "Filtros",
            panelBg:         "#ffffff",
            panelHeaderBg:   "#ffffff",
            panelHeaderText: "#1e2029",
            showSearch:      true,
            groupTitleColor: "#A020F0",
            itemTextColor:   "#444444",
            itemHoverBg:     "#f5f6f8",
            itemSelectedBg:  "#f0e8ff",
            accentColor:     "#A020F0",
            multiSelect:     true,
            alignment:      "flex-start"
        };

        const f = this.formattingSettings;
        if (!f) return defaults;

        try {
            return {
                triggerLabel:    String(f.triggerBtn?.label?.value        ?? defaults.triggerLabel),
                triggerBg:       String((f.triggerBtn?.bgColor?.value     as any)?.value ?? defaults.triggerBg),
                triggerColor:    String((f.triggerBtn?.textColor?.value   as any)?.value ?? defaults.triggerColor),
                triggerBorder:   String((f.triggerBtn?.borderColor?.value as any)?.value ?? defaults.triggerBorder),
                radius:          Number(f.triggerBtn?.borderRadius?.value ?? defaults.radius),
                panelTitle:      String(f.panel?.title?.value             ?? defaults.panelTitle),
                panelBg:         String((f.panel?.bgColor?.value          as any)?.value ?? defaults.panelBg),
                panelHeaderBg:   String((f.panel?.headerBgColor?.value    as any)?.value ?? defaults.panelHeaderBg),
                panelHeaderText: String((f.panel?.headerTextColor?.value  as any)?.value ?? defaults.panelHeaderText),
                showSearch:      Boolean(f.panel?.showSearch?.value       ?? defaults.showSearch),
                groupTitleColor: String((f.groups?.titleColor?.value      as any)?.value ?? defaults.groupTitleColor),
                itemTextColor:   String((f.groups?.itemTextColor?.value   as any)?.value ?? defaults.itemTextColor),
                itemHoverBg:     String((f.groups?.itemHoverBg?.value     as any)?.value ?? defaults.itemHoverBg),
                itemSelectedBg:  String((f.groups?.itemSelectedBg?.value  as any)?.value ?? defaults.itemSelectedBg),
                accentColor:     String((f.checkbox?.checkedColor?.value  as any)?.value ?? defaults.accentColor),
                multiSelect:     Boolean(f.checkbox?.multiSelect?.value   ?? defaults.multiSelect),
                alignment:       String((f.triggerBtn?.alignment?.value as any)?.value ?? defaults.alignment),
            };
        } catch (e) {
            return defaults;
        }
    }

        private getFieldMultiSelect(idx: number): boolean {
        const f = this.formattingSettings;
        if (!f?.fieldConfig) return true; // padrão: multi

        const key = `field${idx}multiSelect` as keyof typeof f.fieldConfig;
        const val = f.fieldConfig[key] as any;
        if (val && typeof val.value === "boolean") return val.value;
        return true;
    }

    // ─── PARSE QUERYNAME ─────────────────────────────────────────────────────

    private parseQN(qn: string): { table: string; column: string } {
        let m = qn.match(/^'([^']+)'\[([^\]]+)\]$/);
        if (m) return { table: m[1], column: m[2] };

        m = qn.match(/^([^\[]+)\[([^\]]+)\]$/);
        if (m) return { table: m[1].trim(), column: m[2] };

        const dot = qn.lastIndexOf(".");
        if (dot > 0) return { table: qn.substring(0, dot), column: qn.substring(dot + 1) };

        return { table: qn, column: qn };
    }

    // ─── BUILD GROUPS ────────────────────────────────────────────────────────

    private buildGroups(dv: DataView | undefined): FieldGroup[] {
        if (!dv?.categorical?.categories) return [];

        return dv.categorical.categories.map((cat, idx) => {
            const name = cat.source.displayName ?? `Campo ${idx + 1}`;
            const qn   = cat.source.queryName   ?? "";
            const { table, column } = this.parseQN(qn);
            const propName = `filter${idx + 1}`;

            const seen  = new Set<string>();
            const items: FieldItem[] = [];
            (cat.values ?? []).forEach(v => {
                const label = v != null ? String(v) : "(Em branco)";
                if (seen.has(label)) return;
                seen.add(label);
                items.push({
                    label,
                    rawValue: v as powerbi.PrimitiveValue | null,
                    selected: this.selected.has(`${propName}||${label}`),
                });
            });
            items.sort((a, b) => a.label.localeCompare(b.label));

            const isExpanded  = this.expandedState.get(name) ?? (idx === 0);
            const multiSelect = this.getFieldMultiSelect(idx); // ← NOVO

            return { name, table, column, propName, items, isExpanded, multiSelect };
        });
    }

    // ─── SYNC FROM JSON FILTERS ──────────────────────────────────────────────

    private syncFromJsonFilters(jsonFilters?: powerbi.IFilter[]): void {
        console.log("[SYNC] jsonFilters recebidos:", JSON.stringify(jsonFilters));

        if (!jsonFilters?.length) {
            this.groups.forEach(g => {
                g.items.forEach(item => {
                    item.selected = this.selected.has(`${g.propName}||${item.label}`);
                });
            });
            return;
        }

        const newSelected = new Map<string, powerbi.PrimitiveValue | null>();

        for (const jf of jsonFilters) {
            const f = jf as any;
            if (!f?.target?.table || !Array.isArray(f?.values)) continue;

            const group = this.groups.find(g =>
                g.table.toLowerCase()  === String(f.target.table).toLowerCase() &&
                g.column.toLowerCase() === String(f.target.column).toLowerCase()
            );
            if (!group) continue;

            for (const v of f.values) {
                const label = v != null ? String(v) : "(Em branco)";
                newSelected.set(`${group.propName}||${label}`, v);
            }
        }

        this.selected = newSelected;

        this.groups.forEach(g => {
            g.items.forEach(item => {
                item.selected = this.selected.has(`${g.propName}||${item.label}`);
            });
        });
    }

    // ─── OPEN / CLOSE PANEL ──────────────────────────────────────────────────

    private openPanel(): void {
        this.panelOpen = true;
        this.renderTrigger();
        this.renderPanel();
        this.positionPanel();

        this.outsideClickHandler = (e: MouseEvent) => {
            if (!this.panelEl.contains(e.target as Node) &&
                !this.triggerEl.contains(e.target as Node)) {
                this.closePanel();
            }
        };
        setTimeout(() => {
            document.addEventListener("click", this.outsideClickHandler!);
        }, 0);
    }

    private closePanel(): void {
        this.panelOpen = false;
        this.panelEl.style.display = "none";
        this.renderTrigger();

        if (this.outsideClickHandler) {
            document.removeEventListener("click", this.outsideClickHandler);
            this.outsideClickHandler = null;
        }
    }

    private clearFilters(): void {
        this.selected.clear();
        this.groups.forEach(g => {
            g.items.forEach(i => i.selected = false);
        });
        this.host.applyJsonFilter(null, "general", "filter", FilterAction.remove);
        this.renderPanel();
        this.renderTrigger();
    }

    // ─── APPLY FILTERS ───────────────────────────────────────────────────────

private applyFilters(): void {
    const activeGroups = this.groups.filter(g => g.items.some(i => i.selected));

    if (activeGroups.length === 0) {
        // Remove tudo de uma vez
        this.host.applyJsonFilter([], "general", "filter", FilterAction.remove);
        this.closePanel();
        return;
    }

    // Monta todos os filtros num array único
    const filters = activeGroups.map(group => ({
        $schema:    "http://powerbi.com/product/schema#basic",
        filterType: 1,
        target:     { table: group.table, column: group.column },
        operator:   "In",
        values:     group.items
            .filter(i => i.selected)
            .map(i => {
                const v = i.rawValue;
                if (v === null || v === undefined) return null;
                if (v instanceof Date) return v.toISOString();
                return v;
            }),
    }));

    console.log("[FilterPanel] Enviando todos os filtros:", JSON.stringify(filters));

    // ✅ Um único applyJsonFilter com array
    this.host.applyJsonFilter(
        filters as unknown as powerbi.IFilter,
        "general",
        "filter",
        FilterAction.merge
    );

    this.closePanel();
}

    // ─── POSITION PANEL ──────────────────────────────────────────────────────

    private positionPanel(): void {
        const rect = this.triggerEl.getBoundingClientRect();
        const s    = this.getSettings();

        this.panelEl.style.position = "fixed";
        this.panelEl.style.top      = `${rect.bottom + 4}px`;
        this.panelEl.style.zIndex   = "2147483647";

        // Remove posições anteriores
        this.panelEl.style.left      = "";
        this.panelEl.style.right     = "";
        this.panelEl.style.transform = "";

        const panelWidth = 280;

        if (s.alignment === "flex-end") {
            // Painel alinhado à direita do botão
            // Usa right calculado a partir da borda direita da janela
            const rightFromEdge = window.innerWidth - rect.right;
            this.panelEl.style.right = `${rightFromEdge}px`;

        } else if (s.alignment === "center") {
            // Painel centralizado em relação ao botão
            const btnCenter = rect.left + rect.width / 2;
            let left = btnCenter - panelWidth / 2;
            // Garante que não saia da tela
            left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8));
            this.panelEl.style.left = `${left}px`;

        } else {
            // flex-start: painel alinhado à esquerda do botão
            this.panelEl.style.left = `${rect.left}px`;
        }
    }

    // ─── RENDER TRIGGER ──────────────────────────────────────────────────────

    private renderTrigger(): void {
        this.triggerEl.innerHTML = "";
        const s = this.getSettings();

        this.triggerEl.style.cssText = `
            display:flex;
            margin-top:1px; 
            width:100%;

            justify-content:${s.alignment};
            align-items:center;
        `;

        const btn = document.createElement("button");
        btn.className = "fp-trigger";
        btn.style.cssText = `
            background:${s.triggerBg};
            color:${s.triggerColor};
            border:1.5px solid ${this.panelOpen ? s.accentColor : s.triggerBorder};
            border-radius:${s.radius}px;
        `;

        // ── Ícone funil ──
        const iconEl = document.createElement("span");
        iconEl.className = "fp-icon";
        iconEl.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 .78 1.63L14 13.35V20a1 1 0 0 1-1.45.89l-4-2A1 1 0 0 1 8 18v-4.65L3.22 5.63A1 1 0 0 1 3 4z"/>
            </svg>`;

        const labelEl = document.createElement("span");
        labelEl.textContent = s.triggerLabel;

        const badgeCount = this.selected.size;
        const badgeEl = document.createElement("span");
        badgeEl.className = "fp-badge" + (badgeCount > 0 ? " show" : "");
        badgeEl.style.background = s.accentColor;
        badgeEl.textContent = String(badgeCount);

        const chevronEl = document.createElement("span");
        chevronEl.className = "fp-chevron" + (this.panelOpen ? " open" : "");
        chevronEl.innerHTML = `
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.8" stroke-linecap="round">
                <polyline points="6 9 12 15 18 9"/>
            </svg>`;

        btn.append(iconEl, labelEl, badgeEl, chevronEl);
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (this.panelOpen) { this.closePanel(); } else { this.openPanel(); }
        });

        this.triggerEl.appendChild(btn);
    }

    // ─── RENDER PANEL ────────────────────────────────────────────────────────

    private renderPanel(): void {
        this.panelEl.innerHTML = "";
        const s = this.getSettings();

        this.panelEl.className = "fp-panel";
        this.panelEl.style.background = s.panelBg;
        this.panelEl.style.display = "flex";

        const header = document.createElement("div");
        header.className = "fp-header";
        header.style.background = s.panelHeaderBg;

        const headerTitle = document.createElement("span");
        headerTitle.textContent = s.panelTitle;
        headerTitle.style.color = s.panelHeaderText;

        const closeBtn = document.createElement("button");
        closeBtn.className = "fp-close";
        closeBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.8" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        closeBtn.addEventListener("click", (e) => { e.stopPropagation(); this.closePanel(); });

        header.append(headerTitle, closeBtn);
        this.panelEl.appendChild(header);

        const groupsEl = document.createElement("div");
        groupsEl.className = "fp-groups";

        if (s.showSearch) {
            const searchWrap = document.createElement("div");
            searchWrap.className = "fp-search-wrap";
            searchWrap.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#aaa" stroke-width="2"><circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
            const searchInput = document.createElement("input");
            searchInput.type = "text";
            searchInput.placeholder = "Buscar...";
            searchInput.className = "fp-search";
            searchInput.addEventListener("input", () => {
                const q = searchInput.value.toLowerCase();
                groupsEl.innerHTML = "";
                this.groups.forEach(g => {
                    const clone = { ...g, items: g.items.filter(i => i.label.toLowerCase().includes(q)) };
                    if (clone.items.length > 0) groupsEl.appendChild(this.buildGroupEl(clone, s));
                });
            });
            searchWrap.appendChild(searchInput);
            this.panelEl.appendChild(searchWrap);
        }

        if (this.groups.length === 0) {
            const empty = document.createElement("div");
            empty.className = "fp-empty";
            empty.textContent = "Adicione campos no painel de dados →";
            groupsEl.appendChild(empty);
        } else {
            this.groups.forEach(g => groupsEl.appendChild(this.buildGroupEl(g, s)));
        }
        this.panelEl.appendChild(groupsEl);

        const footer = document.createElement("div");
        footer.className = "fp-footer";

        const clearBtn = document.createElement("button");
        clearBtn.className = "fp-clear-btn";
        clearBtn.textContent = "Limpar";
        clearBtn.style.borderRadius = `${s.radius}px`;
        clearBtn.addEventListener("click", (e) => { e.stopPropagation(); this.clearFilters(); });

        const applyBtn = document.createElement("button");
        applyBtn.className = "fp-apply-btn";
        applyBtn.textContent = "Aplicar Filtros";
        applyBtn.style.cssText = `background:${s.accentColor};border-radius:${s.radius}px;`;
        applyBtn.addEventListener("click", (e) => { e.stopPropagation(); this.applyFilters(); });

        footer.append(clearBtn, applyBtn);
        this.panelEl.appendChild(footer);

        this.panelEl.addEventListener("click", e => e.stopPropagation());
    }

    // ─── BUILD GROUP ELEMENT ─────────────────────────────────────────────────

    private buildGroupEl(group: FieldGroup, s: Settings): HTMLElement {
        const groupEl = document.createElement("div");
        groupEl.className = "fp-group";

        const groupHeader = document.createElement("div");
        groupHeader.className = "fp-group-header";

        const groupTitle = document.createElement("span");
        groupTitle.className = "fp-group-title";
        groupTitle.textContent = group.name;
        groupTitle.style.color = s.groupTitleColor;

        // ── Badge indicando tipo de seleção ──
        const selTypeBadge = document.createElement("span");
        selTypeBadge.className = "fp-sel-type";
        selTypeBadge.textContent = group.multiSelect ? "multi" : "único";
        selTypeBadge.style.cssText = `
            font-size:9px;font-weight:600;
            padding:1px 5px;border-radius:8px;
            background:${group.multiSelect ? "#e8f5e9" : "#fff3e0"};
            color:${group.multiSelect ? "#2e7d32" : "#e65100"};
            text-transform:capitalize;letter-spacing:.04em;
        `;

        const selCount = group.items.filter(i => i.selected).length;
        if (selCount > 0) {
            const dot = document.createElement("span");
            dot.className = "fp-dot";
            dot.style.background = s.accentColor;
            groupTitle.appendChild(dot);
        }

        const toggle = document.createElement("span");
        toggle.className = "fp-toggle";
        toggle.textContent = group.isExpanded ? "−" : "+";

        groupHeader.append(groupTitle, selTypeBadge, toggle);

        const itemList = document.createElement("div");
        itemList.className = "fp-item-list" + (group.isExpanded ? "" : " collapsed");

        groupHeader.addEventListener("click", () => {
            group.isExpanded = !group.isExpanded;
            this.expandedState.set(group.name, group.isExpanded);
            itemList.classList.toggle("collapsed", !group.isExpanded);
            toggle.textContent = group.isExpanded ? "−" : "+";
        });

        group.items.forEach(item => {
            const itemEl = document.createElement("div");
            itemEl.className = "fp-item" + (item.selected ? " selected" : "");
            if (item.selected) itemEl.style.background = s.itemSelectedBg;

            // ── Checkbox ou radio dependendo do multiSelect do grupo ──
            const cb = document.createElement("span");
            cb.className = group.multiSelect ? "fp-cb" : "fp-rb"; // cb=checkbox, rb=radio
            this.renderCb(cb, item.selected, s.accentColor, group.multiSelect);

            const lbl = document.createElement("span");
            lbl.className = "fp-lbl";
            lbl.textContent = item.label;
            lbl.style.color = s.itemTextColor;

            itemEl.append(cb, lbl);

            itemEl.addEventListener("mouseenter", () => {
                if (!item.selected) itemEl.style.background = s.itemHoverBg;
            });
            itemEl.addEventListener("mouseleave", () => {
                itemEl.style.background = item.selected ? s.itemSelectedBg : "";
            });

            itemEl.addEventListener("click", (e) => {
                e.stopPropagation();

                // ── Single select: desmarca todos do grupo ──
                if (!group.multiSelect) {
                    group.items.forEach(i => {
                        if (i !== item && i.selected) {
                            i.selected = false;
                            this.selected.delete(`${group.propName}||${i.label}`);
                        }
                    });
                    itemList.querySelectorAll<HTMLElement>(".fp-item").forEach(el => {
                        el.style.background = "";
                        el.classList.remove("selected");
                        const cbEl = el.querySelector<HTMLElement>(".fp-cb, .fp-rb");
                        if (cbEl) this.renderCb(cbEl, false, s.accentColor, group.multiSelect);
                    });

                    // Single: se clicar no já selecionado, desmarca
                    item.selected = !item.selected;
                } else {
                    // Multi: toggle normal
                    item.selected = !item.selected;
                }

                const selKey = `${group.propName}||${item.label}`;

                if (item.selected) {
                    this.selected.set(selKey, item.rawValue);
                    itemEl.classList.add("selected");
                    itemEl.style.background = s.itemSelectedBg;
                } else {
                    this.selected.delete(selKey);
                    itemEl.classList.remove("selected");
                    itemEl.style.background = "";
                }

                this.renderCb(cb, item.selected, s.accentColor, group.multiSelect);

                const badge = this.triggerEl.querySelector<HTMLElement>(".fp-badge");
                if (badge) {
                    badge.textContent = String(this.selected.size);
                    badge.classList.toggle("show", this.selected.size > 0);
                }
            });

            itemList.appendChild(itemEl);
        });

        groupEl.append(groupHeader, itemList);
        return groupEl;
    }

    // ─── RENDER CHECKBOX ─────────────────────────────────────────────────────

    // ── Checkbox (multi) ou Radio (single) ──
    private renderCb(el: HTMLElement, checked: boolean, color: string, isMulti: boolean = true): void {
        if (isMulti) {
            // Checkbox quadrado
            el.style.borderRadius = "3px";
            if (checked) {
                el.style.background  = color;
                el.style.borderColor = color;
                el.innerHTML = `<svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            } else {
                el.style.background  = "transparent";
                el.style.borderColor = "#d0d4da";
                el.innerHTML = "";
            }
        } else {
            // Radio circular
            el.style.borderRadius = "50%";
            if (checked) {
                el.style.background  = color;
                el.style.borderColor = color;
                el.innerHTML = `<svg width="6" height="6" viewBox="0 0 6 6">
                    <circle cx="3" cy="3" r="3" fill="white"/></svg>`;
            } else {
                el.style.background  = "transparent";
                el.style.borderColor = "#d0d4da";
                el.innerHTML = "";
            }
        }
    }

    // ─── STYLES ──────────────────────────────────────────────────────────────

    private injectStyles(): void {
        const existingStyle = document.getElementById("fp-styles");
        if (existingStyle) existingStyle.remove();

        const style = document.createElement("style");
        style.id = "fp-styles";
        style.textContent = `
            .fp-trigger {
                display:inline-flex;align-items:center;gap:5px;
                padding:8px 14px 8px 12px;cursor:pointer;
                font-size:13px;font-weight:500;white-space:nowrap;
                box-shadow:0 1px 4px rgba(0,0,0,.1);
                transition:box-shadow .15s,border-color .15s;
                font-family:inherit;
            }
            .fp-trigger:hover { box-shadow:0 2px 8px rgba(0,0,0,.18); }
            .fp-icon { display:flex;flex-direction:column;gap:3.5px; }
            .fp-icon span { display:block;width:14px;height:1.8px;background:currentColor;border-radius:2px; }
            .fp-badge {
                display:none;font-size:10px;font-weight:700;border-radius:10px;
                padding:1px 6px;min-width:18px;text-align:center;line-height:1.6;color:#fff;
            }
            .fp-badge.show { display:inline-block; }
            .fp-chevron { display:flex;align-items:center;transition:transform .25s; }
            .fp-chevron.open { transform:rotate(180deg); }

            .fp-panel {
                position:fixed;
                width:280px;
                border:1px solid #e0e3ea;
                border-radius:10px;
                box-shadow:0 8px 32px rgba(0,0,0,.18);
                flex-direction:column;
                overflow:hidden;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }
            .fp-header {
                display:flex;align-items:center;justify-content:space-between;
                padding:10px 14px 8px;border-bottom:1px solid #f0f2f5;
                flex-shrink:0;
            }
            .fp-header span { font-weight:600;font-size:13px; }
            .fp-close {
                background:none;border:none;cursor:pointer;color:#b0b4be;
                width:24px;height:24px;border-radius:6px;
                display:flex;align-items:center;justify-content:center;
            }
            .fp-close:hover { color:#555;background:#f3f4f6; }

            .fp-search-wrap {
                display:flex;align-items:center;margin:8px 10px 4px;
                background:#f5f6f8;border:1px solid #e8eaed;
                border-radius:20px;padding:5px 10px;gap:6px;flex-shrink:0;
            }
            .fp-search {
                border:none;background:transparent;outline:none;
                font-size:12px;color:#444;width:100%;font-family:inherit;
            }
            .fp-search::placeholder { color:#c0c4cc; }

            .fp-groups { overflow-y:auto;max-height:260px;padding:4px 0;flex:1; }
            .fp-groups::-webkit-scrollbar { width:4px; }
            .fp-groups::-webkit-scrollbar-thumb { background:#e0e2e6;border-radius:4px; }
            .fp-empty { padding:16px;font-size:12px;color:#aaa;text-align:center;font-style:italic; }

            .fp-group-header {
                display:flex;align-items:center;justify-content:space-between;
                padding:7px 14px 4px;cursor:pointer;user-select:none;
            }
            .fp-group-header:hover { background:rgba(0,0,0,.02); }
            .fp-group-title {
                display:flex;align-items:center;gap:6px;
                font-size:12.5px;font-weight:700;letter-spacing:.06em;
            }
            .fp-dot { width:6px;height:6px;border-radius:50%;display:inline-block; }
            .fp-toggle { color:#c0c4cc;font-size:15px;line-height:1; }

            .fp-item-list {
                display:flex;flex-direction:column;gap:1px;
                padding:0 8px 6px;border-bottom:1px solid #f3f4f6;
                overflow:hidden;max-height:600px;
                transition:max-height .2s ease,padding .2s ease;
            }
            .fp-item-list.collapsed { max-height:0 !important;padding-bottom:0; }

            .fp-item {
                display:flex;align-items:center;gap:8px;
                padding:5px 8px;border-radius:6px;cursor:pointer;transition:background .1s;
            }
            .fp-cb {
                width:15px;height:15px;border-radius:3px;border:1.5px solid #d0d4da;
                flex-shrink:0;display:flex;align-items:center;justify-content:center;
                transition:all .15s;
            }
            .fp-rb {
                width:15px;height:15px;border-radius:50%;border:1.5px solid #d0d4da;
                flex-shrink:0;display:flex;align-items:center;justify-content:center;
                transition:all .15s;
            }
            .fp-lbl {
                font-size:12.5px;user-select:none;
                overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;
            }
            .fp-item.selected .fp-lbl { font-weight:500; }

            .fp-footer { display:flex;gap:6px;padding:8px 10px 10px;flex-shrink:0; }
            .fp-clear-btn {
                padding:9px 14px;background:#f3f4f6;color:#555;
                border:1px solid #e0e3ea;font-size:12.5px;font-weight:600;
                cursor:pointer;font-family:inherit;
            }
            .fp-clear-btn:hover { background:#e8eaed; }
            .fp-apply-btn {
                flex:1;border:none;color:#fff;font-size:12.5px;font-weight:600;
                padding:9px 0;cursor:pointer;font-family:inherit;
            }
            .fp-apply-btn:hover { opacity:.87; }
        `;
        document.head.appendChild(style);
    }
}