var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

function deleteMemory() {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}

const aobjRoleDescriptor = [
    { strName: 'harvester', nAmount: 2, objRole: roleHarvester, nCost: 200, aParts: [WORK,CARRY,MOVE]},
    { strName: 'builder', nAmount: 1, objRole: roleBuilder, nCost: 200, aParts: [WORK,CARRY,MOVE] },
    { strName: 'upgrader', nAmount: 1, objRole: roleUpgrader, nCost: 200, aParts: [WORK,CARRY,MOVE] }
];

function spawnCreeps(spawnMain) {
    let haCreepByRole = [];

    for (let i in aobjRoleDescriptor) {
        let objRoleDescriptor = aobjRoleDescriptor[i];

        haCreepByRole[objRoleDescriptor.strName] = _.filter(
            Game.creeps,
            function (creep) {
                return creep.memory.role == objRoleDescriptor.strName;
            }
        );
        console.log(objRoleDescriptor.strName + 's: ' + haCreepByRole[objRoleDescriptor.strName].length);

        if (null == spawnMain.spawning && objRoleDescriptor.nCost <= spawnMain.room.energyAvailable) {
            if (haCreepByRole[objRoleDescriptor.strName].length < objRoleDescriptor.nAmount) {
                var newName = objRoleDescriptor.strName + Game.time;
                console.log('Spawning new ' + objRoleDescriptor.strName + ': ' + newName);
                spawnMain.spawnCreep(objRoleDescriptor.aParts, newName,
                    { memory: { role: objRoleDescriptor.strName } });
            }
        }

    }
}

const aobjDeltas = [
    { dx: 2, dy: -2}
    , { dx: 2, dy: 0}
    , { dx: 2, dy: 2}
    , { dx: 0, dy: 2}
    , { dx: -2, dy: 2}
    , { dx: -2, dy: 0}
    , { dx: -2, dy: -2}
    , { dx: 0, dy: -2}
    , { dx: 2, dy: -4}
    , { dx: 4, dy: -4}
    , { dx: 4, dy: -2}
    , { dx: 4, dy: 0}
    , { dx: 4, dy: 2}
    , { dx: 4, dy: 4}
    , { dx: 2, dy: 4}
    , { dx: 0, dy: 4}
    , { dx: -2, dy: 4}
    , { dx: -4, dy: 4}
    , { dx: -4, dy: 2}
    , { dx: -4, dy: 0}
    , { dx: -4, dy: -2}
    , { dx: -4, dy: -4}
    , { dx: -2, dy: -4}
    , { dx: 0, dy: -4}

];

function ArePathsBlocked(posCenter, aobjMyItems, posTestingSquare) {
    
    let bGoodPath = true;
    let iCurrent = 0;
    while(bGoodPath && iCurrent < aobjMyItems.length) {
        let astepPath = Game.rooms[posCenter.roomName].findPath(
            posCenter
            , aobjMyItems[iCurrent].pos
            , {
                ignoreCreeps: true
                , range: 1
                , costCallback: function(strRoomName, objCostMatrix) {
                    let room = Game.rooms[strRoomName];
                    if (!room) { return; }
                    room.find(FIND_STRUCTURES).forEach(
                        function(struct) {
                            if( STRUCTURE_WALL == struct.structureType ) {
                                objCostMatrix.set( struct.pos.x, struct.pos.y, 255 );
                            }
                        }
                    );
                    objCostMatrix.set( posTestingSquare.x, posTestingSquare.y, 255 );
                    //if( subCostCallback ) {
                        //subCostCallback( strRoomName, objCostMatrix );
                    //}
                }
            }
        );
        bGoodPath = astepPath && 0 < astepPath.length;
        ++iCurrent;
    }
    return bGoodPath;
}

function GetExtensionPos(iStarting, posCenter, aobjMyItems) {
    
    let i = iStarting;
    let posPossibleLocation = null;
    while (!posPossibleLocation && i < aobjDeltas.length) {

        posPossibleLocation = Game.rooms[posCenter.roomName].getPositionAt(posCenter.x + aobjDeltas[i].dx, posCenter.y + aobjDeltas[i].dy);
        if (ArePathsBlocked(posCenter, aobjMyItems, posPossibleLocation)) {
            posPossibleLocation = null;
        }
        ++i;
    }
    
    return posPossibleLocation;
}

const hMaxExtensionsByLevel = {
    1: 0
    , 2: 5
    , 3: 10
    , 4: 20
    , 5: 30
    , 6: 40
    , 7: 50
    , 8: 60
};

function GetStructuresInRoom(roomToCheck) {
    return _.filter(
        Game.structures
        , (struct) => struct.room.name == roomToCheck.name
    );
}

function GetSourcesInRoom(roomToCheck) {
    return roomToCheck.find(FIND_SOURCES);
}

function constructExtensions(spawnMain) {
    //if I can create extensions
    let aobjExtensionsInRoom = spawnMain.room.find(
        FIND_MY_STRUCTURES
        , { filter: { structureType: STRUCTURE_EXTENSION } }
    );
    if (hMaxExtensionsByLevel[spawnMain.room.controller.level] > aobjExtensionsInRoom.length) {
        //create an extension
        let aobjMyItems = [];
        aobjMyItems.push(...GetStructuresInRoom(spawnMain.room));
        aobjMyItems.push(...GetSourcesInRoom(spawnMain.room));

        let posNextExtension = GetExtensionPos(aobjExtensionsInRoom.length, spawnMain.pos, aobjMyItems);
        if (posNextExtension) {
            spawnMain.room.createConstructionSite(posNextExtension.x, posNextExtension.y, STRUCTURE_EXTENSION);    
        }
    }
}

module.exports.loop = function () {

    deleteMemory();

    for (let strRoomName in Game.rooms) {
        let roomCurrent = Game.rooms[strRoomName];

        const spawnMain = roomCurrent.find(FIND_MY_SPAWNS)[0];

        //...

        spawnCreeps(spawnMain);

        constructExtensions(spawnMain);
    }


    /*
    var tower = Game.getObjectById('79e7a2729e772f1d3ef4ae0c');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
        
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }

    */

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        for (let i in aobjRoleDescriptor) {
            let objRoleDescriptor = aobjRoleDescriptor[i];
            if(creep.memory.role == objRoleDescriptor.strName) {
                objRoleDescriptor.objRole.run(creep);
            }
        }
    }
}

