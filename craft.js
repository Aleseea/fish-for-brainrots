/* Reel Value: the Workshop page (Fuze Machine | Rod Crafting | Potion Brewing | Mutation Machine), 2026-10-25.
   Data: the official crafting boards and the in-game Resource Info & Shop
   (brainrot-db/inbox/crafting-*.md, wiki page "Fish for Brainrots - Crafting").
   The Fuze tab is the existing Fuze page (fuze.js), moved under Workshop. */
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
	// ---- Find a recipe (user, 2026-10-25): goals in, recipes out ----------------
	// Every resource does one kind of thing, so each goal is solved on its own as a
	// list of options (slots used, collect cost, items); then the goals are combined
	// within the recipe's slots. Collect cost = the sum of each item's "1 in N".
	function rate( kind, name ) { return describe( kind, { name: name } ).rate; }
	// reach at least `need` with items [name, value]; at most `max` items
	function additive( kind, list, need, max ) {
		var opts = [];
		if ( need <= 0 ) { return [ { slots: 0, cost: 0, items: [] } ]; }
		// best[k][v] for k items reaching value v (capped at need)
		var best = [ {} ];
		best[ 0 ][ 0 ] = { cost: 0, items: [] };
		for ( var k = 1; k <= max; k++ ) {
			best[ k ] = {};
			Object.keys( best[ k - 1 ] ).forEach( function ( v ) {
				var prev = best[ k - 1 ][ v ];
				list.forEach( function ( it ) {
					var nv = Math.min( need, +v + it[ 1 ] ), c = prev.cost + rate( kind, it[ 0 ] );
					var cur = best[ k ][ nv ];
					if ( !cur || c < cur.cost ) { best[ k ][ nv ] = { cost: c, items: prev.items.concat( [ it[ 0 ] ] ) }; }
				} );
			} );
			var hit = best[ k ][ need ];
			if ( hit ) { opts.push( { slots: k, cost: hit.cost, items: hit.items.map( function ( n ) { return { name: n }; } ) } ); }
		}
		return opts;
	}
	// one item that reaches the goal: the cheapest of the allowed ones
	function single( kind, names ) {
		var best = null;
		names.forEach( function ( n ) {
			var c = rate( kind, n );
			if ( !best || c < best.cost ) { best = { slots: 1, cost: c, items: [ { name: n } ] }; }
		} );
		return best ? [ best ] : [];
	}
	// mutation or trait goals: [{ of, pct }], at most 2 items between them
	function special( kind, which, goals ) {
		goals = goals.filter( function ( g ) { return g && g.of && g.pct; } );
		if ( !goals.length ) { return [ { slots: 0, cost: 0, items: [] } ]; }
		var mut = which === 'mut', pcts = mut ? C.MUT_PCT : C.TRAIT_PCT;
		function tier( name ) { var l = mut ? C.MUT_TIERS : C.TRAIT_TIERS; for ( var t in l ) { if ( l[ t ].indexOf( name ) !== -1 ) { return t; } } return 'D'; }
		function choices( g ) {
			var t = tier( g.of ), rates = ( mut ? C.MUT_RATE : C.TRAIT_RATE )[ t ], out = [];
			for ( var a = 0; a < 3; a++ ) {
				if ( pcts[ a ] >= g.pct ) { out.push( { n: 1, cost: rates[ a ], grades: [ a ] } ); }
				for ( var b = a; b < 3; b++ ) {
					if ( pcts[ a ] + pcts[ b ] >= g.pct ) { out.push( { n: 2, cost: rates[ a ] + rates[ b ], grades: [ a, b ] } ); }
				}
			}
			return out;
		}
		var combos = [ { n: 0, cost: 0, items: [] } ];
		goals.forEach( function ( g ) {
			var next = [];
			combos.forEach( function ( c ) {
				choices( g ).forEach( function ( ch ) {
					if ( c.n + ch.n > 2 ) { return; }
					next.push( { n: c.n + ch.n, cost: c.cost + ch.cost, items: c.items.concat( ch.grades.map( function ( gr ) { return { kind: which, of: g.of, grade: gr }; } ) ) } );
				} );
			} );
			combos = next;
		} );
		var byN = {};
		combos.forEach( function ( c ) { if ( !byN[ c.n ] || c.cost < byN[ c.n ].cost ) { byN[ c.n ] = c; } } );
		return Object.keys( byN ).map( function ( n ) { return { slots: +n, cost: byN[ n ].cost, items: byN[ n ].items }; } );
	}
	// goals: see the page's GOALS lists. Returns { fewest, easiest, minSlots } or null if impossible.
	function solve( kind, g, slots ) {
		var groups = [];
		function need( opts ) { groups.push( opts ); }
		if ( kind === 'potion' ) {
			if ( g.luck ) { need( additive( kind, [ [ 'Clover', 1 ], [ 'Four-Leaf Clover', 2 ], [ 'Golden Clover', 3 ], [ 'Rainbow Clover', 4 ] ], g.luck - 1, 10 ) ); }
			if ( g.time ) { need( additive( kind, [ [ 'Stopwatch', 5 ], [ 'Hourglass', 10 ], [ 'Time Crystal', 20 ] ], g.time - 10, 10 ) ); }
			[ [ 'money', 'Doubloon' ], [ 'drops', 'Lure' ], [ 'eternal', 'Leviathan Scale' ], [ 'celestial', 'Star Dust' ], [ 'admin', 'Admin Crown' ], [ 'traitAll', 'Siren Pearl' ] ]
				.forEach( function ( b ) { if ( g[ b[ 0 ] ] ) { need( single( kind, [ b[ 1 ] ] ) ); } } );
		} else {
			if ( g.luck ) { need( additive( kind, [ [ 'Copper Hook', 1 ], [ 'Gold Hook', 2 ], [ 'Diamond Hook', 4 ], [ 'Rainbow Hook', 6 ] ], Math.round( ( g.luck - 1 ) * 2 ), 10 ) ); }
			if ( g.dur ) { need( additive( kind, [ [ 'Oak Plank', 1 ], [ 'Ironwood', 2 ], [ 'Carbon', 5 ] ], Math.round( ( g.dur - 100 ) / 100 ), 10 ) ); }
			if ( g.afk ) { need( additive( kind, [ [ 'Auto Reel', 1 ], [ 'Turbo Reel', 2 ] ], g.afk / 2, 10 ) ); }
			if ( g.perCatch ) { need( single( kind, g.perCatch >= 3 ? [ 'Triple Line' ] : [ 'Twin Line', 'Triple Line' ] ) ); }
			if ( g.bite ) { need( single( kind, [ [ 'Bait', 1 ], [ 'Golden Bait', 1.5 ], [ 'Fly Bait', 2 ] ].filter( function ( b ) { return b[ 1 ] >= g.bite; } ).map( function ( b ) { return b[ 0 ]; } ) ) ); }
			[ [ 'hook', 'Bite Bell' ], [ 'drops', 'Grapnel' ], [ 'celestial', 'Star Shard' ], [ 'admin', 'Crown Jewel' ], [ 'mutAll', 'Kraken Tentacle' ] ]
				.forEach( function ( b ) { if ( g[ b[ 0 ] ] ) { need( single( kind, [ b[ 1 ] ] ) ); } } );
		}
		need( special( kind, 'mut', g.muts || [] ) );
		need( special( kind, 'trait', g.traits || [] ) );
		if ( groups.some( function ( o ) { return !o.length; } ) ) { return null; }
		// combine: table[s] = cheapest way to meet every goal so far using exactly s slots
		var table = { 0: { cost: 0, items: [] } };
		groups.forEach( function ( opts ) {
			var next = {};
			Object.keys( table ).forEach( function ( s ) {
				opts.forEach( function ( o ) {
					var ns = +s + o.slots, c = table[ s ].cost + o.cost;
					if ( ns > 10 ) { return; }
					if ( !next[ ns ] || c < next[ ns ].cost ) { next[ ns ] = { cost: c, items: table[ s ].items.concat( o.items ) }; }
				} );
			} );
			table = next;
		} );
		var keys = Object.keys( table ).map( Number ).sort( function ( a, b ) { return a - b; } );
		if ( !keys.length ) { return null; }
		var minSlots = keys[ 0 ];
		function pack( s ) { return { slots: s, cost: table[ s ].cost, items: table[ s ].items }; }
		var fewest = pack( minSlots );
		// fewest slots: among the fewest-slot ways, the easiest one already wins.
		var easiest = null;
		keys.forEach( function ( s ) { if ( s <= Math.max( slots, minSlots ) && ( !easiest || table[ s ].cost < easiest.cost ) ) { easiest = pack( s ); } } );
		return { fewest: fewest, easiest: easiest, minSlots: minSlots };
	}

	// '' if `item` can go into a recipe that already has `items`; otherwise why not
	// (user, 2026-10-25: don't offer what the game won't take)
	function blocked( kind, items, item ) {
		var d = describe( kind, item );
		if ( !d ) { return 'Unknown item.'; }
		var others = items.map( function ( it ) { return describe( kind, it ); } ).filter( Boolean );
		if ( d.one && others.some( function ( o ) { return o.one === d.one; } ) ) {
			var have = others.filter( function ( o ) { return o.one === d.one; } )[ 0 ].name;
			if ( d.one === 'line' ) { return 'Only 1 line per rod (you have ' + have + ').'; }
			if ( d.one === 'bait' ) { return 'Only 1 bait per rod (you have ' + have + ').'; }
			return 'Only 1 per ' + kind + '.';
		}
		if ( d.group && others.filter( function ( o ) { return o.group === d.group; } ).length >= 2 ) {
			return 'Already 2 ' + ( d.group === 'mut' ? 'mutation' : 'trait' ) + ' items (the most a ' + kind + ' can hold).';
		}
		return '';
	}

	// Over a cap (user, 2026-10-25): what's wasted, what to take out, and a smaller
	// mix that still reaches the cap. Returns [{ label, cap, over, unit, remove: [indexes],
	// keepAt, swap: { items, from, freed } | null }]
	var CAPPED = {
		potion: [
			{ key: 'luck', label: 'Luck', unit: 'x', start: 1, cap: function () { return 10; } },
			{ key: 'time', label: 'Time', unit: ' min', start: 10, cap: function ( items ) {
				return items.some( function ( it ) { return it.name === 'Doubloon'; } ) ? 30 : 60;
			} }
		],
		rod: [
			{ key: 'luck', label: 'Luck', unit: 'x', start: 1, cap: function () { return 7.5; } },
			{ key: 'dur', label: 'Durability', unit: ' catches', start: 100, cap: function () { return 1000; } },
			{ key: 'afk', label: 'AFK speed', unit: ' s', start: 0, cap: function () { return 6; } }
		]
	};
	function waste( kind, items ) {
		var out = [];
		CAPPED[ kind ].forEach( function ( c ) {
			var mine = [];
			items.forEach( function ( it, i ) {
				var d = describe( kind, it );
				if ( d && d.fx && d.fx[ c.key ] ) { mine.push( { i: i, v: d.fx[ c.key ], name: d.name } ); }
			} );
			var total = c.start + mine.reduce( function ( a, m ) { return a + m.v; }, 0 ), cap = c.cap( items );
			if ( total <= cap + 1e-9 ) { return; }
			var over = total - cap;
			// take out the biggest pieces that still leave you at the cap
			var left = over, remove = [];
			mine.slice().sort( function ( a, b ) { return b.v - a.v; } ).forEach( function ( m ) {
				if ( m.v <= left + 1e-9 ) { remove.push( m.i ); left -= m.v; }
			} );
			// the fewest items that reach the cap on their own
			var goal = {};
			goal[ c.key ] = cap;
			var best = solve( kind, goal, 10 ), swap = null;
			var after = mine.length - remove.length;
			if ( best && best.fewest.slots < after ) {
				swap = { items: best.fewest.items, from: mine.map( function ( m ) { return m.i; } ), freed: mine.length - best.fewest.slots };
			}
			// or trade one piece for a smaller one of the same kind, wasting the least
			var trade = null;
			if ( !remove.length ) {
				var pool = ( kind === 'potion' ? C.POTION : C.ROD ).filter( function ( r ) { return r[ 3 ][ c.key ]; } );
				mine.forEach( function ( m ) {
					pool.forEach( function ( r ) {
						var v = r[ 3 ][ c.key ], t = total - m.v + v;
						if ( v < m.v && t >= cap - 1e-9 && ( !trade || t - cap < trade.waste - 1e-9 ) ) {
							trade = { i: m.i, from: m.name, to: r[ 0 ], waste: t - cap };
						}
					} );
				} );
			}
			out.push( { key: c.key, label: c.label, unit: c.unit, cap: cap, over: over, remove: remove, left: left, swap: swap, trade: trade, count: mine.length } );
		} );
		return out;
	}

	return { describe: describe, run: run, together: together, solve: solve, blocked: blocked, waste: waste };
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
		view: saved.view || 'fuze',
		potion: saved.potion || [],
		rod: saved.rod || [],
		mode: saved.mode || { potion: 'build', rod: 'build' },
		rebirth: typeof saved.rebirth === 'number' ? saved.rebirth : null,
		goals: saved.goals || { potion: {}, rod: {} }
	};
	function save() { store( 'mk-craft', state ); }
	// Rebirth: the one saved in Profile > My stats (none saved counts as 0, so the
	// page shows 2 slots until you say; user, 2026-10-25). You can try another
	// here; when it differs from the profile, "Remember" saves it there.
	function profileObj() { return store( 'ffb-profile' ) || {}; }
	function savedRebirth() { var r = profileObj().rebirth; return typeof r === 'number' ? r : null; }
	function rebirth() { return state.rebirth !== null && state.rebirth !== undefined ? state.rebirth : ( savedRebirth() || 0 ); }
	function slots() { return C.slotsFor( rebirth() ); }
	function rememberRebirth( n ) {
		var p = profileObj();
		p.rebirth = n;
		store( 'ffb-profile', p );
		state.rebirth = null;
		save();
		try { window.dispatchEvent( new Event( 'ffb-profile-changed' ) ); } catch ( e ) {}
	}
	function slotNote() {
		var box = el( 'div', 'mk-craft-slotnote' );
		var lab = el( 'label', 'mk-craft-rebirth' );
		lab.appendChild( el( 'span', 'ffz-label', 'Rebirth' ) );
		var sel = el( 'select', 'ffb-trade-input' );
		for ( var r = 0; r <= 45; r++ ) { var o = el( 'option', null, String( r ) ); o.value = r; sel.appendChild( o ); }
		sel.value = rebirth();
		sel.addEventListener( 'change', function () {
			var v = +sel.value;
			state.rebirth = v === ( savedRebirth() === null ? -1 : savedRebirth() ) ? null : v;
			save(); draw();
		} );
		lab.appendChild( sel );
		box.appendChild( lab );
		box.appendChild( el( 'span', 'mk-craft-slotcount', slots() + ' recipe slots' ) );
		var saved = savedRebirth();
		if ( saved === null || rebirth() !== saved ) {
			var b = el( 'button', 'ffz-btn ffz-btn-small mk-craft-remember', 'Remember rebirth ' + rebirth() );
			b.type = 'button';
			b.addEventListener( 'click', function () { rememberRebirth( rebirth() ); draw(); } );
			box.appendChild( b );
			box.appendChild( el( 'span', 'ffz-note', saved === null ?
				( rebirth() ? 'Tap Remember to save it to your profile, so every page (My Collection, upgrade times) uses it.' :
					'No rebirth saved yet, so this counts as rebirth 0. Pick yours and tap Remember: every page uses it.' ) :
				'Your profile says rebirth ' + saved + '. Tap Remember to save ' + rebirth() + ' instead, or keep it just for trying here.' ) );
		}
		return box;
	}

	// ---- top tabs: Fuze Machine | Rod Crafting | Potion Brewing | Mutation
	// Machine, under the Workshop hotbar slot (user, 2026-10-26)
	var fuzeWrap = document.getElementById( 'fuze-wrap' );
	var soon = el( 'div', 'ffz-card mk-craft-soon' );
	soon.hidden = true;
	soon.appendChild( el( 'p', null, 'Coming soon.' ) );
	panel.appendChild( soon );
	function building( v ) { return v === 'potion' || v === 'rod'; }
	var heading = panel.querySelector( 'h2' );
	var nav = el( 'div', 'ffz-nav mk-craft-nav' );
	nav.setAttribute( 'role', 'group' );
	nav.setAttribute( 'aria-label', 'Workshop' );
	var tabs = {};
	[ [ 'fuze', 'Fuze Machine' ], [ 'rod', 'Rod Crafting' ], [ 'potion', 'Potion Brewing' ], [ 'mutation', 'Mutation Machine' ] ].forEach( function ( t ) {
		var b = el( 'button', 'ffb-base-tab', t[ 1 ] );
		b.type = 'button';
		b.addEventListener( 'click', function () { showView( t[ 0 ] ); } );
		nav.appendChild( b );
		tabs[ t[ 0 ] ] = b;
	} );
	panel.insertBefore( nav, heading.nextSibling );
	function showView( v ) {
		if ( !tabs[ v ] ) { v = 'fuze'; }
		state.view = v;
		Object.keys( tabs ).forEach( function ( k ) {
			tabs[ k ].classList.toggle( 'ffb-base-tab-on', k === v );
			tabs[ k ].setAttribute( 'aria-pressed', k === v ? 'true' : 'false' );
		} );
		heading.textContent = tabs[ v ].textContent;
		root.hidden = !building( v );
		soon.hidden = v !== 'mutation';
		if ( fuzeWrap ) { fuzeWrap.hidden = v !== 'fuze'; }
		if ( building( v ) ) { draw(); }
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
			var h = el( 'div', 'ffz-label mk-craft-sheet-tier' );
			h.appendChild( tierBadge( t ) );
			h.appendChild( el( 'span', null, 'Tier ' + t + ' · each drops about 1 in ' + C.TIER_RATE[ t ].toLocaleString( 'en-US' ) + ' catches' ) );
			list.appendChild( h );
			rows.forEach( function ( r ) {
				var d = E.describe( kind, { name: r[ 0 ] } );
				var why = E.blocked( kind, state[ kind ], { name: r[ 0 ] } );
				list.appendChild( optionRow( d, effectText( kind, d ), function () { onPick( { name: r[ 0 ] } ); closeSheet(); }, why ) );
			} );
		} );
		// mutation and trait items: pick which one, then how strong
		var h2 = el( 'div', 'ffz-label mk-craft-sheet-tier' );
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
	function optionRow( d, text, onTap, why ) {
		var b = el( 'button', 'mk-craft-opt' );
		b.type = 'button';
		if ( why ) {
			b.disabled = true;
			b.classList.add( 'mk-craft-opt-off' );
			text = why;
		}
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
		var full = E.blocked( kind, state[ kind ], { kind: which, of: ( mut ? C.MUT_TIERS : C.TRAIT_TIERS ).S[ 0 ], grade: 0 } );
		names.forEach( function ( g, i ) {
			var b = el( 'button', 'ffz-btn ffz-btn-small', g + ' +' + pcts[ i ] + '%' );
			b.type = 'button';
			b.disabled = !!full;
			b.addEventListener( 'click', function () { onPick( { kind: which, of: sel.value, grade: i } ); closeSheet(); } );
			grades.appendChild( b );
		} );
		wrap.appendChild( grades );
		if ( full ) { sel.disabled = true; wrap.classList.add( 'mk-craft-opt-off' ); wrap.appendChild( el( 'p', 'mk-craft-off-why', full ) ); }
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
	function modeBar( kind ) {
		// same buttons as the Fuze page's Find a recipe / Try a fuse (user, 2026-10-26)
		var bar = el( 'div', 'ffz-nav mk-craft-mode' );
		bar.setAttribute( 'role', 'group' );
		[ [ 'build', 'Build' ], [ 'find', 'Find a recipe' ] ].forEach( function ( m ) {
			var b = el( 'button', 'ffb-base-tab' + ( state.mode[ kind ] === m[ 0 ] ? ' ffb-base-tab-on' : '' ), m[ 1 ] );
			b.type = 'button';
			b.setAttribute( 'aria-pressed', state.mode[ kind ] === m[ 0 ] ? 'true' : 'false' );
			b.addEventListener( 'click', function () { state.mode[ kind ] = m[ 0 ]; save(); draw(); } );
			bar.appendChild( b );
		} );
		return bar;
	}
	function draw() {
		var kind = state.view, items = state[ kind ], n = slots();
		root.textContent = '';
		root.appendChild( modeBar( kind ) );
		// potions are yours alone (user, 2026-10-26)
		if ( kind === 'potion' ) {
			var only = el( 'p', 'ffz-note mk-craft-only-you' );
			only.appendChild( el( 'strong', null, 'Only for you: ' ) );
			only.appendChild( document.createTextNode( 'a potion only works for the player who used it. A friend fishing in your pond gets none of its effects. Most effects also only work in your own base pond; Lure and Doubloon work on every pond.' ) );
			root.appendChild( only );
		}
		if ( state.mode[ kind ] === 'find' ) { drawFind( kind ); return; }
		// slots
		var card = el( 'div', 'ffz-card' );
		var top = el( 'div', 'mk-craft-row' );
		top.appendChild( el( 'h3', 'ffz-h', 'Recipe' ) );
		card.appendChild( top );
		card.appendChild( slotNote() );
		// a saved recipe longer than your slots keeps only what fits
		if ( items.length > n ) { state[ kind ] = items = items.slice( 0, n ); save(); }
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
		var capWarn = /stops at|at most|can only come/;
		r.warn.forEach( function ( w ) { if ( !capWarn.test( w ) ) { card.appendChild( el( 'p', 'mk-craft-warn', '⚠️ ' + w ) ); } } );
		E.waste( kind, state[ kind ] ).forEach( function ( wst ) { card.appendChild( wasteBox( kind, wst ) ); } );
		return card;
	}

	function fmt( v, unit ) { return ( unit === ' catches' ? Math.round( v ).toLocaleString( 'en-US' ) : +v.toFixed( 2 ) ) + unit; }
	function wasteBox( kind, w ) {
		var items = state[ kind ];
		var box = el( 'div', 'mk-craft-warn mk-craft-waste' );
		box.appendChild( el( 'div', null, '⚠️ ' + w.label + ' stops at ' + fmt( w.cap, w.unit ) + ': ' + fmt( w.over, w.unit ) + ' wasted.' ) );
		var acts = el( 'div', 'mk-craft-waste-acts' );
		if ( w.remove.length ) {
			var names = {};
			w.remove.forEach( function ( i ) { var nm = E.describe( kind, items[ i ] ).name; names[ nm ] = ( names[ nm ] || 0 ) + 1; } );
			var txt = Object.keys( names ).map( function ( nm ) { return ( names[ nm ] > 1 ? names[ nm ] + ' × ' : '' ) + nm; } ).join( ' and ' );
			var b = el( 'button', 'ffz-btn ffz-btn-small', 'Remove ' + txt );
			b.type = 'button';
			b.title = 'Still ' + fmt( w.cap, w.unit ) + ', and frees ' + w.remove.length + ' slot' + ( w.remove.length > 1 ? 's' : '' );
			b.addEventListener( 'click', function () {
				state[ kind ] = items.filter( function ( it, i ) { return w.remove.indexOf( i ) === -1; } );
				save(); draw();
			} );
			acts.appendChild( b );
			acts.appendChild( el( 'span', 'ffz-note', 'still ' + fmt( w.cap, w.unit ) + ', frees ' + w.remove.length + ' slot' + ( w.remove.length > 1 ? 's' : '' ) +
				( w.left > 1e-9 ? ' (' + fmt( w.left, w.unit ) + ' still wasted)' : ', nothing wasted' ) ) );
		}
		if ( w.swap ) {
			var cnt = {};
			w.swap.items.forEach( function ( it ) { cnt[ it.name ] = ( cnt[ it.name ] || 0 ) + 1; } );
			var mix = Object.keys( cnt ).map( function ( nm ) { return ( cnt[ nm ] > 1 ? cnt[ nm ] + ' × ' : '' ) + nm; } ).join( ' + ' );
			var b2 = el( 'button', 'ffz-btn ffz-btn-small', 'Use ' + mix );
			b2.type = 'button';
			b2.addEventListener( 'click', function () {
				state[ kind ] = items.filter( function ( it, i ) { return w.swap.from.indexOf( i ) === -1; } ).concat( w.swap.items.map( function ( it ) { return { name: it.name }; } ) );
				save(); draw();
			} );
			acts.appendChild( b2 );
			acts.appendChild( el( 'span', 'ffz-note', 'reaches ' + fmt( w.cap, w.unit ) + ' in ' + w.swap.items.length + ' slot' + ( w.swap.items.length > 1 ? 's' : '' ) + ' instead of ' + w.count + ', frees ' + w.swap.freed ) );
		}
		if ( w.trade ) {
			var b3 = el( 'button', 'ffz-btn ffz-btn-small', 'Swap a ' + w.trade.from + ' for a ' + w.trade.to );
			b3.type = 'button';
			b3.addEventListener( 'click', function () {
				state[ kind ] = items.map( function ( it, i ) { return i === w.trade.i ? { name: w.trade.to } : it; } );
				save(); draw();
			} );
			acts.appendChild( b3 );
			acts.appendChild( el( 'span', 'ffz-note', 'still ' + fmt( w.cap, w.unit ) + ( w.trade.waste > 1e-9 ? ', only ' + fmt( w.trade.waste, w.unit ) + ' wasted' : ', nothing wasted' ) + ', and an easier piece to find' ) );
		}
		if ( !w.remove.length && !w.swap && !w.trade ) {
			acts.appendChild( el( 'span', 'ffz-note', 'No item can come out without dropping below ' + fmt( w.cap, w.unit ) + '; a smaller piece in place of a big one would waste less.' ) );
		}
		box.appendChild( acts );
		return box;
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

	// ---- Find a recipe -----------------------------------------------------------
	function opts( list ) { return list.map( function ( v ) { return typeof v === 'object' ? v : [ v, String( v ) ]; } ); }
	function range( a, b, step, unit ) { var o = []; for ( var v = a; v <= b + 1e-9; v += step ) { o.push( [ +v.toFixed( 2 ), +v.toFixed( 2 ) + unit ] ); } return o; }
	var YES = [ [ 1, 'Yes' ] ];
	var GOALS = {
		potion: [
			[ 'luck', 'Luck', range( 2, 10, 1, 'x' ) ],
			[ 'time', 'Lasts', range( 15, 60, 5, ' min' ) ],
			[ 'money', '2x money (Doubloon)', YES ],
			[ 'drops', 'Resources drop 25% more', YES ],
			[ 'eternal', 'Eternal 1 in 2,000', YES ],
			[ 'celestial', 'Celestial 1 in 2,500', YES ],
			[ 'admin', 'Admin Secret 1 in 3,000', YES ],
			[ 'traitAll', 'A trait on every brainrot', YES ]
		],
		rod: [
			[ 'luck', 'Luck', range( 1.5, 7.5, 0.5, 'x' ) ],
			[ 'dur', 'Durability', range( 200, 1000, 100, ' catches' ) ],
			[ 'perCatch', 'Brainrots per catch', [ [ 2, '2' ], [ 3, '3' ] ] ],
			[ 'bite', 'Bites sooner', [ [ 1, '1 s' ], [ 1.5, '1.5 s' ], [ 2, '2 s' ] ] ],
			[ 'afk', 'AFK catches sooner', [ [ 2, '2 s' ], [ 4, '4 s' ], [ 6, '6 s' ] ] ],
			[ 'hook', 'Auto-hook', YES ],
			[ 'drops', 'Resources drop 25% more', YES ],
			[ 'celestial', 'Celestial 1 in 2,500', YES ],
			[ 'admin', 'Admin Secret 1 in 3,000', YES ],
			[ 'mutAll', 'A mutation on every brainrot', YES ]
		]
	};
	var MUT_GOAL_PCTS = [ 15, 25, 30, 35, 40, 50, 60, 70 ], TRAIT_GOAL_PCTS = [ 4, 7, 8, 10, 11, 14, 17, 20 ];
	function select( label, value, options, onChange ) {
		var f = el( 'label', 'mk-craft-goal' );
		f.appendChild( el( 'span', 'ffz-label mk-craft-goal-label', label ) );
		var s = el( 'select', 'ffb-trade-input' );
		var any = el( 'option', null, 'Any' ); any.value = ''; s.appendChild( any );
		options.forEach( function ( o ) { var x = el( 'option', null, o[ 1 ] ); x.value = o[ 0 ]; s.appendChild( x ); } );
		s.value = value === undefined || value === null ? '' : String( value );
		if ( value && s.value === '' ) { s.value = ''; }
		s.classList.toggle( 'mk-craft-goal-set', s.value !== '' );
		s.addEventListener( 'change', function () { onChange( s.value === '' ? null : +s.value ); } );
		f.appendChild( s );
		return f;
	}
	function specialGoals( kind, which, g ) {
		var mut = which === 'mut', key = mut ? 'muts' : 'traits';
		var list = g[ key ] || ( g[ key ] = [ {}, {} ] );
		var box = el( 'div', 'mk-craft-goal-pair' );
		[ 0, 1 ].forEach( function ( i ) {
			var cur = list[ i ] || ( list[ i ] = {} );
			var row = el( 'div', 'mk-craft-goal-row' );
			var names = el( 'select', 'ffb-trade-input' );
			names.setAttribute( 'aria-label', ( mut ? 'Mutation ' : 'Trait ' ) + ( i + 1 ) );
			var none = el( 'option', null, mut ? 'Mutation: none' : 'Trait: none' ); none.value = ''; names.appendChild( none );
			[ 'S', 'A', 'B', 'C', 'D' ].forEach( function ( t ) {
				var og = el( 'optgroup' ); og.label = 'Tier ' + t;
				( mut ? C.MUT_TIERS : C.TRAIT_TIERS )[ t ].forEach( function ( n ) { var o = el( 'option', null, n ); o.value = n; og.appendChild( o ); } );
				names.appendChild( og );
			} );
			names.value = cur.of || '';
			var pct = el( 'select', 'ffb-trade-input mk-craft-goal-pct' );
			pct.setAttribute( 'aria-label', 'Chance' );
			( mut ? MUT_GOAL_PCTS : TRAIT_GOAL_PCTS ).forEach( function ( p ) { var o = el( 'option', null, mut ? '+' + p + '%' : p + '%' ); o.value = p; pct.appendChild( o ); } );
			pct.value = cur.pct || ( mut ? 15 : 4 );
			pct.disabled = !cur.of;
			names.addEventListener( 'change', function () { cur.of = names.value || null; cur.pct = cur.of ? +pct.value : null; save(); drawFind( kind ); } );
			pct.addEventListener( 'change', function () { cur.pct = +pct.value; save(); drawFind( kind ); } );
			names.classList.toggle( 'mk-craft-goal-set', !!cur.of );
			row.appendChild( names );
			row.appendChild( pct );
			box.appendChild( row );
		} );
		box.appendChild( el( 'p', 'ffz-note', mut ? 'Up to 2 mutation items in a ' + kind + ': two of the same add up (+30% from two Normal ones).' :
			'Up to 2 trait items: 4 / 7 / 10% per brainrot each, and two add up.' ) );
		return box;
	}
	function drawFind( kind ) {
		// keep the mode bar, redraw the rest
		while ( root.children.length > 1 ) { root.removeChild( root.lastChild ); }
		var g = state.goals[ kind ], n = slots();
		var card = el( 'div', 'ffz-card' );
		var top = el( 'div', 'mk-craft-row' );
		top.appendChild( el( 'h3', 'ffz-h', 'I want a ' + kind + ' with' ) );
		var clear = el( 'button', 'ffz-btn ffz-btn-small', 'Clear' );
		clear.type = 'button';
		clear.addEventListener( 'click', function () { state.goals[ kind ] = {}; save(); drawFind( kind ); } );
		top.appendChild( clear );
		card.appendChild( top );
		card.appendChild( slotNote() );
		var grid = el( 'div', 'mk-craft-goals' );
		GOALS[ kind ].forEach( function ( def ) {
			var options = def[ 2 ];
			// a Doubloon potion lasts at most 30 minutes
			if ( kind === 'potion' && def[ 0 ] === 'time' && g.money ) { options = options.filter( function ( o ) { return o[ 0 ] <= 30; } ); }
			if ( kind === 'potion' && def[ 0 ] === 'time' && g.money && g.time > 30 ) { g.time = 30; }
			grid.appendChild( select( def[ 1 ], g[ def[ 0 ] ], options, function ( v ) { g[ def[ 0 ] ] = v; save(); drawFind( kind ); } ) );
		} );
		card.appendChild( grid );
		card.appendChild( specialGoals( kind, 'mut', g ) );
		card.appendChild( specialGoals( kind, 'trait', g ) );
		if ( g.money ) { card.appendChild( el( 'p', 'ffz-note', 'A Doubloon potion lasts at most 30 minutes.' ) ); }
		root.appendChild( card );

		var goals = {};
		Object.keys( g ).forEach( function ( k ) { goals[ k ] = g[ k ]; } );
		goals.muts = ( g.muts || [] ).filter( function ( x ) { return x && x.of; } );
		goals.traits = ( g.traits || [] ).filter( function ( x ) { return x && x.of; } );
		var anyGoal = Object.keys( goals ).some( function ( k ) { return k !== 'muts' && k !== 'traits' && goals[ k ]; } ) || goals.muts.length || goals.traits.length;
		var out = el( 'div', 'ffz-card' );
		out.appendChild( el( 'h3', 'ffz-h', 'Recipes' ) );
		if ( !anyGoal ) {
			out.appendChild( el( 'p', 'ffz-note', 'Pick what you want above, and the recipes that do it show up here.' ) );
			root.appendChild( out );
			return;
		}
		var res = E.solve( kind, goals, n );
		if ( !res ) {
			out.appendChild( el( 'p', 'mk-craft-warn', '⚠️ No ' + kind + ' can do all of that, even with 10 slots. Try asking for less.' ) );
			root.appendChild( out );
			return;
		}
		if ( res.minSlots > n ) {
			out.appendChild( el( 'p', 'mk-craft-warn', '⚠️ This needs at least ' + res.minSlots + ' slots, and you have ' + n + ( savedRebirth() === null ? ' (rebirth 0: pick your rebirth above for more)' : '' ) + '. Here is the smallest recipe anyway.' ) );
		}
		var answers = [ [ 'Fewest slots', res.fewest ] ];
		if ( res.easiest && JSON.stringify( res.easiest.items ) !== JSON.stringify( res.fewest.items ) ) { answers.push( [ 'Easiest to collect', res.easiest ] ); }
		else { answers[ 0 ][ 0 ] = 'Best recipe'; }
		answers.forEach( function ( a ) { out.appendChild( answerCard( kind, a[ 0 ], a[ 1 ], n ) ); } );
		root.appendChild( out );
	}
	function answerCard( kind, title, ans, n ) {
		var box = el( 'div', 'mk-craft-answer' );
		var head = el( 'div', 'mk-craft-row' );
		head.appendChild( el( 'strong', null, title ) );
		head.appendChild( el( 'span', 'ffz-note', ans.slots + ' of ' + n + ' slots' ) );
		box.appendChild( head );
		// the items, same ones grouped: "3 × Hourglass"
		var counts = [], seen = {};
		ans.items.forEach( function ( it ) {
			var d = E.describe( kind, it ), k = d.name;
			if ( seen[ k ] ) { seen[ k ].n++; return; }
			seen[ k ] = { d: d, n: 1 };
			counts.push( seen[ k ] );
		} );
		var chips = el( 'div', 'mk-craft-answer-items' );
		counts.forEach( function ( c ) {
			var chip = el( 'span', 'mk-craft-answer-item' );
			chip.style.setProperty( '--tc', TIER_COLOR[ c.d.tier ] );
			chip.appendChild( pic( c.d.icon, 32 ) );
			chip.appendChild( el( 'span', null, ( c.n > 1 ? c.n + ' × ' : '' ) + c.d.name ) );
			chips.appendChild( chip );
		} );
		box.appendChild( chips );
		var r = E.run( kind, ans.items );
		var rarest = counts.reduce( function ( m, c ) { return !m || c.d.rate > m.d.rate ? c : m; }, null );
		var foot = el( 'div', 'mk-craft-answer-foot' );
		foot.appendChild( pic( 'crafted ' + kind + ' - ' + r.look, 40 ) );
		var t = el( 'span', 'ffz-note', r.look + ' · ' + r.wait + ( rarest ? ' · rarest: ' + rarest.d.name + ' (1 in ' + rarest.d.rate.toLocaleString( 'en-US' ) + ' catches)' : '' ) );
		foot.appendChild( t );
		box.appendChild( foot );
		var b = el( 'button', 'ffz-btn ffz-btn-small', 'Build this' );
		b.type = 'button';
		b.disabled = ans.slots > n;
		b.addEventListener( 'click', function () {
			state[ kind ] = ans.items.map( function ( it ) { return JSON.parse( JSON.stringify( it ) ); } );
			state.mode[ kind ] = 'build';
			save(); draw();
			window.scrollTo( 0, 0 );
		} );
		box.appendChild( b );
		return box;
	}

	document.addEventListener( 'keydown', function ( e ) { if ( e.key === 'Escape' ) { closeSheet(); } } );
	window.addEventListener( 'ffb-profile-changed', function () { if ( building( state.view ) ) { draw(); } } );
	showView( state.view );
}() );

if ( typeof module !== 'undefined' ) { module.exports = { CraftData: CraftData, CraftEngine: CraftEngine }; }
