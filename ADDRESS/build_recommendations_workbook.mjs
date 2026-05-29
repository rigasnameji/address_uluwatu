import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.resolve(
  "/Users/kristapsjansons/Documents_Local/Clone - Antigravity/ADDRESS/outputs/guesty-recommendations-2026-05-09",
);

const recommendations = [
  {
    category: "Activities",
    name: "ATMOS Uluwatu",
    area: "Uluwatu",
    budget: "$$$",
    bestFor: "spa, recovery, couples",
    whyGood: "Polished wellness option with strong massage and recovery reputation.",
    guestyNote:
      "A strong post-beach or post-flight pick for massage, recovery, and higher-end wellness treatments. Best booked ahead for late afternoon or evening.",
    source: "https://www.50bestspa.com/spa/atmos-uluwatu",
  },
  {
    category: "Activities",
    name: "Laia Spa Pecatu",
    area: "Pecatu / Ungasan side",
    budget: "$$",
    bestFor: "massage, wellness, relaxed afternoons",
    whyGood: "Warm local spa with deep tissue and hot stone options.",
    guestyNote:
      "A dependable massage choice for guests who want a calm, friendly spa without resort pricing. Great after surfing, beach stairs, or long drives around the Bukit.",
    source: "https://www.laiaspa.com/pecatu",
  },
  {
    category: "Activities",
    name: "Laniakea Spa Bali",
    area: "Pecatu",
    budget: "$$",
    bestFor: "massage, value, recovery",
    whyGood: "Well-liked for attentive therapists and good value.",
    guestyNote:
      "A very solid value-for-money massage option in the Uluwatu area. Best for guests who want a proper treatment without turning it into a full spa day.",
    source: "https://wanderlog.com/place/details/2243681/laniakea-spa-bali",
  },
  {
    category: "Activities",
    name: "The Essence Spa Uluwatu",
    area: "Uluwatu",
    budget: "$$",
    bestFor: "classic massage, easy wellness stop",
    whyGood: "Popular for clean rooms and easy massage booking.",
    guestyNote:
      "A simple, reliable massage stop for guests who want a classic Balinese treatment close to the main Uluwatu strip.",
    source: "https://www.google.com/search?q=The+Essence+Spa+Uluwatu",
  },
  {
    category: "Activities",
    name: "The Istana",
    area: "Pecatu",
    budget: "$$$",
    bestFor: "wellness, breathwork, sauna, cold plunge",
    whyGood: "Known for higher-end wellness programming and ocean views.",
    guestyNote:
      "Best for guests who want a full wellness reset rather than just a massage. Think sauna, cold plunge, breathwork, and a more intentional half-day experience.",
    source: "https://www.google.com/search?q=The+Istana+Uluwatu",
  },
  {
    category: "Activities",
    name: "Heat House Uluwatu",
    area: "Uluwatu",
    budget: "$$",
    bestFor: "pilates, yoga, fitness",
    whyGood: "Boutique infrared movement studio with a strong fitness feel.",
    guestyNote:
      "A good pick for guests who want structured movement, pilates, or yoga rather than a beach club or cafe morning.",
    source: "https://heat-house.com/",
  },
  {
    category: "Activities",
    name: "The Yoga Rescue",
    area: "Jimbaran / Ungasan",
    budget: "$$",
    bestFor: "yoga, slower mornings, beginners",
    whyGood: "Welcoming studio serving South Bali with daily classes.",
    guestyNote:
      "A peaceful yoga option for guests staying between Jimbaran and Uluwatu. Good for both complete beginners and regular practitioners.",
    source: "https://theyogarescue.com/",
  },
  {
    category: "Activities",
    name: "Uluwatu Surf School",
    area: "Uluwatu",
    budget: "$$",
    bestFor: "surf lessons, coaching, reef knowledge",
    whyGood: "Detailed local surf coaching with safety focus.",
    guestyNote:
      "A good surf-school option for guests who want local knowledge and structured coaching. Works especially well for people serious about progressing beyond a one-off lesson.",
    source: "https://uluwatusurfschool.com/",
  },
  {
    category: "Activities",
    name: "Break & Flow Bali",
    area: "Balangan / Uluwatu side",
    budget: "$$",
    bestFor: "private surf lessons, beginners",
    whyGood: "Small-format local surf coaching with beginner-friendly packages.",
    guestyNote:
      "A nice choice for private or semi-private surf lessons, especially for guests who want a more personal session than a crowded surf camp.",
    source: "https://www.breakandflowbali.com/",
  },
  {
    category: "Activities",
    name: "LP Surf School",
    area: "Pecatu",
    budget: "$$",
    bestFor: "beginner surf lessons, families",
    whyGood: "Clear lesson structure and beginner-friendly beach choices.",
    guestyNote:
      "A practical surf-school pick for first-timers staying around Dreamland, Bingin, or Padang Padang. Good if guests want included gear and a simple booking process.",
    source: "https://lpsurfschool.com/",
  },
  {
    category: "Activities",
    name: "Poggy Bali Surf School",
    area: "Padang Padang",
    budget: "$$",
    bestFor: "all ages, lessons, fun atmosphere",
    whyGood: "All-level surf school based around Padang Padang.",
    guestyNote:
      "A flexible surf-school choice for guests who want something approachable, friendly, and close to the main Uluwatu surf zone.",
    source: "https://poggybalisurfschool.com/",
  },
  {
    category: "Activities",
    name: "Boddhi Surf School Bali",
    area: "Uluwatu",
    budget: "$$",
    bestFor: "surf coaching, confident beginners, intermediate surfers",
    whyGood: "Locally run surf coaching with technique and safety focus.",
    guestyNote:
      "A good recommendation for guests who already know they want surf coaching with a more technical feel and local reef knowledge.",
    source: "https://boddhisurfschool.com/",
  },
  {
    category: "Attractions",
    name: "Uluwatu Temple",
    area: "Uluwatu",
    budget: "$",
    bestFor: "culture, sunset, first-time visitors",
    whyGood: "The essential clifftop temple experience in the area.",
    guestyNote:
      "One of South Bali’s signature sights, best visited late afternoon for the cliff views and sunset atmosphere. Guests should dress respectfully and watch their sunglasses around the monkeys.",
    source: "https://www.villa-bali.com/guide/things-to-do-in-uluwatu/",
  },
  {
    category: "Attractions",
    name: "Karang Boma Cliff",
    area: "Uluwatu",
    budget: "Free / $",
    bestFor: "sunset, viewpoints, photos",
    whyGood: "Free cliff viewpoint with huge ocean panoramas.",
    guestyNote:
      "One of the best free sunset viewpoints in Uluwatu. Go before golden hour, wear proper shoes, and stay back from the edge.",
    source: "https://www.balitouristic.com/karang-boma-cliff/",
  },
  {
    category: "Attractions",
    name: "Suluban Beach",
    area: "Uluwatu",
    budget: "Free / $",
    bestFor: "surf watching, cave access, dramatic scenery",
    whyGood: "Iconic cave-and-cliff access beach near Single Fin.",
    guestyNote:
      "A must for surf watching and one of the most dramatic coastal walks in the area. Best at lower tide, with steep steps and a small parking fee.",
    source: "https://www.ohana-agency.com/blog/things-to-do-in-uluwatu",
  },
  {
    category: "Attractions",
    name: "Padang Padang Beach",
    area: "Labuan Sait",
    budget: "$",
    bestFor: "swimming, cove beach, quick visit",
    whyGood: "Small famous cove with easy-to-love views.",
    guestyNote:
      "A compact and iconic cove beach that works well for a short stop, a swim, or first-time Uluwatu photos. There is usually a small entrance fee.",
    source: "https://www.ohana-agency.com/blog/things-to-do-in-uluwatu",
  },
  {
    category: "Attractions",
    name: "Thomas Beach",
    area: "Uluwatu",
    budget: "Free / $",
    bestFor: "swimming, quieter beach time, sunset walks",
    whyGood: "Calmer alternative to some of the busier cove beaches.",
    guestyNote:
      "A quieter white-sand option for guests who want a more relaxed beach without a big scene. Good for swimming, sunbathing, and sunset time.",
    source: "https://www.villacarinabali.com/post/best-beaches-in-uluwatu",
  },
  {
    category: "Attractions",
    name: "Bingin Beach",
    area: "Bingin",
    budget: "Free / $",
    bestFor: "surf vibe, sunset, beach dining",
    whyGood: "Classic cliffside Bukit atmosphere with surf culture.",
    guestyNote:
      "Best for guests who want a laid-back surf-beach feel with sunset drinks and casual seafood nearby. Expect stairs and a more rugged access path.",
    source: "https://www.villacarinabali.com/post/best-beaches-in-uluwatu",
  },
  {
    category: "Attractions",
    name: "Dreamland Beach",
    area: "Pecatu",
    budget: "$",
    bestFor: "big beach, surf, broader sandy stretch",
    whyGood: "Popular larger beach with easier open-sand feel.",
    guestyNote:
      "A broader beach than some of the hidden coves nearby, with a more open feel and plenty of space for beach time and surf watching.",
    source: "https://www.villa-bali.com/guide/things-to-do-in-uluwatu/",
  },
  {
    category: "Attractions",
    name: "Balangan Beach",
    area: "Balangan",
    budget: "$",
    bestFor: "surf views, photos, low-key beach time",
    whyGood: "Long scenic beach with a mellow surf-side feel.",
    guestyNote:
      "A good option for guests who want a scenic beach with a slightly calmer vibe than central Uluwatu. Great for surf watching and sunset light.",
    source: "https://www.villa-bali.com/guide/things-to-do-in-uluwatu/",
  },
  {
    category: "Attractions",
    name: "Melasti Beach",
    area: "Ungasan / Melasti",
    budget: "$",
    bestFor: "families, swimming, scenic road",
    whyGood: "Beautiful cliff road down to one of the area’s cleanest beaches.",
    guestyNote:
      "One of the easiest beaches to recommend widely because it works for swimming, photos, and family beach time. The drive down is part of the experience.",
    source: "https://www.baliholidaysecrets.com/best-beaches-in-uluwatu/",
  },
  {
    category: "Attractions",
    name: "Nyang Nyang Beach",
    area: "Uluwatu",
    budget: "Free / $",
    bestFor: "quiet beach days, long walks, solitude",
    whyGood: "Wild and spacious with fewer crowds.",
    guestyNote:
      "Best for guests who want a more untouched beach and do not mind the walk down. Bring water and sun protection because it is more remote than the easier-access beaches.",
    source: "https://www.villa-bali.com/guide/things-to-do-in-uluwatu/",
  },
  {
    category: "Attractions",
    name: "Green Bowl Beach",
    area: "Ungasan",
    budget: "$",
    bestFor: "hidden beach feel, surf, exploring",
    whyGood: "Less-obvious beach option with a hidden-gem feel.",
    guestyNote:
      "A good pick for guests who like discovering beaches that feel a bit more tucked away. Expect stairs and a quieter, less polished setup.",
    source: "https://www.baliholidaysecrets.com/best-beaches-in-uluwatu/",
  },
  {
    category: "Attractions",
    name: "Tegal Wangi Beach",
    area: "Jimbaran",
    budget: "Free / $",
    bestFor: "sunset, sea views, photo stops",
    whyGood: "Known for dramatic sea views and cliffside sunset stops.",
    guestyNote:
      "A good Jimbaran-side sunset stop for guests who want sea views without committing to a full beach day. Best when treated as a viewpoint rather than a swim spot.",
    source: "https://www.google.com/search?q=Tegal+Wangi+Beach+Jimbaran",
  },
  {
    category: "Attractions",
    name: "Jimbaran Beach",
    area: "Jimbaran",
    budget: "Free",
    bestFor: "sunset walks, calm water, families",
    whyGood: "One of the easiest and most flexible beaches in South Kuta.",
    guestyNote:
      "A calm, broad beach that works well for sunset walks, family time, and easy dinners on the sand. One of the most accessible beaches for mixed-age groups.",
    source: "https://www.balicopter.com/blog/10-things-to-do-in-south-bali-in-2026",
  },
  {
    category: "Attractions",
    name: "Garuda Wisnu Kencana Cultural Park",
    area: "Ungasan",
    budget: "$$",
    bestFor: "culture, families, rainy-day backup",
    whyGood: "Massive landmark statue with cultural programming.",
    guestyNote:
      "A strong cultural and family-friendly stop, especially for guests who want more than beaches. Good on mixed-weather days or when guests want a landmark experience.",
    source: "https://www.google.com/search?q=Garuda+Wisnu+Kencana+official",
  },
  {
    category: "Attractions",
    name: "Pandawa Beach",
    area: "Kutuh / South Kuta",
    budget: "$",
    bestFor: "swimming, easy beach day, groups",
    whyGood: "A broad, accessible beach on the South Kuta side.",
    guestyNote:
      "A good option when guests want a more open, accessible beach with easier parking and facilities than the hidden coves around Uluwatu.",
    source: "https://www.balicopter.com/blog/10-things-to-do-in-south-bali-in-2026",
  },
  {
    category: "Book before you go",
    name: "Savaya Bali",
    area: "Uluwatu",
    budget: "$$$",
    bestFor: "day club, nightlife, DJ events",
    whyGood: "High-demand club venue where advance planning matters.",
    guestyNote:
      "Best booked ahead, especially for headline events, sunset tables, or daybeds. Guests should check the event calendar, dress code, and minimum spend before going.",
    source: "https://www.savaya.com/new/uluwatu",
  },
  {
    category: "Book before you go",
    name: "Sundays Beach Club",
    area: "Ungasan",
    budget: "$$$",
    bestFor: "beach club, couples, calm-water beach access",
    whyGood: "Popular club with limited best spots and demand for beach access.",
    guestyNote:
      "Worth reserving in advance if guests want a smooth day-club experience with the best seating and easier planning around sunset.",
    source: "https://www.google.com/search?q=Sundays+Beach+Club+official",
  },
  {
    category: "Book before you go",
    name: "Oneeighty Dayclub",
    area: "Ungasan",
    budget: "$$$",
    bestFor: "day club, views, special-occasion afternoons",
    whyGood: "Cliff-edge venue where reservations help a lot.",
    guestyNote:
      "Best treated as a reservation-first venue, especially for guests coming for the cliff-edge pool and sunset timing.",
    source: "https://www.google.com/search?q=Oneeighty+Dayclub+official",
  },
  {
    category: "Book before you go",
    name: "Kecak Dance at Uluwatu Temple",
    area: "Uluwatu",
    budget: "$",
    bestFor: "culture, sunset, first-time Bali visitors",
    whyGood: "Sunset performance can sell out or require early arrival.",
    guestyNote:
      "Guests should plan this one early and arrive well before sunset if they want temple views plus the dance. It is one of the area’s most in-demand cultural experiences.",
    source: "https://www.ohana-agency.com/blog/things-to-do-in-uluwatu",
  },
  {
    category: "Book before you go",
    name: "Balicopter Scenic Flights",
    area: "South Bali",
    budget: "$$$$",
    bestFor: "special occasion, aerial views, luxury experience",
    whyGood: "A premium activity that always needs advance booking.",
    guestyNote:
      "A splurge recommendation for birthdays, proposals, or guests who want a memorable South Bali overview without the road time.",
    source: "https://www.balicopter.com/blog/10-things-to-do-in-south-bali-in-2026",
  },
  {
    category: "Book before you go",
    name: "Nusa Dua Water Sports",
    area: "Nusa Dua / South Kuta",
    budget: "$$",
    bestFor: "water sports, groups, families",
    whyGood: "Best done as a pre-booked package with timing and transport sorted.",
    guestyNote:
      "A practical one to pre-book if guests want jet skis, parasailing, banana boat rides, or a half-day family activity with easier logistics.",
    source: "https://www.balicopter.com/blog/10-things-to-do-in-south-bali-in-2026",
  },
  {
    category: "Book before you go",
    name: "Rock Bar Bali",
    area: "Jimbaran",
    budget: "$$$",
    bestFor: "sunset cocktails, date night, special occasion",
    whyGood: "Long wait times are common without a plan.",
    guestyNote:
      "Best for sunset drinks and a memorable cliffside evening, but guests should expect queues if they go without a reservation or early arrival.",
    source: "https://www.google.com/search?q=Rock+Bar+Bali+official",
  },
  {
    category: "Book before you go",
    name: "AYANA Spa Bali",
    area: "Jimbaran",
    budget: "$$$$",
    bestFor: "luxury spa, couples, special occasion",
    whyGood: "Luxury spa experience that works best with advance booking.",
    guestyNote:
      "A premium spa recommendation for guests who want a full luxury experience rather than a simple massage. Advance booking is strongly recommended.",
    source: "https://www.google.com/search?q=AYANA+Spa+Bali+official",
  },
  {
    category: "Food and drinks",
    name: "Suka Espresso Uluwatu",
    area: "Uluwatu",
    budget: "$$",
    bestFor: "breakfast, coffee, easy group meals",
    whyGood: "One of the most reliable all-day Uluwatu staples.",
    guestyNote:
      "A very easy recommendation for breakfast, coffee, smoothie bowls, and casual meals. Great for first arrivals or low-effort brunch before the beach.",
    source: "https://www.bysuka.com/suka-uluwatu",
  },
  {
    category: "Food and drinks",
    name: "Mana Uluwatu",
    area: "Suluban / Uluwatu",
    budget: "$$$",
    bestFor: "sunset dining, ocean views, couples",
    whyGood: "One of the best dining views in the area.",
    guestyNote:
      "A clifftop restaurant that works beautifully for lunch, sunset cocktails, or dinner. Best booked ahead if guests want the prime view tables.",
    source: "https://uluwatusurfvillas.com/restaurant/",
  },
  {
    category: "Food and drinks",
    name: "Single Fin Bali",
    area: "Suluban / Uluwatu",
    budget: "$$",
    bestFor: "sunset drinks, surf views, nightlife",
    whyGood: "The classic Uluwatu cliff bar experience.",
    guestyNote:
      "Best for sunset drinks above the surf break. Wednesdays and Sundays are the liveliest, so it works for both a scenic bar stop and a proper night out.",
    source: "https://www.singlefinbali.com/",
  },
  {
    category: "Food and drinks",
    name: "Hatch Uluwatu",
    area: "Uluwatu",
    budget: "$$",
    bestFor: "late-night drinks, fun groups, playful vibe",
    whyGood: "Colorful venue with later-night energy.",
    guestyNote:
      "A good late-night option when guests want something more social and playful than a standard sunset bar.",
    source: "https://lokasibali.com/lokasi/hatch-uluwatu",
  },
  {
    category: "Food and drinks",
    name: "Drifter Surf Shop Cafe",
    area: "Uluwatu",
    budget: "$$",
    bestFor: "coffee, brunch, surf vibe",
    whyGood: "Strong surf-community feel with cafe and retail in one stop.",
    guestyNote:
      "A nice stop for guests who like specialty coffee, wellness-leaning food, and surf-shop browsing in the same place.",
    source: "https://driftersurf.com/en-gb/pages/surf-shops",
  },
  {
    category: "Food and drinks",
    name: "The Cashew Tree",
    area: "Bingin",
    budget: "$$",
    bestFor: "healthy brunch, families, casual lunches",
    whyGood: "Popular Bingin cafe with broad appeal.",
    guestyNote:
      "A very easy Bingin recommendation for healthy food, coffee, and relaxed lunches. Good for groups with mixed dietary preferences.",
    source: "https://thehoneycombers.com/bali/best-cafes-in-uluwatu/",
  },
  {
    category: "Food and drinks",
    name: "Ours Uluwatu",
    area: "Pecatu",
    budget: "$$$",
    bestFor: "stylish dinner, brunch, couples",
    whyGood: "Design-forward all-day restaurant with steady popularity.",
    guestyNote:
      "A polished option for brunch, dinner, or drinks when guests want something more stylish than a surf cafe.",
    source: "https://oursbali.com/ours-bali-review/",
  },
  {
    category: "Food and drinks",
    name: "Gooseberry Restaurant",
    area: "Pecatu",
    budget: "$$$",
    bestFor: "date night, French-inspired dinner, special meal",
    whyGood: "Very strong review profile for a nicer dinner.",
    guestyNote:
      "One of the better-reviewed dinner picks in the area for guests who want a more refined meal and a quieter evening out.",
    source: "https://www.tripadvisor.com/Restaurant_Review-g1380108-d17713871-Reviews-Gooseberry_French_Restaurant_Uluwatu-Pecatu_Bukit_Peninsula_Bali.html",
  },
  {
    category: "Food and drinks",
    name: "Lucky Fish Lounge",
    area: "Bingin",
    budget: "$$",
    bestFor: "seafood, sunset, beachfront dining",
    whyGood: "Very easy Bingin seafood and sunset recommendation.",
    guestyNote:
      "Great for casual seafood and sunset drinks right by the beach. Go a bit before sunset if guests want the best tables.",
    source: "https://www.tripadvisor.com/Restaurant_Review-g1380108-d14795695-Reviews-Lucky_Fish_Lounge-Pecatu_Bukit_Peninsula_Bali.html",
  },
  {
    category: "Food and drinks",
    name: "M. Mason Bar Grill Uluwatu",
    area: "Uluwatu",
    budget: "$$$",
    bestFor: "meat, shared plates, dinner groups",
    whyGood: "Known for wood-fired cooking and lively dinner energy.",
    guestyNote:
      "A good recommendation for dinner when guests want a more modern, grill-focused meal with shareable plates.",
    source: "https://lokasibali.com/lokasi/m-mason-bar-grill-uluwatu/",
  },
  {
    category: "Food and drinks",
    name: "Tanah Uluwatu Bakery & Grill",
    area: "Uluwatu",
    budget: "$$",
    bestFor: "bakery, breakfast, pastries",
    whyGood: "Reliable bakery-cafe option around Uluwatu.",
    guestyNote:
      "A solid stop for breakfast, baked goods, and coffee when guests want something easy and crowd-pleasing.",
    source: "https://thehoneycombers.com/bali/best-cafes-in-uluwatu/",
  },
  {
    category: "Food and drinks",
    name: "Bukit Cafe",
    area: "Pecatu",
    budget: "$$",
    bestFor: "breakfast, cafe stop, low-key meals",
    whyGood: "Longstanding easy cafe pick around the Bukit.",
    guestyNote:
      "A straightforward breakfast and lunch choice for guests who want something easy, familiar, and casual.",
    source: "https://thehoneycombers.com/bali/best-cafes-in-uluwatu/",
  },
  {
    category: "Food and drinks",
    name: "Milk & Madu Uluwatu",
    area: "Uluwatu",
    budget: "$$",
    bestFor: "families, brunch, casual groups",
    whyGood: "Broad-appeal menu and easy casual setting.",
    guestyNote:
      "A safe recommendation for families or groups who want a comfortable all-day cafe with something for everyone.",
    source: "https://thehoneycombers.com/bali/best-cafes-in-uluwatu/",
  },
  {
    category: "Food and drinks",
    name: "BGS Bali Surf Shop & Coffee Bar Dreamland",
    area: "Ungasan / Dreamland side",
    budget: "$$",
    bestFor: "coffee, surf stop, casual hangout",
    whyGood: "Surf-shop and coffee combo that works well on the go.",
    guestyNote:
      "A good stop for coffee and surf-shop browsing, especially before or after beach time on the Dreamland and Balangan side.",
    source: "https://www.cybo.com/ID-biz/bgs-bali-surf-shop-coffee-bar-dreamland",
  },
  {
    category: "Food and drinks",
    name: "Jimbaran Beach Cafe",
    area: "Jimbaran",
    budget: "$$$",
    bestFor: "seafood sunset dinner, couples, first-timers",
    whyGood: "Classic toes-in-the-sand Jimbaran experience.",
    guestyNote:
      "A classic Jimbaran seafood dinner recommendation for guests who want sunset, grilled fish, and a very Bali beach-dinner atmosphere.",
    source: "https://lokasibali.com/lokasi/jimbaran-beach-cafe",
  },
  {
    category: "Food and drinks",
    name: "Surya Cafe Jimbaran",
    area: "Jimbaran",
    budget: "$$$",
    bestFor: "seafood dinner, sunset, beach dining",
    whyGood: "Well-known seafood cafe on Jimbaran Bay.",
    guestyNote:
      "A strong Jimbaran seafood option for guests who want the classic beach dinner experience without overcomplicating the choice.",
    source: "https://www.suryacafejimbaran.com/",
  },
  {
    category: "Food and drinks",
    name: "Beach Bali Cafe",
    area: "Kedonganan / Jimbaran",
    budget: "$$$",
    bestFor: "seafood dinner, beach atmosphere, groups",
    whyGood: "Another dependable Jimbaran Bay seafood option.",
    guestyNote:
      "A good seafood-on-the-sand recommendation for guests staying closer to Jimbaran or the airport side of South Kuta.",
    source: "https://beachbalicafe18.com/",
  },
  {
    category: "Food and drinks",
    name: "70 Fahrenheit Koffie Cafe Jimbaran",
    area: "Jimbaran",
    budget: "$$",
    bestFor: "coffee, work-friendly cafe, easy meals",
    whyGood: "Useful Jimbaran cafe for coffee and casual meals.",
    guestyNote:
      "A practical Jimbaran cafe for coffee, laptops, and low-key meetings or lunches. Nice when guests want a break from beaches and bars.",
    source: "https://lokasibali.com/lokasi/70-fahrenheit-koffie-cafe-jimbaran",
  },
  {
    category: "Food and drinks",
    name: "Alchemy Uluwatu",
    area: "Uluwatu",
    budget: "$$",
    bestFor: "plant-based meals, healthy breakfast, lunch",
    whyGood: "Well-known healthy and plant-based option.",
    guestyNote:
      "A strong recommendation for vegan, vegetarian, or healthy-leaning guests who still want a stylish cafe stop.",
    source: "https://thehoneycombers.com/bali/best-cafes-in-uluwatu/",
  },
  {
    category: "Food and drinks",
    name: "BAKED. Uluwatu",
    area: "Uluwatu",
    budget: "$$",
    bestFor: "pastries, breakfast, takeaway coffee",
    whyGood: "Popular bakery-style stop for quick, easy breakfasts.",
    guestyNote:
      "A good recommendation for guests who want excellent pastries, coffee, and an easy grab-and-go breakfast before heading out.",
    source: "https://thehoneycombers.com/bali/best-cafes-in-uluwatu/",
  },
  {
    category: "Food and drinks",
    name: "Lands End Cafe",
    area: "Uluwatu",
    budget: "$$",
    bestFor: "cafe views, breakfast, lunch",
    whyGood: "Scenic cafe option often highlighted in cafe roundups.",
    guestyNote:
      "A nice daytime stop for guests who want a coffee or meal with an airy, scenic Uluwatu feel.",
    source: "https://thehoneycombers.com/bali/best-cafes-in-uluwatu/",
  },
  {
    category: "Food and drinks",
    name: "The Loft Uluwatu",
    area: "Uluwatu",
    budget: "$$",
    bestFor: "all-day cafe, easy brunch, mixed groups",
    whyGood: "Popular easygoing cafe with broad menu appeal.",
    guestyNote:
      "A simple all-day option for coffee, breakfast, and casual lunches. Helpful for guests who want something familiar and unfussy.",
    source: "https://www.google.com/search?q=The+Loft+Uluwatu+cafe",
  },
  {
    category: "Neighborhoods",
    name: "Uluwatu",
    area: "Uluwatu",
    budget: "-",
    bestFor: "surf, sunsets, cliffs, dining",
    whyGood: "The signature clifftop side of South Kuta.",
    guestyNote:
      "Best for guests who want dramatic cliffs, surf culture, sunset bars, and easy access to the area’s headline beaches and temple views.",
    source: "https://www.ohana-agency.com/blog/things-to-do-in-uluwatu",
  },
  {
    category: "Neighborhoods",
    name: "Pecatu",
    area: "Pecatu",
    budget: "-",
    bestFor: "villas, restaurants, quieter stays",
    whyGood: "Broad Uluwatu-area base with many villa and dining options.",
    guestyNote:
      "A good base for guests who want a bit more space and a mix of villas, restaurants, and beach access without always staying right on the busiest strip.",
    source: "https://www.villabalisale.com/blog/what-to-do-in-uluwatu-for-families",
  },
  {
    category: "Neighborhoods",
    name: "Bingin",
    area: "Bingin",
    budget: "-",
    bestFor: "surf vibe, cafes, beach access",
    whyGood: "Laid-back surf-focused pocket with strong dining options.",
    guestyNote:
      "Best for guests chasing a mellow surf-town feel, good brunches, beach stairs, and sunset seafood.",
    source: "https://thehoneycombers.com/bali/best-cafes-in-uluwatu/",
  },
  {
    category: "Neighborhoods",
    name: "Labuan Sait / Padang Padang",
    area: "Labuan Sait",
    budget: "-",
    bestFor: "beach-hopping, surf access, central Uluwatu position",
    whyGood: "Strategic pocket close to popular beaches and bars.",
    guestyNote:
      "A very practical area for guests who want quick access to Padang Padang, Suluban, Single Fin, and the heart of Uluwatu.",
    source: "https://www.ohana-agency.com/blog/things-to-do-in-uluwatu",
  },
  {
    category: "Neighborhoods",
    name: "Balangan / Dreamland",
    area: "Balangan",
    budget: "-",
    bestFor: "broader beaches, surf, quieter stays",
    whyGood: "More open-beach feel than the cliff-cove areas.",
    guestyNote:
      "Good for guests who prefer broader beaches, easier surf access, and a slightly calmer base than the Uluwatu core.",
    source: "https://www.villa-bali.com/guide/things-to-do-in-uluwatu/",
  },
  {
    category: "Neighborhoods",
    name: "Ungasan",
    area: "Ungasan",
    budget: "-",
    bestFor: "beach clubs, larger villas, Melasti access",
    whyGood: "Strong base for Melasti and luxury cliff venues.",
    guestyNote:
      "A good fit for guests who want larger villas, easier Melasti access, and several beach club or wellness options nearby.",
    source: "https://www.villacarinabali.com/post/best-beaches-in-uluwatu",
  },
  {
    category: "Neighborhoods",
    name: "Jimbaran Bay",
    area: "Jimbaran",
    budget: "-",
    bestFor: "seafood dinners, families, airport convenience",
    whyGood: "Calmer bay area with easy airport access.",
    guestyNote:
      "Best for guests who want family-friendly beaches, easy airport logistics, and classic seafood dinners on the sand.",
    source: "https://www.balicopter.com/blog/10-things-to-do-in-south-bali-in-2026",
  },
  {
    category: "Neighborhoods",
    name: "Kedonganan",
    area: "Kedonganan",
    budget: "-",
    bestFor: "fish market, local seafood, airport side",
    whyGood: "More local and working-waterfront than resort Jimbaran.",
    guestyNote:
      "A useful area for guests who want a more local seafood experience and easy access to the airport side of South Kuta.",
    source: "https://blp.inc/id/location-guide/bukit/pasar-ikan-kedonganan",
  },
  {
    category: "Neighborhoods",
    name: "Melasti / Kutuh",
    area: "South Kuta",
    budget: "-",
    bestFor: "scenic beach days, clubs, wider roads",
    whyGood: "Known for its dramatic road down to the beach and easier family beach days.",
    guestyNote:
      "A good pocket for guests who want scenic drives, easier beach setups, and several upscale cliff venues nearby.",
    source: "https://www.baliholidaysecrets.com/best-beaches-in-uluwatu/",
  },
  {
    category: "Shopping",
    name: "Samasta Lifestyle Village",
    area: "Jimbaran",
    budget: "$$",
    bestFor: "souvenirs, casual shopping, evening strolls",
    whyGood: "Easy open-air shopping and dining stop in Jimbaran.",
    guestyNote:
      "A useful Jimbaran stop for light shopping, cafes, dessert, and an easy evening walk without going into central Kuta.",
    source: "https://www.samastabali.com/",
  },
  {
    category: "Shopping",
    name: "Drifter Surf Shop Uluwatu",
    area: "Uluwatu",
    budget: "$$",
    bestFor: "surf goods, gifts, apparel",
    whyGood: "One of the most distinctive surf shops in the area.",
    guestyNote:
      "A strong recommendation for guests who want boards, surf apparel, gifts, or just a stylish surf-shop browse.",
    source: "https://driftersurf.com/en-gb/pages/surf-shops",
  },
  {
    category: "Shopping",
    name: "Pepito Market Uluwatu",
    area: "Ungasan / Uluwatu road",
    budget: "$$",
    bestFor: "groceries, villa stocking, imported goods",
    whyGood: "One of the easiest grocery stops for villa stays.",
    guestyNote:
      "A practical stop for stocking a villa with snacks, wine, fruit, breakfast basics, and imported groceries.",
    source: "https://zaubee.com/biz/pepito-market-uluwatu-yulogd1h",
  },
  {
    category: "Shopping",
    name: "Gourmet Market Sidewalk Jimbaran",
    area: "Jimbaran",
    budget: "$$",
    bestFor: "premium groceries, villa supplies, easy shopping",
    whyGood: "Useful premium supermarket inside Sidewalk Jimbaran.",
    guestyNote:
      "A convenient Jimbaran grocery stop for guests who want a nicer supermarket run with both local and imported products.",
    source: "https://gourmetmarket.co.id/",
  },
  {
    category: "Shopping",
    name: "Nirmala Supermarket Jimbaran",
    area: "Jimbaran",
    budget: "$",
    bestFor: "budget groceries, quick essentials",
    whyGood: "Straightforward local supermarket option.",
    guestyNote:
      "A useful option for faster, more affordable grocery runs than the premium supermarkets.",
    source: "https://lokasibali.com/lokasi/nirmala-supermarket-jimbaran",
  },
  {
    category: "Shopping",
    name: "Krisna Oleh Oleh at Samasta",
    area: "Jimbaran",
    budget: "$$",
    bestFor: "souvenirs, snacks, gifts to bring home",
    whyGood: "Easy Bali souvenir stop without detouring far north.",
    guestyNote:
      "A practical stop for gifts, local snacks, coffee, and easy Bali souvenirs before departure day.",
    source: "https://www.samastabali.com/",
  },
  {
    category: "Traveling with kids",
    name: "Waterbom Bali",
    area: "Kuta / airport side",
    budget: "$$$",
    bestFor: "full family day, waterpark, all ages",
    whyGood: "A very strong family outing close to the airport side of South Bali.",
    guestyNote:
      "A top family day trip if guests are happy to drive toward Kuta. Best for a full, energy-burning day rather than a quick stop.",
    source: "https://bali.com/news/press-releases/waterbom-bali-named-the-1-waterpark-in-the-world-by-tripadvisor-travelers-choice-awards-best-of-the-best-2025/",
  },
  {
    category: "Traveling with kids",
    name: "Tarabelle Kids Club",
    area: "Ungasan",
    budget: "$$",
    bestFor: "small kids, parents needing downtime, indoor play",
    whyGood: "Dedicated kids space with cafe support nearby.",
    guestyNote:
      "A very useful recommendation for families with younger children who need a few easy indoor-and-outdoor play hours.",
    source: "https://balikids.app/tarabelle",
  },
  {
    category: "Traveling with kids",
    name: "Jungle Play Bali",
    area: "Jimbaran",
    budget: "$$",
    bestFor: "outdoor play, younger kids, family afternoons",
    whyGood: "Nature-inspired playground option around Jimbaran.",
    guestyNote:
      "A good family option when kids need open-air playtime instead of another beach or restaurant stop.",
    source: "https://wanderlog.com/place/details/1815801/jungle-play-bali",
  },
  {
    category: "Traveling with kids",
    name: "Ohana Kids Paradise",
    area: "Ungasan",
    budget: "$$",
    bestFor: "playground time, meals with kids, family downtime",
    whyGood: "Large family-focused play setup in the Bukit area.",
    guestyNote:
      "Very handy for families staying around Uluwatu who want a child-friendly meal and a proper place for kids to burn energy.",
    source: "https://knowmadsbali.com/en/living/kids-friendly-activities",
  },
  {
    category: "Traveling with kids",
    name: "Hulahop Playground",
    area: "Jimbaran",
    budget: "$",
    bestFor: "younger kids, quick play stop",
    whyGood: "Straightforward outdoor playground in Jimbaran.",
    guestyNote:
      "A simple playground recommendation for families with small children who just need an easy local play stop.",
    source: "https://balikids.app/hulahop-playground",
  },
  {
    category: "Traveling with kids",
    name: "Pamper Me Playground & Kids Salon",
    area: "Jimbaran",
    budget: "$$",
    bestFor: "indoor play, kids salon, rainy-day backup",
    whyGood: "A more unusual family option inside Jimbaran’s shopping zone.",
    guestyNote:
      "Helpful for families needing an indoor backup plan, especially on hot afternoons or rainy days.",
    source: "https://baliforum.ru/places/pamper-me-playground-kids-salon-jimbaran",
  },
  {
    category: "Useful information",
    name: "Ngurah Rai International Airport",
    area: "Airport / Tuban",
    budget: "-",
    bestFor: "arrivals, departures, last-day planning",
    whyGood: "Key logistics point for airport-adjacent guests.",
    guestyNote:
      "Useful for last-day planning: taxi counter, ATMs, baggage storage, lounges, and family facilities are all available on site.",
    source: "https://ngurahraiairport.com/ngurah-rai-airport-news-info/terminal-services-at-ngurah-rai-international-airport/",
  },
  {
    category: "Useful information",
    name: "BIMC Hospital Nusa Dua",
    area: "Nusa Dua / South Kuta",
    budget: "-",
    bestFor: "medical care, emergencies, travel support",
    whyGood: "International-standard hospital option on the South Kuta side.",
    guestyNote:
      "A good hospital recommendation for guests who need urgent care or want an international-standard medical option on the south side of Bali.",
    source: "https://bimcbali.com/about-us",
  },
  {
    category: "Useful information",
    name: "BIMC Hospital Kuta",
    area: "Kuta / airport side",
    budget: "-",
    bestFor: "medical care, emergencies, airport-side support",
    whyGood: "Useful hospital reference closer to the airport.",
    guestyNote:
      "A practical medical backup for guests who need hospital support closer to the airport or Kuta side.",
    source: "https://bimcbali.com/about-us",
  },
  {
    category: "Useful information",
    name: "Guardian Jimbaran Sidewalk",
    area: "Jimbaran",
    budget: "$$",
    bestFor: "pharmacy, toiletries, quick essentials",
    whyGood: "Easy pharmacy and health-beauty stop in Jimbaran.",
    guestyNote:
      "Useful for quick pharmacy runs, toiletries, sunscreen, and basic travel essentials without a long detour.",
    source: "https://lokasibali.com/lokasi/guardian-jimbaran-sidewalk",
  },
  {
    category: "Useful information",
    name: "Guardian Uluwatu Raya",
    area: "Jimbaran / Uluwatu road",
    budget: "$$",
    bestFor: "pharmacy, travel essentials, easy stop",
    whyGood: "Another practical health-and-essentials stop on the main road.",
    guestyNote:
      "A helpful backup pharmacy option on the Jimbaran-Uluwatu route for meds, toiletries, or last-minute basics.",
    source: "https://lokasibali.com/lokasi/guardian-uluwatu-raya",
  },
  {
    category: "Ways to save money",
    name: "Pasar Ikan Kedonganan",
    area: "Kedonganan",
    budget: "$",
    bestFor: "fresh seafood, local experience, bargain shopping",
    whyGood: "One of the best-value local seafood stops in the area.",
    guestyNote:
      "A great budget recommendation for guests who want to buy fresh seafood locally or experience a more authentic market than the beach restaurants.",
    source: "https://blp.inc/id/location-guide/bukit/pasar-ikan-kedonganan",
  },
  {
    category: "Ways to save money",
    name: "Pasar Tradisional Alas Kusuma",
    area: "Jimbaran",
    budget: "$",
    bestFor: "local shopping, produce, everyday supplies",
    whyGood: "Traditional market option for lower-cost everyday basics.",
    guestyNote:
      "Useful for guests who want a more local market for fruit, snacks, and low-cost everyday items instead of supermarket pricing.",
    source: "https://lokasibali.com/lokasi/pasar-tradisional-alas-kusuma",
  },
  {
    category: "Ways to save money",
    name: "Nirmala Supermarket Jimbaran",
    area: "Jimbaran",
    budget: "$",
    bestFor: "budget groceries, villa basics",
    whyGood: "More budget-friendly than many premium grocery stops.",
    guestyNote:
      "A useful supermarket recommendation when guests want to stock the villa without paying premium-market prices.",
    source: "https://lokasibali.com/lokasi/nirmala-supermarket-jimbaran",
  },
  {
    category: "Ways to save money",
    name: "Yeye's Warung",
    area: "Uluwatu",
    budget: "$",
    bestFor: "cheap eats, surf crowd, casual meals",
    whyGood: "Long-running local favorite for affordable meals.",
    guestyNote:
      "A strong cheap-eats recommendation in Uluwatu for guests who care more about value and local surf-town character than polished interiors.",
    source: "https://www.kala.surf/blog/best-warungs-in-uluwatu-2026",
  },
  {
    category: "Ways to save money",
    name: "Satu Uluwatu",
    area: "Uluwatu",
    budget: "$$",
    bestFor: "healthy affordable meals, coworking-friendly cafe",
    whyGood: "Often mentioned as a good-value all-rounder.",
    guestyNote:
      "A useful recommendation for guests who want decent food, good Wi-Fi, and better value than many trendier cafes.",
    source: "https://www.kala.surf/blog/best-warungs-in-uluwatu-2026",
  },
  {
    category: "Ways to save money",
    name: "Karang Boma Cliff",
    area: "Uluwatu",
    budget: "Free / $",
    bestFor: "free sunset, photos, low-cost outing",
    whyGood: "One of the best scenic low-cost things to do nearby.",
    guestyNote:
      "A very easy budget recommendation because guests get huge sunset views without needing a beach club or dinner spend.",
    source: "https://www.balitouristic.com/karang-boma-cliff/",
  },
];

