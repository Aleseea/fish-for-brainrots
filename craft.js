/* Reel Value: the Crafting page (Potion | Rod | Fuze). MOCKUP 2026-10-25.
   Data: the official crafting boards and the in-game Resource Info & Shop
   (brainrot-db/inbox/crafting-*.md, wiki page "Fish for Brainrots - Crafting").
   The Fuze tab is the existing Fuze page (fuze.js), moved under Crafting. */
var CraftData = ( function () {
	// wiki file paths of the pictures (uploaded 2026-10-25)
	var ICON = {"crafted potion - Alchemist Flask":"5/5f/Fish_for_Brainrots_crafted_potion_-_Alchemist_Flask.png","crafted potion - Anchor Bottle":"4/40/Fish_for_Brainrots_crafted_potion_-_Anchor_Bottle.png","crafted potion - Brain Jar":"7/76/Fish_for_Brainrots_crafted_potion_-_Brain_Jar.png","crafted potion - Chained Elixir":"5/57/Fish_for_Brainrots_crafted_potion_-_Chained_Elixir.png","crafted potion - Crab Claw Flask":"f/f4/Fish_for_Brainrots_crafted_potion_-_Crab_Claw_Flask.png","crafted potion - Glass Barrel":"1/1a/Fish_for_Brainrots_crafted_potion_-_Glass_Barrel.png","crafted potion - Kraken Tonic":"1/13/Fish_for_Brainrots_crafted_potion_-_Kraken_Tonic.png","crafted potion - Leviathan Grip":"d/d7/Fish_for_Brainrots_crafted_potion_-_Leviathan_Grip.png","crafted potion - Megalodon Skull Elixir":"c/c0/Fish_for_Brainrots_crafted_potion_-_Megalodon_Skull_Elixir.png","crafted potion - Piranha Jaw Flask":"f/fc/Fish_for_Brainrots_crafted_potion_-_Piranha_Jaw_Flask.png","crafted potion - Shark Jaw Flask":"c/c4/Fish_for_Brainrots_crafted_potion_-_Shark_Jaw_Flask.png","crafted potion - Shark Tooth Vial":"4/48/Fish_for_Brainrots_crafted_potion_-_Shark_Tooth_Vial.png","crafted potion - Ship in a Bottle":"6/6c/Fish_for_Brainrots_crafted_potion_-_Ship_in_a_Bottle.png","crafted potion - Skull Rum":"9/97/Fish_for_Brainrots_crafted_potion_-_Skull_Rum.png","crafted potion - Trident Decanter":"8/8a/Fish_for_Brainrots_crafted_potion_-_Trident_Decanter.png","crafted rod - Abyss Fang III":"b/b4/Fish_for_Brainrots_crafted_rod_-_Abyss_Fang_III.png","crafted rod - Bamboo Rod":"a/ae/Fish_for_Brainrots_crafted_rod_-_Bamboo_Rod.png","crafted rod - Blue Steel Charybdis":"5/51/Fish_for_Brainrots_crafted_rod_-_Blue_Steel_Charybdis.png","crafted rod - Carbon Shark":"b/b2/Fish_for_Brainrots_crafted_rod_-_Carbon_Shark.png","crafted rod - Fishbone":"d/d6/Fish_for_Brainrots_crafted_rod_-_Fishbone.png","crafted rod - Hook-Hand":"7/76/Fish_for_Brainrots_crafted_rod_-_Hook-Hand.png","crafted rod - Kraken Grip":"9/93/Fish_for_Brainrots_crafted_rod_-_Kraken_Grip.png","crafted rod - Leviathan Fang":"6/64/Fish_for_Brainrots_crafted_rod_-_Leviathan_Fang.png","crafted rod - Leviathan Skull":"d/d7/Fish_for_Brainrots_crafted_rod_-_Leviathan_Skull.png","crafted rod - Megalodon II":"2/25/Fish_for_Brainrots_crafted_rod_-_Megalodon_II.png","crafted rod - Morning Star":"6/64/Fish_for_Brainrots_crafted_rod_-_Morning_Star.png","crafted rod - Oak Rod":"3/30/Fish_for_Brainrots_crafted_rod_-_Oak_Rod.png","crafted rod - Pearl Siren":"6/6e/Fish_for_Brainrots_crafted_rod_-_Pearl_Siren.png","crafted rod - Phoenix":"b/b7/Fish_for_Brainrots_crafted_rod_-_Phoenix.png","crafted rod - Steel Barracuda":"f/f9/Fish_for_Brainrots_crafted_rod_-_Steel_Barracuda.png","resource - Admin Crown":"b/bd/Fish_for_Brainrots_resource_-_Admin_Crown.png","resource - Auto Reel":"4/46/Fish_for_Brainrots_resource_-_Auto_Reel.png","resource - Bait":"3/35/Fish_for_Brainrots_resource_-_Bait.png","resource - Bite Bell":"f/f3/Fish_for_Brainrots_resource_-_Bite_Bell.png","resource - Carbon":"8/82/Fish_for_Brainrots_resource_-_Carbon.png","resource - Clover":"1/17/Fish_for_Brainrots_resource_-_Clover.png","resource - Copper Hook":"7/78/Fish_for_Brainrots_resource_-_Copper_Hook.png","resource - Crown Jewel":"a/a7/Fish_for_Brainrots_resource_-_Crown_Jewel.png","resource - Diamond Hook":"7/71/Fish_for_Brainrots_resource_-_Diamond_Hook.png","resource - Doubloon":"1/1f/Fish_for_Brainrots_resource_-_Doubloon.png","resource - Fly Bait":"e/e8/Fish_for_Brainrots_resource_-_Fly_Bait.png","resource - Four-Leaf Clover":"0/09/Fish_for_Brainrots_resource_-_Four-Leaf_Clover.png","resource - Gold Hook":"f/fc/Fish_for_Brainrots_resource_-_Gold_Hook.png","resource - Golden Bait":"8/8a/Fish_for_Brainrots_resource_-_Golden_Bait.png","resource - Golden Clover":"5/5a/Fish_for_Brainrots_resource_-_Golden_Clover.png","resource - Grapnel":"e/e4/Fish_for_Brainrots_resource_-_Grapnel.png","resource - Hourglass":"e/e5/Fish_for_Brainrots_resource_-_Hourglass.png","resource - Ironwood":"8/8e/Fish_for_Brainrots_resource_-_Ironwood.png","resource - Kraken Tentacle":"3/3c/Fish_for_Brainrots_resource_-_Kraken_Tentacle.png","resource - Leviathan Scale":"f/fe/Fish_for_Brainrots_resource_-_Leviathan_Scale.png","resource - Lure":"2/2d/Fish_for_Brainrots_resource_-_Lure.png","resource - Mutation Core":"b/b9/Fish_for_Brainrots_resource_-_Mutation_Core.png","resource - Mutation Essence":"d/de/Fish_for_Brainrots_resource_-_Mutation_Essence.png","resource - Oak Plank":"b/b6/Fish_for_Brainrots_resource_-_Oak_Plank.png","resource - Rainbow Clover":"c/c9/Fish_for_Brainrots_resource_-_Rainbow_Clover.png","resource - Rainbow Hook":"b/b5/Fish_for_Brainrots_resource_-_Rainbow_Hook.png","resource - Siren Pearl":"3/35/Fish_for_Brainrots_resource_-_Siren_Pearl.png","resource - Star Dust":"5/55/Fish_for_Brainrots_resource_-_Star_Dust.png","resource - Star Shard":"8/81/Fish_for_Brainrots_resource_-_Star_Shard.png","resource - Stopwatch":"3/37/Fish_for_Brainrots_resource_-_Stopwatch.png","resource - Time Crystal":"c/c8/Fish_for_Brainrots_resource_-_Time_Crystal.png","resource - Trait Gem":"7/7b/Fish_for_Brainrots_resource_-_Trait_Gem.png","resource - Trait Shard":"3/38/Fish_for_Brainrots_resource_-_Trait_Shard.png","resource - Triple Line":"4/49/Fish_for_Brainrots_resource_-_Triple_Line.png","resource - Turbo Reel":"6/6e/Fish_for_Brainrots_resource_-_Turbo_Reel.png","resource - Twin Line":"f/f4/Fish_for_Brainrots_resource_-_Twin_Line.png"};
	var TIER_RATE = { S: 10753, A: 2241, B: 641, C: 238, D: 79 };
	// [name, tier, points, effect, one-per group]
	var POTION = [
		[ 'Clover', 'D', 2, { luck: 1 } ],
		[ 'Four-Leaf Clover', 'C', 4, { luck: 2 } ],
		[ 'Golden Clover', 'B', 6, { luck: 3 } ],
		[ 'Rainbow Clover', 'A', 8, { luck: 4 } ],
		[ 'Stopwatch', 'D', 2, { time: 5 } ],
		[ 'Hourglass', 'C', 4, { time: 10 } ],
		[ 'Time Crystal', 'B', 8, { time: 20 } ],
		[ 'Lure', 'B', 3, { drops: 25 }, 'Lure' ],
		[ 'Doubloon', 'S', 15, { money: 2 }, 'Doubloon' ],
		[ 'Leviathan Scale', 'A', 10, { eternal: 2000 }, 'Leviathan Scale' ],
		[ 'Star Dust', 'S', 16, { celestial: 2500 }, 'Star Dust' ],
		[ 'Admin Crown', 'S', 20, { admin: 3000 }, 'Admin Crown' ],
		[ 'Siren Pearl', 'S', 10, { traitAll: 1 }, 'Siren Pearl' ]
	];
	var ROD = [
		[ 'Oak Plank', 'D', 2, { dur: 100 } ],
		[ 'Ironwood', 'C', 4, { dur: 200 } ],
		[ 'Carbon', 'A', 10, { dur: 500 } ],
		[ 'Copper Hook', 'D', 1, { luck: 0.5 } ],
		[ 'Gold Hook', 'C', 2, { luck: 1 } ],
		[ 'Diamond Hook', 'B', 4, { luck: 2 } ],
		[ 'Rainbow Hook', 'A', 6, { luck: 3 } ],
		[ 'Twin Line', 'B', 10, { extra: 1 }, 'line' ],
		[ 'Triple Line', 'A', 20, { extra: 2 }, 'line' ],
		[ 'Bait', 'C', 5, { bite: 1 }, 'bait' ],
		[ 'Golden Bait', 'B', 9, { bite: 1.5 }, 'bait' ],
		[ 'Fly Bait', 'S', 15, { bite: 2 }, 'bait' ],
		[ 'Auto Reel', 'C', 3, { afk: 2 } ],
		[ 'Turbo Reel', 'B', 6, { afk: 4 } ],
		[ 'Bite Bell', 'B', 4, { hook: 1 }, 'Bite Bell' ],
		[ 'Grapnel', 'B', 3, { drops: 25 }, 'Grapnel' ],
		[ 'Star Shard', 'S', 20, { celestial: 2500 }, 'Star Shard' ],
		[ 'Crown Jewel', 'S', 25, { admin: 3000 }, 'Crown Jewel' ],
		[ 'Kraken Tentacle', 'S', 10, { mutAll: 1 }, 'Kraken Tentacle' ]
	];
	// mutation and trait items: tier lists, and points Normal / Pure (Bright) / Perfect.
	// The boards give only Normal and Perfect; the middle one is a guess (marked ~).
	var MUT_TIERS = { S: [ 'Darkness', 'Primal', 'Storm', 'Heaven', 'Shadow', 'Ruby' ], A: [ 'Crystal', 'Ghost', 'Eclipse', 'Aurora', 'Hero' ],
		B: [ 'Toxic', 'Fire & Ice', 'Cyber', 'Egypt', 'Galaxy' ], C: [ 'Party', 'Samurai', 'Rainbow', 'Void' ], D: [ 'Atlantis', 'Diamond', 'Gold' ] };
	var TRAIT_TIERS = { S: [ 'Evil', 'Golden Dice' ], A: [ 'Skull', 'Purple Star', 'Bat' ], B: [ 'Tscha Tscha', 'Candy', 'Heart' ],
		C: [ 'Atomic', 'Ghost', 'Gold Digger' ], D: [ 'Leaf', 'Snow', 'Fire' ] };
	var MUT_PTS = { S: [ 8, 12, 15 ], A: [ 6, 9, 12 ], B: [ 5, 8, 10 ], C: [ 4, 6, 7 ], D: [ 2, 3, 4 ] };
	var TRAIT_PTS = { S: [ 3, 5, 6 ], A: [ 2, 4, 5 ], B: [ 2, 3, 4 ], C: [ 1, 2, 3 ], D: [ 1, 2, 2 ] };
	var MUT_PCT = [ 15, 25, 35 ], TRAIT_PCT = [ 4, 7, 10 ];
	var MUT_RATE = { S: [ 10633, 29240, 70176 ], A: [ 5317, 14620, 35088 ], B: [ 3545, 9747, 23392 ], C: [ 1576, 4332, 10397 ], D: [ 760, 2089, 5013 ] };
	var TRAIT_RATE = { S: [ 3545, 9747, 23392 ], A: [ 3190, 8772, 21053 ], B: [ 2127, 5848, 14036 ], C: [ 1182, 3249, 7798 ], D: [ 760, 2089, 5013 ] };
	var LOOK_AT = [ 0, 4, 8, 13, 18, 24, 31, 39, 48, 58, 68, 79, 91, 104, 120 ];
	var WAIT = [ '1 min', '2 min', '3 min', '5 min', '8 min', '10 min', '15 min', '20 min', '30 min', '40 min', '50 min', '1 hour', '75 min', '90 min', '2 hours' ];
	var LOOKS = {
		potion: [ 'Shark Tooth Vial', 'Anchor Bottle', 'Alchemist Flask', 'Piranha Jaw Flask', 'Trident Decanter', 'Glass Barrel', 'Skull Rum', 'Brain Jar',
			'Chained Elixir', 'Shark Jaw Flask', 'Ship in a Bottle', 'Crab Claw Flask', 'Kraken Tonic', 'Leviathan Grip', 'Megalodon Skull Elixir' ],
		rod: [ 'Bamboo Rod', 'Oak Rod', 'Steel Barracuda', 'Morning Star', 'Hook-Hand', 'Carbon Shark', 'Pearl Siren', 'Megalodon II',
			'Fishbone', 'Phoenix', 'Blue Steel Charybdis', 'Abyss Fang III', 'Leviathan Fang', 'Kraken Grip', 'Leviathan Skull' ]
	};
	// recipe slots by rebirth: 2 at the start, 3 from rebirth 1 (user, 2026-10-25), then
	// 5, 10, 15, 20, 30, 40, 45 (a player in game chat) - not confirmed
	var SLOT_AT = [ [ 45, 10 ], [ 40, 9 ], [ 30, 8 ], [ 20, 7 ], [ 15, 6 ], [ 10, 5 ], [ 5, 4 ], [ 1, 3 ], [ 0, 2 ] ];
	function slotsFor( rebirth ) {
		for ( var i = 0; i < SLOT_AT.length; i++ ) { if ( rebirth >= SLOT_AT[ i ][ 0 ] ) { return SLOT_AT[ i ][ 1 ]; } }
		return 2;
	}
	function lookAt( pts ) {
		var s = 0;
		LOOK_AT.forEach( function ( p, i ) { if ( pts >= p ) { s = i; } } );
		return s;
	}
	return { ICON: ICON, TIER_RATE: TIER_RATE, POTION: POTION, ROD: ROD, MUT_TIERS: MUT_TIERS, TRAIT_TIERS: TRAIT_TIERS, MUT_PTS: MUT_PTS,
		TRAIT_PTS: TRAIT_PTS, MUT_PCT: MUT_PCT, TRAIT_PCT: TRAIT_PCT, MUT_RATE: MUT_RATE, TRAIT_RATE: TRAIT_RATE, LOOK_AT: LOOK_AT, WAIT: WAIT,
		LOOKS: LOOKS, slotsFor: slotsFor, lookAt: lookAt };
}() );

