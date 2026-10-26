/* Reel Value: the Fuze Machine page (engine + page). The engine is copied from
   brainrot-db/Fuze Odds/fuze-tab-mockup/engine.js, which test.js checks against
   the machine's own screens. */
// Fuze Machine engine. Shared by the page and the test.
// Normal fuse: fits all 58 screens (2026-10-22). Admin Fuse (2 Admin Secrets +
// 2 Celestials): fits all 23 screens (2026-10-23).
var FuzeEngine = ( function () {
	// ties at the same base: the machine shows these over the other one (seen on screens)
	var TIE_FIRST = [ 'Formulino Raci', 'Capibarino Bulloni', 'Heartcore Bear', 'Fantino Freddini', 'Aquilino Ferrini' ];
	var ADMIN = 'Admin Secret';
	function makePool( brainrots, fix ) {
		var pool = brainrots.filter( function ( b ) {
			return ( b[ 1 ] === 'Eternal' || b[ 1 ] === 'Celestial' || b[ 1 ] === ADMIN ) && b[ 2 ] > 0;
		} ).map( function ( b ) {
			return { name: b[ 0 ], rarity: b[ 1 ], base: fix[ b[ 0 ] ] || b[ 2 ] };
		} );
		pool.sort( function ( a, b ) {
			if ( a.base !== b.base ) { return a.base - b.base; }
			var pa = TIE_FIRST.indexOf( a.name ) !== -1, pb = TIE_FIRST.indexOf( b.name ) !== -1;
			if ( pa !== pb ) { return pa ? -1 : 1; }
			return a.name < b.name ? -1 : 1;
		} );
		pool.forEach( function ( b, i ) { b.i = i; } );
		// the strongest Admin Secret can come out of the machine but can't go into
		// it, since nothing is stronger (user, 2026-10-23: Skeleton Dragon today,
		// whichever is on top when a stronger one is added)
		var topAdmin = 0;
		pool.forEach( function ( b ) { if ( b.rarity === ADMIN ) { topAdmin = Math.max( topAdmin, b.base ); } } );
		pool.forEach( function ( b ) { b.noInput = b.rarity === ADMIN && b.base >= topAdmin; } );
		return pool;
	}
	function isAdmin( b ) { return b.rarity === ADMIN; }
	function canInput( b ) { return !b.noInput; }
	function count( ins, test ) { return ins.filter( test ).length; }
	// '' when the machine takes these 4, otherwise what it says is wrong
	function check( ins ) {
		var no = ins.filter( function ( b ) { return b.noInput; } )[ 0 ];
		if ( no ) { return no.name + ' can\'t be put in the Fuze Machine.'; }
		var a = count( ins, isAdmin );
		if ( !a ) { return ''; }
		if ( a === 2 && count( ins, function ( b ) { return b.rarity === 'Celestial'; } ) === 2 ) { return ''; }
		return 'Admin Secrets can only be fused as 2 Admin Secrets + 2 Celestials.';
	}
	function nearest( list, target ) {
		var best = null, bd = Infinity;
		list.forEach( function ( b ) {
			var d = Math.abs( b.base - target );
			if ( d < bd - 1e-6 ) { best = b; bd = d; }
		} );
		return best;
	}
	// 5 picks spaced evenly on a ratio scale from the cheapest candidate to top
	function spread( cand, top ) {
		var lo = cand[ 0 ].base, hi = top.base;
		var avail = cand.filter( function ( b ) { return b.base <= hi; } ), picks = [];
		for ( var k = 0; k < 5 && avail.length; k++ ) {
			var t = lo * Math.pow( hi / lo, k / 4 ), b = nearest( avail, t );
			picks.push( b );
			avail.splice( avail.indexOf( b ), 1 );
		}
		return picks;
	}
	// ins: 4 pool entries. Returns the outcomes the machine shows, cheapest first.
	function outcomes( pool, ins ) {
		if ( check( ins ) ) { return []; }
		var sum = 0, max = 0, picks;
		if ( count( ins, isAdmin ) ) {
			// Admin Fuse: Admin Secrets above the strongest Admin put in, up to 1.5x it
			var m = 0;
			ins.forEach( function ( b ) { if ( isAdmin( b ) ) { m = Math.max( m, b.base ); } } );
			var acand = pool.filter( function ( b ) {
				return isAdmin( b ) && b.base > m + 1e-6 && b.base <= 1.5 * m + 1e-6;
			} );
			picks = acand.length <= 5 ? acand : spread( acand, acand[ acand.length - 1 ] );
		} else {
			ins.forEach( function ( b ) { sum += b.base; max = Math.max( max, b.base ); } );
			var avg = sum / ins.length;
			var cand = pool.filter( function ( b ) {
				return !isAdmin( b ) && b.base >= avg - 1e-6 && ins.indexOf( b ) === -1;
			} );
			if ( cand.length <= 5 ) {
				picks = cand;
			} else {
				var cap = 3.3 * max;
				picks = spread( cand, cap < cand[ cand.length - 1 ].base ? nearest( cand, cap ) : cand[ cand.length - 1 ] );
			}
		}
		return picks.sort( function ( a, b ) { return a.i - b.i; } );
	}
	// chance of each outcome, in percent
	function odds( ins, outs ) {
		var sum = 0, max = 0, admin = count( ins, isAdmin ) > 0;
		ins.forEach( function ( b ) { sum += b.base; max = Math.max( max, b.base ); } );
		var c = Math.pow( sum / ins.length, 0.65 ) * Math.pow( max, 0.35 ) / ( admin ? Math.exp( 5 ) : 1 );
		var w = outs.map( function ( b ) {
			var l = Math.log( b.base / c );
			if ( admin ) { return Math.exp( -l * l / 2.5 ) * ( b.base >= 900e6 ? 0.25 : 1 ); }
			return Math.exp( -l * l / 2 ) * ( b.rarity === 'Celestial' ? 0.3 : 1 );
		} );
		var t = w.reduce( function ( a, x ) { return a + x; }, 0 );
		return w.map( function ( x ) { return 100 * x / t; } );
	}
	return { makePool: makePool, outcomes: outcomes, odds: odds, check: check, canInput: canInput };
}() );

