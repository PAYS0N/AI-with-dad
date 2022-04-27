/*
 * Module role.harvester
 * 
 */

const anDirections = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
		
		//let strLogLine = "";
		
		//strLogLine += "Processing creep \"" + creep.name + "\": ";

        if( creep.memory.harvesting && 0 == creep.store.getFreeCapacity() ) {
            creep.memory.harvesting = false;
            creep.say('🔄 store');
	    }

	    if( !creep.memory.harvesting && 0 == creep.store[RESOURCE_ENERGY] ) {
	        creep.memory.harvesting = true;
			creep.say('🔄 harvest');
	    }

	    if(creep.memory.harvesting) {
			//strLogLine += "Harvesting...";
			var sources = creep.room.find(FIND_SOURCES);
			if( ERR_NOT_IN_RANGE == creep.harvest(sources[0]) ) {
				//strLogLine += "(Moving...";
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
				//strLogLine += "now at [" + creep.pos + "])";
			}
			else {
				//creep.say('🔄 harvest');
			}
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && 
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });

            if( 0 < targets.length ) {
				//strLogLine += "Storing...";
				if( ERR_NOT_IN_RANGE == creep.transfer(targets[0], RESOURCE_ENERGY) ) {
					//strLogLine += "(Moving towards \"" + targets[0] + "\"...";
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
					//strLogLine += "now at [" + creep.pos + "]";
				}
				else {
					//creep.say('🔄 store');
					//strLogLine += "(Transferring resource to \"" + targets[0] + "\"...)";
				}
				//strLogLine += "...energy now = [" + creep.store[RESOURCE_ENERGY] + "]";
			}
			else {
				creep.say('🔄 idle');
				creep.move(anDirections[Math.floor(Math.random() * anDirections.length)]);
				//strLogLine += "Nowhere to store energy.";
			}

        }

		//console.log( strLogLine );
	}
};

module.exports = roleHarvester;
