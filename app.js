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
	var TABS = [ 'trade', 'value', 'collection', 'catch', 'codes' ];
	var CODES_KEY = 'ffb-site-codes';

	// tells calc.js it runs on this page, so it hands over its brainrot picker
	// noPrefill: here ?brainrot= picks the Value tab's brainrot; it must not
	// also start a new trade (which would stop the last trade coming back)
	// planner: the My base tab uses the new planner (the wiki keeps My
	// collection until its script review is through)
	window.ffbStandalone = { noPrefill: true, planner: true };
	var SAVED_KEY = 'ffb-site-figures';
	var catalog = null;

	var params = new URLSearchParams( location.search );
	var chosen = params.get( 'brainrot' ) || 'Tim Cheese';

	// light theme when the phone asks for it; the calculator styles key off
	// the same class Fandom uses
	if ( window.matchMedia && window.matchMedia( '(prefers-color-scheme: light)' ).matches ) {
		document.documentElement.className += ' theme-fandom-light';
	}

	// Anonymous visit counting (GoatCounter: no cookies, nothing personal).
	// The page view counts itself; each tab opened afterwards counts as an
	// event, so the dashboard shows which calculators get used. Offline, or
	// with the counter blocked, this quietly does nothing.
	var countedTab = null;
	function countTab( name ) {
		if ( countedTab === name ) {
			return;
		}
		countedTab = name;
		try {
			if ( window.goatcounter && typeof window.goatcounter.count === 'function' ) {
				window.goatcounter.count( { path: 'tab-' + name, title: 'Tab: ' + name, event: true } );
			}
		} catch ( e ) {}
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
		countTab( name );
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

	// the same searchable picker as the calculator's cards, in place of the
	// plain dropdown (which stays as the fallback if calc.js fails)
	function usePicker() {
		var make = window.ffbStandalone && window.ffbStandalone.namePicker;
		var select = document.getElementById( 'pick' );
		if ( !make || !catalog || !select ) {
			return;
		}
		var picker = make( catalog, 'pick', chosen, function ( name ) {
			location.href = '?brainrot=' + encodeURIComponent( name ) + '#value';
		} );
		picker.input.id = 'pick';
		picker.node.className += ' site-pick-search';
		select.parentNode.replaceChild( picker.node, select );
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
		s.src = 'calc.js?v=097cb74cf3';
		s.onload = usePicker;
		s.onerror = function () {
			status( 'The calculator script did not load. Try reloading the page.', true );
		};
		document.body.appendChild( s );
	}

	var text = '{{#invoke:Brainrot|tradeMount}}\n' +
		'{{#invoke:Brainrot|eventsJson}}\n' +
		'{{#invoke:Brainrot|collectionMount}}\n' +
		'{{#invoke:Brainrot|catchMount}}\n' +
		'{{#invoke:Brainrot|calculatorMount|brainrot=' + chosen.replace( /[|{}\[\]]/g, '' ) + '}}';
	var url = WIKI + '/api.php?action=parse&format=json&formatversion=2&origin=*' +
		'&prop=text&disablelimitreport=1&contentmodel=wikitext&text=' + encodeURIComponent( text );

	function useFigures( html, offlineAt ) {
		var holder = document.createElement( 'div' );
		holder.innerHTML = html;
		var catalogEl = holder.querySelector( '.ffb-trade-data' );
		if ( !catalogEl ) {
			throw new Error( 'no calculator data' );
		}
		catalog = JSON.parse( catalogEl.textContent );
		var eventsEl = holder.querySelector( '.ffb-events-data' );
		if ( eventsEl ) {
			try {
				showUpcoming( JSON.parse( eventsEl.textContent ) );
			} catch ( err ) {}
		}
		buildPicker( catalog );
		move( holder, '.ffb-trade', 'slot-trade' );
		move( holder, '.ffb-collection', 'slot-collection' );
		// "What can I catch?" (needs the wiki's Module:Brainrot to have catchMount)
		if ( !move( holder, '.ffb-catch', 'slot-catch' ) ) {
			document.getElementById( 'slot-catch' ).textContent =
				'The catch calculator isn\'t on the wiki yet. Check back soon.';
		}
		if ( !move( holder, '.brainrot-calculator', 'slot-value' ) ) {
			document.getElementById( 'slot-value' ).textContent =
				chosen + ' has no measured base yet, so it can\'t be calculated.';
		}
		status( offlineAt ? 'Offline · figures from ' + new Date( offlineAt ).toLocaleString( [], {
			month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
		} ) : '' );
		loadScript();
	}

	function savedFigures() {
		try {
			var saved = JSON.parse( localStorage.getItem( SAVED_KEY ) || 'null' );
			return saved && typeof saved.html === 'string' ? saved : null;
		} catch ( err ) {
			return null;
		}
	}

	fetch( url ).then( function ( r ) {
		if ( !r.ok ) {
			throw new Error( 'HTTP ' + r.status );
		}
		return r.json();
	} ).then( function ( res ) {
		var html = res.parse.text;
		try {
			localStorage.setItem( SAVED_KEY, JSON.stringify( { at: Date.now(), chosen: chosen, html: html } ) );
		} catch ( err ) {}
		useFigures( html, 0 );
	} ).catch( function () {
		// no signal (or the wiki is down): the last figures this phone got
		var saved = savedFigures();
		if ( saved ) {
			try {
				// the saved figures carry the Value tab's brainrot they were for
				chosen = saved.chosen || chosen;
				useFigures( saved.html, saved.at );
				return;
			} catch ( err ) {}
		}
		status( 'Couldn\'t reach the wiki for the latest figures. Check your connection and reload, or use the calculators on the wiki from a computer.', true );
	} );

	// ---- "Coming up": event start times in the reader's own time zone ------
	// The wiki lists the events; their start times follow two fixed schedules
	// (Events page and hub): Admin Abuse runs Saturday 9 PM and reruns
	// Sunday 11 AM, Eastern time; the Admin Pond runs twice a week for 48
	// hours (since 2026-10-06; see below). Eastern time is converted with the browser's own
	// time-zone data, so daylight saving is handled on both ends.
	var ET = 'America/New_York';

	/** The moment a wall-clock time in a time zone happens. */
	function zoned( y, mo, d, h, mi, tz ) {
		var guess = Date.UTC( y, mo - 1, d, h, mi );
		var parts = {};
		new Intl.DateTimeFormat( 'en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric',
			day: 'numeric', hour: 'numeric', minute: 'numeric' } ).formatToParts( new Date( guess ) ).forEach( function ( p ) {
			parts[ p.type ] = p.value;
		} );
		var shown = Date.UTC( +parts.year, +parts.month - 1, +parts.day, +parts.hour % 24, +parts.minute );
		return new Date( guess - ( shown - guess ) );
	}

	function isoParts( iso ) {
		var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec( iso || '' );
		return m ? [ +m[ 1 ], +m[ 2 ], +m[ 3 ] ] : null;
	}

	/** The start times to show, soonest first: { name, when (Date), note }. */
	function upcomingTimes( events, now ) {
		var out = [];
		events.forEach( function ( e ) {
			var d = isoParts( e.from );
			// an exact start time, when the wiki has one, beats the schedule
			if ( typeof e.start === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test( e.start ) ) {
				var st = new Date( e.start ), to = isoParts( e.to ), ends = null;
				if ( to ) {
					ends = new Date( Date.UTC( to[ 0 ], to[ 1 ] - 1, to[ 2 ], st.getUTCHours(), st.getUTCMinutes() ) );
				}
				out.push( { name: e.name, when: st, ends: ends && ends > st ? ends : null, note: '' } );
				return;
			}
			if ( !d ) {
				return;
			}
			if ( e.type === 'abuse' && new Date( Date.UTC( d[ 0 ], d[ 1 ] - 1, d[ 2 ] ) ).getUTCDay() === 6 ) {
				// each run lasts 45 minutes (admins join 15 minutes before)
				var main = zoned( d[ 0 ], d[ 1 ], d[ 2 ], 21, 0, ET ), rerun = zoned( d[ 0 ], d[ 1 ], d[ 2 ] + 1, 11, 0, ET );
				out.push( { name: e.name, when: main, ends: new Date( main.getTime() + 45 * 60000 ), note: 'main run' } );
				out.push( { name: e.name, when: rerun, ends: new Date( rerun.getTime() + 45 * 60000 ), note: 'rerun' } );
			} else {
				// no known start time (a weekend Admin Pond, a mini event): the day only
				out.push( { name: e.name, day: new Date( Date.UTC( d[ 0 ], d[ 1 ] - 1, d[ 2 ], 12 ) ), note: '' } );
			}
		} );
		// the Admin Pond, twice a week for 48 hours since October 6, 2026
		// (announcement; times 2 AM / 2 PM Mountain): midweek from Tuesday
		// 4 AM Eastern, weekend from Friday 4 PM Eastern. For each, the run
		// that's on now (it may have started up to 2 days ago) or the next.
		[ [ 'Tue', 4, 'Admin Pond (midweek)' ], [ 'Fri', 16, 'Admin Pond (weekend)' ] ].forEach( function ( w ) {
			var i, t, p;
			for ( i = -2; i < 8; i++ ) {
				t = new Date( now.getTime() + i * 86400000 );
				p = {};
				new Intl.DateTimeFormat( 'en-US', { timeZone: ET, weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' } ).formatToParts( t ).forEach( function ( x ) {
					p[ x.type ] = x.value;
				} );
				if ( p.weekday === w[ 0 ] ) {
					var start = zoned( +p.year, +p.month, +p.day, w[ 1 ], 0, ET );
					var stop = new Date( start.getTime() + 2 * 86400000 );
					if ( stop > now ) {
						out.push( { name: w[ 2 ], when: start, ends: stop, note: '48 hours' } );
						return;
					}
				}
			}
		} );
		return out.filter( function ( x ) {
			if ( x.ends ) {
				return x.ends.getTime() > now.getTime();
			}
			// no known end: a run that started less than an hour ago still shows
			return x.when ? x.when.getTime() > now.getTime() - 3600000 : x.day.getTime() > now.getTime() - 86400000;
		} ).map( function ( x ) {
			x.live = !!( x.when && x.ends && x.when <= now );
			return x;
		} ).sort( function ( a, b ) {
			// what's on now first (ending soonest first), then what's next
			if ( a.live !== b.live ) {
				return a.live ? -1 : 1;
			}
			return a.live ? a.ends - b.ends : ( a.when || a.day ) - ( b.when || b.day );
		} ).slice( 0, 5 );
	}

	function countdown( when, now ) {
		var mins = Math.round( ( when - now ) / 60000 );
		if ( mins <= 0 ) {
			return 'on now';
		}
		var d = Math.floor( mins / 1440 ), h = Math.floor( ( mins % 1440 ) / 60 ), m = mins % 60;
		return 'in ' + ( d ? d + 'd ' : '' ) + ( d || h ? h + 'h ' : '' ) + ( d ? '' : m + 'm' );
	}

	var upcomingEvents = [];
	var bannerAt = 0;
	var seenKey = 'ffb-site-seen-events';
	function whenText( x ) {
		return x.when ?
			x.when.toLocaleString( [], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' } ) :
			x.day.toLocaleDateString( [], { weekday: 'short', month: 'short', day: 'numeric' } ) + ' · time not announced';
	}
	function itemKey( x ) {
		return x.name + '|' + ( x.note || '' ) + '|' + ( x.when ? x.when.getTime() : x.day.getTime() );
	}
	function seen() {
		try {
			return JSON.parse( localStorage.getItem( seenKey ) || '[]' );
		} catch ( err ) {
			return [];
		}
	}
	/**
	 * What's coming up lives in a bell (with a count of the ones not seen
	 * yet) and a one-line banner that rotates through them, instead of a
	 * box at the top of every tab.
	 */
	function renderUpcoming() {
		var box = document.getElementById( 'upcoming' );
		var bell = document.getElementById( 'bell' );
		var banner = document.getElementById( 'banner' );
		var now = new Date();
		var items = upcomingTimes( upcomingEvents, now );
		box.textContent = '';
		if ( !items.length ) {
			bell.hidden = true;
			banner.hidden = true;
			box.hidden = true;
			return;
		}
		var head = el( 'div', 'site-upcoming-title', ( items[ 0 ].live ? 'On now and coming up' : 'Coming up' ) + ' · your time' );
		box.appendChild( head );
		var list = el( 'ul', 'site-upcoming-list' );
		items.forEach( function ( x ) {
			var li = el( 'li', 'site-upcoming-row' + ( x.live ? ' site-upcoming-live' : '' ) );
			li.appendChild( el( 'span', 'site-upcoming-name', ( x.live ? '🔴 Live now: ' : '' ) + x.name + ( x.note ? ' (' + x.note + ')' : '' ) ) );
			li.appendChild( el( 'span', 'site-upcoming-when', x.live ? 'until ' + whenText( { when: x.ends } ) : whenText( x ) ) );
			if ( x.live ) {
				li.appendChild( el( 'span', 'site-upcoming-count', 'ends ' + countdown( x.ends, now ) ) );
			} else if ( x.when ) {
				li.appendChild( el( 'span', 'site-upcoming-count', countdown( x.when, now ) ) );
			}
			list.appendChild( li );
		} );
		box.appendChild( list );
		var more = el( 'a', 'site-upcoming-more', 'All events on the wiki' );
		more.href = WIKI + '/wiki/' + encodeURIComponent( ( HUB + ' - Events' ).replace( / /g, '_' ) );
		box.appendChild( more );
		var already = seen();
		var fresh = items.filter( function ( x ) {
			return already.indexOf( itemKey( x ) ) === -1;
		} ).length;
		bell.hidden = false;
		document.getElementById( 'bell-count' ).textContent = fresh ? String( fresh ) : '';
		bell.setAttribute( 'aria-label', 'Coming up' + ( fresh ? ' (' + fresh + ' new)' : '' ) );
		var x = items[ bannerAt % items.length ];
		banner.hidden = false;
		banner.textContent = '';
		banner.className = 'site-banner' + ( x.live ? ' site-banner-live' : '' );
		banner.appendChild( el( 'span', 'site-banner-icon', x.live ? '🔴' : '📣' ) );
		var txt = el( 'span', 'site-banner-text' );
		if ( x.live ) {
			txt.appendChild( el( 'span', 'site-banner-livetag', 'Live now' ) );
			txt.appendChild( document.createTextNode( ' ' ) );
		}
		txt.appendChild( el( 'strong', null, x.name + ( x.note ? ' (' + x.note + ')' : '' ) ) );
		txt.appendChild( document.createTextNode( ' ' + ( x.live ? 'ends ' + countdown( x.ends, now ) : x.when ? countdown( x.when, now ) : whenText( x ) ) ) );
		banner.appendChild( txt );
		banner.appendChild( el( 'span', 'site-banner-n', ( bannerAt % items.length + 1 ) + ' / ' + items.length ) );
	}
	function openUpcoming( open ) {
		var box = document.getElementById( 'upcoming' );
		var bell = document.getElementById( 'bell' );
		box.hidden = !open;
		bell.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
		if ( open ) {
			// opening the list counts them as seen
			try {
				localStorage.setItem( seenKey, JSON.stringify( upcomingTimes( upcomingEvents, new Date() ).map( itemKey ) ) );
			} catch ( err ) {}
			document.getElementById( 'bell-count' ).textContent = '';
		}
	}
	document.getElementById( 'bell' ).addEventListener( 'click', function ( e ) {
		e.stopPropagation();
		openUpcoming( document.getElementById( 'upcoming' ).hidden );
	} );
	document.getElementById( 'banner' ).addEventListener( 'click', function ( e ) {
		e.stopPropagation();
		openUpcoming( true );
	} );
	document.addEventListener( 'click', function ( e ) {
		var box = document.getElementById( 'upcoming' );
		if ( !box.hidden && !box.contains( e.target ) ) {
			openUpcoming( false );
		}
	} );
	document.addEventListener( 'keydown', function ( e ) {
		if ( e.key === 'Escape' ) {
			openUpcoming( false );
		}
	} );
	function showUpcoming( events ) {
		upcomingEvents = Array.isArray( events ) ? events.filter( function ( e ) {
			return e && typeof e.name === 'string';
		} ) : [];
		renderUpcoming();
		setInterval( renderUpcoming, 60000 );
		// the banner steps to the next announcement every 6 seconds
		setInterval( function () {
			bannerAt++;
			renderUpcoming();
		}, 6000 );
	}

	// ---- the Codes tab: the wiki's "Active codes" table, read live ---------

	/** A wiki link, made absolute; anything else is dropped (text only). */
	function wikiHref( href ) {
		return typeof href === 'string' && /^\/wiki\/[^"'<>]+$/.test( href ) ? WIKI + href : null;
	}

	function showCodes( html, offlineAt ) {
		var holder = document.createElement( 'div' );
		holder.innerHTML = html;
		var heading = holder.querySelector( '#Active_codes' );
		var node = heading && heading.parentNode;
		var table = null;
		while ( node && !table ) {
			node = node.nextElementSibling;
			if ( node && node.tagName === 'TABLE' ) {
				table = node;
			} else if ( node && node.querySelector && node.querySelector( 'table' ) ) {
				table = node.querySelector( 'table' );
			}
		}
		var list = document.getElementById( 'codes-list' );
		list.textContent = '';
		if ( !table ) {
			list.appendChild( el( 'p', 'site-status site-status-error', 'Couldn\'t read the codes. See the Codes page on the wiki.' ) );
			return;
		}
		var rows = Array.prototype.slice.call( table.querySelectorAll( 'tr' ) ).slice( 1 );
		rows.forEach( function ( tr ) {
			var cells = tr.querySelectorAll( 'td' );
			if ( cells.length < 2 ) {
				return;
			}
			var code = cells[ 0 ].textContent.trim();
			if ( !/^[0-9A-Za-z-]{1,20}$/.test( code ) ) {
				return;
			}
			var card = el( 'div', 'site-code' );
			var top = el( 'div', 'site-code-top' );
			top.appendChild( el( 'span', 'site-code-value', code ) );
			var copy = el( 'button', 'site-code-copy', 'Copy' );
			copy.type = 'button';
			copy.setAttribute( 'aria-label', 'Copy code ' + code );
			copy.addEventListener( 'click', function () {
				var done = function ( text ) {
					copy.textContent = text;
					setTimeout( function () {
						copy.textContent = 'Copy';
					}, 1800 );
				};
				if ( navigator.clipboard && navigator.clipboard.writeText ) {
					navigator.clipboard.writeText( code ).then( function () {
						done( 'Copied' );
					}, function () {
						done( code );
					} );
				} else {
					done( code );
				}
			} );
			top.appendChild( copy );
			card.appendChild( top );
			// the reward, keeping the wiki's links to the brainrot, rod or potion
			var reward = el( 'div', 'site-code-reward' );
			Array.prototype.forEach.call( cells[ 1 ].childNodes, function ( n ) {
				var href = n.nodeType === 1 && n.tagName === 'A' ? wikiHref( n.getAttribute( 'href' ) ) : null;
				if ( href ) {
					var a = el( 'a', null, n.textContent );
					a.href = href;
					reward.appendChild( a );
				} else {
					reward.appendChild( document.createTextNode( n.textContent ) );
				}
			} );
			card.appendChild( reward );
			var added = cells[ 2 ] ? cells[ 2 ].textContent.trim() : '';
			if ( added && added !== '—' ) {
				card.appendChild( el( 'div', 'site-code-added', 'Added ' + added ) );
			}
			list.appendChild( card );
		} );
		document.getElementById( 'codes-intro' ).textContent = rows.length + ' working codes, straight from the wiki\'s list. Tap Copy, then type it into the keypad in front of your base.' +
			( offlineAt ? ' (Offline: the list from ' + new Date( offlineAt ).toLocaleDateString( [], { month: 'short', day: 'numeric' } ) + '.)' : '' );
		// the redeem steps, also from the wiki page
		var how = holder.querySelector( '#How_to_redeem_a_code' );
		var steps = how && how.parentNode;
		while ( steps && steps.tagName !== 'OL' ) {
			steps = steps.nextElementSibling;
		}
		var box = document.getElementById( 'codes-how' );
		box.textContent = '';
		if ( steps ) {
			var ol = el( 'ol', 'site-codes-how' );
			Array.prototype.forEach.call( steps.querySelectorAll( 'li' ), function ( li ) {
				ol.appendChild( el( 'li', null, li.textContent.trim() ) );
			} );
			box.appendChild( ol );
		}
	}

	function el( tag, cls, text ) {
		var n = document.createElement( tag );
		if ( cls ) {
			n.className = cls;
		}
		if ( text !== undefined ) {
			n.textContent = text;
		}
		return n;
	}

	fetch( WIKI + '/api.php?action=parse&format=json&formatversion=2&origin=*&prop=text&disablelimitreport=1&page=' +
		encodeURIComponent( HUB + ' - Codes' ) ).then( function ( r ) {
		if ( !r.ok ) {
			throw new Error( 'HTTP ' + r.status );
		}
		return r.json();
	} ).then( function ( res ) {
		try {
			localStorage.setItem( CODES_KEY, JSON.stringify( { at: Date.now(), html: res.parse.text } ) );
		} catch ( err ) {}
		showCodes( res.parse.text, 0 );
	} ).catch( function () {
		var saved = null;
		try {
			saved = JSON.parse( localStorage.getItem( CODES_KEY ) || 'null' );
		} catch ( err ) {}
		if ( saved && typeof saved.html === 'string' ) {
			showCodes( saved.html, saved.at );
		} else {
			var list = document.getElementById( 'codes-list' );
			list.textContent = '';
			list.appendChild( el( 'p', 'site-status site-status-error', 'Couldn\'t reach the wiki for the codes. Check your connection and reload.' ) );
		}
	} );

	// installable, and the page itself opens without a signal
	if ( 'serviceWorker' in navigator ) {
		window.addEventListener( 'load', function () {
			navigator.serviceWorker.register( 'sw.js' ).catch( function () {} );
		} );
	}
}() );