// The Fuze page: Find a recipe + Try a fuse (designed in the Game Style
// Mockup, 2026-10-22/23). app.js calls window.ffbFuzeStart() once the wiki's
// figures are on the page and calc.js has loaded (for its brainrot picker).
window.ffbFuzeStart = function () {
	var root = document.getElementById( 'ffz' );
	var dataEl = document.querySelector( '.ffb-trade-data' );
	if ( !root || !dataEl || root.getAttribute( 'data-started' ) ) { return; }
	var D;
	try {
		D = JSON.parse( dataEl.textContent );
	} catch ( e ) {
		return;
	}
	root.setAttribute( 'data-started', '1' );
	root.textContent = '';
	var pool = FuzeEngine.makePool( D.brainrots, {} );
	var byName = {};
	pool.forEach( function ( b ) { byName[ b.name ] = b; } );
	var MUTS = D.mutations.map( function ( m ) { return m[ 0 ]; } );
	var TRAITS = D.traits.map( function ( t ) { return t[ 0 ]; } );
	var TRAIT_MULT = {};
	D.traits.forEach( function ( t ) { TRAIT_MULT[ t[ 0 ] ] = t[ 1 ]; } );
	/**
	 * Each trait's chance to come through, as the machine works it out
	 * (fitted 2026-10-23 to all 81 machine screens, Admin Fuse included;
	 * Fuze Odds/trait_fit.py): every input that has a trait adds 44.5% x
	 * (its base / the 4 inputs' average base)^0.77 to a total, and that is
	 * shared over every trait on the inputs, weighted (multiplier)^-1.1 x
	 * (holder's base)^0.84. A trait on several inputs adds up. Within a point
	 * nearly always; a trait that gets very high can be a few points off.
	 */
	function traitOdds( slots ) {
		var bases = slots.map( function ( s ) { return byName[ s.name ].base; } );
		var mean = bases.reduce( function ( a, b ) { return a + b; }, 0 ) / bases.length;
		var total = 0, w = {}, sum = 0;
		slots.forEach( function ( s, i ) {
			var ts = s.traits.filter( function ( t ) { return t && TRAIT_MULT[ t ]; } );
			if ( !ts.length ) { return; }
			total += 44.5 * Math.pow( bases[ i ] / mean, 0.77 );
			ts.forEach( function ( t ) {
				var x = Math.pow( TRAIT_MULT[ t ], -1.1 ) * Math.pow( bases[ i ] / 1e6, 0.84 );
				w[ t ] = ( w[ t ] || 0 ) + x;
				sum += x;
			} );
		} );
		var out = {};
		Object.keys( w ).forEach( function ( t ) { out[ t ] = Math.min( 100, total * w[ t ] / sum ); } );
		return out;
	}
	// typed-in % only count for the 4 inputs they were typed for
	function slotsKey( slots ) {
		return slots.map( function ( s ) { return s.name + ':' + s.traits.filter( Boolean ).slice().sort().join( '+' ); } ).sort().join( '|' );
	}
	// pictures come from the wiki, like the calculators' (calc.js safeIconUrl)
	var ICONS = {
		get: function ( path ) {
			return typeof path === 'string' && /^[0-9a-f]\/[0-9a-f]{2}\/[A-Za-z0-9_&.,()'+-]+\.png$/.test( path ) ?
				'https://static.wikia.nocookie.net/fortnite-creator-islands/images/' + path + '/revision/latest/scale-to-width-down/80?nr=4' : null;
		}
	};

	function el( tag, cls, text ) {
		var n = document.createElement( tag );
		if ( cls ) { n.className = cls; }
		if ( text !== undefined ) { n.textContent = text; }
		return n;
	}
	function store( key, val ) {
		try {
			if ( val === undefined ) { return JSON.parse( localStorage.getItem( key ) || 'null' ); }
			localStorage.setItem( key, JSON.stringify( val ) );
		} catch ( e ) {}
		return null;
	}
	function money( v ) {
		return '$' + ( v >= 1e9 ? +( v / 1e9 ).toFixed( 2 ) + 'B' : Math.round( v / 1e6 ) + 'M' ) + '/s';
	}
	function pct( p ) {
		if ( p >= 99.995 ) { return '100%'; }
		if ( p > 0 && p < 0.01 ) { return '<0.01%'; }
		return +p.toFixed( 2 ) + '%';
	}
	function iconImg( path ) {
		var src = path && ICONS.get( path );
		if ( !src ) { return null; }
		var i = new Image();
			i.referrerPolicy = 'no-referrer';
		i.src = src;
		i.alt = '';
		i.className = 'ffz-icon';
		return i;
	}
	function rarityVars( node, rarity ) {
		node.style.setProperty( '--rc', D.rarityColors[ rarity ] || '#888' );
		if ( D.rarityColors2 && D.rarityColors2[ rarity ] ) {
			node.style.setProperty( '--rc2', D.rarityColors2[ rarity ] );
			node.classList.add( 'ffz-pic-cel' );
		}
	}
	function pic( b, big ) {
		var s = el( 'span', 'ffz-pic' + ( big ? ' ffz-pic-big' : '' ) );
		rarityVars( s, b.rarity );
		var src = ICONS.get( D.brainrotIcons[ b.name ] );
		if ( src ) {
			var i = new Image();
			i.referrerPolicy = 'no-referrer';
			i.src = src;
			i.alt = '';
			s.appendChild( i );
		} else {
			s.textContent = b.name.split( ' ' ).map( function ( w ) { return w[ 0 ]; } ).join( '' ).slice( 0, 2 );
		}
		return s;
	}
	// the app's searchable brainrot box (name or looks), limited to what can be
	// fused; a plain list if the shared picker isn't on the page (user, 2026-10-23)
	var pickData = {};
	// allowed: a filter for the choices (the four slots pass one); cached by its key
	function rotPicker( id, value, onPick, allowed, allowedKey ) {
		var make = window.ffbStandalone && window.ffbStandalone.namePicker;
		if ( !make ) {
			var sel = rotSelect( id, value );
			sel.addEventListener( 'change', function () { onPick( sel.value ); } );
			return sel;
		}
		var key = allowed ? allowedKey : 'all';
		if ( !pickData[ key ] ) {
			var d = pickData[ key ] = {};
			Object.keys( D ).forEach( function ( k ) { d[ k ] = D[ k ]; } );
			d.brainrots = pool.slice().reverse().filter( function ( b ) { return !allowed || allowed( b ); } )
				.map( function ( b ) { return [ b.name, b.rarity, b.base ]; } );
		}
		var p = make( pickData[ key ], id, value, function ( name ) { if ( byName[ name ] ) { onPick( name ); } } );
		p.input.id = id;
		p.node.classList.add( 'ffz-picker' );
		return p.node;
	}
	function rotSelect( id, value, withAny, anyLabel ) {
		var sel = el( 'select', 'ffz-select' );
		sel.id = id;
		if ( withAny ) {
			var o = el( 'option', null, anyLabel );
			o.value = '';
			sel.appendChild( o );
		}
		[ 'Admin Secret', 'Celestial', 'Eternal' ].forEach( function ( r ) {
			var g = el( 'optgroup' );
			g.label = r;
			pool.slice().reverse().forEach( function ( b ) {
				if ( b.rarity !== r ) { return; }
				var o = el( 'option', null, b.name + ' · ' + money( b.base ) );
				o.value = b.name;
				g.appendChild( o );
			} );
			sel.appendChild( g );
		} );
		sel.value = value || '';
		return sel;
	}
	function plainSelect( id, list, value, noneLabel ) {
		var sel = el( 'select', 'ffz-select' );
		sel.id = id;
		if ( noneLabel ) {
			var o = el( 'option', null, noneLabel );
			o.value = '';
			sel.appendChild( o );
		}
		list.forEach( function ( v ) {
			var o = el( 'option', null, v );
			o.value = v;
			sel.appendChild( o );
		} );
		sel.value = value || '';
		return sel;
	}
	function chip( label, on, iconPath ) {
		var b = el( 'button', 'ffz-chip' );
		b.type = 'button';
		var i = iconImg( iconPath );
		if ( i ) { b.appendChild( i ); }
		b.appendChild( document.createTextNode( label ) );
		b.setAttribute( 'aria-pressed', on ? 'true' : 'false' );
		return b;
	}
	// how many of each brainrot are on the My Collection list (this browser)
	function owned() {
		var c = {}, list = store( 'ffb-collection' );
		( list && list.r || [] ).forEach( function ( r ) { c[ r[ 0 ] ] = ( c[ r[ 0 ] ] || 0 ) + 1; } );
		return c;
	}

	// ---- every 4-brainrot mix, worked out once (order doesn't matter) ----
	var combos = null, byTarget = null;
	function build() {
		if ( combos ) { return; }
		combos = [];
		byTarget = {};
		function add( ins ) {
			var outs = FuzeEngine.outcomes( pool, ins ), ps = FuzeEngine.odds( ins, outs );
			var top = Math.max.apply( null, ps ), total = 0, kinds = {};
			ins.forEach( function ( x ) { total += x.base; kinds[ x.name ] = ( kinds[ x.name ] || 0 ) + 1; } );
			var combo = { ins: ins, outs: outs, ps: ps, total: total, kinds: kinds, nKinds: Object.keys( kinds ).length };
			combos.push( combo );
			outs.forEach( function ( o, k ) {
				( byTarget[ o.name ] = byTarget[ o.name ] || [] ).push( { combo: combo, p: ps[ k ], top: ps[ k ] >= top - 1e-9 } );
			} );
		}
		var norm = pool.filter( function ( x ) { return x.rarity !== 'Admin Secret'; } );
		var adm = pool.filter( function ( x ) { return x.rarity === 'Admin Secret' && FuzeEngine.canInput( x ); } );
		var cel = pool.filter( function ( x ) { return x.rarity === 'Celestial'; } );
		var n = norm.length;
		for ( var a = 0; a < n; a++ ) {
			for ( var b = a; b < n; b++ ) {
				for ( var c = b; c < n; c++ ) {
					for ( var d = c; d < n; d++ ) { add( [ norm[ a ], norm[ b ], norm[ c ], norm[ d ] ] ); }
				}
			}
		}
		// the Admin Fuse: 2 Admin Secrets + 2 Celestials
		for ( var i = 0; i < adm.length; i++ ) {
			for ( var j = i; j < adm.length; j++ ) {
				for ( var k = 0; k < cel.length; k++ ) {
					for ( var l = k; l < cel.length; l++ ) { add( [ adm[ i ], adm[ j ], cel[ k ], cel[ l ] ] ); }
				}
			}
		}
	}

	// ---- state --------------------------------------------------------------
	var saved = store( 'mk-fuze' ) || {};
	var state = {
		// the Fuze page always opens on Find a recipe (user, 2026-10-23)
		view: 'recipes',
		target: saved.target || 'Spin Ferno',
		// cnt: exactly this many of a rarity in the mix ('' = any number)
		f: saved.f || { kinds: 'any', top: false, cnt: {} },
		// per brainrot: 'have', 'no' (don't have) or 'must' (must use)
		marks: saved.marks || {},
		// other results you'd also be happy with, per target (user, 2026-10-23)
		also: saved.also || {},
		q: '',
		sort: saved.sort || 'chance',
		shown: 10,
		// example: a real machine screen from 2026-10-22 (IMG_4050)
		slots: saved.slots || [
			{ name: 'Lumacone Cannellonatore', mut: 'Default', traits: [ 'Heart', 'Snow' ] },
			{ name: 'Lumacone Cannellonatore', mut: 'Default', traits: [ 'Golden Dice' ] },
			{ name: 'Lumacone Cannellonatore', mut: 'Storm', traits: [ 'Bat', 'Purple Star' ] },
			{ name: 'Mewerty', mut: 'Storm', traits: [ 'Atomic' ] }
		],
		want: saved.want || { rot: 'Spin Ferno', mut: 'Storm', traits: [] },
		// { key: slotsKey, pct: { trait: % } }: what the machine showed, typed in
		traitPct: saved.traitPct && saved.traitPct.pct ? saved.traitPct : { key: '', pct: {} }
	};
	if ( state.f.must ) { state.marks[ state.f.must ] = 'must'; }
	if ( state.f.skip ) { state.marks[ state.f.skip ] = 'no'; }
	delete state.f.must;
	delete state.f.skip;
	delete state.f.mine;
	state.f.cnt = state.f.cnt || {};
	delete state.f.max;
	delete state.f.celOff;
	function save() {
		store( 'mk-fuze', { view: state.view, target: state.target, f: state.f, marks: state.marks, also: state.also, sort: state.sort, slots: state.slots, want: state.want, traitPct: state.traitPct } );
	}

	// ---- layout ---------------------------------------------------------------
	var nav = el( 'div', 'ffz-nav' );
	nav.setAttribute( 'role', 'group' );
	nav.setAttribute( 'aria-label', 'Fuze tools' );
	var bRecipes = el( 'button', 'ffb-base-tab', 'Find a recipe' );
	var bTry = el( 'button', 'ffb-base-tab', 'Try a fuse' );
	var bHow = el( 'button', 'ffb-base-tab', 'How it works' );
	[ bRecipes, bTry, bHow ].forEach( function ( b ) { b.type = 'button'; nav.appendChild( b ); } );
	var vRecipes = el( 'div', 'ffz' ), vTry = el( 'div', 'ffz' );
	root.appendChild( nav );
	root.appendChild( vRecipes );
	root.appendChild( vTry );
	function showView( v ) {
		state.view = v;
		bRecipes.classList.toggle( 'ffb-base-tab-on', v === 'recipes' );
		bTry.classList.toggle( 'ffb-base-tab-on', v === 'try' );
		bRecipes.setAttribute( 'aria-pressed', v === 'recipes' ? 'true' : 'false' );
		bTry.setAttribute( 'aria-pressed', v === 'try' ? 'true' : 'false' );
		bHow.classList.toggle( 'ffb-base-tab-on', v === 'how' );
		bHow.setAttribute( 'aria-pressed', v === 'how' ? 'true' : 'false' );
		vRecipes.hidden = v !== 'recipes';
		vTry.hidden = v !== 'try';
		vHow.hidden = v !== 'how';
		if ( v === 'recipes' ) { drawRecipes(); } else if ( v === 'how' ) { drawHow(); } else { drawTry(); }
		save();
	}
	bRecipes.addEventListener( 'click', function () { showView( 'recipes' ); } );
	bTry.addEventListener( 'click', function () { showView( 'try' ); } );
	bHow.addEventListener( 'click', function () { showView( 'how' ); } );

	// ---- Find a recipe ----------------------------------------------------------
	function drawRecipes() {
		build();
		vRecipes.textContent = '';
		var t = byName[ state.target ] || byName[ 'Spin Ferno' ];
		state.target = t.name;

		var pickCard = el( 'div', 'ffz-card' );
		var lab = el( 'label', 'ffz-label', 'I want to get' );
		lab.htmlFor = 'ffz-target';
		var sel = rotPicker( 'ffz-target', t.name, function ( name ) { state.target = name; state.shown = 10; save(); drawRecipes(); } );
		var head = el( 'div', 'ffz-target' );
		head.appendChild( pic( t, true ) );
		var ht = el( 'div', 'ffz-target-text' );
		ht.appendChild( el( 'div', 'ffz-target-name', t.name ) );
		var sub = el( 'div', 'ffz-sub' );
		sub.appendChild( document.createTextNode( t.rarity + ' · ' ) );
		sub.appendChild( el( 'span', 'ffz-money', money( t.base ) ) );
		ht.appendChild( sub );
		head.appendChild( ht );
		var wrap = el( 'div' );
		wrap.appendChild( lab );
		wrap.appendChild( sel );
		pickCard.appendChild( wrap );
		pickCard.appendChild( head );
		vRecipes.appendChild( pickCard );

		// brainrots that are in every mix for this target: shown here and
		// locked in, so no filter can take them out (user, 2026-10-22)
		var req = {}, all0 = byTarget[ t.name ] || [];
		// what else can come out of a mix that can give the target
		var coOut = {};
		all0.forEach( function ( e ) { e.combo.outs.forEach( function ( o ) { if ( o.name !== t.name ) { coOut[ o.name ] = true; } } ); } );
		if ( all0.length ) {
			Object.keys( all0[ 0 ].combo.kinds ).forEach( function ( n ) { req[ n ] = 4; } );
			all0.forEach( function ( e ) {
				Object.keys( req ).forEach( function ( n ) {
					if ( !e.combo.kinds[ n ] ) { delete req[ n ]; } else { req[ n ] = Math.min( req[ n ], e.combo.kinds[ n ] ); }
				} );
			} );
		}
		// the fewest of each rarity those need
		var reqRar = {};
		Object.keys( req ).forEach( function ( n ) { reqRar[ byName[ n ].rarity ] = ( reqRar[ byName[ n ].rarity ] || 0 ) + req[ n ]; } );
		if ( Object.keys( req ).length ) {
			var rc0 = el( 'div', 'ffz-card ffz-needs' );
			rc0.appendChild( el( 'h3', 'ffz-h', 'Every recipe needs' ) );
			Object.keys( req ).forEach( function ( n ) {
				var b = byName[ n ], line = el( 'div', 'ffz-target' );
				line.appendChild( pic( b ) );
				var tx = el( 'div', 'ffz-target-text' );
				tx.appendChild( el( 'div', 'ffz-in-name', ( req[ n ] > 1 ? 'At least ' + req[ n ] + '× ' : '' ) + b.name ) );
				var why = b.base === t.base ?
					'It earns the same as ' + t.name + ' (' + money( b.base ) + '), and the machine shows ' + b.name + ' over ' + t.name + ' whenever both could come out. So ' + t.name + ' only appears when ' + b.name + ' goes in.' :
					'No mix without it can give ' + t.name + '.';
				tx.appendChild( el( 'div', 'ffz-sub', why ) );
				line.appendChild( tx );
				line.appendChild( el( 'span', 'ffz-tag ffz-tag-lock', '🔒 Locked in' ) );
				rc0.appendChild( line );
			} );
			vRecipes.appendChild( rc0 );
		}

		// filters
		var fc = el( 'div', 'ffz-card' );
		fc.appendChild( el( 'h3', 'ffz-h', 'Filters' ) );
		// the first filter (user, 2026-10-23)
		fc.appendChild( alsoBox() );
		var own = owned();
		// Most likely result and Kinds were removed (user, 2026-10-23): the sort covers them
		state.f.top = false;
		state.f.kinds = 'any';
		// exactly how many of each rarity go in (user, 2026-10-23). A row shows
		// only for a rarity some recipe uses, with only the counts that occur
		var rarOrder = [];
		pool.forEach( function ( b ) { if ( rarOrder.indexOf( b.rarity ) === -1 ) { rarOrder.unshift( b.rarity ); } } );
		var counts = {};
		all0.forEach( function ( e ) {
			var n = {};
			e.combo.ins.forEach( function ( x ) { n[ x.rarity ] = ( n[ x.rarity ] || 0 ) + 1; } );
			rarOrder.forEach( function ( r ) { ( counts[ r ] = counts[ r ] || {} )[ n[ r ] || 0 ] = true; } );
		} );
		var offered = {};
		rarOrder.forEach( function ( r ) {
			var opts = Object.keys( counts[ r ] || {} ).map( Number ).sort();
			if ( !opts.length || ( opts.length === 1 && opts[ 0 ] === 0 ) ) { return; }
			var box = el( 'div' );
			box.appendChild( el( 'span', 'ffz-label', r + 's to put in' ) );
			if ( opts.length === 1 ) {
				box.appendChild( el( 'p', 'ffz-note ffz-lock-note', '🔒 Every recipe uses exactly ' + opts[ 0 ] + ' ' + r + ( opts[ 0 ] > 1 ? 's' : '' ) + '.' ) );
				fc.appendChild( box );
				return;
			}
			offered[ r ] = opts;
			if ( state.f.cnt[ r ] !== undefined && state.f.cnt[ r ] !== '' && opts.indexOf( +state.f.cnt[ r ] ) === -1 ) { state.f.cnt[ r ] = ''; }
			var rc = el( 'div', 'ffz-chips' );
			[ '' ].concat( opts.map( String ) ).forEach( function ( v ) {
				var c = chip( v === '' ? 'Any' : v, ( state.f.cnt[ r ] || '' ) === v );
				c.setAttribute( 'aria-label', v === '' ? 'Any number of ' + r + 's' : 'Exactly ' + v + ' ' + r + ( v === '1' ? '' : 's' ) );
				c.addEventListener( 'click', function () {
					state.f.cnt[ r ] = v;
					Array.prototype.forEach.call( rc.children, function ( x ) { x.setAttribute( 'aria-pressed', x === c ? 'true' : 'false' ); } );
					state.shown = 10;
					save();
					drawResults();
				} );
				rc.appendChild( c );
			} );
			box.appendChild( rc );
			if ( reqRar[ r ] ) {
				box.appendChild( el( 'p', 'ffz-note ffz-lock-note', '🔒 At least ' + reqRar[ r ] + ': every recipe needs ' + Object.keys( req ).filter( function ( n ) { return byName[ n ].rarity === r; } ).join( ' and ' ) + '.' ) );
			}
			fc.appendChild( box );
		} );
		fc.appendChild( markBox( own ) );
		vRecipes.appendChild( fc );
		var res = el( 'div', 'ffz' );
		vRecipes.appendChild( res );
		// brainrots that go into at least one mix giving the target (and every
		// "also" pick): the only ones worth marking (user, 2026-10-23)
		var markRefresh; // set by markBox, which runs before this line
		function ingredients() {
			var ex = state.also[ t.name ] || [], got = {};
			all0.forEach( function ( e ) {
				var ok = ex.every( function ( n ) { return e.combo.outs.some( function ( o ) { return o.name === n; } ); } );
				if ( ok ) { Object.keys( e.combo.kinds ).forEach( function ( n ) { got[ n ] = true; } ); }
			} );
			return got;
		}
		function alsoBox() {
			var box = el( 'div', 'ffz-marks ffz-marks-first' );
			box.appendChild( el( 'span', 'ffz-label', 'I\'d also be happy with (up to 4)' ) );
			var names = pool.filter( function ( b ) { return coOut[ b.name ]; } ).reverse();
			if ( !names.length ) {
				box.appendChild( el( 'p', 'ffz-note', 'Every mix that gives ' + t.name + ' gives only ' + t.name + '.' ) );
				return box;
			}
			var sets = [], seen = {};
			all0.forEach( function ( e ) {
				var k = e.combo.outs.map( function ( o ) { return o.i; } ).join( ',' );
				if ( !seen[ k ] ) { seen[ k ] = true; sets.push( e.combo.outs.map( function ( o ) { return o.name; } ) ); }
			} );
			function canAdd( name ) {
				var l = state.also[ t.name ] || [];
				if ( l.length >= 4 ) { return false; }
				return sets.some( function ( set ) {
					return set.indexOf( name ) !== -1 && l.every( function ( n ) { return set.indexOf( n ) !== -1; } );
				} );
			}
			function drawAvail() {
				Array.prototype.forEach.call( chips.children, function ( c ) {
					var on = c.getAttribute( 'aria-pressed' ) === 'true';
					c.disabled = !on && !canAdd( c.getAttribute( 'data-name' ) );
					c.title = c.disabled ? ( ( state.also[ t.name ] || [] ).length >= 4 ? 'You can pick up to 4' : 'Can\'t come out of the same fuse as the ones you picked' ) : '';
				} );
			}
			var note = el( 'p', 'ffz-note' );
			function drawNote() {
				var n = ( state.also[ t.name ] || [] ).length;
				note.textContent = n ? 'Showing mixes that can give ' + t.name + ' and ' + ( n === 1 ? 'the other one' : 'all ' + n + ' others' ) + ' you picked. The chance is of getting any one of them.' :
					'Pick other results you\'d be glad to get, like ones you still need for the index. Only brainrots that can come out of the same fuse as ' + t.name + ' are listed.';
			}
			box.appendChild( note );
			var chips = el( 'div', 'ffz-chips' );
			// closed, only the picked ones show; the toggle opens the rest (user, 2026-10-23)
			var openAll = false;
			var tog = el( 'button', 'ffz-btn ffz-btn-small' );
			tog.type = 'button';
			tog.setAttribute( 'aria-expanded', 'false' );
			function drawTog() {
				var picked = ( state.also[ t.name ] || [] ).length;
				tog.textContent = openAll ? 'Done' : ( picked ? 'Change' : 'Choose from ' + names.length );
				tog.setAttribute( 'aria-expanded', openAll ? 'true' : 'false' );
				Array.prototype.forEach.call( chips.children, function ( c ) {
					c.hidden = !openAll && c.getAttribute( 'aria-pressed' ) !== 'true';
				} );
			}
			tog.addEventListener( 'click', function () { openAll = !openAll; drawTog(); } );
			names.forEach( function ( b ) {
				var on = ( state.also[ t.name ] || [] ).indexOf( b.name ) !== -1;
				var c = el( 'button', 'ffz-chip ffz-chip-rot' );
				c.type = 'button';
				c.setAttribute( 'aria-pressed', on ? 'true' : 'false' );
				c.setAttribute( 'data-name', b.name );
				c.appendChild( pic( b ) );
				c.appendChild( document.createTextNode( b.name ) );
				c.addEventListener( 'click', function () {
					var l = state.also[ t.name ] = state.also[ t.name ] || [], i = l.indexOf( b.name );
					if ( i === -1 ) { l.push( b.name ); } else { l.splice( i, 1 ); }
					c.setAttribute( 'aria-pressed', i === -1 ? 'true' : 'false' );
					state.shown = 10;
					drawNote();
					drawAvail();
					save();
					drawResults();
					if ( markRefresh ) { markRefresh(); }
				} );
				chips.appendChild( c );
			} );
			box.appendChild( chips );
			box.appendChild( tog );
			drawNote();
			drawAvail();
			drawTog();
			return box;
		}
		function drawResults() {
			res.textContent = '';
			var all = byTarget[ t.name ] || [];
			var m = {};
			Object.keys( state.marks ).forEach( function ( n ) { m[ n ] = state.marks[ n ]; } );
			Object.keys( req ).forEach( function ( n ) { m[ n ] = 'must'; } );
			var haves = Object.keys( state.marks ).filter( function ( n ) { return state.marks[ n ] !== 'no' && !req[ n ]; } );
			var musts = Object.keys( m ).filter( function ( n ) { return m[ n ] === 'must'; } );
			var extras = ( state.also[ t.name ] || [] ).filter( function ( n ) { return coOut[ n ]; } ).slice( 0, 4 );
			var list = all.filter( function ( e ) {
				var c = e.combo;
				if ( state.f.top && !e.top ) { return false; }
				if ( state.f.kinds === '1' && c.nKinds !== 1 ) { return false; }
				if ( state.f.kinds === '2' && c.nKinds > 2 ) { return false; }
				for ( var r in offered ) {
					var want = state.f.cnt[ r ];
					if ( want !== undefined && want !== '' && c.ins.filter( function ( x ) { return x.rarity === r; } ).length !== +want ) { return false; }
				}
				for ( var k in c.kinds ) {
					if ( m[ k ] === 'no' ) { return false; }
					// once anything is marked Have, mixes use only what you have
					if ( haves.length && !m[ k ] ) { return false; }
				}
				if ( !musts.every( function ( n ) { return c.kinds[ n ]; } ) ) { return false; }
				return extras.every( function ( n ) { return c.outs.some( function ( o ) { return o.name === n; } ); } );
			} ).map( function ( e ) {
				if ( !extras.length ) { return e; }
				var p = e.p;
				e.combo.outs.forEach( function ( o, k ) { if ( extras.indexOf( o.name ) !== -1 ) { p += e.combo.ps[ k ]; } } );
				return { combo: e.combo, p: p, top: e.top };
			} );
			var sorts = {
				chance: function ( a, b ) { return b.p - a.p || a.combo.total - b.combo.total; },
				cheap: function ( a, b ) { return a.combo.total - b.combo.total || b.p - a.p; },
				kinds: function ( a, b ) { return a.combo.nKinds - b.combo.nKinds || b.p - a.p; }
			};
			list.sort( sorts[ state.sort ] || sorts.chance );

			// mixes with the same possible results have almost the same odds, so
			// they're shown as one group (user, 2026-10-22)
			var groups = [], gi = {};
			list.forEach( function ( e ) {
				var key = e.combo.outs.map( function ( o ) { return o.i; } ).join( ',' );
				var g = gi[ key ];
				if ( !g ) { g = gi[ key ] = { mixes: [], lo: 100, hi: 0, total: Infinity, kinds: 9 }; groups.push( g ); }
				g.mixes.push( e );
				g.lo = Math.min( g.lo, e.p );
				g.hi = Math.max( g.hi, e.p );
				g.total = Math.min( g.total, e.combo.total );
				g.kinds = Math.min( g.kinds, e.combo.nKinds );
			} );
			var gsorts = {
				chance: function ( a, b ) { return b.hi - a.hi || a.total - b.total; },
				cheap: function ( a, b ) { return a.total - b.total || b.hi - a.hi; },
				kinds: function ( a, b ) { return a.kinds - b.kinds || b.hi - a.hi; }
			};
			groups.sort( gsorts[ state.sort ] || gsorts.chance );

			var bar = el( 'div', 'ffz-sortbar' );
			var count = el( 'p', 'ffz-count ffz-note' );
			count.textContent = ( list.length === all.length ?
				all.length.toLocaleString() + ' mixes can give ' + t.name :
				list.length.toLocaleString() + ' of ' + all.length.toLocaleString() + ' mixes match your filters' ) +
				'. They come in ' + groups.length.toLocaleString() + ' groups with the same results.';
			bar.appendChild( count );
			var ss = el( 'select', 'ffz-select' );
			ss.id = 'ffz-sort';
			ss.setAttribute( 'aria-label', 'Sort recipes' );
			[ [ 'chance', 'Best chance first' ], [ 'cheap', 'Weakest brainrots first' ], [ 'kinds', 'Fewest kinds first' ] ].forEach( function ( o ) {
				var op = el( 'option', null, o[ 1 ] );
				op.value = o[ 0 ];
				ss.appendChild( op );
			} );
			ss.value = state.sort;
			ss.addEventListener( 'change', function () { state.sort = ss.value; state.shown = 10; save(); drawResults(); } );
			bar.appendChild( ss );
			res.appendChild( bar );

			var ul = el( 'div', 'ffz-list' );
			if ( !list.length ) {
				ul.appendChild( el( 'div', 'ffz-empty', all.length ? 'No mix matches these filters. Try turning one off, or mark more brainrots as Have.' :
					'Nothing fuses into ' + t.name + ': it\'s the weakest ' + t.rarity + ', so no mix can give it.' ) );
			}
			// in a group, the cheapest way first (user, 2026-10-23): the mixes
			// differ in what they cost far more than in their chance
			var inGroup = {
				cheap: sorts.cheap,
				kinds: function ( a, b ) { return a.combo.nKinds - b.combo.nKinds || sorts.cheap( a, b ); }
			};
			groups.slice( 0, state.shown ).forEach( function ( g, i ) {
				g.mixes.sort( inGroup[ state.sort ] || inGroup.cheap );
				ul.appendChild( groupCard( g, i + 1, t, own, req ) );
			} );
			res.appendChild( ul );
			if ( groups.length > state.shown ) {
				var more = el( 'button', 'ffz-btn ffz-more', 'Show 10 more groups' );
				more.type = 'button';
				more.addEventListener( 'click', function () { state.shown += 10; drawResults(); } );
				res.appendChild( more );
			}
			res.appendChild( el( 'p', 'ffz-note', 'The order you put brainrots in doesn\'t matter, so each mix is listed once. Levels and mutations don\'t change these odds. Covers Eternal and Celestial brainrots and the Admin Fuse (2 Admin Secrets + 2 Celestials); mixes with Brainrot God, Secret or Immortal brainrots haven\'t been measured yet.' ) );
		}
		// the Have / Don't have / Must use list, with search
		function markBox( own ) {
			var box = el( 'div', 'ffz-marks' );
			var top = el( 'div', 'ffz-marks-head' );
			var lab = el( 'label', 'ffz-label', 'Brainrots I have and don\'t have' );
			lab.htmlFor = 'ffz-q';
			top.appendChild( lab );
			var sum = el( 'p', 'ffz-note ffz-marks-sum' );
			top.appendChild( sum );
			box.appendChild( top );
			var q = el( 'input', 'ffz-search' );
			q.type = 'search';
			q.id = 'ffz-q';
			q.placeholder = 'Tap to search and mark brainrots (name or look)';
			q.autocomplete = 'off';
			q.value = state.q;
			box.appendChild( q );
			var tools = el( 'div', 'ffz-chips' );
			var mineN = Object.keys( own ).filter( function ( n ) { return byName[ n ]; } );
			if ( mineN.length ) {
				var imp = el( 'button', 'ffz-btn ffz-btn-small', 'Mark My Collection as Have (' + mineN.length + ')' );
				imp.type = 'button';
				imp.addEventListener( 'click', function () {
					mineN.forEach( function ( n ) { if ( !state.marks[ n ] ) { state.marks[ n ] = 'have'; } } );
					changed();
				} );
				tools.appendChild( imp );
			}
			var clr = el( 'button', 'ffz-btn ffz-btn-small', 'Clear marks' );
			clr.type = 'button';
			clr.addEventListener( 'click', function () { state.marks = {}; changed(); } );
			tools.appendChild( clr );
			box.appendChild( tools );
			var rows = el( 'div', 'ffz-marklist' );
			rows.setAttribute( 'role', 'list' );
			box.appendChild( rows );
			var looks = D.lookWords || {};
			// the full list only opens while you search; closed, it shows just what's
			// marked or locked in (user, 2026-10-23)
			var open = false;
			function setOpen( v ) {
				if ( open === v ) { return; }
				open = v;
				drawRows();
			}
			q.addEventListener( 'focus', function () { setOpen( true ); } );
			q.addEventListener( 'keydown', function ( ev ) { if ( ev.key === 'Escape' ) { q.blur(); setOpen( false ); } } );
			document.addEventListener( 'pointerdown', function ( ev ) {
				if ( open && box.isConnected && !box.contains( ev.target ) ) { setOpen( false ); }
			} );
			function drawRows() {
				rows.textContent = '';
				var words = state.q.toLowerCase().trim().split( /\s+/ ).filter( Boolean );
				var ingr = ingredients();
				var shown = pool.slice().reverse().filter( function ( b ) {
					if ( !ingr[ b.name ] ) { return false; }
					var hay = ( b.name + ' ' + ( looks[ b.name ] || [] ).join( ' ' ) + ' ' + b.rarity ).toLowerCase();
					return words.every( function ( w ) { return hay.indexOf( w ) !== -1; } );
				} );
				// marked ones first, so they're easy to find again
				if ( !open ) {
					shown = pool.slice().reverse().filter( function ( b ) { return ( state.marks[ b.name ] && ingr[ b.name ] ) || req[ b.name ]; } );
				}
				rows.hidden = !shown.length && !open;
				rows.classList.toggle( 'ffz-marklist-open', open );
				shown.sort( function ( a, b ) {
					return ( req[ b.name ] ? 2 : state.marks[ b.name ] ? 1 : 0 ) - ( req[ a.name ] ? 2 : state.marks[ a.name ] ? 1 : 0 );
				} );
				if ( !shown.length && open ) { rows.appendChild( el( 'p', 'ffz-note', state.q ? 'Nothing that can go into these recipes matches "' + state.q + '".' : 'No brainrots to mark.' ) ); }
				shown.forEach( function ( b ) {
					var r = el( 'div', 'ffz-markrow' );
					r.setAttribute( 'role', 'listitem' );
					r.appendChild( pic( b ) );
					var tx = el( 'div', 'ffz-markname' );
					tx.appendChild( el( 'div', 'ffz-in-name', b.name ) );
					tx.appendChild( el( 'div', 'ffz-sub ffz-money', money( b.base ) ) );
					r.appendChild( tx );
					if ( req[ b.name ] ) {
						r.classList.add( 'ffz-markrow-lock' );
						r.appendChild( el( 'span', 'ffz-tag ffz-tag-lock', '🔒 Needed for every recipe' ) );
						rows.appendChild( r );
						return;
					}
					var seg = el( 'div', 'ffz-seg' );
					seg.setAttribute( 'role', 'group' );
					seg.setAttribute( 'aria-label', b.name );
					[ [ 'have', 'Have' ], [ 'no', 'Don\'t have' ], [ 'must', 'Must use' ] ].forEach( function ( o ) {
						var btn = el( 'button', 'ffz-seg-btn ffz-seg-' + o[ 0 ], o[ 1 ] );
						btn.type = 'button';
						btn.setAttribute( 'aria-pressed', state.marks[ b.name ] === o[ 0 ] ? 'true' : 'false' );
						btn.addEventListener( 'click', function () {
							if ( state.marks[ b.name ] === o[ 0 ] ) { delete state.marks[ b.name ]; } else { state.marks[ b.name ] = o[ 0 ]; }
							Array.prototype.forEach.call( seg.children, function ( x ) {
								x.setAttribute( 'aria-pressed', x.className.indexOf( 'ffz-seg-' + state.marks[ b.name ] ) !== -1 ? 'true' : 'false' );
							} );
							changed( true );
						} );
						seg.appendChild( btn );
					} );
					r.appendChild( seg );
					rows.appendChild( r );
				} );
			}
			function drawSum() {
				var c = { have: 0, no: 0, must: 0 };
				Object.keys( state.marks ).forEach( function ( n ) { c[ state.marks[ n ] ]++; } );
				sum.textContent = c.have + c.must ?
					'Mixes use only the ' + ( c.have + c.must ) + ' you have' + ( c.must ? ', including ' + c.must + ' you must use' : '' ) + ( c.no ? '; ' + c.no + ' left out' : '' ) + '.' :
					c.no ? c.no + ' left out. Mark the ones you have to see only mixes you can make.' :
					'Mark the ones you have to see only mixes you can make. Don\'t have leaves a brainrot out.';
			}
			// inPlace: a row's buttons already show the change, so the list keeps its place
			function changed( inPlace ) {
				state.shown = 10;
				save();
				if ( !inPlace ) { drawRows(); }
				drawSum();
				drawResults();
			}
			q.addEventListener( 'input', function () { state.q = q.value; drawRows(); } );
			markRefresh = drawRows;
			drawRows();
			drawSum();
			return box;
		}
		drawResults();
	}
	function haveAll( c, own ) {
		for ( var k in c.kinds ) {
			if ( ( own[ k ] || 0 ) < c.kinds[ k ] && state.marks[ k ] !== 'have' && state.marks[ k ] !== 'must' ) { return false; }
		}
		return true;
	}
	function tryMix( c, t ) {
		state.slots = c.ins.map( function ( b ) { return { name: b.name, mut: 'Default', traits: [] }; } );
		state.want = { rot: t.name, mut: '', traits: [] };
		showView( 'try' );
		root.scrollIntoView( { block: 'start' } );
	}
	// a mix's brainrots in the order to show them (user, 2026-10-23): the
	// required ones first (in every recipe, or marked Must use), then Admin
	// Secrets, then the rest, most expensive first
	function inOrder( c, req ) {
		function rank( b ) { return req[ b.name ] || state.marks[ b.name ] === 'must' ? 0 : b.rarity === 'Admin Secret' ? 1 : 2; }
		return c.ins.slice().sort( function ( a, b ) {
			return rank( a ) - rank( b ) || b.base - a.base || ( a.name < b.name ? -1 : a.name > b.name ? 1 : 0 );
		} );
	}
	// one mix as a short row: small pictures, names (in the pictures' order), chance, Try
	function mixRow( e, t, own, req ) {
		var c = e.combo, row = el( 'div', 'ffz-mix' );
		var ins = inOrder( c, req );
		var pics = el( 'span', 'ffz-mix-pics' );
		ins.forEach( function ( b ) { pics.appendChild( pic( b ) ); } );
		row.appendChild( pics );
		var names = [];
		ins.forEach( function ( b, i ) {
			if ( i && ins[ i - 1 ] === b ) { return; }
			names.push( ( c.kinds[ b.name ] > 1 ? c.kinds[ b.name ] + '× ' : '' ) + b.name );
		} );
		var tx = el( 'span', 'ffz-mix-names' );
		tx.textContent = names.join( ' + ' );
		if ( haveAll( c, own ) ) {
			tx.appendChild( document.createTextNode( ' ' ) );
			tx.appendChild( el( 'span', 'ffz-tag ffz-tag-own', 'You have these' ) );
		}
		row.appendChild( tx );
		row.appendChild( el( 'span', 'ffz-mix-pct', pct( e.p ) ) );
		var go = el( 'button', 'ffz-btn ffz-btn-small', 'Try' );
		go.type = 'button';
		go.setAttribute( 'aria-label', 'Try ' + names.join( ' + ' ) + ' in the machine' );
		go.addEventListener( 'click', function () { tryMix( { ins: ins }, t ); } );
		row.appendChild( go );
		return row;
	}
	// a group: the shared results, the chance range and the best mixes
	function groupCard( g, rank, t, own, req ) {
		// the results' odds come from the group's best-chance mix (the first
		// mix shown is its cheapest)
		var best = g.mixes.reduce( function ( a, e ) { return e.p > a.p ? e : a; } ), c = best.combo, card = el( 'div', 'ffz-recipe' );
		var head = el( 'div' );
		head.appendChild( el( 'div', 'ffz-rank', '#' + rank + ' · ' + g.mixes.length.toLocaleString() + ( g.mixes.length === 1 ? ' mix' : ' mixes' ) ) );
		var res = el( 'div', 'ffz-also' );
		res.appendChild( el( 'span', 'ffz-sub', c.outs.length === 1 ? 'The only possible result:' : 'Possible results:' ) );
		c.outs.forEach( function ( o, k ) {
			var a = el( 'span', 'ffz-also-item' + ( o.name === t.name || ( state.also[ t.name ] || [] ).indexOf( o.name ) !== -1 ? ' ffz-also-target' : '' ) );
			a.title = o.name;
			a.appendChild( pic( o ) );
			a.appendChild( el( 'b', null, pct( c.ps[ k ] ) ) );
			res.appendChild( a );
		} );
		head.appendChild( res );
		card.appendChild( head );
		var ch = el( 'div', 'ffz-chance' );
		ch.appendChild( el( 'span', 'ffz-big', pct( g.hi ) ) );
		if ( ( state.also[ t.name ] || [] ).length ) { ch.appendChild( el( 'span', 'ffz-sub', 'any you picked' ) ); }
		ch.appendChild( el( 'span', 'ffz-sub', g.hi - g.lo >= 0.005 ? 'down to ' + pct( g.lo ) : 'about 1 in ' + Math.max( 1, Math.round( 100 / g.hi ) ) ) );
		card.appendChild( ch );
		var mixes = el( 'div', 'ffz-mixes' );
		var shown = 0;
		function more( n ) {
			g.mixes.slice( shown, shown + n ).forEach( function ( e ) { mixes.appendChild( mixRow( e, t, own, req ) ); } );
			shown = Math.min( g.mixes.length, shown + n );
			if ( shown >= g.mixes.length ) { btn.hidden = true; } else { btn.textContent = 'Show ' + Math.min( 20, g.mixes.length - shown ) + ' more of ' + ( g.mixes.length - shown ).toLocaleString(); }
		}
		var btn = el( 'button', 'ffz-btn ffz-btn-small' );
		btn.type = 'button';
		btn.addEventListener( 'click', function () { more( 20 ); } );
		card.appendChild( mixes );
		var foot = el( 'div', 'ffz-recipe-foot' );
		var tags = el( 'div', 'ffz-chips' );
		if ( best.top && c.outs.length > 1 ) { tags.appendChild( el( 'span', 'ffz-tag ffz-tag-top', 'Most likely result' ) ); }
		foot.appendChild( tags );
		foot.appendChild( btn );
		card.appendChild( foot );
		more( 3 );
		if ( btn.hidden && !tags.children.length ) { foot.hidden = true; }
		return card;
	}

	// ---- Try a fuse -------------------------------------------------------------
	function drawTry() {
		vTry.textContent = '';
		state.slots.forEach( function ( s ) { if ( !byName[ s.name ] ) { s.name = 'Lumacone Cannellonatore'; } } );
		var ins = state.slots.map( function ( s ) { return byName[ s.name ]; } );
		var outs = FuzeEngine.outcomes( pool, ins ), ps = FuzeEngine.odds( ins, outs );

		// the four slots
		var sc = el( 'div', 'ffz-card' );
		sc.appendChild( el( 'h3', 'ffz-h', 'Put in 4 brainrots' ) );
		var grid = el( 'div', 'ffz-slots' );
		state.slots.forEach( function ( s, i ) {
			var slot = el( 'div', 'ffz-slot' );
			var top = el( 'div', 'ffz-slot-top' );
			top.appendChild( pic( byName[ s.name ] ) );
			// only what makes a fuse the machine takes with the other three (user,
			// 2026-10-23): 2 Admin Secrets need 2 Celestials, and so on
			var others = state.slots.filter( function ( x, j ) { return j !== i; } ).map( function ( x ) { return byName[ x.name ]; } );
			var nA = 0, nC = 0, nE = 0;
			others.forEach( function ( b ) {
				if ( b.rarity === 'Admin Secret' ) { nA++; } else if ( b.rarity === 'Celestial' ) { nC++; } else { nE++; }
			} );
			// an Admin Secret in another slot rules out Eternals, an Eternal rules
			// out Admin Secrets, and an Admin Fuse holds 2 of each (user, 2026-10-23)
			var ok = pool.filter( function ( b ) {
				if ( !FuzeEngine.canInput( b ) ) { return false; }
				if ( b.rarity === 'Admin Secret' ) { return !nE && nA < 2 && nC < 3; }
				if ( b.rarity === 'Celestial' ) { return !nA || nC < 2; }
				return !nA;
			} );
			var okSet = {};
			ok.forEach( function ( b ) { okSet[ b.name ] = true; } );
			var rs = rotPicker( 'ffz-slot' + i, s.name, function ( name ) { s.name = name; afterInputs(); },
				function ( b ) { return okSet[ b.name ]; }, ok.map( function ( b ) { return b.i; } ).join( ',' ) );
			var rsIn = rs.querySelector ? rs.querySelector( 'input' ) || rs : rs;
			rsIn.setAttribute( 'aria-label', 'Brainrot ' + ( i + 1 ) );
			top.appendChild( rs );
			slot.appendChild( top );
			var ms = plainSelect( 'ffz-slot' + i + '-mut', MUTS, s.mut );
			ms.setAttribute( 'aria-label', 'Mutation of brainrot ' + ( i + 1 ) );
			ms.addEventListener( 'change', function () { s.mut = ms.value; afterInputs(); } );
			slot.appendChild( ms );
			var tr = el( 'div', 'ffz-slot-traits' );
			for ( var k = 0; k < 3; k++ ) {
				( function ( k ) {
					var ts = plainSelect( 'ffz-slot' + i + '-t' + k, TRAITS, s.traits[ k ], 'No trait' );
					ts.setAttribute( 'aria-label', 'Trait ' + ( k + 1 ) + ' of brainrot ' + ( i + 1 ) );
					ts.addEventListener( 'change', function () {
						s.traits[ k ] = ts.value;
						s.traits = s.traits.filter( Boolean );
						afterInputs();
					} );
					tr.appendChild( ts );
				}( k ) );
			}
			slot.appendChild( tr );
			grid.appendChild( slot );
		} );
		sc.appendChild( grid );
		var rare = ins.some( function ( b ) { return b.rarity === 'Celestial'; } );
		var admin = ins.some( function ( b ) { return b.rarity === 'Admin Secret'; } );
		var vip = ( store( 'ffb-profile' ) || {} ).vip;
		sc.appendChild( el( 'p', 'ffz-note', 'Wait: ' + ( admin ? '3 h (1 h 30 min with VIP)' : rare ? '2 h 30 min (1 h 15 min with VIP)' : '2 h (1 h with VIP)' ) +
			( vip ? '. You have VIP.' : '.' ) + ' The cost in cash shows in the machine; it isn\'t worked out here yet.' ) );
		vTry.appendChild( sc );

		// what can come out
		if ( state.want.rot && outs.every( function ( o ) { return o.name !== state.want.rot; } ) ) { state.want.rot = ''; }
		var oc = el( 'div', 'ffz-card' );
		oc.appendChild( el( 'h3', 'ffz-h', 'Possible outcomes' ) );
		var bad = FuzeEngine.check( ins );
		oc.appendChild( bad ? el( 'p', 'ffz-warn', bad + ' Change the 4 above to see what could come out.' ) : el( 'p', 'ffz-note', 'Tap the one you want.' ) );
		var og = el( 'div', 'ffz-outs' );
		outs.forEach( function ( o, k ) {
			var b = el( 'button', 'ffz-out' );
			b.type = 'button';
			rarityVars( b, o.rarity );
			b.setAttribute( 'aria-pressed', state.want.rot === o.name ? 'true' : 'false' );
			var p = pic( o );
			p.className = 'ffz-pic';
			b.appendChild( p );
			b.appendChild( el( 'span', 'ffz-out-name', o.name ) );
			b.appendChild( el( 'span', 'ffz-out-base ffz-money', money( o.base ) ) );
			b.appendChild( el( 'span', 'ffz-out-pct', pct( ps[ k ] ) ) );
			b.addEventListener( 'click', function () {
				state.want.rot = state.want.rot === o.name ? '' : o.name;
				save();
				drawTry();
			} );
			og.appendChild( b );
		} );
		oc.appendChild( og );
		vTry.appendChild( oc );

		// mutations: each input's mutation, 25% each
		var mc = {}, morder = [];
		state.slots.forEach( function ( s ) {
			if ( !mc[ s.mut ] ) { morder.push( s.mut ); }
			mc[ s.mut ] = ( mc[ s.mut ] || 0 ) + 25;
		} );
		if ( state.want.mut && !mc[ state.want.mut ] ) { state.want.mut = ''; }
		var mcard = el( 'div', 'ffz-card' );
		mcard.appendChild( el( 'h3', 'ffz-h', 'Possible mutations' ) );
		mcard.appendChild( el( 'p', 'ffz-note', 'The result takes one of the inputs\' mutations, 25% for each input that has it.' ) );
		var mch = el( 'div', 'ffz-chips' );
		var anyM = chip( 'Any mutation', !state.want.mut );
		anyM.addEventListener( 'click', function () { state.want.mut = ''; save(); drawTry(); } );
		mch.appendChild( anyM );
		morder.forEach( function ( m ) {
			var c = chip( m + ' ' + mc[ m ] + '%', state.want.mut === m, D.mutationIcons[ m ] );
			c.addEventListener( 'click', function () { state.want.mut = m; save(); drawTry(); } );
			mch.appendChild( c );
		} );
		mcard.appendChild( mch );
		vTry.appendChild( mcard );

		// traits: each one's chance, worked out (a % typed in from the machine wins)
		var torder = [];
		state.slots.forEach( function ( s ) {
			s.traits.forEach( function ( t ) { if ( t && torder.indexOf( t ) === -1 ) { torder.push( t ); } } );
		} );
		state.want.traits = state.want.traits.filter( function ( t ) { return torder.indexOf( t ) !== -1; } );
		var key = slotsKey( state.slots );
		if ( state.traitPct.key !== key ) { state.traitPct = { key: key, pct: {} }; }
		var est = traitOdds( state.slots );
		var typed = state.traitPct.pct;
		function tpct( t ) { return typed[ t ] !== undefined ? typed[ t ] : est[ t ]; }
		var tcard = el( 'div', 'ffz-card' );
		tcard.appendChild( el( 'h3', 'ffz-h', 'Possible traits' ) );
		if ( !torder.length ) {
			tcard.appendChild( el( 'p', 'ffz-note', 'None of the 4 has a trait, so the result won\'t have one.' ) );
		} else {
			tcard.appendChild( el( 'p', 'ffz-note', 'Tap the traits you want. The chances are worked out from 81 machine screens and are nearly always within a point of the machine; a trait that gets very high can be a few points off. If the machine shows something different, type its % in.' ) );
			var rows = el( 'div', 'ffz-traitrows' );
			torder.forEach( function ( t ) {
				var r = el( 'div', 'ffz-traitrow' );
				var on = state.want.traits.indexOf( t ) !== -1;
				var c = chip( on ? 'Want ' + t : t, on, D.traitIcons[ t ] );
				c.addEventListener( 'click', function () {
					var i = state.want.traits.indexOf( t );
					if ( i === -1 ) { state.want.traits.push( t ); } else { state.want.traits.splice( i, 1 ); }
					save();
					drawTry();
				} );
				r.appendChild( c );
				var big = el( 'b', 'ffz-tpct', tpct( t ).toFixed( 2 ) + '%' );
				r.appendChild( big );
				var w = el( 'label', 'ffz-pctwrap' );
				w.appendChild( el( 'span', 'ffz-pctsrc', 'Machine shows' ) );
				var inp = el( 'input', 'ffz-pct' );
				inp.type = 'number';
				inp.inputMode = 'decimal';
				inp.min = '0';
				inp.max = '100';
				inp.step = '0.01';
				inp.id = 'ffz-tp-' + t.replace( /\W+/g, '-' );
				inp.placeholder = '–';
				inp.setAttribute( 'aria-label', 'Chance of ' + t + ' in %, worked out as ' + est[ t ].toFixed( 2 ) + '; type the machine\'s % to use it instead' );
				if ( typed[ t ] !== undefined ) { inp.value = typed[ t ]; }
				inp.addEventListener( 'change', function () {
					var v = parseFloat( inp.value );
					if ( isNaN( v ) ) { delete typed[ t ]; } else { typed[ t ] = Math.min( 100, Math.max( 0, v ) ); }
					big.textContent = tpct( t ).toFixed( 2 ) + '%';
					save();
					drawGoal();
				} );
				w.appendChild( inp );
				w.appendChild( document.createTextNode( '%' ) );
				r.appendChild( w );
				rows.appendChild( r );
			} );
			tcard.appendChild( rows );
		}
		vTry.appendChild( tcard );

		// the goal
		var goal = el( 'div', 'ffz-card ffz-goal' );
		goal.id = 'ffz-goal';
		vTry.appendChild( goal );
		function drawGoal() {
			goal.textContent = '';
			goal.appendChild( el( 'h3', 'ffz-h', 'What you want' ) );
			var w = state.want;
			if ( !w.rot ) {
				goal.appendChild( el( 'p', 'ffz-note', 'Pick a brainrot from Possible outcomes to see your chances.' ) );
				return;
			}
			var k = outs.map( function ( o ) { return o.name; } ).indexOf( w.rot );
			var parts = [ [ w.rot, ps[ k ] / 100 ] ];
			if ( w.mut ) { parts.push( [ w.mut + ' mutation', mc[ w.mut ] / 100 ] ); }
			w.traits.forEach( function ( t ) { parts.push( [ t, tpct( t ) / 100 ] ); } );
			var line = el( 'div', 'ffz-goal-want' );
			line.textContent = [ w.rot, w.mut ? 'with ' + w.mut : 'any mutation' ].concat( w.traits.length ? [ 'with ' + w.traits.join( ' + ' ) ] : [] ).join( ', ' );
			goal.appendChild( line );
			if ( w.traits.length > 3 ) {
				goal.appendChild( el( 'p', 'ffz-warn', 'A brainrot holds at most 3 traits, so 4 or more can\'t all come through.' ) );
				return;
			}
			var p = parts.reduce( function ( a, x ) { return a * x[ 1 ]; }, 1 );
			if ( p <= 0 ) {
				goal.appendChild( el( 'p', 'ffz-warn', 'That can\'t come out of this fuse.' ) );
				return;
			}
			function within( q ) { return p >= 1 ? 1 : Math.ceil( Math.log( 1 - q ) / Math.log( 1 - p ) ); }
			var n50 = within( 0.5 ), n90 = within( 0.9 );
			var stats = el( 'div', 'ffz-stats' );
			function stat( label, big, sub ) {
				var s = el( 'div', 'ffz-stat' );
				var l = el( 'div' );
				l.appendChild( el( 'span', 'ffz-label', label ) );
				if ( sub ) { l.appendChild( el( 'span', 'ffz-sub', sub ) ); }
				s.appendChild( l );
				s.appendChild( el( 'span', 'ffz-big', big ) );
				stats.appendChild( s );
			}
			stat( 'Chance each try', pct( p * 100 ), 'about 1 in ' + Math.max( 1, Math.round( 1 / p ) ) );
			stat( 'Half the time by', ( n50 - 1 ) + ' rerolls', n50 === 1 ? 'the first fuse' : null );
			stat( '9 times in 10 by', ( n90 - 1 ) + ' rerolls', ( n90 - 1 ) + ' tokens or ' + ( ( n90 - 1 ) * 100 ).toLocaleString() + ' V-Bucks' );
			goal.appendChild( stats );
			var math = el( 'ul', 'ffz-math' );
			parts.forEach( function ( x ) { math.appendChild( el( 'li', null, x[ 0 ] + ': ' + pct( x[ 1 ] * 100 ) ) ); } );
			goal.appendChild( math );
			goal.appendChild( el( 'p', 'ffz-note', 'A reroll costs 1 Re-roll token or 100 V-Bucks and rolls the brainrot, mutation and traits again. The chances are multiplied as if each part rolls on its own. Some results say "Can\'t be rerolled", and then you\'d need to fuse again.' ) );
		}
		drawGoal();
		save();
	}
	function afterInputs() {
		save();
		drawTry();
	}

	// ---- How it works (user, 2026-10-26: charts that explain the machine) -----
	// Every chart is worked out live by the same engine as Try a fuse.
	var SVGNS = 'http://www.w3.org/2000/svg';
	function sv( tag, attrs, text ) {
		var n = document.createElementNS( SVGNS, tag );
		Object.keys( attrs || {} ).forEach( function ( k ) { n.setAttribute( k, attrs[ k ] ); } );
		if ( text !== undefined ) { n.textContent = text; }
		return n;
	}
	var NORM = pool.filter( function ( b ) { return b.rarity !== 'Admin Secret'; } );
	var ADM = pool.filter( function ( b ) { return b.rarity === 'Admin Secret'; } );
	var CEL = pool.filter( function ( b ) { return b.rarity === 'Celestial'; } );
	function shortName( n ) { return n.length > 18 ? n.slice( 0, 17 ) + '…' : n; }
	function isAdminMix( ins ) { return ins.some( function ( b ) { return b.rarity === 'Admin Secret'; } ); }
	// what the machine does with these 4, in numbers the charts need
	function explain( ins ) {
		var outs = FuzeEngine.outcomes( pool, ins ), ps = FuzeEngine.odds( ins, outs );
		var sum = 0, max = 0, admin = isAdminMix( ins ), maxAdmin = 0;
		ins.forEach( function ( b ) {
			sum += b.base; max = Math.max( max, b.base );
			if ( b.rarity === 'Admin Secret' ) { maxAdmin = Math.max( maxAdmin, b.base ); }
		} );
		var avg = sum / ins.length;
		var line = admin ? ADM : NORM;
		var from = admin ? maxAdmin : avg, to = admin ? 1.5 * maxAdmin : 3.3 * max;
		var cand = line.filter( function ( b ) {
			return admin ? b.base > maxAdmin + 1e-6 && b.base <= to + 1e-6 : b.base >= avg - 1e-6 && ins.indexOf( b ) === -1;
		} );
		var sweet = Math.pow( avg, 0.65 ) * Math.pow( max, 0.35 ) / ( admin ? Math.exp( 5 ) : 1 );
		return { ins: ins, outs: outs, ps: ps, avg: avg, max: max, admin: admin, line: line, from: from, to: to, cand: cand, sweet: sweet };
	}
	// a tap/hover caption under a chart: the mark's name, income and chance
	function tipLine( svg ) {
		var cap = el( 'p', 'ffz-how-tip', 'Tap a bar or dot to see which brainrot it is.' );
		function show( e ) {
			var t = e.target.closest && e.target.closest( '[data-tip]' );
			if ( t ) { cap.textContent = t.getAttribute( 'data-tip' ); }
		}
		svg.addEventListener( 'pointerover', show );
		svg.addEventListener( 'click', show );
		return cap;
	}
	/**
	 * The income ladder: every brainrot that can come out on one line, cheapest
	 * on the left (ratio scale, like the machine's spacing). Marks the 4 inputs,
	 * the window the results come from, and a bar per result for its chance.
	 */
	function ladder( x, opts ) {
		opts = opts || {};
		var W = 320, H = opts.small ? 92 : 178, pad = 14, base = opts.small ? 58 : 128, barMax = opts.small ? 34 : 86;
		var lo = x.line[ 0 ].base, hi = x.line[ x.line.length - 1 ].base;
		var L0 = Math.log( lo ), L1 = Math.log( hi );
		function X( v ) { return pad + ( Math.log( Math.min( hi, Math.max( lo, v ) ) ) - L0 ) / ( L1 - L0 ) * ( W - 2 * pad ); }
		var svg = sv( 'svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'ffz-how-svg', role: 'img',
			'aria-label': 'Income ladder: ' + x.outs.length + ' possible results between ' + money( x.from ) + ' and ' + money( Math.min( x.to, hi ) ) } );
		// the window results come from
		var wx0 = X( x.from ), wx1 = X( Math.min( x.to, hi ) );
		svg.appendChild( sv( 'rect', { x: wx0, y: base - barMax - 14, width: Math.max( 2, wx1 - wx0 ), height: barMax + 14, rx: 6, class: 'ffz-how-window' } ) );
		[ [ wx0, x.admin ? 'strongest Admin in' : 'average' ], [ wx1, x.admin ? '1.5×' : '3.3× strongest' ] ].forEach( function ( m, k ) {
			svg.appendChild( sv( 'line', { x1: m[ 0 ], x2: m[ 0 ], y1: base - barMax - 14, y2: base + 4, class: 'ffz-how-edge' } ) );
			if ( !opts.small ) {
				svg.appendChild( sv( 'text', { x: m[ 0 ] + ( k ? -3 : 3 ), y: base - barMax - 18, 'text-anchor': k ? 'end' : 'start', class: 'ffz-how-lab' }, m[ 1 ] ) );
			}
		} );
		// the line of brainrots
		svg.appendChild( sv( 'line', { x1: pad, x2: W - pad, y1: base, y2: base, class: 'ffz-how-axis' } ) );
		var picked = {};
		x.outs.forEach( function ( o ) { picked[ o.name ] = true; } );
		x.line.forEach( function ( b ) {
			var c = sv( 'circle', { cx: X( b.base ), cy: base, r: picked[ b.name ] ? 4 : 2.6, fill: D.rarityColors[ b.rarity ] || '#888',
				class: 'ffz-how-dot' + ( picked[ b.name ] ? ' ffz-how-dot-on' : '' ), 'data-tip': b.name + ' · ' + b.rarity + ' · ' + money( b.base ) } );
			svg.appendChild( c );
		} );
		// a bar per result: its chance
		var top = Math.max.apply( null, x.ps.concat( [ 1 ] ) );
		x.outs.forEach( function ( o, k ) {
			var h = Math.max( 3, x.ps[ k ] / top * barMax ), cx = X( o.base );
			var tip = ( k + 1 ) + '. ' + o.name + ' · ' + money( o.base ) + ' · ' + pct( x.ps[ k ] );
			svg.appendChild( sv( 'rect', { x: cx - 4, y: base - 6 - h, width: 8, height: h, rx: 3, class: 'ffz-how-bar', 'data-tip': tip } ) );
			// a wider invisible target, easier to tap than the bar
			svg.appendChild( sv( 'rect', { x: cx - 9, y: base - 6 - barMax, width: 18, height: barMax + 6, fill: 'transparent', 'data-tip': tip } ) );
			if ( !opts.small ) {
				svg.appendChild( sv( 'text', { x: cx, y: base - 10 - h, 'text-anchor': 'middle', class: 'ffz-how-num' }, String( k + 1 ) ) );
			}
		} );
		// the 4 inputs, under the line
		var seen = {};
		// Admin Fuse: only the Admin Secrets put in matter for the list, so only they are marked
		x.ins.forEach( function ( b ) { if ( !x.admin || b.rarity === 'Admin Secret' ) { seen[ b.name ] = ( seen[ b.name ] || 0 ) + 1; } } );
		Object.keys( seen ).forEach( function ( n ) {
			var b = byName[ n ], cx = X( b.base ), y = base + 8;
			svg.appendChild( sv( 'path', { d: 'M' + cx + ' ' + y + 'l-5 9h10z', class: 'ffz-how-in', 'data-tip': 'You put in ' + ( seen[ n ] > 1 ? seen[ n ] + '× ' : '' ) + n + ' · ' + money( b.base ) } ) );
			if ( seen[ n ] > 1 && !opts.small ) { svg.appendChild( sv( 'text', { x: cx + 7, y: y + 9, class: 'ffz-how-lab' }, '×' + seen[ n ] ) ); }
		} );
		if ( !opts.small ) {
			svg.appendChild( sv( 'text', { x: pad, y: H - 4, class: 'ffz-how-lab' }, money( lo ) ) );
			svg.appendChild( sv( 'text', { x: W - pad, y: H - 4, 'text-anchor': 'end', class: 'ffz-how-lab' }, money( hi ) ) );
			svg.appendChild( sv( 'text', { x: W / 2, y: H - 4, 'text-anchor': 'middle', class: 'ffz-how-lab' }, 'income →' ) );
		}
		return svg;
	}
	// the results as a list: the table view of the ladder
	function resultList( x ) {
		var ol = el( 'ol', 'ffz-how-list' );
		x.outs.forEach( function ( o, k ) {
			var li = el( 'li' );
			li.appendChild( el( 'span', 'ffz-how-list-n', String( k + 1 ) ) );
			li.appendChild( pic( o ) );
			var t = el( 'span', 'ffz-how-list-name' );
			t.appendChild( el( 'strong', null, o.name ) );
			t.appendChild( el( 'span', 'ffz-note', o.rarity + ' · ' + money( o.base ) ) );
			li.appendChild( t );
			li.appendChild( el( 'span', 'ffz-how-list-p', pct( x.ps[ k ] ) ) );
			ol.appendChild( li );
		} );
		return ol;
	}
	/** The odds curve: chances peak at a sweet spot and fall off both ways. */
	function curve( x ) {
		var W = 320, H = 156, pad = 14, base = 112, top = 22;
		var lo = x.line[ 0 ].base, hi = x.line[ x.line.length - 1 ].base, L0 = Math.log( lo ), L1 = Math.log( hi );
		function X( v ) { return pad + ( Math.log( v ) - L0 ) / ( L1 - L0 ) * ( W - 2 * pad ); }
		var spread = x.admin ? 2.5 : 2;
		function wt( v ) { var l = Math.log( v / x.sweet ); return Math.exp( -l * l / spread ); }
		function Y( w ) { return base - w * ( base - top ); }
		var svg = sv( 'svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'ffz-how-svg', role: 'img', 'aria-label': 'Odds curve peaking at ' + money( x.sweet ) } );
		svg.appendChild( sv( 'line', { x1: pad, x2: W - pad, y1: base, y2: base, class: 'ffz-how-axis' } ) );
		function path( mult ) {
			var d = '';
			for ( var i = 0; i <= 80; i++ ) {
				var v = Math.exp( L0 + ( L1 - L0 ) * i / 80 );
				d += ( i ? 'L' : 'M' ) + X( v ).toFixed( 1 ) + ' ' + Y( wt( v ) * mult ).toFixed( 1 );
			}
			return d;
		}
		svg.appendChild( sv( 'path', { d: path( 1 ), class: 'ffz-how-curve' } ) );
		var low = x.admin ? 0.25 : 0.3;
		svg.appendChild( sv( 'path', { d: path( low ), class: 'ffz-how-curve ffz-how-curve-low' } ) );
		var sx = X( Math.min( hi, Math.max( lo, x.sweet ) ) );
		svg.appendChild( sv( 'line', { x1: sx, x2: sx, y1: top - 4, y2: base + 4, class: 'ffz-how-edge' } ) );
		svg.appendChild( sv( 'text', { x: sx, y: base + 15, 'text-anchor': sx > W - 70 ? 'end' : sx < 70 ? 'start' : 'middle', class: 'ffz-how-lab' }, 'sweet spot ' + money( x.sweet ) ) );
		x.outs.forEach( function ( o, k ) {
			var rare = x.admin ? o.base >= 900e6 : o.rarity === 'Celestial';
			var cy = Y( wt( o.base ) * ( rare ? low : 1 ) );
			svg.appendChild( sv( 'circle', { cx: X( o.base ), cy: cy, r: 5, class: 'ffz-how-pt', fill: D.rarityColors[ o.rarity ] || '#888',
				'data-tip': ( k + 1 ) + '. ' + o.name + ' · ' + pct( x.ps[ k ] ) + ( rare ? ( x.admin ? ' (900M and up: rarer)' : ' (Celestial: rarer)' ) : '' ) } ) );
			svg.appendChild( sv( 'text', { x: X( o.base ), y: cy - 8, 'text-anchor': 'middle', class: 'ffz-how-num' }, String( k + 1 ) ) );
		} );
		svg.appendChild( sv( 'text', { x: pad, y: H - 6, class: 'ffz-how-lab' }, money( lo ) ) );
		svg.appendChild( sv( 'text', { x: W - pad, y: H - 6, 'text-anchor': 'end', class: 'ffz-how-lab' }, money( hi ) ) );
		return svg;
	}
	function legend( items ) {
		var row = el( 'div', 'ffz-how-legend' );
		items.forEach( function ( it ) {
			var s = el( 'span', 'ffz-how-key' );
			var m = el( 'span', 'ffz-how-swatch ' + ( it[ 2 ] || '' ) );
			if ( it[ 1 ] ) { m.style.background = it[ 1 ]; }
			s.appendChild( m );
			s.appendChild( document.createTextNode( it[ 0 ] ) );
			row.appendChild( s );
		} );
		return row;
	}
	function rarityLegend( admin ) {
		var keys = admin ? [ 'Admin Secret' ] : [ 'Eternal', 'Celestial' ];
		return legend( keys.map( function ( r ) { return [ r, D.rarityColors[ r ] ]; } )
			.concat( [ [ 'result chance', null, 'ffz-how-swatch-bar' ], [ 'you put in', null, 'ffz-how-swatch-in' ] ] ) );
	}
	function inputsRow( ins ) {
		var row = el( 'div', 'ffz-how-ins' );
		ins.forEach( function ( b ) { var p = pic( b ); p.title = b.name + ' · ' + money( b.base ); row.appendChild( p ); } );
		return row;
	}
	// example mixes for the charts
	// the weakest Eternal shows the change best: one strong input moves the whole window
	var mid = NORM[ 0 ], strong = CEL[ CEL.length - 1 ] || NORM[ NORM.length - 1 ];
	var EXAMPLES = {
		same: [ mid, mid, mid, mid ],
		strong: [ mid, mid, mid, strong ],
		admin: ADM.filter( FuzeEngine.canInput ).slice( 0, 2 ).concat( CEL.slice( 0, 2 ) )
	};
	var howMix = 'try';
	function howIns() {
		if ( howMix === 'try' ) {
			var ins = state.slots.map( function ( s ) { return byName[ s.name ]; } );
			return FuzeEngine.check( ins ) ? EXAMPLES.same : ins;
		}
		return EXAMPLES[ howMix ];
	}
	var vHow = el( 'div', 'ffz' );
	root.appendChild( vHow );
	function drawHow() {
		vHow.textContent = '';
		var x = explain( howIns() );

		// 1. the steps
		var c1 = el( 'div', 'ffz-card' );
		c1.appendChild( el( 'h3', 'ffz-h', 'How the machine picks' ) );
		var steps = el( 'ol', 'ffz-how-steps' );
		( x.admin ? [
			[ 'Put in 2 Admin Secrets + 2 Celestials', 'The Admin Fuse. Admin Secrets can\'t be fused any other way.' ],
			[ 'Your strongest Admin Secret sets the floor', 'Only Admin Secrets stronger than it can come out (' + money( x.from ) + ' here). The Celestials don\'t change the list.' ],
			[ 'Up to 1.5× it can come out', x.cand.length + ' Admin Secret' + ( x.cand.length === 1 ? '' : 's' ) + ' fit, up to ' + money( x.to ) + '.' ],
			[ 'You see up to 5, with their chances', 'Spread out from the cheapest to the strongest. Ones at $900M/s and up are 4× rarer.' ]
		] : [
			[ 'Put in 4 brainrots', 'Brainrot God or rarer. These charts cover Eternals and Celestials, the ones measured from the machine.' ],
			[ 'The machine takes their average income', 'Your average here: ' + money( x.avg ) + '. It\'s the floor: nothing cheaper can come out.' ],
			[ 'Anything at or above the average can come out', x.cand.length + ' brainrot' + ( x.cand.length === 1 ? '' : 's' ) + ' qualify here, except the ones you put in.' ],
			[ 'You see 5 of them, with their chances', x.cand.length > 5 ? 'Spread out from the cheapest up to about 3.3× your strongest (' + money( Math.min( x.to, x.line[ x.line.length - 1 ].base ) ) + ').' : 'Only ' + x.cand.length + ' qualify, so you see all of them.' ]
		] ).forEach( function ( s ) {
			var li = el( 'li' );
			li.appendChild( el( 'strong', null, s[ 0 ] ) );
			li.appendChild( el( 'span', 'ffz-note', s[ 1 ] ) );
			steps.appendChild( li );
		} );
		c1.appendChild( steps );
		c1.appendChild( el( 'p', 'ffz-note', 'One strong brainrot pulls the top of the window up. Weak ones pull the average, and so the floor, down.' ) );
		vHow.appendChild( c1 );

		// 2. the ladder, live
		var c2 = el( 'div', 'ffz-card' );
		c2.appendChild( el( 'h3', 'ffz-h', 'The income ladder' ) );
		var mixes = el( 'div', 'ffz-how-mixes' );
		[ [ 'try', 'My Try a fuse 4' ], [ 'same', '4 the same' ], [ 'strong', '3 + 1 strong' ], [ 'admin', 'Admin Fuse' ] ].forEach( function ( m ) {
			var b = el( 'button', 'ffz-chip', m[ 1 ] );
			b.type = 'button';
			b.setAttribute( 'aria-pressed', howMix === m[ 0 ] ? 'true' : 'false' );
			b.addEventListener( 'click', function () { howMix = m[ 0 ]; drawHow(); } );
			mixes.appendChild( b );
		} );
		c2.appendChild( mixes );
		c2.appendChild( inputsRow( x.ins ) );
		c2.appendChild( el( 'p', 'ffz-note', 'Every brainrot that can come out of ' + ( x.admin ? 'an Admin Fuse' : 'a fuse' ) + ', cheapest on the left. The blue window is where results come from; the bars are each result\'s chance.' ) );
		var lad = ladder( x );
		c2.appendChild( lad );
		c2.appendChild( tipLine( lad ) );
		c2.appendChild( rarityLegend( x.admin ) );
		c2.appendChild( resultList( x ) );
		vHow.appendChild( c2 );

		// 3. the odds curve
		var c3 = el( 'div', 'ffz-card' );
		c3.appendChild( el( 'h3', 'ffz-h', 'Why some results are likelier' ) );
		c3.appendChild( el( 'p', 'ffz-note', 'Chances aren\'t even. They peak at a sweet spot a bit above your average, pulled up toward your strongest brainrot, and fall off on both sides. ' +
			( x.admin ? 'Admin Secrets at $900M/s and up sit on the lower curve: 4× rarer.' : 'Celestials sit on the lower curve: about 3× rarer than an Eternal in the same spot.' ) ) );
		var cv = curve( x );
		c3.appendChild( cv );
		c3.appendChild( tipLine( cv ) );
		c3.appendChild( legend( [ [ x.admin ? 'under $900M/s' : 'Eternal', null, 'ffz-how-swatch-line' ], [ x.admin ? '$900M/s and up' : 'Celestial', null, 'ffz-how-swatch-dash' ] ] ) );
		vHow.appendChild( c3 );

		// 4. what changes the result
		var c4 = el( 'div', 'ffz-card' );
		c4.appendChild( el( 'h3', 'ffz-h', 'What changes your result' ) );
		var pair = el( 'div', 'ffz-how-pair' );
		[ [ '4 the same', EXAMPLES.same ], [ 'Swap one for a strong one', EXAMPLES.strong ] ].forEach( function ( p ) {
			var ex = explain( p[ 1 ] ), box = el( 'div', 'ffz-how-ex' );
			box.appendChild( el( 'span', 'ffz-label', p[ 0 ] ) );
			box.appendChild( inputsRow( p[ 1 ] ) );
			box.appendChild( ladder( ex, { small: true } ) );
			box.appendChild( el( 'p', 'ffz-note', 'Results from ' + money( ex.outs[ 0 ] ? ex.outs[ 0 ].base : ex.avg ) + ' to ' + money( ex.outs.length ? ex.outs[ ex.outs.length - 1 ].base : ex.avg ) ) );
			pair.appendChild( box );
		} );
		c4.appendChild( pair );
		var facts = el( 'ul', 'ffz-how-facts' );
		var muts = state.slots.map( function ( s ) { return s.mut; } );
		[
			[ 'Levels and evolutions', 'change nothing. A level 1 and a level 200 of the same brainrot give the same results and chances.' ],
			[ 'The mutation', 'is one of your 4 inputs\' mutations, 25% each (' + muts.join( ', ' ) + ' in your Try a fuse).' ],
			[ 'Putting in a brainrot', 'means it can\'t come out of that fuse.' ]
		].forEach( function ( f ) {
			var li = el( 'li' );
			li.appendChild( el( 'strong', null, f[ 0 ] + ' ' ) );
			li.appendChild( document.createTextNode( f[ 1 ] ) );
			facts.appendChild( li );
		} );
		c4.appendChild( facts );
		vHow.appendChild( c4 );

		// 5. traits
		var c5 = el( 'div', 'ffz-card' );
		c5.appendChild( el( 'h3', 'ffz-h', 'Traits passed on' ) );
		var to = traitOdds( state.slots ), names = Object.keys( to ).sort( function ( a, b ) { return to[ b ] - to[ a ]; } );
		c5.appendChild( el( 'p', 'ffz-note', 'Each trait on your inputs has its own chance to come through (your Try a fuse 4). Traits on stronger brainrots come through more often; rarer traits, with a bigger multiplier, less often.' ) );
		if ( names.length ) {
			var bars = el( 'div', 'ffz-how-tbars' );
			names.forEach( function ( t ) {
				var row = el( 'div', 'ffz-how-trow' );
				row.appendChild( el( 'span', 'ffz-how-tname', t + ' ×' + TRAIT_MULT[ t ] ) );
				var track = el( 'span', 'ffz-how-track' ), fill = el( 'span', 'ffz-how-fill' );
				fill.style.width = Math.max( 2, to[ t ] ) + '%';
				track.appendChild( fill );
				row.appendChild( track );
				row.appendChild( el( 'span', 'ffz-how-tp', Math.round( to[ t ] ) + '%' ) );
				bars.appendChild( row );
			} );
			c5.appendChild( bars );
		} else {
			c5.appendChild( el( 'p', 'ffz-note', 'Your Try a fuse 4 have no traits. Add some there to see their chances here.' ) );
		}
		vHow.appendChild( c5 );
	}

	showView( state.view );
	// tapping the Fuze tab goes back to Find a recipe
	var fuzeTab = document.getElementById( 'tab-fuze' );
	if ( fuzeTab ) { fuzeTab.addEventListener( 'click', function () { if ( state.view !== 'recipes' ) { showView( 'recipes' ); } } ); }
};
