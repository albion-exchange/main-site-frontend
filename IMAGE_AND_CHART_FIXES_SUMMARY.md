# Image Loading & Chart Alignment Fixes

## ✅ **ISSUES FIXED**

### **Issue 1: Cover Images & Gallery Not Loading**

**Problem**: Images stored in `/src/lib/data/images/` with paths like `/src/lib/data/images/bak-hf-cover.jpeg` don't work in SvelteKit builds.

**Root Cause**: SvelteKit serves static assets from the `static/` folder, not from `src/lib/data/`.

**Solution Applied**:

1. **✅ Moved Images to Correct Location**
   ```
   src/lib/data/images/* → static/images/*
   ```

2. **✅ Updated All JSON File Paths**
   - Updated 8 mock JSON files to use `/images/` instead of `/src/lib/data/images/`
   - Script processed: `bak-hf1.json`, `bak-hf2.json`, `eur-wr1.json`, `eur-wr2.json`, `eur-wr3.json`, `eur-wr-legacy.json`, `gom-dw1.json`, `per-bv1.json`

3. **✅ Updated Fallback Path**
   - Fixed fallback image path in asset detail page: `/src/lib/data/images/eur-wr-cover.jpg` → `/images/eur-wr-cover.jpg`

4. **✅ Cleaned Up**
   - Removed old `src/lib/data/images/` directory
   - Removed duplicate files in `static/images/assets/`

**Files Changed**:
- ✅ All 8 files in `/src/lib/data/mockTokenMetadata/*.json`
- ✅ `/src/routes/assets/[id]/+page.svelte` (fallback path)
- ✅ Moved all images to `/static/images/`

---

### **Issue 2: Portfolio Breakeven Line Misalignment**

**Problem**: Breakeven line showing at wrong position (e.g., "$20K" line appearing at $40K position).

**Root Cause**: Portfolio page used different coordinate calculation than Chart component:
- **Portfolio**: `40 + chartHeight - (value / maxValue) * chartHeight` 
- **Chart Component**: `padding.top + chartHeight - ((value - niceMin) / valueRange) * chartHeight`

**Solution Applied**:

1. **✅ Implemented Chart Component's Coordinate System**
   ```javascript
   // Added proper padding, niceMin, niceMax calculations
   const padding = { top: 40, right: 20, bottom: 40, left: 60 }
   const niceMin = minValue < 0 ? -getNiceNumber(Math.abs(minValue) * 1.1) : 0
   const niceMax = getNiceNumber(maxValue * 1.1)
   const valueRange = niceMax - niceMin
   const breakEvenY = padding.top + chartHeight - ((holding.totalInvested - niceMin) / valueRange) * chartHeight
   ```

2. **✅ Updated SVG Coordinates**
   - Used proper `padding.left` and `padding.right` values
   - Aligned line positioning with Chart component's coordinate system

3. **✅ Added getNiceNumber Function**
   - Implemented same value normalization as Chart component
   - Ensures consistent scaling and positioning

**Files Changed**:
- ✅ `/src/routes/portfolio/+page.svelte` (breakeven calculation logic)

---

## **Technical Details**

### **Image Path Changes**
```diff
- "coverImage": "/src/lib/data/images/bak-hf-cover.jpeg"
+ "coverImage": "/images/bak-hf-cover.jpeg"

- return assetData?.coverImage || '/src/lib/data/images/eur-wr-cover.jpg';
+ return assetData?.coverImage || '/images/eur-wr-cover.jpg';
```

### **Chart Coordinate Fix**
```diff
- {@const maxValue = Math.max(...cumulativeData.map(d => d.value), holding.totalInvested * 1.2)}
- {@const breakEvenY = 40 + chartHeight - (holding.totalInvested / maxValue) * chartHeight}

+ {@const padding = { top: 40, right: 20, bottom: 40, left: 60 }}
+ {@const minValue = Math.min(...cumulativeData.map(d => d.value), 0)}
+ {@const maxValue = Math.max(...cumulativeData.map(d => d.value), 1)}
+ {@const niceMin = minValue < 0 ? -getNiceNumber(Math.abs(minValue) * 1.1) : 0}
+ {@const niceMax = getNiceNumber(maxValue * 1.1)}
+ {@const valueRange = niceMax - niceMin}
+ {@const breakEvenY = padding.top + chartHeight - ((holding.totalInvested - niceMin) / valueRange) * chartHeight}
```

---

## **Results**

### **✅ Images Now Working**
- Asset card cover images load correctly
- Asset detail gallery images display properly  
- Fallback images work for missing data

### **✅ Portfolio Charts Fixed**
- Breakeven lines now align correctly with chart data
- "$20K" breakeven line appears at correct $20K position
- Consistent coordinate system with Chart component

### **✅ Build Compatibility**
- All image assets served properly from `static/` folder
- No build errors or warnings introduced
- Type checking passes successfully

## **Verification Steps**

1. **Test Image Loading**:
   - Check asset cards show cover images
   - Verify asset detail gallery displays images
   - Confirm fallback images work when data missing

2. **Test Portfolio Charts**:
   - Verify breakeven lines align with correct values
   - Check that "$20K" line appears at $20K position
   - Confirm visual alignment with chart bars

Both issues should now be resolved! 🎉