// What a recipe does. Pure: shared by the page and the test.
var CraftEngine = ( function () {
	var C = CraftData;
	function tierOf( list, name ) {
		for ( var t in list ) { if ( list[ t ].indexOf( name ) !== -1 ) { return t; } }
		return null;
	}
	// item: { name } or { kind: 'mut' | 'trait', of: 'Darkness', grade: 0..2 }
	function describe( kind, item ) {
		if ( item.kind === 'mut' || item.kind === 'trait' ) {
			var mut = item.kind === 'mut', tier = tierOf( mut ? C.MUT_TIERS : C.TRAIT_TIERS, item.of );
			var grades = mut ? [ '', 'Pure ', 'Perfect ' ] : [ '', 'Bright ', 'Perfect ' ];
			var noun = mut ? ( kind === 'potion' ? 'Essence' : 'Core' ) : ( kind === 'potion' ? 'Shard' : 'Gem' );
			return {
				name: grades[ item.grade ] + item.of + ' ' + noun, tier: tier,
				pts: ( mut ? C.MUT_PTS : C.TRAIT_PTS )[ tier ][ item.grade ], ptsGuess: item.grade === 1,
				icon: 'resource - ' + ( mut ? ( kind === 'potion' ? 'Mutation Essence' : 'Mutation Core' ) : ( kind === 'potion' ? 'Trait Shard' : 'Trait Gem' ) ),
				rate: ( mut ? C.MUT_RATE : C.TRAIT_RATE )[ tier ][ item.grade ], fx: {}, group: mut ? 'mut' : 'trait',
				mut: mut ? item.of : null, trait: mut ? null : item.of, pct: ( mut ? C.MUT_PCT : C.TRAIT_PCT )[ item.grade ]
			};
		}
		var row = ( kind === 'potion' ? C.POTION : C.ROD ).filter( function ( r ) { return r[ 0 ] === item.name; } )[ 0 ];
		return row && { name: row[ 0 ], tier: row[ 1 ], pts: row[ 2 ], fx: row[ 3 ], one: row[ 4 ] || null, icon: 'resource - ' + row[ 0 ], rate: C.TIER_RATE[ row[ 1 ] ] };
	}
	function run( kind, items ) {
		var potion = kind === 'potion';
		var r = { pts: 0, ptsGuess: false, luck: 1, time: 10, dur: 100, perCatch: 1, bite: 0, afk: 0, hook: false, drops: 0, money: false,
			eternal: 0, celestial: 0, admin: 0, traitAll: false, mutAll: false, muts: {}, traits: {}, warn: [], wasted: {} };
		var seen = {}, nMut = 0, nTrait = 0, rawLuck = 0, rawTime = 0, rawDur = 0, rawAfk = 0;
		items.forEach( function ( it ) {
			var d = describe( kind, it );
			if ( !d ) { return; }
			r.pts += d.pts;
			if ( d.ptsGuess ) { r.ptsGuess = true; }
			var key = d.one;
			if ( key ) {
				if ( seen[ key ] ) {
					r.warn.push( key === 'line' ? 'Only 1 line per rod: the second one does nothing.' :
						key === 'bait' ? 'Only 1 bait per rod: the second one does nothing.' : 'Only 1 ' + d.name + ' per ' + kind + '.' );
					return;
				}
				seen[ key ] = true;
			}
			if ( d.group === 'mut' ) {
				if ( ++nMut > 2 ) { r.warn.push( 'At most 2 mutation items per ' + kind + '.' ); return; }
				r.muts[ d.mut ] = ( r.muts[ d.mut ] || 0 ) + d.pct;
			}
			if ( d.group === 'trait' ) {
				if ( ++nTrait > 2 ) { r.warn.push( 'At most 2 trait items per ' + kind + '.' ); return; }
				r.traits[ d.trait ] = ( r.traits[ d.trait ] || 0 ) + d.pct;
			}
			var fx = d.fx;
			if ( fx.luck ) { rawLuck += fx.luck; }
			if ( fx.time ) { rawTime += fx.time; }
			if ( fx.dur ) { rawDur += fx.dur; }
			if ( fx.extra ) { r.perCatch = 1 + fx.extra; }
			if ( fx.bite ) { r.bite = fx.bite; }
			if ( fx.afk ) { rawAfk += fx.afk; }
			if ( fx.hook ) { r.hook = true; }
			if ( fx.drops ) { r.drops += fx.drops; }
			if ( fx.money ) { r.money = true; }
			if ( fx.eternal ) { r.eternal = fx.eternal; }
			if ( fx.celestial ) { r.celestial = fx.celestial; }
			if ( fx.admin ) { r.admin = fx.admin; }
			if ( fx.traitAll ) { r.traitAll = true; }
			if ( fx.mutAll ) { r.mutAll = true; }
		} );
		var luckCap = potion ? 10 : 7.5;
		r.luck = Math.min( luckCap, 1 + rawLuck );
		if ( 1 + rawLuck > luckCap ) { r.warn.push( 'Luck stops at ' + luckCap + 'x: ' + ( 1 + rawLuck - luckCap ) + 'x of it is wasted.' ); }
		if ( potion ) {
			var timeCap = r.money ? 30 : 60;
			r.time = Math.min( timeCap, 10 + rawTime );
			if ( 10 + rawTime > timeCap ) {
				r.warn.push( ( r.money ? 'With a Doubloon the potion lasts at most 30 minutes' : 'Potions last at most 60 minutes' ) + ': ' + ( 10 + rawTime - timeCap ) + ' minutes are wasted.' );
			}
		} else {
			r.dur = Math.min( 1000, 100 + rawDur );
			if ( 100 + rawDur > 1000 ) { r.warn.push( 'Durability stops at 1,000 catches: ' + ( 100 + rawDur - 1000 ) + ' are wasted.' ); }
			r.afk = Math.min( 6, rawAfk );
			if ( rawAfk > 6 ) { r.warn.push( 'AFK catches can only come 6 seconds sooner: ' + ( rawAfk - 6 ) + ' s is wasted.' ); }
		}
		r.stage = C.lookAt( r.pts );
		r.look = C.LOOKS[ kind ][ r.stage ];
		r.wait = C.WAIT[ r.stage ];
		r.next = r.stage < 14 ? { at: C.LOOK_AT[ r.stage + 1 ], name: C.LOOKS[ kind ][ r.stage + 1 ] } : null;
		return r;
	}
	// a potion and a rod used together (user, 2026-10-25: their luck adds up)
	function together( p, rod ) {
		var muts = {}, traits = {};
		[ p, rod ].forEach( function ( r ) {
			if ( !r ) { return; }
			Object.keys( r.muts ).forEach( function ( m ) { muts[ m ] = ( muts[ m ] || 0 ) + r.muts[ m ]; } );
			Object.keys( r.traits ).forEach( function ( t ) { traits[ t ] = ( traits[ t ] || 0 ) + r.traits[ t ]; } );
		} );
		function oneIn( a, b ) { return a && b ? Math.round( 1 / ( 1 / a + 1 / b ) ) : ( a || b || 0 ); }
		return {
			luck: ( p ? p.luck : 0 ) + ( rod ? rod.luck : 0 ),
			drops: ( p ? p.drops : 0 ) + ( rod ? rod.drops : 0 ),
			muts: muts, traits: traits,
			celestial: oneIn( p && p.celestial, rod && rod.celestial ),
			admin: oneIn( p && p.admin, rod && rod.admin ),
			eternal: p ? p.eternal : 0
		};
	}
	return { describe: describe, run: run, together: together };
}() );

