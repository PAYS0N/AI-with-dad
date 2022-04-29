const STR_ROLE_HARVESTER = 'harvester';
var roleHarvester = require('role.harvester');

const STR_ROLE_UPGRADER = 'upgrader';
var roleUpgrader = require('role.upgrader');

const STR_ROLE_BUILDER = 'builder';
var roleBuilder = require('role.builder');

const N_ROOM_WIDTH = 50;
const N_ROOM_HEIGHT = 50;

var AIWD_Math = require('AIWD_Math');

var AIWD_Screeps_Math = require('AIWD_Screeps_Math');

var AIWD_Javascript = require('AIWD_Javascript');

var AIWD_Screeps = require('AIWD_Screeps');


/**
* 
* Game utility functions
*
*/

//let spawnMain = GetMainSpawnInRoom( roomCurrent );
let H_SPAWN_MAIN_BY_ROOM_NAME = [];
function GetMainSpawnInRoom( roomCurrent ) {
	if( ! H_SPAWN_MAIN_BY_ROOM_NAME[roomCurrent.name] ) {
		//console.log( "Seeking main spawn for room \"" + roomCurrent.name + "\"" );
		let aspawnInRoom = roomCurrent.find(FIND_MY_SPAWNS);
		let spawnMain = null;
		// if there's only one spawn, it's the main
		if( 1 == aspawnInRoom.length ) {
			spawnMain = aspawnInRoom[0];
			spawnMain.memory.bIsMain = true;
		}
		else {
			// if there's more than one, check for a memory flag
			aspawnMarkedMain = _.filter( aspawnInRoom, (spawn) => spawn.memory.bIsMain );
			if( 0 < aspawnMarkedMain.length ) {
				spawnMain = aspawnMarkedMain[0];
				spawnMain.memory.bIsMain = true;
			}
			else {
				// if there's more than one and no memory flag, pick the one closest to the center
				let posCenter = roomCurrent.getPositionAt( Math.floor(N_ROOM_WIDTH/2), Math.floor(N_ROOM_HEIGHT/2) );
				spawnMain = posCenter.findClosestByRange(aspawnInRoom);
				spawnMain.memory.bIsMain = true;
			}
		}
		//spawnMain.room.visual.text(
		//	'Main spawn'
		//	, spawnMain.pos.x + 1
		//	, spawnMain.pos.y
		//	, {align: 'left', opacity: 0.8}
		//);
		H_SPAWN_MAIN_BY_ROOM_NAME[roomCurrent.name] = spawnMain;
	}
	
	return H_SPAWN_MAIN_BY_ROOM_NAME[roomCurrent.name];
}

/**
 * 
 * @param {Array} aobjNotProtected An Array of location objects that you want protected.
 * @param {int} nPreferredCoverageDistance The distance away from the protected points that you want a tower.  For example, if nPreferredCoverageDistance == 5 and you provide an unprotected source, the associated recommended tower position returned will be on a line from the center of the objects 5 units further than the unprotected source.
 * @returns An Array of RoomPosition objects nPreferredCoverageDistance units outside the provided unprotected objects with respect to the geographic center of the provided objects.  The Array is in decreasing order of "how far out" the positions are.
 */
