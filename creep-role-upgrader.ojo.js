/*
 * Module role.upgrader
 * 
 */



var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

		//let strLogLine = "";
		
		//strLogLine += "Processing creep \"" + creep.name + "\"";

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }

	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
			//strLogLine += "Upgrading...";
            if( ERR_NOT_IN_RANGE == creep.upgradeController(creep.room.controller) ) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
			else {
				//creep.say('🚧 upgrade');
			}
        }
        else {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
		
		//console.log( strLogLine );
	}
};

module.exports = roleUpgrader;
