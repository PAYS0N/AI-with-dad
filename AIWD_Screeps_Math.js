/*
 * Module AIWD_Screeps_Math
 * 
 * Math utility functions specific to Screeps
 *
 */

//TOP: 1,
//TOP_RIGHT: 2,
//RIGHT: 3,
//BOTTOM_RIGHT: 4,
//BOTTOM: 5,
//BOTTOM_LEFT: 6,
//LEFT: 7,
//TOP_LEFT: 8,

var AIWD_Javascript = require('AIWD_Javascript');
var AIWD_Screeps = require('AIWD_Screeps');

/**
 * 
 * @param {int} dir A direction constant, e.g. BOTTOM_LEFT.
 * @returns The x-component of a unit move in the provided direction, e.g. -0.707 in the case of BOTTOM_LEFT.
 */
exports.GetXComponent = function( dir ) {
	let anXComponentOfDirection = [NaN, 0, 0.707, 1, 0.707, 0, -0.707, -1, -0.707];
	return anXComponentOfDirection[dir];
}

/**
 * 
 * @param {int} dir A direction constant, e.g. BOTTOM_LEFT.
 * @returns The y-component of a unit move in the provided direction, e.g. 0.707 in the case of BOTTOM_LEFT.
 */
exports.GetYComponent = function( dir ) {
	let anYComponentOfDirection = [NaN, -1, -0.707, 0, 0.707, 1, 0.707, 0, -0.707];
	return anYComponentOfDirection[dir];
}

/**
 * 
 * @param {Array} aobjLocations An Array of locations - i.e., positions or objects containing positions.  The array may mix objects of different types so long as each is a RoomPosition or contains a RoomPosition property named 'pos'.
 * @returns A RoomPosition representing the average (center) position for the provided set of locations (positions or objects containing positions).
 * @example let posCenter = FindAverageLocation( aobjLocations );
 */
 exports.FindAverageLocation = function( aobjLocations ) {
	AIWD_Javascript.GuaranteeArgument( aobjLocations, 'object', 'Array' );
	if( 0 == aobjLocations.length ) {
		throw new RangeError( 'FindAverageLocation called with empty list.' );
	}
	else {
		let nAccumulatorX = 0;
		let nAccumulatorY = 0;
		let strRoomName = null;

		for( let i in aobjLocations ) {
			let posCurrent = AIWD_Screeps.GetPositionOf( aobjLocations[i] );
			
			
			if( strRoomName == null ) {
				strRoomName = posCurrent.roomName;
			}

			if( strRoomName != posCurrent.roomName ) {
				console.log( "WARNING: ignoring position [" + posCurrent + "] outside initial room \"" + strRoomName + "\" in average calculation." );
			}
			else {
				nAccumulatorX += posCurrent.x;
				nAccumulatorY += posCurrent.y;
			}
		}
		//let posAccumulator = aobjLocations.reduce((posA, posB) => Game.spawns['Spawn1'].room.getPositionAt(posA.x + posB.x, posA.y + posB.y));
		nAccumulatorX = Math.floor( nAccumulatorX/aobjLocations.length );
		nAccumulatorY = Math.floor( nAccumulatorY/aobjLocations.length );
		return new RoomPosition( nAccumulatorX, nAccumulatorY, strRoomName );
	}
}

//let aposBoundingBox = GetBoundingBox( aposThingsToProtect );
exports.GetBoundingBox = function( aposThingsToProtect ) {
	
	if( 0 == aposThingsToProtect.length ) {
		throw new RangeError( 'GetBoundingBox called with empty list.' );
	}
	else {
		let anX = _.map( aposThingsToProtect, (pos) => pos.x );
		let anY = _.map( aposThingsToProtect, (pos) => pos.y );

		let posUpperLeft = Game.rooms[aposThingsToProtect[0].roomName].getPositionAt( Math.min.apply(null, anX), Math.min.apply(null, anY) );
		let posLowerRight = Game.rooms[aposThingsToProtect[0].roomName].getPositionAt( Math.max.apply(null, anX), Math.max.apply(null, anY) );

		new RoomVisual('Spawn1')
			.circle(posUpperLeft)
			.line(posUpperLeft.x,posUpperLeft.y,posLowerRight.x,posUpperLeft.y)
			.line(posLowerRight.x,posUpperLeft.y,posLowerRight.x,posLowerRight.y)
			.line(posLowerRight.x,posLowerRight.y,posUpperLeft.x,posLowerRight.y)
			.line(posUpperLeft.x,posLowerRight.y,posUpperLeft.x,posUpperLeft.y)
		;

		return [posUpperLeft, posLowerRight];
	}
}