function GetOutsideTowerPositions( aobjNotProtected, nPreferredCoverageDistance ) {
	let hPosByStdDev = {};
	
	if( 0 == aobjNotProtected.length ) {
		return [];
	}
	else {
		for( let i in aobjNotProtected ) {
			let posCurrent = AIWD_Screeps.GetPositionOf( aobjNotProtected[i] );
			let anXComponentToOtherPositions = [];
			let anYComponentToOtherPositions = [];
			for( let j in aobjNotProtected ) {
				let posComparing = AIWD_Screeps.GetPositionOf( aobjNotProtected[j] );
				if( i != j ) {
					// Get direction to the other pos
					anXComponentToOtherPositions.push( posCurrent.x - posComparing.x );
					anYComponentToOtherPositions.push( posCurrent.y - posComparing.y );
					//new RoomVisual('Spawn1').circle(posCurrent).line(posCurrent,posComparing);
				}
			}

			// store average direction, stddev
			const fXComponentAverage = anXComponentToOtherPositions.reduce((a, b) => a + b) / anXComponentToOtherPositions.length;
			const fYComponentAverage = anYComponentToOtherPositions.reduce((a, b) => a + b) / anYComponentToOtherPositions.length;
			//new RoomVisual('Spawn1').circle(posCurrent).line(posCurrent.x,posCurrent.y,posCurrent.x+fXComponentAverage,posCurrent.y+fYComponentAverage);
			const fXStandardDeviation = AIWD_Math.GetStandardDeviation(anXComponentToOtherPositions);
			const fYStandardDeviation = AIWD_Math.GetStandardDeviation(anYComponentToOtherPositions);
			let fSdtDevAvg = (fXStandardDeviation + fYStandardDeviation)/2;
			//new RoomVisual('Spawn1').text( fSdtDevAvg.toFixed(2), posCurrent.x+1, posCurrent.y-1 );

			let fMax = Math.max( Math.abs(fXComponentAverage), Math.abs(fYComponentAverage) );
			let posOutside = Game.rooms[posCurrent.roomName].getPositionAt( 
				Math.floor( posCurrent.x + (nPreferredCoverageDistance*fXComponentAverage/fMax) ) 
				, Math.floor( posCurrent.y + (nPreferredCoverageDistance*fYComponentAverage/fMax) ) 
			);
			
			let fIndexValue = fSdtDevAvg.toFixed(2);
			while( hPosByStdDev[fIndexValue] ) {
				fIndexValue += 0.01;
			}
			hPosByStdDev[fIndexValue] = posOutside;

		}

		let akeysSorted = Object.keys(hPosByStdDev).sort();
		return _.map( akeysSorted, function(strKey) { return hPosByStdDev[strKey]; } );
	}

}

/**
*
* GetBestTowerLocation( aobjNotProtected, posSpawn, nPreferredCoverageDistance )
*
*/
// For a given set of positions we want to protect, return the best tower position.
function GetBestTowerLocation( aobjNotProtected, posSpawn, nPreferredCoverageDistance ) {
	
	let posBestChoice = null;

	if( 0 < aobjNotProtected.length ) {

		let nStartingDistance = Math.floor(nPreferredCoverageDistance/2);
		let aposTowerOptions = GetOutsideTowerPositions( aobjNotProtected, nStartingDistance );

		// this array is used to set additional positions around the source as unusable.
		let asources = _.filter( aobjNotProtected, (obj) => AIWD_Screeps.IsASource(obj) );
		
		let bFound = false;
		let astepPath = [];
		let iTargetChoice = 0;
		let posTarget = aposTowerOptions[iTargetChoice];
		let nCoverageDistance = nStartingDistance;
		while( posTarget && !bFound ) {
			astepPath = AIWD_Screeps.GetCreepPath( 
				posSpawn
				, posTarget
				, nCoverageDistance
				, function( roomName, costMatrix ) {
					for( let iSource in asources ) {
						let source = asources[iSource];
						let anOffsets = [-1, 0, 1];
						for( let i = 0; i < anOffsets.length; ++i ) {
							for( let j = 0; j < anOffsets.length; ++j ) {
								if( 0 != anOffsets[i] || 0 != anOffsets[j] ) {
									let nX = source.pos.x + anOffsets[i];
									let nY = source.pos.y + anOffsets[j];
									costMatrix.set( nX, nY, 255 );
								}
							}
						}
					}
				}
			);
			if( 0 != astepPath.length ) {
				// && Game.rooms[posTarget.roomName].getPositionAt( stepLast.x, stepLast.y ).getRangeTo() 
				bFound = true;
			}
			else {
				++nCoverageDistance;
				if( nCoverageDistance > nPreferredCoverageDistance ) {
					++iTargetChoice;
					posTarget = aposTowerOptions[iTargetChoice];
					nCoverageDistance = nStartingDistance;
				}
			}
		}
		
		if( posTarget ) {
			let stepLast = astepPath[astepPath.length-1];
			//new RoomVisual('Spawn1').circle(stepLast.x, stepLast.y);

			posBestChoice = Game.rooms[posTarget.roomName].getPositionAt( stepLast.x, stepLast.y );
		}
	}

	return posBestChoice;
}


