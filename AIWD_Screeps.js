/**
* 
* AIWD_Screeps utility functions
*
*/

var AIWD_Javascript = require('AIWD_Javascript');

/**
 * 
 * @param {Object} obj A RoomPosition object or an object that contains a property named 'pos' containing a RoomPosition object.
 * @returns The RoomPosition object associated wtih obj.  If obj IS a RoomPosition, returns it.
 */
exports.GetPositionOf = function( obj ) {
	AIWD_Javascript.GuaranteeArgument( obj, 'object' );
	if( 'pos' in obj ) {
		return obj.pos;
	}
	if( 'x' in obj && 'y' in obj && 'roomName' in obj ) {
		return obj;
	}
	throw new TypeError("Argument \"" + obj + "\" does not associate to a position.");
}

exports.IsInitialized = function() {
	return Memory.flags.bInitialized;
}

exports.Initialize = function() {
	if( ! Memory.flags.bInitialized ) {
		Memory.flags.bSuicideEmptyUpgraderSmall = false;
		Memory.flags.bInitialized = true;
	}
}

let ASOURCES_IN_ROOM = null;
exports.GetSourcesInRoom = function( room ) {
	if( null == ASOURCES_IN_ROOM ) {
		ASOURCES_IN_ROOM = room.find(FIND_SOURCES);
	}
	return ASOURCES_IN_ROOM;
}

let H_N_ENERGY_AVAILABLE_BY_ROOM_NAME = [];
exports.GetAvailableEnergyFromAllSources = function( room ) {

	let asourcesFound = exports.GetSourcesInRoom( room );
	if( ! H_N_ENERGY_AVAILABLE_BY_ROOM_NAME[room.name] ) {
		H_N_ENERGY_AVAILABLE_BY_ROOM_NAME[room.name] = asourcesFound.reduce(
			(previousValue, source) => previousValue + source.energy
			, 0
		);
	}
	//console.log( "H_N_ENERGY_AVAILABLE_BY_ROOM_NAME[" + room.name + "] = " + H_N_ENERGY_AVAILABLE_BY_ROOM_NAME[room.name] );

	return H_N_ENERGY_AVAILABLE_BY_ROOM_NAME[room.name];
}

exports.GetSpawningCreep = function( spawn ) {
	return spawn.spawning ? Game.creeps[spawn.spawning.name] : null;
}

exports.GetNumberSpawningByRole = function( spawn, strCreepRole ) {
	let spawningCreep = exports.GetSpawningCreep( spawn );
	return (spawningCreep && strCreepRole == spawningCreep.memory.role) ? 1 : 0;
}

exports.GetStructuresInRoom = function( roomToCheck ) {
	return _.filter( 
		Game.structures 
		, (struct) => struct.room.name == roomToCheck.name 
	);
}

/**
* 
* Clear memory from deceased creeps
*
*/
exports.ManageMemory = function() {
    for( let name in Memory.creeps ) {
        if( !Game.creeps[name] ) {
            delete Memory.creeps[name];
            console.log( 'Clearing non-existing creep memory: ', name );
        }
    }
}

//TODO: Find a better way.
exports.IsASource = function( obj ) {
		let bResult = ('pos' in obj) && ('room' in obj) && ('energy' in obj) && ('energyCapacity' in obj) && ('id' in obj) && ('ticksToRegeneration' in obj);
		return bResult;
}

//returns array like:
//[
//    { x: 10, y: 5, dx: 1,  dy: 0, direction: RIGHT },
//    { x: 10, y: 6, dx: 0,  dy: 1, direction: BOTTOM },
//    { x: 9,  y: 7, dx: -1, dy: 1, direction: BOTTOM_LEFT },
//    ...
//]
//let astepPath = GetCreepPath( objFrom, objTo, nRangeToTarget );
exports.GetCreepPath = function( objFrom, objTo, nRangeToTarget, subCostCallback ) {
	let posFrom = exports.GetPositionOf(objFrom);
	let posTo = exports.GetPositionOf(objTo);
	let roomFrom = Game.rooms[posFrom.roomName];

	const astepPath = roomFrom.findPath(
		posFrom
		, posTo
		, {
			costCallback: function( roomName, costMatrix ) {
				let room = Game.rooms[roomName];
				if (!room) return;
				room.find( FIND_STRUCTURES ).forEach( function(struct) {
					if (struct.structureType === STRUCTURE_WALL) {
						costMatrix.set( struct.pos.x, struct.pos.y, 255 );
					}
				});
				if( subCostCallback ) {
					subCostCallback( roomName, costMatrix );
				}
			}
			, ignoreCreeps: true
			, range: nRangeToTarget
		}
	);
	
	return astepPath ? astepPath : [];
}

//let aobjReachable = GetObjectsACreepCanReach( posFrom, aobjToCheck, nRange );
// Returns an Array of objects of those in aobjToCheck that creeps could reach within nRange of from posFrom
exports.GetObjectsACreepCanReach = function( posFrom, aobjToCheck, nRange ) {
	let aobjReachable = [];

	for( let i in aobjToCheck ) {
		let objToReach = aobjToCheck[i];
		let posToReach = exports.GetPositionOf( objToReach );
		
		let pathFinderResult = PathFinder.search(
			posFrom, 
			{pos: posToReach, range: nRange},
			{
				roomCallback: function(roomName) {
					let room = Game.rooms[roomName];
					if (!room) return;
					let costs = new PathFinder.CostMatrix;
			
					room.find(FIND_STRUCTURES).forEach(function(struct) {
						if (struct.structureType === STRUCTURE_WALL) {
							costs.set(struct.pos.x, struct.pos.y, 255);
						}
					});
					
					return costs;
				}
			}
		);
		
		if( ! pathFinderResult.incomplete ) {
			//console.log( "\tThere IS a path." );
			aobjReachable.push( objToReach );
		} else {
			//console.log( "\tThere IS NOT a path." );
		}
	}
	
	return aobjReachable;
}

