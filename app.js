/**
 * Standalone calculator site: fetches the calculators' data from the wiki,
 * puts it on the page, then loads calc.js (the same script the wiki runs),
 * which builds the calculators from it exactly as it does on the wiki.
 *
 * The data comes from the wiki's own Lua modules through its public API
 * (anonymous, CORS-enabled with origin=*), so a new base value on the wiki
 * shows up here on the next page load with nothing to redeploy.
 */
( function () {
	'use strict';

	var WIKI = 'https://fortnite-creator-islands.fandom.com';
	var HUB = 'Fish for Brainrots';
	var TABS = [ 'trade', 'value', 'collection' ];

	var params = new URLSearchParams( location.search );
	var chosen = params.get( 'brainrot' ) || 'Tim Cheese';

	// light theme when the phone asks for it; the calculator styles key off
	// the same class Fandom uses
	if ( window.matchMedia && window.matchMedia( '(prefers-color-scheme: light)' ).matches ) {
		document.documentElement.className += ' theme-fandom-light';
	}

	function show( name ) {
		if ( TABS.indexOf( name ) === -1 ) {
			name = 'trade';
		}
		TABS.forEach( function ( t ) {
			document.getElementById( 'panel-' + t ).hidden = t !== name;
			var tab = document.getElementById( 'tab-' + t );
			tab.setAttribute( 'aria-selected', t === name ? 'true' : 'false' );
		} );
	}
	window.addEventListener( 'hashchange', function () {
		show( location.hash.slice( 1 ) );
	} );
	show( location.hash.slice( 1 ) || ( params.get( 'brainrot' ) ? 'value' : 'trade' ) );

	function status( text, isError ) {
		var el = document.getElementById( 'status' );
		el.hidden = !text;
		el.textContent = text || '';
		el.className = 'site-status' + ( isError ? ' site-status-error' : '' );
	}

	function wikiUrl( title ) {
		return WIKI + '/wiki/' + encodeURIComponent( title.replace( / /g, '_' ) ).replace( /%2F/g, '/' );
	}

	function buildPicker( catalog ) {
		var pick = document.getElementById( 'pick' );
		// most valuable first, like the wiki's dropdowns; only brainrots
		// with a measured base can be calculated
		var list = catalog.brainrots.filter( function ( b ) {
			return b[ 2 ] !== null;
		} ).sort( function ( x, y ) {
			return y[ 2 ] - x[ 2 ] || ( x[ 0 ] < y[ 0 ] ? -1 : 1 );
		} );
		list.forEach( function ( b ) {
			var o = document.createElement( 'option' );
			o.value = b[ 0 ];
			o.textContent = b[ 0 ] + ' (' + b[ 1 ] + ')';
			pick.appendChild( o );
		} );
		pick.value = chosen;
		pick.addEventListener( 'change', function () {
			location.href = '?brainrot=' + encodeURIComponent( pick.value ) + '#value';
		} );
		var more = document.getElementById( 'value-more' );
		var a = document.createElement( 'a' );
		a.href = wikiUrl( HUB + ' - ' + chosen );
		a.textContent = chosen + ' on the wiki';
		more.appendChild( document.createTextNode( 'Every mutation and level in full: ' ) );
		more.appendChild( a );
		more.appendChild( document.createTextNode( '.' ) );
	}

	function move( holder, selector, slotId ) {
		var el = holder.querySelector( selector );
		if ( el ) {
			document.getElementById( slotId ).appendChild( el );
		}
		return !!el;
	}

	function loadScript() {
		var s = document.createElement( 'script' );
		s.src = 'calc.js';
		s.onerror = function () {
			status( 'The calculator script did not load. Try reloading the page.', true );
		};
		document.body.appendChild( s );
	}

	var text = '{{#invoke:Brainrot|tradeMount}}\n' +
		'{{#invoke:Brainrot|collectionMount}}\n' +
		'{{#invoke:Brainrot|calculatorMount|brainrot=' + chosen.replace( /[|{}\[\]]/g, '' ) + '}}';
	var url = WIKI + '/api.php?action=parse&format=json&formatversion=2&origin=*' +
		'&prop=text&disablelimitreport=1&contentmodel=wikitext&text=' + encodeURIComponent( text );

	fetch( url ).then( function ( r ) {
		if ( !r.ok ) {
			throw new Error( 'HTTP ' + r.status );
		}
		return r.json();
	} ).then( function ( res ) {
		var holder = document.createElement( 'div' );
		holder.innerHTML = res.parse.text;
		var catalogEl = holder.querySelector( '.ffb-trade-data' );
		if ( !catalogEl ) {
			throw new Error( 'no calculator data in the reply' );
		}
		buildPicker( JSON.parse( catalogEl.textContent ) );
		move( holder, '.ffb-trade', 'slot-trade' );
		move( holder, '.ffb-collection', 'slot-collection' );
		if ( !move( holder, '.brainrot-calculator', 'slot-value' ) ) {
			document.getElementById( 'slot-value' ).textContent =
				chosen + ' has no measured base yet, so it can\'t be calculated.';
		}
		status( '' );
		loadScript();
	} ).catch( function () {
		status( 'Couldn\'t reach the wiki for the latest figures. Check your connection and reload, or use the calculators on the wiki from a computer.', true );
	} );
}() );
