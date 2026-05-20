# Jharbhunaksha Jharkhand - Offline Map Viewer

Jharbhunaksha portal ka offline map viewer for all 22 districts of Jharkhand.  
**Live:** https://viqplx7q.github.io/jharbhunaksha/

## Features

- **22 districts**, 247 circles, 1,697 halkas, 26,647 mouzas — full hierarchy
- **WMS-based village maps** with plot boundaries, labels, and FMB overlay
- **Hierarchical selectors**: District → Circle → Halka → Mouza
- **Search mouza** by name or code across all districts
- **Layer controls**: toggle Village Map, Plot Boundaries, Labels + opacity slider
- **Print / Save as PDF** support
- Works with or without internet (local CDN assets)
- 24,491 GIS extents (92% coverage)
- 24,506 standalone HTML map files

## Usage

### Single-page App
Open `index.html` or visit the live site →  
Select district → circle → halka → mouza → click **खोलें**

**Search mouza:** Type name/code in the search box → click result → map loads automatically

### Standalone Maps
Open `maps/index.html` → browse district/circle/halka → click mouza for direct map view

## Structure

```
index.html              - Main single-page app
assets/
  css/main.css          - Styles
  js/main.js            - App logic
  data/
    jharkhand.js        - Hierarchy data (22 districts, 2.8 MB)
    extents.js          - GIS extents (24,491 entries, 3.0 MB)
  lib/
    ol.js               - OpenLayers 4.6.5 (local, 530 KB)
    ol.css
    font-awesome.min.css
    fontawesome-webfont.woff2
maps/                   - Standalone HTML maps (24,506 files)
```

## Data Source

Jharbhunaksha Portal — https://jharbhunaksha.jharkhand.gov.in  
Hierarchy & extents fetched via `ScalarDatahandler` and `getVVVVExtentGeoref` APIs.  
Maps rendered via **GeoServer WMS** with 6 overlay layer IDs.

## Tech

- OpenLayers 4.6.5 (local copy)
- Vanilla JavaScript
- WMS overlay layers for plot boundaries, khata boundaries, and labels
- Offline-first: all assets (JS, CSS, fonts, data) bundled locally