/**
* 
* Manage towers
*
*/
function ManageTowers( roomToManage, posBasePath ) {

	if( 0 == roomToManage.find(FIND_CONSTRUCTION_SITES).length && AIWD_Screeps.GetTowersAllowedAtRoomControlLevel( roomToManage.controller.level ) > AIWD_Screeps.GetStructuresInRoom( roomToManage ).filter( (struct) => STRUCTURE_TOWER == struct.structureType ).length ) {
		let aobjThingsToProtect = GetAllObjectsToProtectInRoom( roomToManage, posBasePath );
		let aobjNotProtected = GetObjectsNotAlreadyProtected( aobjThingsToProtect, 5 );
		let posNewTower = GetBestTowerLocation( aobjNotProtected, posBasePath, 5 );
		if( posNewTower ) {
			let nResult = roomToManage.createConstructionSite( posNewTower.x, posNewTower.y, STRUCTURE_TOWER );
			if( 0 != nResult ) {
console.log( "Tower construction result (" + posNewTower.x + ", " + posNewTower.y + "): " + nResult );
			}
		}
	}
	
    for( let strStructureName in Game.structures ) {
        let structure = Game.structures[strStructureName];
		
		if( STRUCTURE_TOWER == structure.structureType ) {
			let closestDamagedStructure = structure.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: (struct) => struct.hits < struct.hitsMax
			});
			if(closestDamagedStructure) {
				structure.repair(closestDamagedStructure);
			}

			let closestHostile = structure.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if(closestHostile) {
				structure.attack(closestHostile);
			}
		}
    }

	return {
//        nHarvestersBefore: harvesters.length,
    };
}

/**
* 
* Manage harvesters
*
*/
function ManageHarvesters( spawn ) {
	
    let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == STR_ROLE_HARVESTER);
    //console.log('Harvesters: ' + harvesters.length);
	let spawningCreep = AIWD_Screeps.GetSpawningCreep( spawn );
	let nHarvestersSpawning = AIWD_Screeps.GetNumberSpawningByRole( spawn, STR_ROLE_HARVESTER );

	const nEnergyAvailableFromSources = AIWD_Screeps.GetAvailableEnergyFromAllSources( spawn.room );

	let aaHarvesterUpgradePath = [
		['Harvester', STR_ROLE_HARVESTER, 1, 200, 400, [WORK,CARRY,MOVE]]
		, ['Harvester', STR_ROLE_HARVESTER, 2, 500, 1000, [WORK,WORK,CARRY,CARRY,MOVE,MOVE]]
		, ['Harvester', STR_ROLE_HARVESTER, 3, 1000, 10000, [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE]]
	];
	// if fewer than n harvesters and enough energy and a resource available, create the highest-level harvester possible
    if( 3 > (harvesters.length + nHarvestersSpawning) && 200 < spawn.room.energyAvailable && 300 < nEnergyAvailableFromSources ) {
        let newName = 'Harvester' + Game.time;
		let nSpawnDryRunResult = spawn.spawnCreep([WORK,CARRY,MOVE], newName, {memory: {role: STR_ROLE_HARVESTER, level: 1}, dryRun: true });
		if( OK == nSpawnDryRunResult ) {
			console.log('Spawning new harvester: ' + newName);
			spawn.spawnCreep([WORK,CARRY,MOVE], newName, {memory: {role: STR_ROLE_HARVESTER, level: 1}});
		}
		else {
			console.log('Unable to spawn new harvester: \"' + nSpawnDryRunResult + '\"');
		}
    }
	else {
		// if = 3 harvesters and enough energy and a resource available, upgrade a harvester
		if( 3 == harvesters.length ) {
			// if there is a harvester to upgrade && there is enough energy available && there is enough energy to make it worth it
			//	&& 500 < spawn.room.energyAvailable && 600 < nEnergyAvailableFromSources ) {
			// then upgrade a harvester
		}
		// if > 3 harvesters available, suicide a lowest-level harvester
	}
	
	return {
        nHarvestersBefore: harvesters.length,
    };
}

