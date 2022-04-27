/*
 * Module AIWD_Math
 * 
 * Math utility functions
 *
 */


/**
 * 
 * @param {Array} arrayNumbers An array of numerical values.
 * @returns A float equal to the standard deviation of the provided values.
 */
exports.GetStandardDeviation = function( arrayNumbers ) {
	if( !arrayNumbers || 0 === arrayNumbers.length ) {
		return 0;
	}
	else {
		const n = arrayNumbers.length;
		const mean = arrayNumbers.reduce((a, b) => a + b) / n;
		return Math.sqrt(arrayNumbers.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
	}
}