( function () {
	if ( typeof document === 'undefined' ) { return; }
	var panel = document.getElementById( 'panel-fuze' );
	var root = document.getElementById( 'craft' );
	if ( !panel || !root ) { return; }
	var C = CraftData, E = CraftEngine;
	var TIERS = [ 'S', 'A', 'B', 'C', 'D' ];
	var TIER_COLOR = { S: '#e0202a', A: '#f07a10', B: '#8a2be2', C: '#1f6fe0', D: '#2fae3a' };

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
	function pic( name, size, cls ) {
		var path = C.ICON[ name ];
		var i = new Image();
		i.referrerPolicy = 'no-referrer';
		i.alt = '';
		i.className = cls || 'mk-craft-pic';
		i.width = i.height = size;
		if ( path ) { i.src = 'https://static.wikia.nocookie.net/fortnite-creator-islands/images/' + path + '/revision/latest/scale-to-width-down/' + ( size > 60 ? 160 : 80 ) + '?nr=4'; }
		return i;
	}
	function tierBadge( t ) {
		var b = el( 'span', 'mk-craft-tier', t );
		b.style.background = TIER_COLOR[ t ];
		return b;
	}
	function num( n ) { return ( +n.toFixed( 2 ) ).toLocaleString( 'en-US' ); }

	var saved = store( 'mk-craft' ) || {};
	var state = {
		view: saved.view || 'potion',
		potion: saved.potion || [],
		rod: saved.rod || [],
		slots: saved.slots || null
	};
	function save() { store( 'mk-craft', state ); }
	function profileRebirth() { var p = store( 'ffb-profile' ) || {}; return +p.rebirth || 0; }
	function slots() { return state.slots || C.slotsFor( profileRebirth() ); }

	// ---- top tabs: Potion | Rod | Fuze ---------------------------------------
	var fuzeWrap = document.getElementById( 'fuze-wrap' );
	var heading = panel.querySelector( 'h2' );
	var nav = el( 'div', 'ffz-nav mk-craft-nav' );
	nav.setAttribute( 'role', 'group' );
	nav.setAttribute( 'aria-label', 'Crafting' );
	var tabs = {};
	[ [ 'potion', 'Potion' ], [ 'rod', 'Rod' ], [ 'fuze', 'Fuze' ] ].forEach( function ( t ) {
		var b = el( 'button', 'ffb-base-tab', t[ 1 ] );
		b.type = 'button';
		b.addEventListener( 'click', function () { showView( t[ 0 ] ); } );
		nav.appendChild( b );
		tabs[ t[ 0 ] ] = b;
	} );
	panel.insertBefore( nav, heading.nextSibling );
	function showView( v ) {
		state.view = v;
		Object.keys( tabs ).forEach( function ( k ) {
			tabs[ k ].classList.toggle( 'ffb-base-tab-on', k === v );
			tabs[ k ].setAttribute( 'aria-pressed', k === v ? 'true' : 'false' );
		} );
		heading.textContent = v === 'fuze' ? 'Fuze Machine' : v === 'rod' ? 'Rod Station' : 'Potion Brewery';
		root.hidden = v === 'fuze';
		if ( fuzeWrap ) { fuzeWrap.hidden = v !== 'fuze'; }
		if ( v !== 'fuze' ) { draw(); }
		save();
	}

	// ---- picker sheet ------------------------------------------------------------
	var sheet = null;
	function closeSheet() { if ( sheet ) { sheet.remove(); sheet = null; document.body.classList.remove( 'mk-craft-sheet-open' ); } }
	function openPicker( kind, onPick ) {
		closeSheet();
		sheet = el( 'div', 'mk-craft-sheet' );
		sheet.setAttribute( 'role', 'dialog' );
		sheet.setAttribute( 'aria-label', 'Add a resource' );
		var box = el( 'div', 'mk-craft-sheet-box' );
		var head = el( 'div', 'mk-craft-sheet-head' );
		head.appendChild( el( 'strong', null, kind === 'potion' ? 'Add an ingredient' : 'Add a part' ) );
		var x = el( 'button', 'mk-craft-x', '✕' );
		x.type = 'button';
		x.setAttribute( 'aria-label', 'Close' );
		x.addEventListener( 'click', closeSheet );
		head.appendChild( x );
		box.appendChild( head );
		var list = el( 'div', 'mk-craft-sheet-list' );
		TIERS.forEach( function ( t ) {
			var rows = ( kind === 'potion' ? C.POTION : C.ROD ).filter( function ( r ) { return r[ 1 ] === t; } );
			if ( !rows.length ) { return; }
			var h = el( 'div', 'mk-craft-sheet-tier' );
			h.appendChild( tierBadge( t ) );
			h.appendChild( el( 'span', null, 'Tier ' + t + ' · each drops about 1 in ' + C.TIER_RATE[ t ].toLocaleString( 'en-US' ) + ' catches' ) );
			list.appendChild( h );
			rows.forEach( function ( r ) {
				var d = E.describe( kind, { name: r[ 0 ] } );
				list.appendChild( optionRow( d, effectText( kind, d ), function () { onPick( { name: r[ 0 ] } ); closeSheet(); } ) );
			} );
		} );
		// mutation and trait items: pick which one, then how strong
		var h2 = el( 'div', 'mk-craft-sheet-tier' );
		h2.appendChild( el( 'span', null, kind === 'potion' ? 'Mutation Essences and Trait Shards (up to 2 of each)' : 'Mutation Cores and Trait Gems (up to 2 of each)' ) );
		list.appendChild( h2 );
		list.appendChild( specialRow( kind, 'mut', onPick ) );
		list.appendChild( specialRow( kind, 'trait', onPick ) );
		box.appendChild( list );
		sheet.appendChild( box );
		sheet.addEventListener( 'click', function ( e ) { if ( e.target === sheet ) { closeSheet(); } } );
		document.body.appendChild( sheet );
		document.body.classList.add( 'mk-craft-sheet-open' );
	}
	function optionRow( d, text, onTap ) {
		var b = el( 'button', 'mk-craft-opt' );
		b.type = 'button';
		b.appendChild( pic( d.icon, 40 ) );
		var t = el( 'span', 'mk-craft-opt-text' );
		t.appendChild( el( 'span', 'mk-craft-opt-name', d.name ) );
		t.appendChild( el( 'span', 'mk-craft-opt-fx', text ) );
		b.appendChild( t );
		b.appendChild( el( 'span', 'mk-craft-opt-pts', ( d.ptsGuess ? '~' : '' ) + d.pts + ' pts' ) );
		b.addEventListener( 'click', onTap );
		return b;
	}
	function specialRow( kind, which, onPick ) {
		var mut = which === 'mut';
		var wrap = el( 'div', 'mk-craft-special' );
		var top = el( 'div', 'mk-craft-special-top' );
		top.appendChild( pic( 'resource - ' + ( mut ? ( kind === 'potion' ? 'Mutation Essence' : 'Mutation Core' ) : ( kind === 'potion' ? 'Trait Shard' : 'Trait Gem' ) ), 40 ) );
		var sel = el( 'select', 'ffb-trade-input mk-craft-select' );
		sel.setAttribute( 'aria-label', mut ? 'Mutation' : 'Trait' );
		TIERS.forEach( function ( t ) {
			var g = el( 'optgroup' );
			g.label = 'Tier ' + t;
			( mut ? C.MUT_TIERS : C.TRAIT_TIERS )[ t ].forEach( function ( n ) { var o = el( 'option', null, n ); o.value = n; g.appendChild( o ); } );
			sel.appendChild( g );
		} );
		top.appendChild( sel );
		wrap.appendChild( top );
		var grades = el( 'div', 'mk-craft-grades' );
		var names = mut ? [ 'Normal', 'Pure', 'Perfect' ] : [ 'Normal', 'Bright', 'Perfect' ];
		var pcts = mut ? C.MUT_PCT : C.TRAIT_PCT;
		names.forEach( function ( g, i ) {
			var b = el( 'button', 'ffz-btn ffz-btn-small', g + ' +' + pcts[ i ] + '%' );
			b.type = 'button';
			b.addEventListener( 'click', function () { onPick( { kind: which, of: sel.value, grade: i } ); closeSheet(); } );
			grades.appendChild( b );
		} );
		wrap.appendChild( grades );
		wrap.appendChild( el( 'p', 'ffz-note', mut ? '+15/25/35% chance for that mutation while it runs. Two of the same add up.' : '4/7/10% chance per brainrot to get that trait.' ) );
		return wrap;
	}
	function effectText( kind, d ) {
		var f = d.fx;
		if ( f.luck ) { return ( kind === 'potion' ? 'Potion' : 'Rod' ) + ' luck +' + f.luck + 'x'; }
		if ( f.time ) { return 'Lasts ' + f.time + ' minutes longer'; }
		if ( f.dur ) { return 'Durability +' + f.dur + ' catches'; }
		if ( f.extra ) { return '+' + f.extra + ' brainrot' + ( f.extra > 1 ? 's' : '' ) + ' per catch'; }
		if ( f.bite ) { return 'Bites ' + f.bite + ' s sooner'; }
		if ( f.afk ) { return 'AFK catches ' + f.afk + ' s sooner'; }
		if ( f.hook ) { return 'Hooks every bite by itself'; }
		if ( f.drops ) { return 'Resources drop 25% more often'; }
		if ( f.money ) { return '2x money, on top of everything (max 30 min)'; }
		if ( f.eternal ) { return '1 in 2,000: Eternal'; }
		if ( f.celestial ) { return '1 in 2,500: Celestial'; }
		if ( f.admin ) { return '1 in 3,000: Admin Secret'; }
		if ( f.traitAll ) { return 'Every brainrot without a trait gets one'; }
		if ( f.mutAll ) { return 'Every brainrot without a mutation gets one'; }
		return '';
	}

	// ---- presets ------------------------------------------------------------
	var PRESETS = {
		potion: [
			[ 'Max luck (10x)', [ 'Rainbow Clover', 'Rainbow Clover', 'Clover' ] ],
			[ 'Longest (60 min)', [ 'Time Crystal', 'Time Crystal', 'Hourglass' ] ],
			[ 'Money (2x, 30 min)', [ 'Doubloon', 'Time Crystal' ] ],
			[ 'Jackpots', [ 'Admin Crown', 'Star Dust', 'Leviathan Scale' ] ]
		],
		rod: [
			[ 'Max luck (7.5x)', [ 'Rainbow Hook', 'Rainbow Hook', 'Copper Hook' ] ],
			[ '1,000 catches', [ 'Carbon', 'Ironwood', 'Ironwood' ] ],
			[ 'AFK farming', [ 'Triple Line', 'Turbo Reel', 'Auto Reel', 'Bite Bell' ] ],
			[ 'Jackpots', [ 'Crown Jewel', 'Star Shard' ] ]
		]
	};

	// ---- the builder ------------------------------------------------------------
	function draw() {
		var kind = state.view, items = state[ kind ], n = slots();
		root.textContent = '';
		// slots
		var card = el( 'div', 'ffz-card' );
		var top = el( 'div', 'mk-craft-row' );
		top.appendChild( el( 'h3', 'ffz-h', kind === 'potion' ? 'Recipe' : 'Recipe' ) );
		var slotSel = el( 'select', 'ffb-trade-input mk-craft-slots' );
		slotSel.setAttribute( 'aria-label', 'Recipe slots' );
		for ( var s = 2; s <= 10; s++ ) { var o = el( 'option', null, s + ' slots' ); o.value = s; slotSel.appendChild( o ); }
		slotSel.value = n;
		slotSel.addEventListener( 'change', function () {
			var v = +slotSel.value;
			state.slots = v === C.slotsFor( profileRebirth() ) ? null : v;
			if ( state[ kind ].length > v ) { state[ kind ] = state[ kind ].slice( 0, v ); }
			save(); draw();
		} );
		top.appendChild( slotSel );
		card.appendChild( top );
		card.appendChild( el( 'p', 'ffz-note', state.slots ? 'Set by hand. Clear it by picking ' + C.slotsFor( profileRebirth() ) + ' (your rebirth ' + profileRebirth() + ').' :
			'From your rebirth (' + profileRebirth() + ') in My stats. Not checked in game yet: 2 at the start, 3 from rebirth 1, 10 at rebirth 45.' ) );
		var grid = el( 'div', 'mk-craft-grid' );
		for ( var i = 0; i < n; i++ ) {
			( function ( i ) {
				var it = items[ i ];
				var b = el( 'button', 'mk-craft-slot' + ( it ? ' mk-craft-slot-full' : '' ) );
				b.type = 'button';
				if ( it ) {
					var d = E.describe( kind, it );
					b.style.setProperty( '--tc', TIER_COLOR[ d.tier ] );
					b.appendChild( pic( d.icon, 44 ) );
					b.appendChild( el( 'span', 'mk-craft-slot-name', d.name ) );
					b.setAttribute( 'aria-label', 'Remove ' + d.name );
					b.appendChild( el( 'span', 'mk-craft-slot-x', '✕' ) );
					b.addEventListener( 'click', function () { state[ kind ].splice( i, 1 ); save(); draw(); } );
				} else {
					b.appendChild( el( 'span', 'mk-craft-slot-plus', '+' ) );
					b.setAttribute( 'aria-label', 'Add' );
					b.addEventListener( 'click', function () {
						openPicker( kind, function ( pick ) { state[ kind ].push( pick ); save(); draw(); } );
					} );
				}
				grid.appendChild( b );
			}( i ) );
		}
		card.appendChild( grid );
		var pre = el( 'div', 'mk-craft-presets' );
		pre.appendChild( el( 'span', 'ffz-note', 'Try:' ) );
		PRESETS[ kind ].forEach( function ( p ) {
			var b = el( 'button', 'ffz-btn ffz-btn-small', p[ 0 ] );
			b.type = 'button';
			if ( p[ 1 ].length > n ) { b.disabled = true; b.title = 'Needs ' + p[ 1 ].length + ' slots'; }
			b.addEventListener( 'click', function () { state[ kind ] = p[ 1 ].map( function ( name ) { return { name: name }; } ); save(); draw(); } );
			pre.appendChild( b );
		} );
		if ( items.length ) {
			var clr = el( 'button', 'ffz-btn ffz-btn-small', 'Clear' );
			clr.type = 'button';
			clr.addEventListener( 'click', function () { state[ kind ] = []; save(); draw(); } );
			pre.appendChild( clr );
		}
		card.appendChild( pre );
		root.appendChild( card );

		var r = E.run( kind, items );
		root.appendChild( resultCard( kind, r, items.length ) );
		root.appendChild( setupCard() );
	}

	function resultCard( kind, r, count ) {
		var card = el( 'div', 'ffz-card' );
		var look = el( 'div', 'mk-craft-look' );
		look.appendChild( pic( 'crafted ' + kind + ' - ' + r.look, 96, 'mk-craft-look-pic' ) );
		var lt = el( 'div', 'mk-craft-look-text' );
		lt.appendChild( el( 'div', 'mk-craft-look-name', r.look ) );
		lt.appendChild( el( 'div', 'ffz-note', 'Look ' + ( r.stage + 1 ) + ' of 15 · ' + ( r.ptsGuess ? 'about ' : '' ) + r.pts + ' points · ' + r.wait + ' to ' + ( kind === 'potion' ? 'brew' : 'craft' ) ) );
		if ( r.next ) {
			var bar = el( 'div', 'mk-craft-bar' );
			var lo = C.LOOK_AT[ r.stage ], fill = el( 'span' );
			fill.style.width = Math.max( 4, Math.min( 100, ( r.pts - lo ) / ( r.next.at - lo ) * 100 ) ) + '%';
			bar.appendChild( fill );
			lt.appendChild( bar );
			lt.appendChild( el( 'div', 'ffz-note', ( r.next.at - r.pts ) + ' more points for ' + r.next.name ) );
		} else {
			lt.appendChild( el( 'div', 'ffz-note', 'The best look there is.' ) );
		}
		look.appendChild( lt );
		card.appendChild( look );

		var ul = el( 'ul', 'mk-craft-fx' );
		function li( label, value, sub ) {
			var l = el( 'li' );
			l.appendChild( el( 'span', 'mk-craft-fx-label', label ) );
			l.appendChild( el( 'span', 'mk-craft-fx-val', value ) );
			if ( sub ) { l.appendChild( el( 'span', 'mk-craft-fx-sub', sub ) ); }
			ul.appendChild( l );
		}
		if ( kind === 'potion' ) {
			li( 'Luck', num( r.luck ) + 'x', 'Base pond' );
			li( 'Lasts', r.time + ' minutes' );
			if ( r.money ) { li( 'Money', '2x', 'on top of every other multiplier, every pond' ); }
		} else {
			li( 'Luck', num( r.luck ) + 'x' );
			li( 'Durability', r.dur.toLocaleString( 'en-US' ) + ' catches' );
			if ( r.perCatch > 1 ) { li( 'Per catch', r.perCatch + ' brainrots' ); }
			if ( r.bite ) { li( 'Bites', r.bite + ' s sooner' ); }
			if ( r.afk ) { li( 'AFK catches', r.afk + ' s sooner' ); }
			if ( r.hook ) { li( 'Auto-hook', 'every bite' ); }
		}
		if ( r.drops ) { li( 'Resource drops', '+' + r.drops + '%', 'every pond' ); }
		Object.keys( r.muts ).forEach( function ( m ) { li( m + ' chance', '+' + r.muts[ m ] + '%' ); } );
		Object.keys( r.traits ).forEach( function ( t ) { li( t, r.traits[ t ] + '% per brainrot' ); } );
		if ( r.eternal ) { li( 'Eternal', '1 in ' + r.eternal.toLocaleString( 'en-US' ), 'per brainrot' ); }
		if ( r.celestial ) { li( 'Celestial', '1 in ' + r.celestial.toLocaleString( 'en-US' ), 'per brainrot' ); }
		if ( r.admin ) { li( 'Admin Secret', '1 in ' + r.admin.toLocaleString( 'en-US' ), 'per brainrot' ); }
		if ( r.traitAll ) { li( 'Traits', 'every brainrot without one gets one' ); }
		if ( r.mutAll ) { li( 'Mutations', 'every brainrot without one gets one' ); }
		card.appendChild( ul );
		if ( !count ) { card.appendChild( el( 'p', 'ffz-note', 'Tap + to add ' + ( kind === 'potion' ? 'ingredients' : 'parts' ) + '. An empty recipe still makes the plainest ' + kind + '.' ) ); }
		r.warn.forEach( function ( w ) { card.appendChild( el( 'p', 'mk-craft-warn', '⚠️ ' + w ) ); } );
		return card;
	}

	function setupCard() {
		var p = state.potion.length ? E.run( 'potion', state.potion ) : null;
		var rod = state.rod.length ? E.run( 'rod', state.rod ) : null;
		var card = el( 'div', 'ffz-card mk-craft-setup' );
		card.appendChild( el( 'h3', 'ffz-h', 'My setup: potion + rod' ) );
		var pair = el( 'div', 'mk-craft-pair' );
		[ [ 'potion', p ], [ 'rod', rod ] ].forEach( function ( x ) {
			var b = el( 'button', 'mk-craft-pair-item' );
			b.type = 'button';
			if ( x[ 1 ] ) {
				b.appendChild( pic( 'crafted ' + x[ 0 ] + ' - ' + x[ 1 ].look, 48 ) );
				b.appendChild( el( 'span', null, x[ 1 ].look ) );
			} else {
				b.appendChild( el( 'span', 'mk-craft-slot-plus', '+' ) );
				b.appendChild( el( 'span', null, 'No ' + x[ 0 ] + ' yet' ) );
			}
			b.addEventListener( 'click', function () { showView( x[ 0 ] ); } );
			pair.appendChild( b );
		} );
		card.appendChild( pair );
		if ( !p && !rod ) { card.appendChild( el( 'p', 'ffz-note', 'Build a potion and a rod to see them together.' ) ); return card; }
		var t = E.together( p, rod );
		var ul = el( 'ul', 'mk-craft-fx' );
		function li( label, value, sub ) {
			var l = el( 'li' );
			l.appendChild( el( 'span', 'mk-craft-fx-label', label ) );
			l.appendChild( el( 'span', 'mk-craft-fx-val', value ) );
			if ( sub ) { l.appendChild( el( 'span', 'mk-craft-fx-sub', sub ) ); }
			ul.appendChild( l );
		}
		li( 'Luck', num( t.luck ) + 'x', ( p ? num( p.luck ) + 'x potion' : '' ) + ( p && rod ? ' + ' : '' ) + ( rod ? num( rod.luck ) + 'x rod' : '' ) );
		var drop = 15 * ( 1 + t.drops / 100 );
		li( 'Resource drop', +drop.toFixed( 2 ) + '% per catch', t.drops ? '15% +' + t.drops + '%' : '' );
		Object.keys( t.muts ).forEach( function ( m ) { li( m + ' chance', '+' + t.muts[ m ] + '%' ); } );
		Object.keys( t.traits ).forEach( function ( x ) { li( x, t.traits[ x ] + '% per brainrot' ); } );
		if ( t.eternal ) { li( 'Eternal', '1 in ' + t.eternal.toLocaleString( 'en-US' ) ); }
		if ( t.celestial ) { li( 'Celestial', 'about 1 in ' + t.celestial.toLocaleString( 'en-US' ) ); }
		if ( t.admin ) { li( 'Admin Secret', 'about 1 in ' + t.admin.toLocaleString( 'en-US' ) ); }
		card.appendChild( ul );
		card.appendChild( el( 'p', 'ffz-note', 'Adds the potion and rod together (players say luck adds up; not checked in game). Most potion effects only work on your Base pond.' ) );
		return card;
	}

	document.addEventListener( 'keydown', function ( e ) { if ( e.key === 'Escape' ) { closeSheet(); } } );
	window.addEventListener( 'ffb-profile-changed', function () { if ( state.view !== 'fuze' ) { draw(); } } );
	showView( state.view );
}() );

if ( typeof module !== 'undefined' ) { module.exports = { CraftData: CraftData, CraftEngine: CraftEngine }; }