/**
* 
* Manage upgraders
*
*/
function ManageUpgraders( spawn ) {
    let upgradersemptysmall = _.filter(Game.creeps, (creep) => creep.memory.role == STR_ROLE_UPGRADER && 0 == creep.store[RESOURCE_ENERGY] && 3 == creep.body.length);
    //console.log('UpgradersEmptySmall: ' + upgradersemptysmall.length);
	if( Memory.flags.bSuicideEmptyUpgraderSmall && 0 < upgradersemptysmall.length ) {
		console.log('Killing: ' + upgradersemptysmall[0].name);
		upgradersemptysmall[0].say('🔄 Goodbye, cruel world!');
		upgradersemptysmall[0].suicide();
		Memory.flags.bSuicideEmptyUpgraderSmall = false;
	}
	
    let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == STR_ROLE_UPGRADER);

	let spawningCreep = AIWD_Screeps.GetSpawningCreep( spawn );
	let nUpgradersSpawning = (spawn.spawning && STR_ROLE_UPGRADER == spawningCreep.memory.role && 1 == spawningCreep.memory.level ? 1 : 0);

	let upgradersbig = _.filter(Game.creeps, (creep) => creep.memory.role == STR_ROLE_UPGRADER && 3 < creep.body.length);

	const nEnergyAvailableFromSources = AIWD_Screeps.GetAvailableEnergyFromAllSources( spawn.room );

    if( 3 > (upgraders.length + nUpgradersSpawning) && 200 < spawn.room.energyAvailable && 300 < nEnergyAvailableFromSources ) {
        let newName = 'Upgrader' + Game.time;
		let nSpawnDryRunResult = spawn.spawnCreep([WORK,CARRY,MOVE], newName, {memory: {role: STR_ROLE_UPGRADER, level: 1}, dryRun: true });
		if( OK == nSpawnDryRunResult ) {
			console.log('Spawning new upgrader: ' + newName);
			spawn.spawnCreep([WORK,CARRY,MOVE], newName, {memory: {role: STR_ROLE_UPGRADER, level: 1}});
		}
		else {
			console.log('Unable to spawn new upgrader: \"' + nSpawnDryRunResult + '\"');
		}
    }
	else {
		let nUpgradersBigSpawning = (spawn.spawning && STR_ROLE_UPGRADER == spawningCreep.memory.role && 2 == spawningCreep.memory.level ? 1 : 0);

		if( !Memory.flags.bSuicideEmptyUpgraderSmall && 3 > (upgradersbig.length + nUpgradersBigSpawning) && 1000 < spawn.room.energyAvailable ) {
			let newName = 'UpgraderBig' + Game.time;
			console.log('Spawning new upgrader: ' + newName);
			spawn.spawnCreep( [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE], newName, { memory: { role: STR_ROLE_UPGRADER, level: 2 } } );
			
			// Look for an empty upgrader to suicide until you find one.
			Memory.flags.bSuicideEmptyUpgraderSmall = true;
		}
	}

	return {
        nUpgradersBefore: upgraders.length
		, nUpgradersSpawning: nUpgradersSpawning
		, upgradersbig: upgradersbig.length
    };
}

//STRUCTURE_SPAWN
//STRUCTURE_EXTENSION
//STRUCTURE_ROAD
//STRUCTURE_WALL
//STRUCTURE_RAMPART
//STRUCTURE_KEEPER_LAIR
//STRUCTURE_PORTAL
//STRUCTURE_CONTROLLER
//STRUCTURE_LINK
//STRUCTURE_STORAGE
//STRUCTURE_TOWER
//STRUCTURE_OBSERVER
//STRUCTURE_POWER_BANK
//STRUCTURE_POWER_SPAWN
//STRUCTURE_EXTRACTOR
//STRUCTURE_LAB
//STRUCTURE_TERMINAL
//STRUCTURE_CONTAINER
//STRUCTURE_NUKER
//STRUCTURE_FACTORY
//STRUCTURE_INVADER_CORE

//TODO: change to protect specific sources - closest, ones we "own", whatever.
//let aobjThingsToProtect = GetAllObjectsToProtectInRoom( roomToCheck, objReachableFrom );
function GetAllObjectsToProtectInRoom( roomToCheck, objReachableFrom ) {
	//AIWD_Javascript.GuaranteeArgument( roomToCheck, 'object' );
	if (typeof roomToCheck === 'undefined') {
		throw new TypeError('First argument is missing / not defined');
	}
	//AIWD_Javascript.GuaranteeArgument( objReachableFrom, 'object' );
	if (typeof objReachableFrom === 'undefined') {
		throw new TypeError('First argument is missing / not defined');
	}
		
	// Start with all of the structures I own.
	let astructAll = AIWD_Screeps.GetStructuresInRoom( roomToCheck );
	if( 0 < astructAll.length ) {
		// Remove the towers
		let aobjThingsToProtect = _.filter( astructAll, (struct) => struct.structureType != STRUCTURE_TOWER );
		if( ! aobjThingsToProtect ) {
			aobjThingsToProtect = [];
		}

		// Look for sources I can reach and include the closest one.
		let asourceReachable = AIWD_Screeps.GetSourcesICanReach( roomToCheck, objReachableFrom );
		if( 0 < asourceReachable.length ) {
			//console.log( "asourceReachable = " + asourceReachable );
			let sourceClosest = objReachableFrom.pos.findClosestByPath(asourceReachable);
			if( sourceClosest ) {
				//console.log( "sourceClosest = " + sourceClosest );
				aobjThingsToProtect.push( sourceClosest );
			}
		}
		
		return aobjThingsToProtect;
		
	}
	
	return [];	// If we got here, nothing was found to protect.  This shouldn't happen.
}