const categoryOrder = [
  "Activities",
  "Attractions",
  "Book before you go",
  "Food and drinks",
  "Neighborhoods",
  "Shopping",
  "Traveling with kids",
  "Useful information",
  "Ways to save money",
];

const areaOrder = [
  "Uluwatu",
  "Pecatu / Ungasan side",
  "Pecatu",
  "Jimbaran / Ungasan",
  "Balangan / Uluwatu side",
  "Padang Padang",
  "Ungasan",
  "South Bali",
  "Labuan Sait",
  "Bingin",
  "Balangan",
  "South Kuta",
  "Jimbaran",
  "Kedonganan",
  "Airport / Tuban",
];

const workbook = Workbook.create();
const summary = workbook.worksheets.add("Summary");
const sheet = workbook.worksheets.add("Recommendations");
const glossary = workbook.worksheets.add("Category guide");

sheet.showGridLines = false;
summary.showGridLines = false;
glossary.showGridLines = false;

const headers = [
  "Category",
  "Name",
  "Area",
  "Budget",
  "Best for",
  "Why it is good",
  "Guesty-ready note",
  "Source",
];

const rows = recommendations.map((rec) => [
  rec.category,
  rec.name,
  rec.area,
  rec.budget,
  rec.bestFor,
  rec.whyGood,
  rec.guestyNote,
  rec.source,
]);

