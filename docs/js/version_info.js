
const DEPOTS_INFO = {
    'depot_windows': 1451481,
    'depot_macos': 1451482,
    'depot_linux': 1451483,
}

const VERSION_INFO = {
    'vHH_initial': {
        'name': 'Heist and Housing Update',
        'supported': false,
		'steamdb_buildid': '12980251',
		'crc32_windows': undefined,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vCHP_latest': {
        'name': 'Patch + Cosmetics + Heist Planner Update',
        'supported': true,
		'steamdb_buildid': '12437491',
		'crc32_windows': '98F3F212',
        'manifest_windows': '6080836104571247089',
        'manifest_macos': '6696505757018614311',
        'manifest_linux': '994994544851264338',
    },
    'vCHP_initial': {
        'name': 'Patch + Cosmetics + Heist Planner Update (initial build)',
        'supported': false,
		'hideindropdown': true,
		'firstbuild': true,
		'steamdb_buildid': '12268751',
		'crc32_windows': 'A5954457',
        'manifest_windows': '7161133995973860705',
        'manifest_macos': '6311011063643256594',
        'manifest_linux': '4354764687800420988',
    },
    'vEV': {
        'name': 'Enemies + Vehicles Update',
		'supported': false,
		'steamdb_buildid': '12146743',
		'crc32_windows': undefined,
        'manifest_windows': '5323332575527167787',
        'manifest_macos': '30505314974738315',
        'manifest_linux': '4224516891669427196',
    },
    'vHR_last': {
        'name': 'Heist Reworks Update Rollback',
		'_note': '(last public branch build) before Enemy + Vehicle Update',
		'supported': false,
		'steamdb_buildid': '12154076',
		'crc32_windows': 'F490BFCD',
        'manifest_windows': '7432145351273649667',
        'manifest_macos': '4759878000052750572',
        'manifest_linux': '2946460705531773760',
    },
    'vHR': {
        'name': 'Heist Reworks Update Rollback (initial rollback)',
        'supported': false,
		'hideindropdown': true,
		'firstbuild': true,
		'_note': 'has new icon?',
		'steamdb_buildid': '11601744',
		'crc32_windows': '2DB82D99',
        'manifest_windows': '9136054215769811295',
        'manifest_macos': '3308372407716214796',
        'manifest_linux': '6376062607261038989',
    },
    'vHRP': {
        'name': 'Heist Reworks Preview',
        'firstbuild': true,
		'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vOM4': {
        'name': 'Optimization Madness Patch 4',
        'long_name': 'Optimization Madness Update, Patch 4',
        'supported': false,
		'_note': 'has old icon!',
		'steamdb_buildid': '11081145',
		'crc32_windows': '7D0E5A7E',
        'manifest_windows': '6832944460612416007',
        'manifest_macos': '2223563822179351257',
        'manifest_linux': '134824437052749935',
    },
    'vOM': {
        'name': 'Optimization Madness Update',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vGS3': {
        'name': 'Graphics+Maps+Noots, Spr Patch 3',
        'long_name': 'Graphics + Maps + Noots, Spring Patch 3',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vGS2': {
        'name': 'Graphics+Maps+Noots, Spr Patch 2',
        'long_name': 'Graphics + Maps + Noots, Spring Patch 2',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vGS2': {
        'name': 'Graphics+Maps+Noots Update',
        'long_name': 'Graphics + Maps + Noot Variations Update',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vJ': {
        'name': 'January Update',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vP': {
        'name': 'Post Office Update',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vW': {
        'name': 'Winter Update',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vBP': {
        'name': 'Blueprint Update',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vPBP': {
        'name': 'pre-Blueprint Update',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    }
}