'use strict';

var request = require( 'request' );
var Table   = require( 'cli-table' );

function getBasicAuth ( user, pass ) {
	return new Buffer( user + ':' + pass ).toString( 'base64' );
}

module.exports = function aoeu ( connection, done ) {
	var uri     = 'http://' + connection.server + ':' + connection.port + '/api/queues';
	var headers = { 'Authorization' : 'Basic ' + getBasicAuth( connection.user, connection.pass ) };

	request( {
		'uri'     : uri,
		'headers' : headers
	}, function ( error, response, body ) {
		if ( error ) {
			return done( error );
		}

		try {
			body = JSON.parse( body );
		} catch ( error ) {
			done( error );
		}

		var table = new Table( { 'head' : [ 'Queue Name', 'Unacked', 'Node' ] } );

		var unacked = body.filter( function ( queue ) {
			if ( queue.messages_unacknowledged ) {
				return queue;
			}
		} ).sort( function ( a, b ) {
			return b.messages_unacknowledged - a.messages_unacknowledged;
		} );

		unacked.forEach( function ( queue ) {
			table.push( [ queue.name, queue.messages_unacknowledged, queue.node ] );
		} );

		console.log( '\n\n', connection.server );
		console.log( table.toString() );

		if ( unacked.length ) {
			return done( unacked );
		}

		done();
	} );
};
