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

let B_INITIALIZED = false;
exports.IsInitialized = function() {
	return B_INITIALIZED;
}

exports.Initialize = function() {
	if( ! B_INITIALIZED ) {
		Memory.flags.bSuicideEmptyUpgraderSmall = false;
		B_INITIALIZED = true;
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
	return 'effects' in obj && 'pos' in obj && 'room' in obj && 'energy' in obj && 'energyCapacity' in obj && 'id' in obj && 'ticksToRegeneration' in obj;
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