sheet.getRange("A1:H1").values = [headers];
sheet.getRange(`A2:H${rows.length + 1}`).values = rows;

sheet.getRange("A1:H1").format = {
  fill: "#0F4C5C",
  font: { bold: true, color: "#FFFFFF" },
  wrapText: true,
  horizontalAlignment: "Center",
  verticalAlignment: "Center",
};

sheet.getRange(`A2:H${rows.length + 1}`).format = {
  verticalAlignment: "Top",
  wrapText: true,
};

sheet.getRange(`A2:A${rows.length + 1}`).conditionalFormats.add("containsText", {
  text: "Activities",
  format: { fill: "#E8F3F7" },
});
sheet.getRange(`A2:A${rows.length + 1}`).conditionalFormats.add("containsText", {
  text: "Attractions",
  format: { fill: "#EEF6EA" },
});
sheet.getRange(`A2:A${rows.length + 1}`).conditionalFormats.add("containsText", {
  text: "Book before you go",
  format: { fill: "#FFF4E5" },
});
sheet.getRange(`A2:A${rows.length + 1}`).conditionalFormats.add("containsText", {
  text: "Food and drinks",
  format: { fill: "#FDECEC" },
});
sheet.getRange(`A2:A${rows.length + 1}`).conditionalFormats.add("containsText", {
  text: "Neighborhoods",
  format: { fill: "#F4EEF8" },
});
sheet.getRange(`A2:A${rows.length + 1}`).conditionalFormats.add("containsText", {
  text: "Shopping",
  format: { fill: "#EDF4FF" },
});
sheet.getRange(`A2:A${rows.length + 1}`).conditionalFormats.add("containsText", {
  text: "Traveling with kids",
  format: { fill: "#FFF6DB" },
});
sheet.getRange(`A2:A${rows.length + 1}`).conditionalFormats.add("containsText", {
  text: "Useful information",
  format: { fill: "#EAF5F0" },
});
sheet.getRange(`A2:A${rows.length + 1}`).conditionalFormats.add("containsText", {
  text: "Ways to save money",
  format: { fill: "#F5F7E9" },
});

