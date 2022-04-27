/*
 * Module role.builder
 * 
 */

const anDirections = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

		//let strLogLine = "";
		
		//strLogLine += "Processing creep \"" + creep.name + "\": ";

	    if( creep.memory.building && 0 == creep.store[RESOURCE_ENERGY] ) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if( !creep.memory.building && 0 == creep.store.getFreeCapacity() ) {
	        creep.memory.building = true;
	        creep.say('🛠️ build');
	    }

	    if(creep.memory.building) {
			//strLogLine += "Building...";
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if( targets.length ) {
                if( ERR_NOT_IN_RANGE == creep.build(targets[0]) ) {
					//strLogLine += "(Moving...";
                    creep.moveTo( targets[0], {visualizePathStyle: {stroke: '#ffffff'}} );
					//strLogLine += "now at [" + creep.pos + "]";
                }
				else {
					//strLogLine += "...built.";
				}
            }
			else {
				creep.say('🔄 idle');
				creep.move(anDirections[Math.floor(Math.random() * anDirections.length)]);
				// strLogLine += "...no targets.";
			}
	    }
	    else {
			//strLogLine += "Harvesting...";
	        var sources = creep.room.find(FIND_SOURCES);
            if( ERR_NOT_IN_RANGE == creep.harvest(sources[0]) ) {
				//strLogLine += "(Moving...";
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
				//strLogLine += "now at [" + creep.pos + "])";
            }
			else {
				//strLogLine += "...harvested.";
			}
	    }

		//console.log( strLogLine );
	}
};

module.exports = roleBuilder;
