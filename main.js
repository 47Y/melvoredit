$(() => {
    const $import = $('#txtImport');
    const $edit = $('#txtEdit');
    const $export = $('#txtExport');

    $import.on('blur', () => {
        try {
            const jsonSave = JSON.parse(pako.ungzip(atob($import.val()), { to: 'string' }));
            $edit.val(JSON.stringify(jsonSave.saveGame, null, 2));
            $edit.attr('disabled', false);
        } catch (e) {
            $edit.val('');
            $edit.attr('disabled', true);
            $export.val('');
            $export.attr('disabled', true);
            return;
        }
    });

    $edit.on('blur', () => {
        try {
            const jsonSave = $edit.val();
            JSON.parse(jsonSave);
            const strSave = btoa(pako.gzip(jsonSave, { to: 'string' }));
            $export.val(strSave);
            $export.attr('disabled', false);
        } catch (e) {
            $export.val('');
            $export.attr('disabled', true);
            return;
        }
    });
});

function getSaveFromString(saveString) {
    var _a, _b, _c, _d, _e;
    let saveGame = {};
    const packed = decompressSaveString(saveString);
    let oldFormat = false;
    let saveVersion = 1;
    if (!('v'in packed)) {
        saveGame = packed;
        oldFormat = true;
        saveVersion = -1;
        if (saveGame.SETTINGS === undefined) {
            saveGame.SETTINGS = defaultSaveValues.SETTINGS;
        } else {
            setDefaultSettings(saveGame.SETTINGS);
        }
    } else {
        const serializedData = packed.s;
        const nestedSerializedData = packed.ns;
        const numberData = packed.n;
        const boolData = packed.b;
        const otherData = packed.o;
        saveVersion = packed.v;
        numberData.forEach((value,i)=>{
            saveGame[numberVars[saveVersion][i]] = value;
        }
        );
        boolData.forEach((value,i)=>{
            saveGame[boolVars[saveVersion][i]] = value === 1;
        }
        );
        serialVars[saveVersion].forEach((key,i)=>{
            const args = [serializedData[i], saveVersion];
            switch (key) {
            case 'bank':
                saveGame[key] = deserializeBank(...args);
                break;
            case 'statsGeneral':
                saveGame[key] = deserializeStats.general(...args);
                break;
            case 'statsWoodcutting':
                saveGame[key] = deserializeStats.woodcutting(...args);
                break;
            case 'statsFiremaking':
                saveGame[key] = deserializeStats.firemaking(...args);
                break;
            case 'statsFishing':
                saveGame[key] = deserializeStats.fishing(...args);
                break;
            case 'statsCooking':
                saveGame[key] = deserializeStats.cooking(...args);
                break;
            case 'statsMining':
                saveGame[key] = deserializeStats.mining(...args);
                break;
            case 'statsSmithing':
                saveGame[key] = deserializeStats.smithing(...args);
                break;
            case 'statsCombat':
                saveGame[key] = deserializeStats.combat(...args);
                break;
            case 'statsThieving':
                saveGame[key] = deserializeStats.thieving(...args);
                break;
            case 'statsFarming':
                saveGame[key] = deserializeStats.farming(...args);
                break;
            case 'statsFletching':
                saveGame[key] = deserializeStats.fletching(...args);
                break;
            case 'statsCrafting':
                saveGame[key] = deserializeStats.crafting(...args);
                break;
            case 'statsRunecrafting':
                saveGame[key] = deserializeStats.runecrafting(...args);
                break;
            case 'statsHerblore':
                saveGame[key] = deserializeStats.herblore(...args);
                break;
            case 'glovesTracker':
                saveGame[key] = deserializeGlovesTracker(...args);
                break;
            case 'rockData':
                saveGame[key] = deserializeRockData(...args);
                break;
            case 'herbloreBonuses':
                saveGame[key] = deserializeHerbloreBonuses(...args);
                break;
            case 'tutorialTips':
                saveGame[key] = deserializeTutorialTips(...args);
                break;
            case 'shopItemsPurchased':
                saveGame[key] = deserializeShopItems(...args);
                break;
            case 'combatData':
                saveGame[key] = deserializeCombatData(...args);
                break;
            case 'equippedFood':
                saveGame[key] = deserializeFood(...args);
                break;
            case 'SETTINGS':
                saveGame[key] = deserializeSettings(...args);
                break;
            case 'monsterStats':
                saveGame[key] = deserializeMonsterStats(...args);
                break;
            case 'skillsUnlocked':
            case 'petUnlocked':
                saveGame[key] = deserializeBoolArray(...args);
                break;
            case 'equipmentSets':
                saveGame[key] = deserializeEquipment(...args);
                break;
            case 'skillXP':
            case 'dungeonCompleteCount':
            case 'selectedAttackStyle':
            case 'lockedItems':
            case 'golbinRaidStats':
            case 'slayerTaskCompletion':
            case 'chosenAgilityObstacles':
            case 'agilityObstacleBuildCount':
            case 'itemsAlreadyFound':
            case 'saveStateBeforeRaid':
                saveGame[key] = deserializeNumberArray(...args);
                break;
            case 'slayerTask':
                saveGame[key] = deserializeSlayerTask(...args);
                break;
            default:
                throw new Error(`Error loading save: Invalid variable for deserialization: ${key}`);
            }
        }
        );
        nestedVars[saveVersion].forEach((key,i)=>{
            const args = [nestedSerializedData[i], saveVersion];
            switch (key) {
            case 'newFarmingAreas':
                saveGame[key] = deserializeFarmingAreas(...args);
                break;
            case 'MASTERY':
                saveGame[key] = deserializeMastery(...args);
                break;
            case 'golbinRaidHistory':
                saveGame[key] = deserializeRaidHistory(...args);
                break;
            case 'itemStats':
                saveGame[key] = deserializeItemStats(...args);
                break;
            default:
                throw new Error(`Error loading save: Invalid variable for nested deserialization: ${key}`);
            }
        }
        );
        otherVars[saveVersion].forEach((key,i)=>{
            saveGame[key] = JSON.parse(otherData[i]);
        }
        );
        constructRedundantVars(saveGame, saveVersion);
        if (saveVersion > 1)
            saveGame.serialCombat = new DataReader(packed.cd);
        for (let i = saveVersion + 1; i <= currentSaveVersion; i++) {
            (_a = numberVarDiff[i]) === null || _a === void 0 ? void 0 : _a.add.forEach((key)=>{
                setSaveKeyToDefault(saveGame, key);
            }
            );
            (_b = boolVarDiff[i]) === null || _b === void 0 ? void 0 : _b.add.forEach((key)=>{
                setSaveKeyToDefault(saveGame, key);
            }
            );
            (_c = otherVarDiff[i]) === null || _c === void 0 ? void 0 : _c.add.forEach((key)=>{
                setSaveKeyToDefault(saveGame, key);
            }
            );
            (_d = serialVarDiff[i]) === null || _d === void 0 ? void 0 : _d.add.forEach((key)=>{
                setSaveKeyToDefault(saveGame, key);
            }
            );
            (_e = nestedVarDiff[i]) === null || _e === void 0 ? void 0 : _e.add.forEach((key)=>{
                setSaveKeyToDefault(saveGame, key);
            }
            );
        }
    }
    saveGame.version = saveVersion;
    return {
        saveGame: saveGame,
        oldFormat: oldFormat
    };
}