sheet.getRange("A1:H1").format.rowHeightPx = 36;
sheet.getRange("A:H").format.columnWidthPx = 120;
sheet.getRange("A:A").format.columnWidthPx = 160;
sheet.getRange("B:B").format.columnWidthPx = 200;
sheet.getRange("C:C").format.columnWidthPx = 150;
sheet.getRange("D:D").format.columnWidthPx = 85;
sheet.getRange("E:E").format.columnWidthPx = 180;
sheet.getRange("F:F").format.columnWidthPx = 220;
sheet.getRange("G:G").format.columnWidthPx = 340;
sheet.getRange("H:H").format.columnWidthPx = 220;
sheet.freezePanes.freezeRows(1);

const table = sheet.tables.add(`A1:H${rows.length + 1}`, true, "RecommendationsTable");
table.style = "TableStyleMedium2";

summary.getRange("A1:G1").merge();
summary.getRange("A1").values = [["South Kuta + Uluwatu Guesty Recommendations"]];
summary.getRange("A1").format = {
  fill: "#0F4C5C",
  font: { bold: true, color: "#FFFFFF", size: 16 },
  horizontalAlignment: "Center",
  verticalAlignment: "Center",
};
summary.getRange("A2:G2").merge();
summary.getRange("A2").values = [[
  "Built for Guesty category import planning. Covers Uluwatu, Pecatu, Bingin, Jimbaran, Ungasan, the South Kuta side, and airport-adjacent backup picks.",
]];
summary.getRange("A2").format = {
  fill: "#E8F3F7",
  font: { color: "#14323D" },
  wrapText: true,
  verticalAlignment: "Center",
};

