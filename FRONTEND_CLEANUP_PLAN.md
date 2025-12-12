# Frontend Cleanup Plan

## Issues Identified

### 1. ✅ DeviceStatus Component - **FIXED**
**Problem**: File named `DeviceStatus.jsx` contained a `Tasks` component
**Impact**: Showing tasks instead of device/sensor status
**Solution**: Replaced with proper DeviceStatus component showing:
- Serial connection status
- Device/sensor online/offline status
- Reconnect functionality
- Clean device list UI

---

## Cleanup Tasks

### 2. Unused Variables & Imports (ESLint Warnings)

#### Data.jsx
```
Line 391: 'selectedGarden' - assigned but never used
Line 393: 'comparisonRatio', 'setComparisonRatio' - assigned but never used
Line 394: 'microalgaeInput', 'setMicroalgaeInput' - assigned but never used
```

#### Finance.jsx
```
Line 3: 'LandPlot', 'Handshake', 'Scale', 'BarChartHorizontal' - imported but never used
Line 249: 'FinancialComparisonChart' - assigned but never used
Line 265: 'metrics' - assigned but never used
Line 353: 'DOSMDataWidget' - assigned but never used
Line 397: 'dosmStats', 'setDosmStats' - assigned but never used
Line 409: 'loading' - assigned but never used
Line 417: 'refetchAllData' - assigned but never used
Line 438: 'profitData', 'costData' - assigned but never used
```

#### Forecast.jsx
```
Line 3: 'Leaf', 'Wind', 'BarChart3' - imported but never used
```

#### NipisOverview.jsx & KasturiOverview.jsx
```
React Hook dependency issues - need to wrap objects in useMemo
```

#### TeamProfile.jsx
```
Line 3: 'User' - imported but never used
```

#### FarmingSuggestions.jsx
```
Line 11: 'Scissors' - imported but never used
```

#### Hooks
```
useApiClean.js Line 83: 'setStatus' - assigned but never used
useFirestoreClean.js Line 44: React Hook dependency issues
useRealtimeClean.js Line 3: 'useCallback' - imported but never used
```

---

## Recommended Cleanup Actions

### Priority 1: Remove Unused Imports (Quick Wins)

**Files to Clean:**
1. ✅ `DeviceStatus.jsx` - Already fixed
2. `src/components/dashboard/Data.jsx`
3. `src/components/dashboard/Finance.jsx`
4. `src/components/dashboard/Forecast.jsx`
5. `src/components/dashboard/TeamProfile.jsx`
6. `src/components/ui/FarmingSuggestions.jsx`
7. `src/hook/useRealtimeClean.js`

### Priority 2: Remove Unused Variables

**Pattern to find:**
```javascript
// Bad - unused state
const [value, setValue] = useState(); // Never used

// Good - remove if not needed
// (delete the line)
```

### Priority 3: Fix React Hook Dependencies

**Common Issues:**
```javascript
// Issue: Object in dependency array
useEffect(() => {
  // ...
}, [appConfig]); // appConfig changes every render

// Fix: Wrap in useMemo
const appConfig = useMemo(() => ({
  // config object
}), []); // Only create once
```

### Priority 4: Code Organization

**Current Structure:**
```
src/
├── components/
│   ├── dashboard/     (6 files - some with issues)
│   ├── ui/           (many components)
│   ├── layout/
│   └── charts/
├── hook/             (3 files - some warnings)
└── App.js
```

**Issues:**
- Mixed concerns (some components do too much)
- Unused code left in place
- Inconsistent naming (DeviceStatus was actually Tasks)
- Large components that could be split

---

## Detailed Fixes

### Fix 1: Data.jsx - Remove Unused Variables

**Location:** Lines 391, 393-394

**Current:**
```javascript
const [selectedGarden, setSelectedGarden] = useState('all');
const [comparisonRatio, setComparisonRatio] = useState(null);
const [microalgaeInput, setMicroalgaeInput] = useState('');
```

**Action:**
- If truly unused → Delete
- If planned for future → Comment with TODO
- If partially used → Remove unused setter

### Fix 2: Finance.jsx - Major Cleanup Needed

**Issues:** Many unused variables and imports

**Actions:**
1. Remove unused icon imports (Line 3)
2. Remove unused component variables (Lines 249, 353, 397, 438)
3. Consolidate or remove unused functions

**This file needs the most attention!**

### Fix 3: Fix React Hook Dependencies

**Pattern:**
```javascript
// Before
const appConfig = {
  key: value
};

useMemo(() => {
  // uses appConfig
}, [appConfig]); // ❌ appConfig is new object every render

// After
const appConfig = useMemo(() => ({
  key: value
}), [value]); // ✅ Only recreate when value changes

useMemo(() => {
  // uses appConfig
}, [appConfig]); // ✅ Now stable
```

---

## Automated Cleanup Script

### Option 1: Use ESLint Auto-fix
```bash
npm run lint:fix
```

**What it fixes:**
- Removes unused imports automatically
- Some simple code issues
- Formatting

**What it won't fix:**
- Unused variables (needs manual review)
- Logic issues
- React Hook dependencies

### Option 2: Manual Review + Fix

**Process:**
1. Open file
2. Check ESLint warnings
3. For each warning:
   - Is it truly unused? → Delete
   - Is it used elsewhere? → Keep
   - Is it for future? → Add // TODO comment
4. Test after changes

---

## Testing After Cleanup

### Checklist:
- [ ] App compiles without errors
- [ ] No new console errors
- [ ] All pages load correctly
- [ ] Features still work
- [ ] ESLint warnings reduced

### Run These:
```bash
# 1. Check for errors
npm run dev

# 2. Run linter
npm run lint

# 3. Check bundle size
npm run build
```

---

## Benefits of Cleanup

### Before Cleanup:
- ❌ 40+ ESLint warnings
- ❌ Confusing code (DeviceStatus = Tasks?)
- ❌ Slower development
- ❌ Harder to find bugs
- ❌ Larger bundle size

### After Cleanup:
- ✅ <10 ESLint warnings (only real issues)
- ✅ Clear, maintainable code
- ✅ Faster development
- ✅ Easier debugging
- ✅ Smaller bundle size

---

## Maintenance Going Forward

### Rules:
1. **Delete unused code immediately** - Don't let it accumulate
2. **Fix ESLint warnings as you code** - Don't ignore them
3. **Use proper naming** - Component file should match export
4. **Organize imports** - Group by: React, external, internal, styles
5. **Comment future TODOs** - Don't leave incomplete code uncommented

### ESLint Integration:
```json
// .vscode/settings.json (recommended)
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "javascriptreact"]
}
```

---

## Next Steps

### Immediate (Do Now):
1. ✅ Fix DeviceStatus component - **DONE**
2. Remove unused imports from Dashboard components
3. Remove unused variables
4. Test that everything still works

### Short Term (This Week):
1. Fix React Hook dependency warnings
2. Refactor large components
3. Add proper TypeScript types (optional)
4. Update documentation

### Long Term (Ongoing):
1. Set up pre-commit hooks to prevent unused code
2. Regular code reviews
3. Refactor as you add features
4. Keep dependencies updated

---

## Summary

**Current State:** ~40 ESLint warnings, naming confusion, unused code
**Goal:** <10 warnings, clean code, proper naming
**Impact:** Better performance, easier maintenance, fewer bugs

Ready to clean up? Let's start with the quick wins! 🧹
