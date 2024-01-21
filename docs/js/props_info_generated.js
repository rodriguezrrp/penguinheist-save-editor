// generated by the mapping script
const PROP_INFO = {
    "itemOwned": {
        "category": "items",
        "name": "Item {name} Owned",
        "name_map": "item",
        "type": "bool"
    },
    "itemAvailable": {
        "category": "items",
        "name": "Item {name} Available",
        "name_map": "item",
        "type": "bool"
    },
    "newBlueprint": {
        "category": "items",
        "name": "Blueprint for Item {name} Picked Up",
        "name_map": "item",
        "type": "bool"
    },
    "decipheredHint": {
        "category": "items",
        "name": "Hint for Item {name} Deciphered",
        "name_map": "item",
        "type": "bool"
    },
    "previousLoadout": {
        "category": "loadout",
        "name": "Loadout",
        "type": "intlist",
        "dropdown": "dropdown-items",
        "default": 2
    },
    "clothingOwned": {
        "category": "clothing",
        "name": "Clothing {name} Owned",
        "name_map": "clothing",
        "type": "bool"
    },
    "clothing": {
        "category": "outfit",
        "name": "Equipped Clothing #{name}",
        "name_map": {
            "0": 1,
            "1": 2,
            "2": 3,
            "3": 4,
            "4": 5,
            "5": 6
        },
        "type": "int-dropdown",
        "dropdown": "dropdown-clothing",
        "dropdown_extra": {
            "-1": "None"
        }
    },
    "clothingColor": {
        "category": "outfit",
        "name": "Equipped Clothing #{name} Color",
        "name_map": {
            "0": 1,
            "1": 2,
            "2": 3,
            "3": 4,
            "4": 5,
            "5": 6
        },
        "type": "color"
    },
    "skinIndex": {
        "category": "outfit",
        "name": "Skin",
        "type": "int-dropdown",
        "dropdown": "dropdown-skins"
    },
    "hasStructure": {
        "category": "structures",
        "name": "Structure {name} Available",
        "name_map": "structure",
        "type": "bool"
    },
    "canConstruct": {
        "category": "structures",
        "name": "Constructed {name}",
        "name_map": "structure",
        "type": "bool"
    },
    "objectRetrieved": {
        "category": "misc",
        "name": "Retrieved {name}",
        "name_map": "_self",
        "type": "bool"
    },
    "challenge": {
        "category": "challenges",
        "name": "Challenge Statistic {name}",
        "name_map": "_self",
        "type": "int"
    },
    "challengeFinished": {
        "category": "challenges",
        "name": "Challenge #{name} Finished",
        "name_map": {
            "0": 1,
            "1": 2,
            "2": 3
        },
        "type": "bool"
    },
    "finishedHeist": {
        "category": "heists",
        "name": "Finished Heist {name}",
        "name_map": "_self",
        "type": "bool"
    },
    "money": {
        "category": "money",
        "name": "Money",
        "type": "int"
    },
    "stamps": {
        "category": "money",
        "name": "Stamps",
        "type": "int"
    },
    "resolutionIndex": {
        "category": "graphics",
        "name": "Resolution Index",
        "type": "int",
        "note": "Resolution options change depending on the monitor used. This does not guarantee a specific resolution on another monitor."
    },
    "graphics": {
        "category": "graphics",
        "name": "Graphics",
        "type": "int-dropdown",
        "dropdown": "dropdown-graphics",
        "note": "Level of quality",
        "sort": false
    },
    "vSync": {
        "category": "graphics",
        "name": "VSync",
        "type": "int-dropdown",
        "dropdown": {
            "0": "Off",
            "1": "On"
        }
    },
    "bloomEnabled": {
        "category": "graphics",
        "name": "Bloom",
        "type": "bool"
    },
    "antiAliasingEnabled": {
        "category": "graphics",
        "name": "Anti-Aliasing",
        "type": "bool"
    },
    "outlinesEnabled": {
        "category": "graphics",
        "name": "Outlines",
        "type": "bool"
    },
    "ambientOcclusionEnabled": {
        "category": "graphics",
        "name": "Ambient Occlusion",
        "type": "bool"
    },
    "useFancySkyAndWeather": {
        "category": "graphics",
        "name": "Fancy Sky and Weather",
        "type": "bool"
    },
    "bloodEnabled": {
        "category": "graphics",
        "name": "Blood Enabled",
        "type": "bool"
    },
    "drawDistance": {
        "category": "graphics",
        "name": "Draw Distance",
        "type": "float-range",
        "range": [
            0.025,
            1
        ]
    },
    "difficulty": {
        "category": "misc",
        "name": "Difficulty",
        "type": "int-dropdown",
        "dropdown": {
            "0": "Easy",
            "1": "Medium",
            "2": "Hard",
            "3": "Hardcore"
        },
        "sort": false
    },
    "invertY": {
        "category": "controls",
        "name": "Invert Y",
        "type": "bool"
    },
    "mouseSensitivity": {
        "category": "controls",
        "name": "Mouse Sensitivity",
        "type": "float-range",
        "range": [
            0.5,
            2
        ]
    },
    "mouseSmoothing": {
        "category": "controls",
        "name": "Mouse Smoothing",
        "type": "float-range",
        "range": [
            0,
            1
        ]
    },
    "usingControllerInput": {
        "category": "controls",
        "name": "Using Controller Input",
        "type": "bool"
    },
    "fwd": {
        "category": "controls",
        "name": "Forward",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "bck": {
        "category": "controls",
        "name": "Backward",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "lft": {
        "category": "controls",
        "name": "Left",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "rgt": {
        "category": "controls",
        "name": "Right",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "jmp": {
        "category": "controls",
        "name": "Jump",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "sld": {
        "category": "controls",
        "name": "Slide",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "use": {
        "category": "controls",
        "name": "Attack",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "aim": {
        "category": "controls",
        "name": "Aim",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "r_punch": {
        "category": "controls",
        "name": "Right Punch",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "l_punch": {
        "category": "controls",
        "name": "Left Punch",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "rld": {
        "category": "controls",
        "name": "Reload",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "dqp": {
        "category": "controls",
        "name": "De-equip",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "zoom": {
        "category": "controls",
        "name": "Zoom",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds",
        "note": "Use Scope"
    },
    "pngsns": {
        "category": "controls",
        "name": "Penguin Sense",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "noot": {
        "category": "controls",
        "name": "Noot",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "int": {
        "category": "controls",
        "name": "Interact",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "cam": {
        "category": "controls",
        "name": "Camera",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "view": {
        "category": "controls",
        "name": "View Penguin",
        "type": "int-dropdown",
        "dropdown": "dropdown-keybinds"
    },
    "previousDay": {
        "category": "misc",
        "name": "Previous Day",
        "type": "int"
    },
    "masterVolume": {
        "category": "settings",
        "name": "Master Volume",
        "type": "float-range",
        "range": [
            0,
            1
        ]
    },
    "musicVolume": {
        "category": "settings",
        "name": "Music Volume",
        "type": "float-range",
        "range": [
            0,
            1
        ]
    },
    "region": {
        "category": "settings",
        "name": "Server Region",
        "type": "int-dropdown",
        "dropdown": "dropdown-region",
        "sort": false
    },
    "timerEnabled": {
        "category": "misc",
        "name": "Timer Enabled",
        "type": "bool"
    },
    "speechIndex": {
        "category": "misc",
        "name": "Speech Index for {name}",
        "name_map": "_self",
        "type": "int",
        "note": "Increments when a speech dialog plays"
    },
    "hasNewShopItem": {
        "category": "misc",
        "name": "Has New Shop Item",
        "type": "bool",
        "note": "Display of the &quot;New&quot; text on the Shop button"
    },
    "seenTutorial": {
        "category": "misc",
        "name": "Seen Tutorial",
        "type": "bool"
    },
    "lastMap": {
        "category": "misc",
        "name": "Last Map",
        "type": "int"
    },
    "previousHeist": {
        "category": "misc",
        "name": "Previous Heist",
        "type": "int-dropdown",
        "dropdown": "dropdown-heists"
    }
};