summary.getRange("A4:B8").values = [
  ["Metric", "Value"],
  ["Total recommendations", recommendations.length],
  ["Guesty categories covered", categoryOrder.length],
  ["Areas represented", new Set(recommendations.map((r) => r.area)).size],
  ["Food and drinks picks", recommendations.filter((r) => r.category === "Food and drinks").length],
];
summary.getRange("A4:B4").format = {
  fill: "#14323D",
  font: { bold: true, color: "#FFFFFF" },
};
summary.getRange("A4:B8").format = {
  wrapText: true,
  verticalAlignment: "Center",
};

summary.getRange("D4:E13").values = [
  ["Category", "Count"],
  ...categoryOrder.map((category) => [
    category,
    recommendations.filter((r) => r.category === category).length,
  ]),
];
summary.getRange("D4:E4").format = {
  fill: "#14323D",
  font: { bold: true, color: "#FFFFFF" },
};

summary.getRange("J4:K13").values = [
  ["Short label", "Count"],
  ["Activities", recommendations.filter((r) => r.category === "Activities").length],
  ["Attractions", recommendations.filter((r) => r.category === "Attractions").length],
  ["Book ahead", recommendations.filter((r) => r.category === "Book before you go").length],
  ["Food & drinks", recommendations.filter((r) => r.category === "Food and drinks").length],
  ["Neighborhoods", recommendations.filter((r) => r.category === "Neighborhoods").length],
  ["Shopping", recommendations.filter((r) => r.category === "Shopping").length],
  ["Kids", recommendations.filter((r) => r.category === "Traveling with kids").length],
  ["Useful info", recommendations.filter((r) => r.category === "Useful information").length],
  ["Save money", recommendations.filter((r) => r.category === "Ways to save money").length],
];