//let asourceReachable = GetSourcesICanReach( roomToCheck, objReachableFrom );
// Returns an Array of Source objects in roomToCheck that creeps could reach from objReachableFrom
exports.GetSourcesICanReach = function( roomToCheck, objReachableFrom ) {

	return exports.GetObjectsACreepCanReach( 
		objReachableFrom.pos 
		, exports.GetSourcesInRoom( roomToCheck ) 
		, 1 
	);

}

// This data from https://docs.screeps.com/control.html.  Probably best to not use the table directly; use the accessor functions below.
const aobjBuildingByControllerLevel = [
	{ nEnergy: 0, nContainers: 5, nSpawns: 0, nExtensions: 0, nExtensionCapacity: 0, nRampartMaxHits: 0, bWalls: false, nTowers: 0, bStorage: false, nLinks: 0, bExtractor: false, nLabs: 0, bTerminal: false, bFactory: false, bObserver: false, bPowerSpawn: false, bNuker: false }
	, { nEnergy: 200, nContainers: 5, nSpawns: 1, nExtensions: 0, nExtensionCapacity: 0, nRampartMaxHits: 0, bWalls: false, nTowers: 0, bStorage: false, nLinks: 0, bExtractor: false, nLabs: 0, bTerminal: false, bFactory: false, bObserver: false, bPowerSpawn: false, bNuker: false }
	, { nEnergy: 45000, nContainers: 5, nSpawns: 1, nExtensions: 5, nExtensionCapacity: 50, nRampartMaxHits: 300000, bWalls: true, nTowers: 0, bStorage: false, nLinks: 0, bExtractor: false, nLabs: 0, bTerminal: false, bFactory: false, bObserver: false, bPowerSpawn: false, bNuker: false }
	, { nEnergy: 135000, nContainers: 5, nSpawns: 1, nExtensions: 10, nExtensionCapacity: 50, nRampartMaxHits: 1000000, bWalls: true, nTowers: 1, bStorage: false, nLinks: 0, bExtractor: false	, nLabs: 0, bTerminal: false, bFactory: false, bObserver: false, bPowerSpawn: false, bNuker: false }
	, { nEnergy: 405000, nContainers: 5, nSpawns: 1, nExtensions: 20, nExtensionCapacity: 50, nRampartMaxHits: 3000000, bWalls: true, nTowers: 1, bStorage: true, nLinks: 0, bExtractor: false, nLabs: 0, bTerminal: false, bFactory: false, bObserver: false, bPowerSpawn: false, bNuker: false }
	, { nEnergy: 1215000, nContainers: 5, nSpawns: 1, nExtensions: 30, nExtensionCapacity: 50, nRampartMaxHits: 10000000, bWalls: true, nTowers: 2, bStorage: true, nLinks: 2, bExtractor: false, nLabs: 0, bTerminal: false, bFactory: false, bObserver: false, bPowerSpawn: false, bNuker: false }
	, { nEnergy: 3645000, nContainers: 5, nSpawns: 1, nExtensions: 40, nExtensionCapacity: 50, nRampartMaxHits: 30000000, bWalls: true, nTowers: 2, bStorage: true, nLinks: 3, bExtractor: true, nLabs: 3, bTerminal: true, bFactory: false, bObserver: false, bPowerSpawn: false, bNuker: false }
	, { nEnergy: 10935000, nContainers: 5, nSpawns: 2, nExtensions: 50, nExtensionCapacity: 100, nRampartMaxHits: 100000000, bWalls: true, nTowers: 3, bStorage: true, nLinks: 4, bExtractor: true, nLabs: 6, bTerminal: true, bFactory: true, bObserver: false, bPowerSpawn: false, bNuker: false }
	, { nEnergy: NaN, nContainers: 5, nSpawns: 3, nExtensions: 60, nExtensionCapacity: 200, nRampartMaxHits: 300000000, bWalls: true, nTowers: 6, bStorage: true, nLinks: 6, bExtractor: true, nLabs: 10, bTerminal: true, bFactory: true, bObserver: true, bPowerSpawn: true, bNuker: true }
];

exports.GetEnergyCostAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].nEnergy; }
exports.GetContainersAllowedAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].nSpawns; }
exports.GetSpawnsAllowedAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].nSpawns; }
exports.GetExtensionsAllowedAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].nExtensions; }
exports.GetExtensionCapacityAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].nExtensionCapacity; }
exports.GetRampartMaxHitsAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].nRampartMaxHits; }
exports.IsWallAllowedAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].bWalls; }
exports.GetTowersAllowedAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].nTowers; }
exports.IsStorageAllowedAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].bStorage; }
exports.GetLinksAllowedAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].nLinks; }
exports.IsExtractorAllowedAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].bExtractor; }
exports.GetLabsAllowedAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].nLabs; }
exports.IsTerminalAllowedAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].bTerminal; }
exports.IsFactoryAllowedAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].bFactory; }
exports.IsObserverAllowedAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].bObserver; }
exports.IsPowerSpawnAllowedAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].bPowerSpawn; }
exports.IsNukerAllowedAtRoomControlLevel = function( nRoomControlLevel ) { return aobjBuildingByControllerLevel[nRoomControlLevel].bNuker; }
