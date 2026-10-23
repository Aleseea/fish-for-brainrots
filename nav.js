/* Reel Value's navigation: the hotbar along the bottom on phones (a sidebar
   with each page's own tabs on larger screens), Profile = My Collection +
   What can I catch? + My stats, and the "start with your stats" note.
   Built from the Game Style Mockup (2026-10-23). app.js still decides which
   page shows (from the #hash); these only add the controls. */
// the pages as a hotbar along the bottom, like the game's backpack bar
// (user, 2026-10-23): numbered slots with drawn icons, the open one lifted
// with a blue ring; its name flashes up when you switch
( function () {
	var nav = document.querySelector( '.site-tabs' );
	if ( !nav ) { return; }
	nav.classList.add( 'mk-hotbar' );
	var O = 'stroke="#081408" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"';
	var ICONS = {
		// Value: a gold coin with a $
		value: '<svg viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="21" r="15" fill="#e8a417" ' + O + '/><circle cx="20" cy="19" r="15" fill="#ffc93a" ' + O + '/><circle cx="20" cy="19" r="10.5" fill="none" stroke="#e8a417" stroke-width="2"/><path d="M24 14.5c-1-1.3-2.4-1.9-4-1.9-2.4 0-4 1.2-4 3 0 4.2 8.2 2.4 8.2 6.6 0 1.9-1.8 3.2-4.2 3.2-1.8 0-3.4-.7-4.4-2.1M20 10.5v2.1M20 25.4v2.1" fill="none" stroke="#7a4b00" stroke-width="2.4" stroke-linecap="round"/></svg>',
		// Trade: two arrows swapping
		trade: '<svg viewBox="0 0 40 40" width="40" height="40"><path d="M7 14h20v-5l9 8-9 8v-5H7z" fill="#2e9bf0" ' + O + '/><path d="M33 26H13v-5l-9 8 9 8v-5h20z" fill="#6fe82a" ' + O + ' transform="translate(0 -3)"/></svg>',
		// Fuze: the machine's sun burst with a bolt
		fuze: '<svg viewBox="0 0 40 40" width="40" height="40"><path d="M20 3l3.6 7 7.6-2.2-2.2 7.6 7 3.6-7 3.6 2.2 7.6-7.6-2.2L20 35l-3.6-7-7.6 2.2 2.2-7.6-7-3.6 7-3.6-2.2-7.6 7.6 2.2z" fill="#ffd23f" ' + O + '/><path d="M22 10l-7 11h5l-2 9 7-12h-5z" fill="#ff7a1a" ' + O + ' stroke-width="2"/></svg>',
		// Codes: the keypad in front of your base, where codes are typed
		codes: '<svg viewBox="0 0 40 40" width="40" height="40"><rect x="7" y="4" width="26" height="32" rx="5" fill="#6b7a8f" ' + O + '/><rect x="11" y="8" width="18" height="6" rx="1.5" fill="#6fe82a" stroke="#081408" stroke-width="2"/>' +
			[ [ 14, 20 ], [ 20, 20 ], [ 26, 20 ], [ 14, 26 ], [ 20, 26 ], [ 26, 26 ], [ 20, 32 ] ].map( function ( p ) {
				return '<rect x="' + ( p[ 0 ] - 2.3 ) + '" y="' + ( p[ 1 ] - 2.3 ) + '" width="4.6" height="4.6" rx="1" fill="#e6edf5" stroke="#081408" stroke-width="1.4"/>';
			} ).join( '' ) + '</svg>',
		// Profile: your collection and what you can catch, under a backpack
		collection: '<svg viewBox="0 0 40 40" width="40" height="40"><path d="M15 9V7a5 5 0 0 1 10 0v2" fill="none" ' + O + '/><rect x="8" y="9" width="24" height="27" rx="7" fill="#f05a3c" ' + O + '/><rect x="12" y="22" width="16" height="10" rx="3" fill="#d23f25" ' + O + ' stroke-width="2.2"/><path d="M12 17h16" ' + O + ' stroke-width="2.2"/></svg>'
	};
	Array.prototype.forEach.call( nav.querySelectorAll( 'a[data-n]' ), function ( a ) {
		var label = a.textContent;
		a.textContent = '';
		a.setAttribute( 'aria-label', label );
		// drawn icons, chunky with a dark outline like the game's HUD (user,
		// 2026-10-23: no brainrot pictures for the pages)
		var svg = ICONS[ a.id.replace( 'tab-', '' ) ];
		if ( svg ) {
			var ic = document.createElement( 'span' );
			ic.className = 'mk-slot-pic';
			ic.setAttribute( 'aria-hidden', 'true' );
			ic.innerHTML = svg;
			a.appendChild( ic );
		}
		var n = document.createElement( 'span' );
		n.className = 'mk-slot-n';
		n.textContent = a.getAttribute( 'data-n' );
		a.appendChild( n );
		var name = document.createElement( 'span' );
		name.className = 'mk-slot-name';
		name.textContent = label;
		a.appendChild( name );
	} );
	// More was replaced by Profile + Codes (user, 2026-10-23)
	var flashT;
	nav.addEventListener( 'click', function ( e ) {
		var a = e.target.closest && e.target.closest( 'a' );
		if ( !a ) { return; }
		window.scrollTo( 0, 0 );
		// the name shows for a moment, then fades
		var name = a.querySelector( '.mk-slot-name' );
		Array.prototype.forEach.call( nav.querySelectorAll( '.mk-flash' ), function ( x ) { x.classList.remove( 'mk-flash' ); } );
		clearTimeout( flashT );
		if ( name ) {
			name.classList.add( 'mk-flash' );
			flashT = setTimeout( function () { name.classList.remove( 'mk-flash' ); }, 1200 );
		}
	} );
	document.body.appendChild( nav );
}() );
// Profile = My Collection + What can I catch? under one hotbar slot, with
// tabs at the top of both (user, 2026-10-23)
( function () {
	var col = document.getElementById( 'panel-collection' ), cat = document.getElementById( 'panel-catch' );
	var tCol = document.getElementById( 'tab-collection' ), tCat = document.getElementById( 'tab-catch' );
	if ( !col || !cat || !tCol || !tCat ) { return; }
	function bar( active ) {
		var n = document.createElement( 'div' );
		n.className = 'ffb-base-nav mk-profile-tabs';
		n.setAttribute( 'role', 'group' );
		n.setAttribute( 'aria-label', 'Profile' );
		[ [ 'My Collection', tCol ], [ 'What can I catch?', tCat ] ].forEach( function ( p ) {
			var b = document.createElement( 'button' );
			b.type = 'button';
			b.className = 'ffb-base-tab' + ( p[ 1 ] === active ? ' ffb-base-tab-on' : '' );
			b.setAttribute( 'aria-pressed', p[ 1 ] === active ? 'true' : 'false' );
			b.textContent = p[ 0 ];
			b.addEventListener( 'click', function () { p[ 1 ].click(); window.scrollTo( 0, 0 ); } );
			n.appendChild( b );
		} );
		return n;
	}
	col.insertBefore( bar( tCol ), col.firstChild );
	cat.insertBefore( bar( tCat ), cat.firstChild );
	// the Profile slot stays lit while either page is open
	function sync() { tCol.classList.toggle( 'mk-profile-on', tCat.getAttribute( 'aria-selected' ) === 'true' ); }
	new MutationObserver( sync ).observe( tCat, { attributes: true, attributeFilter: [ 'aria-selected' ] } );
	sync();
}() );
// large screens: each page's own tabs move into the sidebar, under the page
// (user, 2026-10-23). The sidebar items press the page's real tab buttons,
// which stay in the page (hidden on large screens) and keep working on phones.
( function () {
	var nav = document.querySelector( '.mk-hotbar' );
	if ( !nav ) { return; }
	var SUBS = {
		'tab-fuze': { panel: 'panel-fuze', group: '.ffz-nav', items: [ 'Find a recipe', 'Try a fuse' ] },
		'tab-collection': { tabs: [ [ 'My Collection', 'tab-collection' ], [ 'What can I catch?', 'tab-catch' ] ] }
	};
	var subs = [];
	function source( cfg, label ) {
		var p = document.getElementById( cfg.panel );
		var g = p && p.querySelector( cfg.group );
		return g && Array.prototype.filter.call( g.querySelectorAll( 'button' ), function ( b ) {
			return b.textContent.trim().toLowerCase().indexOf( label.toLowerCase() ) === 0;
		} )[ 0 ];
	}
	Object.keys( SUBS ).forEach( function ( id ) {
		var link = document.getElementById( id ), cfg = SUBS[ id ];
		if ( !link ) { return; }
		var box = document.createElement( 'div' );
		box.className = 'mk-side-subs';
		var list = cfg.tabs || cfg.items.map( function ( l ) { return [ l ]; } );
		list.forEach( function ( it ) {
			var b = document.createElement( 'button' );
			b.type = 'button';
			b.className = 'mk-side-sub';
			b.textContent = it[ 0 ];
			b.addEventListener( 'click', function () {
				if ( it[ 1 ] ) {
					document.getElementById( it[ 1 ] ).click();
				} else {
					link.click();
					var src = source( cfg, it[ 0 ] );
					if ( src ) { src.click(); }
				}
				window.scrollTo( 0, 0 );
				setTimeout( sync, 0 );
			} );
			subs.push( { b: b, cfg: cfg, it: it, link: link } );
			box.appendChild( b );
		} );
		link.parentNode.insertBefore( box, link.nextSibling );
	} );
	function sync() {
		subs.forEach( function ( s ) {
			var on;
			if ( s.it[ 1 ] ) {
				on = document.getElementById( s.it[ 1 ] ).getAttribute( 'aria-selected' ) === 'true';
			} else {
				var src = source( s.cfg, s.it[ 0 ] );
				on = s.link.getAttribute( 'aria-selected' ) === 'true' && !!src &&
					( src.getAttribute( 'aria-pressed' ) === 'true' || src.getAttribute( 'aria-selected' ) === 'true' );
			}
			s.b.setAttribute( 'aria-current', on ? 'page' : 'false' );
		} );
	}
	new MutationObserver( sync ).observe( document.body, { subtree: true, attributes: true, attributeFilter: [ 'aria-pressed', 'aria-selected' ] } );
	sync();
}() );
// large screens: My Collection's own sections (Brainrots, Upgrade plan, Same
// level, My stats) go in the sidebar too, straight under Profile
// (user, 2026-10-23). Labels are read from the page, since counts change.
( function () {
	var nav = document.querySelector( '.mk-hotbar' );
	var colItem = nav && Array.prototype.filter.call( nav.querySelectorAll( '.mk-side-sub' ), function ( b ) { return b.textContent === 'My Collection'; } )[ 0 ];
	if ( !colItem ) { return; }
	colItem.setAttribute( 'data-mycol', '' );
	var box = document.createElement( 'div' );
	box.className = 'mk-side-subs mk-side-subs-2';
	colItem.parentNode.insertBefore( box, colItem.nextSibling );
	function srcButtons() {
		var g = document.querySelector( '#slot-collection .ffb-base-nav:not(.mk-profile-tabs)' );
		return g ? Array.prototype.slice.call( g.querySelectorAll( '.ffb-base-tab' ) ) : [];
	}
	function key( t ) { return t.replace( /\s*\(\d+\)\s*$/, '' ); }
	function draw() {
		// the planner's Profile section is called My stats, last in the list (user, 2026-10-23)
		srcButtons().forEach( function ( s ) { if ( s.textContent.trim() === 'Profile' ) { s.textContent = 'My stats'; } } );
		var src = srcButtons(), onCol = document.getElementById( 'tab-collection' ).getAttribute( 'aria-selected' ) === 'true';
		if ( !src.length ) { return; }
		var have = Array.prototype.map.call( box.children, function ( b ) { return b.getAttribute( 'data-k' ); } ).join( '|' );
		if ( have !== src.map( function ( b ) { return key( b.textContent ); } ).join( '|' ) ) {
			box.textContent = '';
			src.forEach( function ( s ) {
				var b = document.createElement( 'button' );
				b.type = 'button';
				b.className = 'mk-side-sub';
				b.setAttribute( 'data-k', key( s.textContent ) );
				b.addEventListener( 'click', function () {
					document.getElementById( 'tab-collection' ).click();
					var now = srcButtons().filter( function ( x ) { return key( x.textContent ) === b.getAttribute( 'data-k' ); } )[ 0 ];
					if ( now ) { now.click(); }
					window.scrollTo( 0, 0 );
					setTimeout( draw, 0 );
				} );
				box.appendChild( b );
			} );
		}
		src.forEach( function ( s, i ) {
			var b = box.children[ i ];
			b.textContent = s.textContent.trim();
			b.classList.toggle( 'mk-side-last', b.textContent === 'My stats' );
			b.setAttribute( 'aria-current', onCol && s.classList.contains( 'ffb-base-tab-on' ) ? 'page' : 'false' );
		} );
	}
	var t;
	new MutationObserver( function () { clearTimeout( t ); t = setTimeout( draw, 30 ); } )
		.observe( document.getElementById( 'panel-collection' ), { subtree: true, childList: true, attributes: true, attributeFilter: [ 'class' ] } );
	new MutationObserver( draw ).observe( document.getElementById( 'tab-collection' ), { attributes: true, attributeFilter: [ 'aria-selected' ] } );
	draw();
}() );
// no stats saved yet: Profile opens on My stats first, with a note and a way
// on to the brainrots (user, 2026-10-23)
( function () {
	var tab = document.getElementById( 'tab-collection' ), panel = document.getElementById( 'panel-collection' );
	if ( !tab || !panel ) { return; }
	function hasStats() {
		try { return !!localStorage.getItem( 'ffb-profile' ); } catch ( e ) { return true; }
	}
	function inner( label ) {
		return Array.prototype.filter.call( document.querySelectorAll( '#slot-collection .ffb-base-tab' ), function ( b ) {
			return b.textContent.trim().indexOf( label ) === 0;
		} )[ 0 ];
	}
	var note = null, tries = 0;
	function firstVisit() {
		if ( hasStats() ) { return; }
		var ms = inner( 'My stats' );
		if ( !ms ) {
			// the planner builds once the wiki's figures arrive
			if ( ( tries = ( tries || 0 ) + 1 ) < 40 ) { setTimeout( firstVisit, 250 ); }
			return;
		}
		ms.click();
		if ( note ) { return; }
		note = document.createElement( 'div' );
		note.className = 'mk-stats-first';
		note.innerHTML = '<strong>Start with your stats.</strong> Your rebirth, indexes, VIP and Fishing Skill are used across the site, in the upgrade plan, your earnings and the catch odds. ';
		var go = document.createElement( 'button' );
		go.type = 'button';
		go.className = 'ffb-calc-chip';
		go.textContent = 'Done, show my brainrots';
		go.addEventListener( 'click', function () {
			try { if ( !localStorage.getItem( 'ffb-profile' ) ) { localStorage.setItem( 'ffb-profile', '{}' ); } } catch ( e ) {}
			var b = inner( 'Brainrots' );
			if ( b ) { b.click(); }
			note.remove();
			note = null;
		} );
		note.appendChild( go );
		var slot = document.getElementById( 'slot-collection' );
		slot.parentNode.insertBefore( note, slot );
	}
	tab.addEventListener( 'click', function () { setTimeout( firstVisit, 0 ); } );
	if ( tab.getAttribute( 'aria-selected' ) === 'true' ) { setTimeout( firstVisit, 0 ); }
}() );