summary.getRange("G4:H14").values = [
  ["Area", "Count"],
  ...Array.from(
    recommendations.reduce((map, rec) => {
      map.set(rec.area, (map.get(rec.area) || 0) + 1);
      return map;
    }, new Map()),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10),
];
summary.getRange("G4:H4").format = {
  fill: "#14323D",
  font: { bold: true, color: "#FFFFFF" },
};

const chart = summary.charts.add("bar", summary.getRange("J4:K13"));
chart.title = "Recommendations by Guesty category";
chart.hasLegend = false;
chart.xAxis = { axisType: "textAxis" };
chart.setPosition("A11", "F26");

glossary.getRange("A1:C1").values = [["Category", "Use it for", "Notes"]];
glossary.getRange("A2:C10").values = [
  ["Activities", "Wellness, surf lessons, fitness, yoga", "Use when the main value is doing something rather than just seeing a place."],
  ["Attractions", "Beaches, cliffs, temples, parks, sights", "Use for scenic or cultural spots guests will visit."],
  ["Book before you go", "High-demand clubs, ticketed sunset experiences, premium reservations", "Use when advance planning materially improves the guest experience."],
  ["Food and drinks", "Restaurants, cafes, bars, beach clubs", "Best for brunch, seafood, sunset drinks, dinner, and nightlife."],
  ["Neighborhoods", "Area overviews and where to spend time", "Useful when guests ask where different parts of South Kuta feel different."],
  ["Shopping", "Groceries, surf stores, souvenir stops", "Focus on useful guest shopping, not luxury retail."],
  ["Traveling with kids", "Play spaces, waterparks, easy family days", "Use when the main reason is child-friendly logistics."],
  ["Useful information", "Airport, hospitals, pharmacies, practical support", "Keep these clear and functional."],
  ["Ways to save money", "Markets, cheap eats, free viewpoints, budget grocery runs", "Focus on real savings, not just mid-range picks."],
];
glossary.getRange("A1:C1").format = {
  fill: "#14323D",
  font: { bold: true, color: "#FFFFFF" },
};
glossary.getRange("A1:C10").format = { wrapText: true, verticalAlignment: "Top" };
glossary.getRange("A:A").format.columnWidthPx = 160;
glossary.getRange("B:B").format.columnWidthPx = 220;
glossary.getRange("C:C").format.columnWidthPx = 360;

