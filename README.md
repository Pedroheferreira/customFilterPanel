# 🎛️ Custom Filter Panel— Custom Visual for Power BI
A custom Power BI visual that provides a clean, web-style filter panel with multi-field support, accordion groups, search, and full color customization via the Format Pane.
![Power BI](https://img.shields.io/badge/Power%20BI-Custom%20Visual-F2C811?style=flat&logo=powerbi&logoColor=black)
![API](https://img.shields.io/badge/API-5.10.0-blue?style=flat)
![pbiviz](https://img.shields.io/badge/pbiviz-7.x-green?style=flat)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)
-----
*Developed by Pedro Silva — Telefonica*
*Pedro Silva — Pedrof.Silva@telefonica.com /  pe123he@gmail.com | +5511934114041
-----
## ✨ Features
- **≡ Filtrar button** — compact trigger button that opens the filter panel
- **Up to 5 dynamic field slots** — connect any text/category column from your data
- **Accordion groups** — each connected field becomes a collapsible group
- **Search box** — filter items across all groups in real time
- **Multi-select or single-select** — configurable per visual instance
- **Cross-filtering** — applies Power BI native selection to all other visuals on the page
- **Badge counter** — shows how many filters are currently active
- **Fully customizable** — all colors, labels, and sizes via the Format Pane
- **Filter Automatic** — Filter automatic
----
## 📋 Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher
- [Power BI Desktop](https://powerbi.microsoft.com/desktop/)
- Power BI account (for publishing)
-----
## 🚀 Installation & Build
### 1. Clone the repository
```bash
git clone https://github.com/your-username/filter-slicer-visual.git
cd filter-slicer-visual
```
### 2. Install dependencies
```bash
npm install
```
### 3. Install the development certificate (first time only)
Required to run the visual in Power BI Desktop during development.
```bash
pbiviz --install-cert
```
> **Note:** This requires PowerShell 7 on Windows. Download it at [microsoft.com/powershell](https://microsoft.com/powershell) if you get a `pwsh not recognized` error.
### 4. Start the development server
```bash
pbiviz start
```
The visual will be available at `https://localhost:8080`. Keep this terminal open while testing in Power BI Desktop.
### 5. Build the production package
```bash
pbiviz package
```
This generates a `.pbiviz` file inside the `dist/` folder, ready to import into Power BI.
-----
## 📊 How to Use in Power BI
### Importing the visual
1. Open **Power BI Desktop**
1. In the Visualizations pane, click **”…”** (More visuals)
1. Select **“Import a visual from a file”**
1. Choose the `.pbiviz` file from the `dist/` folder
1. Confirm the security warning — the visual will appear in your pane
### Enabling the Developer Visual (dev mode only)
1. Go to **File → Options → Security**
1. Enable **“Enable custom visual developer mode”**
1. The Developer Visual tile will appear in the Visualizations pane
### Connecting data
1. Add the visual to your report canvas
1. In the **Data** pane on the right, drag columns into the field slots:
- **Campo 1** through **Campo 5**
- Each connected column becomes a filter group in the panel
- Accepts any text or category column from any table
### Recommended layout
For the best experience, place the visual at the **top of the page**:
|State               |Recommended Height|Width |
|--------------------|------------------|------|
|Closed (button only)|~45px             |~160px|
|Open (panel visible)|~380px            |~260px|

> **Tip:** Use Power BI **Bookmarks** to animate the open/close transition — create one bookmark with the visual at 45px height and another at 380px, then link them to the button click.
### Applying filters
1. Click **≡ Filtrar** to open the panel
1. Select one or more values across any group
1. Click **Aplicar Filtros** — all other visuals on the page will be filtered
1. The badge on the button shows how many filters are currently active
1. To clear filters, deselect all items and click **Aplicar Filtros** again
-----
## 🎨 Customizing Colors
All visual properties are available in the **Format Pane** under the **Visual** tab. There are 5 sections:
### Botão Filtrar
Controls the trigger button appearance.
|Property           |Description        |Default      |
|-------------------|-------------------|-------------|
|Texto              |Button label       |`Filtrar`    |
|Cor de fundo       |Background color   |`transparent`|
|Cor do texto       |Text and icon color|`#2a2d36`    |
|Cor da borda       |Border color       |`#c8ccd4`    |
|Arredondamento (px)|Border radius      |`8`          |
### Painel de Filtros
Controls the filter panel container.
|Property                 |Description             |Default  |
|-------------------------|------------------------|---------|
|Título                   |Panel header title      |`Filtros`|
|Cor de fundo             |Panel background        |`#ffffff`|
|Cor de fundo do cabeçalho|Header background       |`#ffffff`|
|Cor do texto do cabeçalho|Header text color       |`#1e2029`|
|Mostrar busca            |Show/hide the search box|`On`     |
### Grupos
Controls the accordion group headers and list items.
|Property                |Description             |Default  |
|------------------------|------------------------|---------|
|Cor do título do grupo  |Group title color       |`#E8394A`|
|Cor dos itens           |Item text color         |`#444444`|
|Cor de fundo hover      |Item hover background   |`#f5f6f8`|
|Cor de fundo selecionado|Selected item background|`#fef2f3`|
### Botão Aplicar
Controls the apply button at the bottom of the panel.
|Property           |Description     |Default          |
|-------------------|----------------|-----------------|
|Texto              |Button label    |`Aplicar Filtros`|
|Cor de fundo       |Background color|`#E8394A`        |
|Cor do texto       |Text color      |`#ffffff`        |
|Arredondamento (px)|Border radius   |`20`             |
### Checkbox
Controls the selection indicators.
|Property          |Description                    |Default  |
|------------------|-------------------------------|---------|
|Cor quando marcado|Checkbox checked color         |`#E8394A`|
|Multi-seleção     |Allow selecting multiple values|`On`     |
-----
## 🗂️ Project Structure
```
filter-slicer-visual/
├── src/
│   ├── visual.ts         # Main visual logic and rendering
│   └── settings.ts       # Format pane model (FormattingSettingsModel)
├── style/
│   └── visual.less       # Minimal base styles
├── assets/
│   └── icon.png          # 32x32px visual icon
├── capabilities.json     # Data roles, mappings, and format properties
├── pbiviz.json           # Visual metadata (name, version, author)
├── package.json          # Node dependencies
├── tsconfig.json         # TypeScript configuration
└── dist/                 # Generated .pbiviz file (after pbiviz package)
```
-----
## 🛠️ Built With
- [Power BI Visuals API](https://github.com/microsoft/PowerBI-visuals-api) `5.9.0`
- [powerbi-visuals-tools](https://github.com/microsoft/PowerBI-visuals-tools) `7.x`
- [powerbi-visuals-utils-formattingmodel](https://github.com/microsoft/powerbi-visuals-utils-formattingmodel) `1.3.0`
- TypeScript `5.x`
-----
## 📄 License
MIT License — feel free to use, modify, and distribute.
-----
*Developed by Pedro Silva — Telefonica*
*Pedro Silva — Pedrof.Silva@telefonica.com /  pe123he@gmail.com | +5511934114041
