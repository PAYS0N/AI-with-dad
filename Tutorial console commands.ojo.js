
//https://screeps.com/a/#!/sim


// lifecycle = c. 1500 game ticks

// Make sure that at least one of your creeps regularly performs the function upgradeController.

// Spawn harvester
Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester1', { memory: { role: 'harvester' } } );
Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester2', { memory: { role: 'harvester' } } );

// Spawn big harvester
Game.spawns['Spawn1'].spawnCreep( [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE], 'HarvesterBig', { memory: { role: 'harvester' } } );

// Spawn upgrader
Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Upgrader1', { memory: { role: 'upgrader' } } );

// Spawn builder
Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Builder1', { memory: { role: 'builder' } } );

// Kill (cause to suicide) a creep
Game.creeps['Harvester1'].suicide();

// Set safe mode
Game.spawns['Spawn1'].room.controller.activateSafeMode();

// Create a tower
Game.spawns['Spawn1'].room.createConstructionSite( 23, 22, STRUCTURE_TOWER );





// Claim a room (by claiming its controller)
//	Make sure your GCL is higher then the numer of room controllers you currently control. Create a creep with one or more CLAIM parts. Other than a MOVE part to get them into position, no other part is necessary to claim a room.


// Create an extension, which holds energy for use
if( room.controller.level > 1 && 
Game.spawns['Spawn1'].room.createConstructionSite( 23, 22, STRUCTURE_TOWER );


Game.getObjectById('31a956e85112f830321300d1').pos.getRangeTo(20, 25);

// Draw some items on screen
new RoomVisual('Spawn1').circle(10,20).line(0,0,10,20);
new RoomVisual('Spawn1').text('Some text', 1, 1, {align: 'left'}); 