summary.getRange("A:H").format.columnWidthPx = 120;
summary.getRange("A:A").format.columnWidthPx = 160;
summary.getRange("B:B").format.columnWidthPx = 90;
summary.getRange("D:D").format.columnWidthPx = 190;
summary.getRange("G:G").format.columnWidthPx = 160;
summary.getRange("A1:H30").format.wrapText = true;
summary.freezePanes.freezeRows(3);

await fs.mkdir(outputDir, { recursive: true });

const recommendationsCheck = await workbook.inspect({
  kind: "table",
  range: `Recommendations!A1:H12`,
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 8,
});
console.log(recommendationsCheck.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

const previewSummary = await workbook.render({
  sheetName: "Summary",
  range: "A1:H26",
  scale: 1,
  format: "png",
});
await fs.writeFile(
  path.join(outputDir, "summary-preview.png"),
  new Uint8Array(await previewSummary.arrayBuffer()),
);

const previewSheet = await workbook.render({
  sheetName: "Recommendations",
  range: "A1:H20",
  scale: 1,
  format: "png",
});
await fs.writeFile(
  path.join(outputDir, "recommendations-preview.png"),
  new Uint8Array(await previewSheet.arrayBuffer()),
);

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(path.join(outputDir, "south-kuta-uluwatu-guesty-recommendations.xlsx"));

console.log(`Saved workbook with ${recommendations.length} recommendations to ${outputDir}`);
