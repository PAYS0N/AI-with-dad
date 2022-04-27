/*
 * Module AIWD_Javascript
 * 
 * Javascript language functions
 *
 */

/**
 * 
 * @param {Object} varObj An object variable.
 * @returns A string containing the name of the provided object variable.
 */
exports.GetVarName = function(varObj) {
	return Object.keys(varObj)[0];
}

/**
 * 
 * @param {*} arg A variable to run validation on.  The method will throw various errors if the variable doesn't satisfy certain conditions of validity, for example, having a non-null value.
 * @param {string} strTypeExpected The type that the provided argument must have, lest this method throw an error.  For example, 'object' for an object variable.
 * @param {string} strClassExpected Optional.  A string representing the class of the provided argument, if an object.
 */
exports.GuaranteeArgument = function( arg, strTypeExpected, strClassExpected ) {
	//console.log( "typeof arg = \"" + typeof arg + "\"" );
	//console.log( "arg.constructor.name = \"" + arg.constructor.name + "\"" );
	if( ! arg ) {
		throw new TypeError( 'Argument is missing or undefined' );
	}
	let strType = typeof arg;
	if( strType != strTypeExpected ) {
		throw new TypeError( "Argument type, \"" + strType + "\", doesn't match expected type \"" + strTypeExpected + "\"." );
	}
	if( 'object' == strType ) {
		if( strClassExpected && strClassExpected != arg.constructor.name ) {
			throw new TypeError( "Argument object class \"" + arg.constructor.name + "\" doesn't match expected class \"" + strClassExpected + "\"." );
		}
	}
}