//let aobjNotProtected = GetObjectsNotAlreadyProtected( aobjThingsToProtect, nTowerRangeRequired );
function GetObjectsNotAlreadyProtected( aobjThingsToProtect, nTowerRangeRequired ) {
	//AIWD_Javascript.GuaranteeArgument( aobjThingsToProtect, 'object', 'Array' );
	if (typeof aobjThingsToProtect === 'undefined') {
		throw new TypeError('First argument is missing / not defined');
	}

	if( 0 < aobjThingsToProtect.length ) {
		// Get positions to protect just outside the objects, but reachable
//			let aposTargetsToProtect = _filter( 
//				aobjThingsToProtect.map( (obj) => obj.pos )
//				, function(obj) {
//					
//				}
//			);
		
		// Remove things that are already protected
		//console.log( "BEFORE: " + aobjThingsToProtect.length );
		let astructTowers = _.filter(Game.structures, (struct) => STRUCTURE_TOWER == struct.structureType );
//		let aposThingsToProtect = _.map( 
//			aobjThingsToProtect
//			, function(obj) {
//				//console.log( "\tObject = " + obj );
//				return obj.pos;
//			}
//		);
		//console.log( "BEFORE: " + aposThingsToProtect.length );
		let aobjThingsToProtectReduced = [];
		if( 0 < astructTowers.length ) {
			aobjThingsToProtectReduced = _.filter( 
				aobjThingsToProtect
				, function(objToCheck) {
					let structClosest = objToCheck.pos.findClosestByRange( astructTowers );
					if( ! structClosest ) {
						return false;
					}
					else {
						let nRangeToClosestTower = structClosest.pos.getRangeTo( objToCheck.pos );
						return ( nRangeToClosestTower && NaN != nRangeToClosestTower && nRangeToClosestTower > nTowerRangeRequired );
					}
				}
			);
		}
		else {
			aobjThingsToProtectReduced = aobjThingsToProtect;
		}
		//console.log( "AFTER : " + aobjThingsToProtectReduced.length );
		return aobjThingsToProtectReduced;
	}
	
	return [];	// If we got here, nothing was found to protect.  This shouldn't happen.
}


module.exports.loop = function () {

	if( ! AIWD_Screeps.IsInitialized() ) {
		AIWD_Screeps.Initialize();
	}

	AIWD_Screeps.ManageMemory();

	for( let strRoomName in Game.rooms ) {
		let roomCurrent = Game.rooms[strRoomName];
		let spawnMain = GetMainSpawnInRoom( roomCurrent );

		// Defend what we have
			// Gather
			// Build defenses

		// Expand if we can
			// Gather
			// Upgrade/expand

		let objHarvestersResults = ManageHarvesters( spawnMain );
		
		if( 0 < objHarvestersResults.nHarvestersBefore ) {
			let objUpgradersResults = ManageUpgraders( spawnMain );
		}
		
		let objTowersResults = ManageTowers( roomCurrent, spawnMain );
		
		let spawningCreep = AIWD_Screeps.GetSpawningCreep( spawnMain );
		if( spawningCreep ) { 
			spawnMain.room.visual.text(
				'🛠️' + spawningCreep.memory.role
				, spawnMain.pos.x + 1
				, spawnMain.pos.y
				, {align: 'left', opacity: 0.8});
		}
	}

	for(let name in Game.creeps) {
		let creep = Game.creeps[name];
		if(creep.memory.role == STR_ROLE_HARVESTER) {
			roleHarvester.run(creep);
		}
		if(creep.memory.role == STR_ROLE_UPGRADER) {
			roleUpgrader.run(creep);
		}
		if(creep.memory.role == STR_ROLE_BUILDER) {
			roleBuilder.run(creep);
		}
	}
}
