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
	var TABS = [ 'value', 'trade', 'fuze', 'collection', 'catch', 'codes' ];
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
	// with no ?brainrot=, the Value tab opens on the best brainrot (highest
	// base; user, 2026-10-08). The last one found is remembered, so the
	// first request usually already asks for the right one.
	var BEST_KEY = 'ffb-site-best';
	var asked = params.get( 'brainrot' );
	var chosen = asked || rememberedBest() || 'Skeleton Dragon';

	function rememberedBest() {
		try {
			return localStorage.getItem( BEST_KEY );
		} catch ( err ) {
			return null;
		}
	}

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
		// Value is the home page (user, 2026-10-23)
		if ( TABS.indexOf( name ) === -1 ) {
			name = 'value';
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
	show( location.hash.slice( 1 ) || 'value' );

	function status( text, isError ) {
		var el = document.getElementById( 'status' );
		el.hidden = !text;
		el.textContent = text || '';
		el.className = 'site-status' + ( isError ? ' site-status-error' : '' );
	}

	function wikiUrl( title ) {
		return WIKI + '/wiki/' + encodeURIComponent( title.replace( / /g, '_' ) ).replace( /%2F/g, '/' );
	}

	/**
	 * Brainrots most valuable first, like the wiki's dropdowns (ties A-Z);
	 * only brainrots with a measured base can be calculated.
	 */
	function byValue( catalog ) {
		return catalog.brainrots.filter( function ( b ) {
			return b[ 2 ] !== null;
		} ).sort( function ( x, y ) {
			return y[ 2 ] - x[ 2 ] || ( x[ 0 ] < y[ 0 ] ? -1 : 1 );
		} );
	}

	function buildPicker( catalog ) {
		var pick = document.getElementById( 'pick' );
		var list = byValue( catalog );
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
		s.src = 'calc.js?v=3c5847bae7';
		s.onload = function () {
			usePicker();
			// the Fuze page builds from the same figures, with calc.js's picker
			if ( window.ffbFuzeStart ) {
				window.ffbFuzeStart();
			}
		};
		s.onerror = function () {
			status( 'The calculator script did not load. Try reloading the page.', true );
		};
		document.body.appendChild( s );
	}

	function calculatorMount( name ) {
		return '{{#invoke:Brainrot|calculatorMount|brainrot=' + name.replace( /[|{}\[\]]/g, '' ) + '}}';
	}
	function parseUrl( text ) {
		return WIKI + '/api.php?action=parse&format=json&formatversion=2&origin=*' +
			'&prop=text&disablelimitreport=1&contentmodel=wikitext&text=' + encodeURIComponent( text );
	}
	function getHtml( text ) {
		return fetch( parseUrl( text ) ).then( function ( r ) {
			if ( !r.ok ) {
				throw new Error( 'HTTP ' + r.status );
			}
			return r.json();
		} ).then( function ( res ) {
			return res.parse.text;
		} );
	}
	var text = '{{#invoke:Brainrot|tradeMount}}\n' +
		'{{#invoke:Brainrot|eventsJson}}\n' +
		'{{#invoke:Brainrot|collectionMount}}\n' +
		'{{#invoke:Brainrot|catchMount}}\n' +
		calculatorMount( chosen );

	/**
	 * With no ?brainrot=, makes sure the Value tab got the best brainrot:
	 * when the remembered one isn't the best any more, fetches the best
	 * one's calculator and swaps it in. Resolves to the page's HTML.
	 */
	function withBest( html ) {
		if ( asked ) {
			return html;
		}
		var holder = document.createElement( 'div' );
		holder.innerHTML = html;
		var catalogEl = holder.querySelector( '.ffb-trade-data' );
		var best = catalogEl ? byValue( JSON.parse( catalogEl.textContent ) )[ 0 ] : null;
		if ( !best ) {
			return html;
		}
		try {
			localStorage.setItem( BEST_KEY, best[ 0 ] );
		} catch ( err ) {}
		if ( best[ 0 ] === chosen ) {
			return html;
		}
		return getHtml( calculatorMount( best[ 0 ] ) ).then( function ( calcHtml ) {
			var fresh = document.createElement( 'div' );
			fresh.innerHTML = calcHtml;
			var old = holder.querySelector( '.brainrot-calculator' );
			var mount = fresh.querySelector( '.brainrot-calculator' );
			if ( mount ) {
				if ( old ) {
					old.parentNode.replaceChild( mount, old );
				} else {
					holder.appendChild( mount );
				}
				chosen = best[ 0 ];
			}
			return holder.innerHTML;
		}, function () {
			return html;
		} );
	}

	function useFigures( html, offlineAt ) {
		var holder = document.createElement( 'div' );
		holder.innerHTML = html;
		var catalogEl = holder.querySelector( '.ffb-trade-data' );
		if ( !catalogEl ) {
			throw new Error( 'no calculator data' );
		}
		catalog = JSON.parse( catalogEl.textContent );
		var eventsEl = holder.querySelector( '.ffb-events-data' );
		var miniEl = holder.querySelector( '.ffb-mini-data' );
		if ( miniEl ) {
			try {
				miniRotation = JSON.parse( miniEl.textContent );
			} catch ( err ) {}
		}
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

	getHtml( text ).then( withBest ).then( function ( html ) {
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

	/**
	 * The mini events (data.miniEvents on the wiki): a fixed rotation that
	 * runs all day, the same for everyone. order[0] started at anchor; one
	 * starts every `every` minutes and runs for `runs`. Returns the one on
	 * now, if any, and the next one.
	 */
	var miniRotation = null;
	function miniTimes( mini, now ) {
		if ( !mini || !Array.isArray( mini.order ) || !mini.order.length || !( mini.every > 0 ) || !( mini.runs > 0 ) ) {
			return [];
		}
		var anchor = Date.parse( mini.anchor );
		if ( isNaN( anchor ) ) {
			return [];
		}
		var slot = mini.every * 60000, n = mini.order.length;
		var k = Math.floor( ( now.getTime() - anchor ) / slot );
		var out = [];
		for ( var i = k; i <= k + 2 && out.length < 2; i++ ) {
			var start = new Date( anchor + i * slot ), ends = new Date( start.getTime() + mini.runs * 60000 );
			if ( ends > now ) {
				out.push( { name: mini.order[ ( ( i % n ) + n ) % n ] + ' mini event', when: start, ends: ends,
					note: mini.runs + ' min', mini: true } );
			}
		}
		return out;
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
				out.push( { name: e.name, when: st, ends: ends && ends > st ? ends : null, note: '', abuse: e.type === 'abuse', mutation: e.mutation } );
				return;
			}
			if ( !d ) {
				return;
			}
			if ( e.type === 'abuse' && new Date( Date.UTC( d[ 0 ], d[ 1 ] - 1, d[ 2 ] ) ).getUTCDay() === 6 ) {
				// each run lasts 45 minutes (admins join 15 minutes before)
				var main = zoned( d[ 0 ], d[ 1 ], d[ 2 ], 21, 0, ET ), rerun = zoned( d[ 0 ], d[ 1 ], d[ 2 ] + 1, 11, 0, ET );
				out.push( { name: e.name, when: main, ends: new Date( main.getTime() + 45 * 60000 ), note: 'main run', abuse: true, mutation: e.mutation } );
				out.push( { name: e.name, when: rerun, ends: new Date( rerun.getTime() + 45 * 60000 ), note: 'rerun', abuse: true, mutation: e.mutation } );
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
		// the mini events don't run during an Admin Abuse (user, 2026-10-23)
		var runs = out.filter( function ( x ) {
			return x.abuse && x.when && x.ends;
		} );
		out = out.concat( miniTimes( miniRotation, now ).filter( function ( m ) {
			return !runs.some( function ( r ) {
				return m.when < r.ends && m.ends > r.when;
			} );
		} ) );
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
	function whenText( x ) {
		return x.when ?
			x.when.toLocaleString( [], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' } ) :
			x.day.toLocaleDateString( [], { weekday: 'short', month: 'short', day: 'numeric' } ) + ' · time not announced';
	}
	/** The reader's time zone, short ("MDT"), or its region when there's no short name. */
	function zoneName( now ) {
		try {
			var tz = '';
			new Intl.DateTimeFormat( [], { timeZoneName: 'short' } ).formatToParts( now ).forEach( function ( p ) {
				if ( p.type === 'timeZoneName' ) {
					tz = p.value;
				}
			} );
			if ( /^(GMT|UTC)[+-]/.test( tz ) ) {
				var region = Intl.DateTimeFormat().resolvedOptions().timeZone;
				tz = region ? region.replace( /^.*\//, '' ).replace( /_/g, ' ' ) + ' time, ' + tz : tz;
			}
			return tz;
		} catch ( err ) {
			return '';
		}
	}
	function clock( d ) {
		return d.toLocaleTimeString( [], { hour: 'numeric', minute: '2-digit' } );
	}
	/**
	 * What's on lives in the header (user, 2026-10-23): the mutation mini
	 * event's icon beside the site name, and while the Admin Pond is on, a
	 * label under the tagline with its traits floating around the name, as
	 * they float around the pond in the game. Everything else (the Admin
	 * Abuse runs and other events) rotates in a one-line banner at the top
	 * of the page; tapping it opens the full list.
	 */
	function renderUpcoming() {
		var box = document.getElementById( 'upcoming' );
		var banner = document.getElementById( 'banner' );
		var now = new Date();
		var all = upcomingTimes( upcomingEvents, now );
		var abuse = all.filter( function ( x ) {
			return x.abuse && x.live;
		} )[ 0 ] || null;
		renderMutation( all.filter( function ( x ) {
			return x.mini;
		} ), abuse, now );
		renderPond( all.filter( isPond )[ 0 ] || null, abuse, now );
		var items = all.filter( function ( x ) {
			return !x.mini && !isPond( x ) && x !== abuse;
		} );
		box.textContent = '';
		if ( !items.length ) {
			banner.hidden = true;
			box.hidden = true;
			return;
		}
		var head = el( 'div', 'site-upcoming-title', ( items[ 0 ].live ? 'On now and coming up' : 'Coming up' ) + ' · ' + ( zoneName( now ) || 'your time' ) );
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
		if ( items.length > 1 ) {
			banner.appendChild( el( 'span', 'site-banner-n', ( bannerAt % items.length + 1 ) + ' / ' + items.length ) );
		}
	}

	function mutationIconPath( name ) {
		var path = catalog && catalog.mutationIcons && catalog.mutationIcons[ name ];
		return typeof path === 'string' && /^[0-9a-f]\/[0-9a-f]{2}\/[A-Za-z0-9_&.,()'+-]+\.png$/.test( path ) ? path : null;
	}
	/**
	 * A mutation with no game icon yet (a new one at its Admin Abuse): its
	 * name on a tile in its colour, or the admin purple, with NEW when the
	 * wiki doesn't have it yet.
	 */
	function mutationNameTile( name, cls ) {
		var t = el( 'span', cls + ' site-mut-nametile' );
		t.appendChild( el( 'span', 'site-mut-nametile-name', name ) );
		var c = catalog && catalog.mutationColors && catalog.mutationColors[ name ];
		if ( typeof c === 'string' && /^#[0-9a-fA-F]{3,8}$/.test( c ) ) {
			t.style.background = c;
		}
		if ( mutationMult( name ) === null ) {
			t.appendChild( el( 'span', 'site-mut-new', 'New' ) );
		}
		return t;
	}
	/** A mutation's game icon, or a square in its colour with its first letter. */
	function mutationMark( name, cls ) {
		var path = mutationIconPath( name );
		if ( path ) {
			var img = el( 'img', cls );
			img.referrerPolicy = 'no-referrer';
			img.setAttribute( 'referrerpolicy', 'no-referrer' );
			img.src = 'https://static.wikia.nocookie.net/fortnite-creator-islands/images/' + path + '/revision/latest/scale-to-width-down/80?nr=4';
			img.alt = '';
			return img;
		}
		var sq = el( 'span', cls + ' site-mut-letter', name.charAt( 0 ) );
		var c = catalog && catalog.mutationColors && catalog.mutationColors[ name ];
		if ( typeof c === 'string' && /^#[0-9a-fA-F]{3,8}$/.test( c ) ) {
			sq.style.background = c;
		}
		return sq;
	}
	function mutationMult( name ) {
		var mult = null;
		( catalog && Array.isArray( catalog.mutations ) ? catalog.mutations : [] ).forEach( function ( m ) {
			if ( m[ 0 ] === name ) {
				mult = m[ 1 ];
			}
		} );
		return mult;
	}
	/** The mutation an Admin Abuse is for: the wiki's field, else read off its name. */
	function abuseMutation( x ) {
		if ( typeof x.mutation === 'string' && x.mutation ) {
			return x.mutation;
		}
		var best = '';
		( catalog && Array.isArray( catalog.mutations ) ? catalog.mutations : [] ).forEach( function ( m ) {
			if ( String( m[ 0 ] ).length > best.length && x.name.indexOf( m[ 0 ] ) === 0 ) {
				best = m[ 0 ];
			}
		} );
		return best || x.name.replace( /\s*\(.*?\)/g, '' ).replace( /\s*Admin Abuse.*$/, '' ).trim() || x.name;
	}
	/**
	 * The mutation mini event beside the site name: the one on now with the
	 * time left under it, or between them the next one, faded, with when it
	 * starts. Tapping it opens a card with the name, multiplier and times.
	 */
	function renderMutation( minis, abuse, now ) {
		var btn = document.getElementById( 'mut-btn' );
		var card = document.getElementById( 'mut-card' );
		var x = abuse || minis[ 0 ];
		btn.hidden = !x;
		if ( !x ) {
			card.hidden = true;
			return;
		}
		// within half a minute of its start counts as on (countdown would say 'on now')
		var live = x.when.getTime() <= now.getTime() + 30000;
		var name = abuse ? abuseMutation( abuse ) : x.name.replace( / mini event$/, '' ), mult = mutationMult( name );
		var left = live ? countdown( x.ends, now ).replace( /^in /, '' ) : countdown( x.when, now );
		var icon = !!mutationIconPath( name );
		btn.className = 'site-mutbtn' + ( live ? '' : ' site-mutbtn-next' ) + ( abuse ? ' site-mutbtn-abuse' : '' ) + ( icon ? '' : ' site-mutbtn-wide' );
		btn.textContent = '';
		btn.appendChild( icon ? mutationMark( name, 'site-mutbtn-icon' ) : mutationNameTile( name, 'site-mutbtn-tile' ) );
		btn.appendChild( el( 'span', 'site-mutbtn-when', left.replace( /^in /, '' ) ) );
		btn.setAttribute( 'aria-label', abuse ? name + ' Admin Abuse, ' + left + ' left' :
			live ? 'Mutation now: ' + name + ', ' + left + ' left' : 'Next mutation: ' + name + ', ' + left );
		card.textContent = '';
		card.appendChild( el( 'div', 'site-upcoming-title', abuse ? 'Admin Abuse · on now' : live ? 'Mutation mini event · on now' : 'Next mutation mini event' ) );
		var row = el( 'div', 'site-mut-row' );
		row.appendChild( icon ? mutationMark( name, 'site-mut-big' ) : mutationNameTile( name, 'site-mut-bigtile' ) );
		var t = el( 'div', 'site-mut-text' );
		t.appendChild( el( 'strong', null, name + ( mult ? ' ×' + mult : '' ) ) );
		if ( abuse ) {
			t.appendChild( el( 'span', 'site-upcoming-when', abuse.name + ( abuse.note ? ' (' + abuse.note + ')' : '' ) ) );
		}
		t.appendChild( el( 'span', 'site-upcoming-when', live ?
			clock( x.when ) + ' to ' + clock( x.ends ) + ' · ' + left + ' left' :
			'starts ' + clock( x.when ) + ' · ' + left ) );
		row.appendChild( t );
		card.appendChild( row );
		if ( abuse ) {
			if ( mult === null ) {
				card.appendChild( el( 'p', 'site-mut-note', 'New mutation: its multiplier isn\'t known yet.' ) );
			}
			card.appendChild( el( 'p', 'site-mut-note', 'Most traits are active during the Admin Abuse. Mini events pause until it ends.' ) );
			card.appendChild( tzNote( now ) );
			return;
		}
		var nx = minis[ 1 ];
		if ( nx ) {
			var n2 = nx.name.replace( / mini event$/, '' );
			var r2 = el( 'div', 'site-mut-row site-mut-row-next' );
			r2.appendChild( mutationMark( n2, 'site-mut-small' ) );
			r2.appendChild( el( 'span', null, 'Then ' + n2 + ( mutationMult( n2 ) ? ' ×' + mutationMult( n2 ) : '' ) + ' at ' + clock( nx.when ) ) );
			card.appendChild( r2 );
		}
		if ( miniRotation && miniRotation.runs > 0 && miniRotation.every > 0 ) {
			card.appendChild( el( 'p', 'site-mut-note', 'Mini events run all day, the same for everyone: each lasts ' + miniRotation.runs +
				' minutes and a new one starts every ' + miniRotation.every + '.' ) );
		}
		card.appendChild( tzNote( now ) );
	}
	function tzNote( now ) {
		var z = zoneName( now );
		return el( 'p', 'site-mut-note site-tz-note', 'Times are in your time zone' + ( z ? ' (' + z + ')' : '' ) + '.' );
	}

	/**
	 * While the Admin Pond is on: a label under the tagline (tap for its
	 * traits and to report them). Floating out from the site name: the
	 * pond's reported traits, or during an Admin Abuse, when most traits are
	 * on at once, every trait in turn (user, 2026-10-23), with any reported
	 * ones coming round more often and a little bigger. The floaters are only
	 * rebuilt when that list changes, so the animation doesn't restart every
	 * time the header updates.
	 */
	var floatKey = '';
	function renderPond( pond, abuse, now ) {
		var tag = document.getElementById( 'pond-now' );
		var card = document.getElementById( 'pond-card' );
		var reported = pond ? pondTraits( pond, now ) : [];
		tag.hidden = !pond;
		if ( !pond ) {
			card.hidden = true;
		} else {
			tag.textContent = '';
			tag.appendChild( el( 'span', 'site-pondtag-live', 'Admin Pond on' ) );
			tag.appendChild( el( 'span', 'site-pondtag-when', reported.length || abuse ? 'ends ' + countdown( pond.ends, now ) : 'Traits? Tap to add them' ) );
			card.textContent = '';
			card.appendChild( el( 'div', 'site-upcoming-title', 'Admin Pond · on now' ) );
			card.appendChild( el( 'div', 'site-upcoming-when', 'until ' + whenText( { when: pond.ends } ) + ' · ends ' + countdown( pond.ends, now ) ) );
			card.appendChild( pondLine( pond, now ) );
		}
		// every trait with a picture to float (an icon or an emoji)
		var all = abuse && catalog && Array.isArray( catalog.traits ) ? catalog.traits.map( function ( t ) {
			return t[ 0 ];
		} ).filter( function ( t ) {
			return !!( ( catalog.traitIcons && catalog.traitIcons[ t ] ) || ( catalog.traitEmoji && catalog.traitEmoji[ t ] ) );
		} ) : [];
		var key = ( abuse ? 'abuse:' + all.length + ':' : '' ) + reported.join( '|' );
		if ( key !== floatKey ) {
			floatKey = key;
			buildFloats( all, reported );
		}
	}
	// where each floater drifts: [ side, how far up (-) or down (+) ]
	var FLOAT_PATHS = [ [ -1, -0.2 ], [ 1, -0.35 ], [ -1, 0.3 ], [ 1, 0.25 ], [ -1, -0.6 ], [ 1, 0.55 ], [ -1, 0.05 ], [ 1, -0.05 ] ];
	var FLOAT_TRIP = 9; // seconds, as the CSS animation
	function buildFloats( all, reported ) {
		var fl = document.getElementById( 'pond-float' );
		fl.textContent = '';
		var queue = [], i;
		if ( all.length ) {
			// every trait once, a reported one after every third
			for ( i = 0; i < all.length; i++ ) {
				queue.push( { name: all[ i ], hot: false } );
				if ( reported.length && i % 3 === 2 ) {
					queue.push( { name: reported[ ( i / 3 | 0 ) % reported.length ], hot: true } );
				}
			}
		} else {
			reported.forEach( function ( t ) {
				queue.push( { name: t, hot: false } );
			} );
		}
		if ( !queue.length ) {
			return;
		}
		// the pond's few traits: each twice, once drifting each way; every
		// trait: 8 in the air at once, each taking the next one on each trip
		var n = all.length ? FLOAT_PATHS.length : Math.min( FLOAT_PATHS.length, queue.length * 2 );
		var next = 0;
		function fill( f ) {
			var q = queue[ next++ % queue.length ];
			f.textContent = '';
			f.className = 'site-float' + ( q.hot ? ' site-float-hot' : '' );
			f.appendChild( traitMark( q.name, false ) );
		}
		for ( i = 0; i < n; i++ ) {
			var f = el( 'span', 'site-float' );
			fill( f );
			f.style.setProperty( '--dx', FLOAT_PATHS[ i ][ 0 ] );
			f.style.setProperty( '--dy', FLOAT_PATHS[ i ][ 1 ] );
			f.style.animationDelay = ( -i * FLOAT_TRIP / n ).toFixed( 2 ) + 's';
			if ( queue.length > n ) {
				f.addEventListener( 'animationiteration', function () {
					fill( this );
				} );
			}
			fl.appendChild( f );
		}
	}

	// the cards: one open at a time; a tap anywhere else or Escape closes it
	var CARDS = { banner: 'upcoming', 'mut-btn': 'mut-card', 'pond-now': 'pond-card', 'pond-float': 'pond-card' };
	function openCard( id ) {
		Object.keys( CARDS ).forEach( function ( b ) {
			var open = CARDS[ b ] === id;
			document.getElementById( CARDS[ b ] ).hidden = !open;
			document.getElementById( b ).setAttribute( 'aria-expanded', open ? 'true' : 'false' );
		} );
	}
	Object.keys( CARDS ).forEach( function ( b ) {
		document.getElementById( b ).addEventListener( 'click', function ( e ) {
			e.stopPropagation();
			var id = CARDS[ b ];
			// a floating trait with no Admin Pond on (an Admin Abuse): its card
			if ( b === 'pond-float' && document.getElementById( 'pond-now' ).hidden ) {
				id = 'mut-card';
			}
			openCard( document.getElementById( id ).hidden ? id : null );
		} );
	} );
	document.addEventListener( 'click', function ( e ) {
		var inside = Object.keys( CARDS ).some( function ( b ) {
			return document.getElementById( CARDS[ b ] ).contains( e.target );
		} );
		if ( !inside ) {
			openCard( null );
		}
	} );
	document.addEventListener( 'keydown', function ( e ) {
		if ( e.key === 'Escape' ) {
			openCard( null );
		}
	} );
	// ---- Admin Pond traits, reported by players on a wiki page -------------
	// The traits over the Admin Pond change every 30 minutes: up to 3, picked
	// at random (user, 2026-10-14). Anyone with a wiki account can report the
	// current ones by editing one short wiki page; the page's last save time
	// says how fresh they are. Only real trait names count, and a report
	// shows only while it's from this pond and from the current 30 minutes.
	var POND_PAGE = HUB + ' - Admin Pond traits';
	// the traits change on the clock, at :00 and :30 (user, 2026-10-14), so a
	// report counts until the next change and no longer
	var POND_SLOT = 30 * 60000;
	function slotStart( now ) {
		return new Date( Math.floor( now.getTime() / POND_SLOT ) * POND_SLOT );
	}
	var pondReport = null;
	/**
	 * The wiki's "new section" editor with the picked traits already in as
	 * its heading, so reporting is one tap on Save. (A normal edit can't be
	 * pre-filled from another site: a cross-site POST arrives logged out.)
	 */
	function pondReportUrl( traits ) {
		return WIKI + '/index.php?title=' + encodeURIComponent( POND_PAGE.replace( / /g, '_' ) ) +
			'&action=edit&section=new&preloadtitle=' + encodeURIComponent( traits.join( ', ' ) );
	}
	function pondTraitNames( text ) {
		var known = {}, out = [];
		( catalog && Array.isArray( catalog.traits ) ? catalog.traits : [] ).forEach( function ( t ) {
			known[ String( t[ 0 ] ).toLowerCase() ] = t[ 0 ];
		} );
		text = String( text ).replace( /<!--[\s\S]*?-->/g, '' );
		// each report is a new section whose heading is the list; the newest is
		// last. A page edited by hand (a plain list, no headings) still works.
		var heads = text.match( /^=+[^=\n].*?=+\s*$/gm );
		if ( heads ) {
			text = heads[ heads.length - 1 ].replace( /^=+|=+\s*$/g, '' );
		}
		text.split( /[,;\n]+/ ).forEach( function ( w ) {
			var n = known[ w.replace( /[*#'\[\]]/g, '' ).trim().toLowerCase() ];
			if ( n && out.indexOf( n ) === -1 && out.length < 3 ) {
				out.push( n );
			}
		} );
		return out;
	}
	function fetchPondTraits() {
		fetch( WIKI + '/api.php?action=query&format=json&formatversion=2&origin=*&prop=revisions&rvprop=content|timestamp&rvslots=main&titles=' +
			encodeURIComponent( POND_PAGE ) ).then( function ( r ) {
			if ( !r.ok ) {
				throw new Error( 'HTTP ' + r.status );
			}
			return r.json();
		} ).then( function ( res ) {
			var page = res.query.pages[ 0 ], rev = page && page.revisions && page.revisions[ 0 ];
			pondReport = rev ? { traits: pondTraitNames( rev.slots.main.content ), at: new Date( rev.timestamp ) } : null;
			renderUpcoming();
		} ).catch( function () {} );
	}
	/** The live Admin Pond's current traits, or [] when nobody has reported them since the last change. */
	function pondTraits( pond, now ) {
		var r = pondReport;
		return r && r.traits.length && !isNaN( r.at ) && r.at >= pond.when && r.at >= slotStart( now ) ? r.traits : [];
	}
	function pondLive( now ) {
		return upcomingTimes( upcomingEvents, now ).some( isPond );
	}
	function isPond( x ) {
		return x.live && /^Admin Pond/.test( x.name );
	}
	/** A trait's game icon (or its emoji, or nothing) and its name. */
	function traitMark( name, withName ) {
		var span = el( 'span', 'site-pond-trait' );
		var path = catalog && catalog.traitIcons && catalog.traitIcons[ name ];
		if ( typeof path === 'string' && /^[0-9a-f]\/[0-9a-f]{2}\/[A-Za-z0-9_&.,()'+-]+\.png$/.test( path ) ) {
			var img = el( 'img', 'site-pond-icon' );
			// Fandom serves a placeholder picture instead unless no referrer is sent (as in calc.js)
			img.referrerPolicy = 'no-referrer';
			img.setAttribute( 'referrerpolicy', 'no-referrer' );
			img.src = 'https://static.wikia.nocookie.net/fortnite-creator-islands/images/' + path + '/revision/latest/scale-to-width-down/40?nr=4'; // as calc.js: past the year-long cached black-backed icons
			img.alt = withName ? '' : name;
			img.title = name;
			span.appendChild( img );
		} else if ( catalog && catalog.traitEmoji && catalog.traitEmoji[ name ] ) {
			span.appendChild( document.createTextNode( catalog.traitEmoji[ name ] + ' ' ) );
		}
		if ( withName ) {
			span.appendChild( document.createTextNode( name ) );
		}
		return span;
	}
	function nextChange( now ) {
		return new Date( slotStart( now ).getTime() + POND_SLOT ).toLocaleTimeString( [], { hour: 'numeric', minute: '2-digit' } );
	}
	function minsAgo( at, now ) {
		var m = Math.max( 0, Math.round( ( now - at ) / 60000 ) );
		return m < 1 ? 'just now' : m + ' min ago';
	}
	/** The traits line in the Admin Pond card. */
	function pondLine( pond, now ) {
		var box = el( 'div', 'site-pond' );
		var traits = pondTraits( pond, now );
		box.appendChild( el( 'span', 'site-pond-label', 'Traits over the pond:' ) );
		if ( traits.length ) {
			traits.forEach( function ( t ) {
				box.appendChild( traitMark( t, true ) );
			} );
			box.appendChild( el( 'span', 'site-pond-age', 'reported ' + minsAgo( pondReport.at, now ) + ' · they change at ' + nextChange( now ) ) );
		} else {
			box.appendChild( el( 'span', 'site-pond-age', 'nobody has reported them since they changed at ' + slotStart( now ).toLocaleTimeString( [], { hour: 'numeric', minute: '2-digit' } ) ) );
		}
		if ( pondSent && now - pondSent < 5 * 60000 && !( traits.length && pondReport.at >= pondSent - 60000 ) ) {
			box.appendChild( el( 'span', 'site-pond-note', 'Thanks! Tap Save on the wiki page; your report shows here within 2 minutes.' ) );
		}
		if ( pondFormOpen ) {
			box.appendChild( pondForm() );
		} else {
			var b = el( 'button', 'site-pond-open', traits.length ? 'Changed? Report the new traits' : 'Seen them? Report the traits' );
			b.type = 'button';
			b.addEventListener( 'click', function ( e ) {
				e.stopPropagation();
				pondFormOpen = true;
				renderUpcoming();
			} );
			box.appendChild( b );
		}
		return box;
	}

	// the report form: tap up to 3 traits, then send them to the wiki
	var pondFormOpen = false, pondPick = [], pondSent = 0, pondFormNode = null;
	function pondForm() {
		if ( !pondFormNode ) {
			pondFormNode = el( 'div', 'site-pond-form' );
		}
		var f = pondFormNode;
		f.textContent = '';
		f.appendChild( el( 'div', 'site-pond-form-title', 'Which traits are over the pond now? Pick up to 3.' ) );
		var chips = el( 'div', 'site-pond-chips' );
		( catalog && Array.isArray( catalog.traits ) ? catalog.traits.slice() : [] ).sort( function ( a, b ) {
			return b[ 1 ] - a[ 1 ];
		} ).forEach( function ( t ) {
			var on = pondPick.indexOf( t[ 0 ] ) !== -1;
			var c = el( 'button', 'site-pond-chip' );
			c.type = 'button';
			c.setAttribute( 'aria-pressed', on ? 'true' : 'false' );
			c.disabled = !on && pondPick.length >= 3;
			c.appendChild( traitMark( t[ 0 ], true ) );
			c.addEventListener( 'click', function ( e ) {
				e.stopPropagation();
				var i = pondPick.indexOf( t[ 0 ] );
				if ( i === -1 ) {
					if ( pondPick.length < 3 ) {
						pondPick.push( t[ 0 ] );
					}
				} else {
					pondPick.splice( i, 1 );
				}
				pondForm();
			} );
			chips.appendChild( c );
		} );
		f.appendChild( chips );
		var row = el( 'div', 'site-pond-actions' );
		var send = el( 'button', 'site-pond-send', pondPick.length ? 'Send ' + pondPick.length + ' to the wiki' : 'Send to the wiki' );
		send.type = 'button';
		send.disabled = !pondPick.length;
		send.addEventListener( 'click', function ( e ) {
			e.stopPropagation();
			window.open( pondReportUrl( pondPick ), '_blank', 'noopener' );
			pondSent = Date.now();
			pondPick = [];
			pondFormOpen = false;
			renderUpcoming();
		} );
		var cancel = el( 'button', 'site-pond-cancel', 'Cancel' );
		cancel.type = 'button';
		cancel.addEventListener( 'click', function ( e ) {
			e.stopPropagation();
			pondPick = [];
			pondFormOpen = false;
			renderUpcoming();
		} );
		row.appendChild( send );
		row.appendChild( cancel );
		f.appendChild( row );
		f.appendChild( el( 'div', 'site-pond-form-note', 'The wiki opens with your traits filled in: tap Save there. You need a free Fandom account, logged in.' ) );
		return f;
	}

	function showUpcoming( events ) {
		upcomingEvents = Array.isArray( events ) ? events.filter( function ( e ) {
			return e && typeof e.name === 'string';
		} ) : [];
		renderUpcoming();
		setInterval( renderUpcoming, 60000 );
		// while an Admin Pond is on, check for newly reported traits every 2 minutes
		if ( pondLive( new Date() ) ) {
			fetchPondTraits();
		}
		setInterval( function () {
			if ( !document.hidden && pondLive( new Date() ) ) {
				fetchPondTraits();
			}
		}, 120000 );
		document.addEventListener( 'visibilitychange', function () {
			if ( !document.hidden && pondLive( new Date() ) ) {
				fetchPondTraits();
			}
		} );
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
