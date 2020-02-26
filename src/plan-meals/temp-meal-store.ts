import getDb, { Location } from "../utils/database.js"

function getLocation(location: string) : Location {
   location = location.trim()
   if (!location) {
      return ""
   }
   if (/(\.com|\.net|\.org)/.test(location)) {
      return { url: location, title: location }
   }
   var match : RegExpMatchArray | null;
   var bookRgx = /(.*) (\d+)$/
   if (match = location.match(bookRgx)) {
      return { book: match[1], page: +match[2] }
   }
   return location
}

[
"????, 1000 Veg 457",
"Acorn squash soup, 1000 Veg 26",
"African sweet potato stew, VP 301",
"Alfredo-style Fettuccine, Internet",
"Annalise's enchiladas, (Gmail/her blog)",
"Artichoke & Root Veg Gratin, VP 355",
"Asian chicken with bowties, broth container, ????",
"Asian pork cabbage, Fast/slow 80",
"Asparagus & swt potato curry, mothering clipping",
"Asparagus Soup, MVK 39",
"Cauliflower, MVK 144",
"Asparagus and mushrooms with orange sauce and rice, KG 6",
"Asparagus frittata, KG 7",
"Asparagus risotto, KG 5",
"Asparagus, Steamed",
"Autumn Stew, VP 298",
"Avocado enchilada, Food Doctor ?",
"Baked Beans, VP 292",
"Baked Polenta, VP 227",
"Baked potato, Yum",
"Barley pilaf, MVK 133",
"Bean & Pasta Soup, 1000 Veg 51",
"Bean Soup, 1000 Veg 81",
"Bean hash, vegweb.com",
"Bean stew, KG 48",
"Bean/pasta casserole, 1000 Veg 549",
"Beanless chili, https://lowcarbyum.com/no-bean-low-carb-chili/#wprm-recipe-container-26610",
"Beans and Rice, Food Doctor 73",
"Beans with Kale, MVK 163",
"Beef Stew and Colcannon, http://allrecipes.com/Recipe/Beer-Braised-Irish-Stew-and-Colcannon/",
"Beef basil noodles,  diabetesmealplans.com",
"Beef burrito,",
"Beef burrito with Vegetables, Asian 473",
"Beet salad, MVK 68",
"Black Bean chili, VP 318",
"Black bean burger (frozen) & rice, ???",
"Black bean hash, ???",
"Black bean soup, Food Doctor 27",
"Black eyed peas, Purloined recipe",
"Black eyed peas, whipstone.com",
"Bok Choy Paneer, Raw 163",
"Bok choy and green bean stirfry, http://www.foodnetwork.com/recipes/guy-fieri/best-bok-choy-recipe.html",
"Bolivian corn pudding, Latin 149",
"Bone broth soup, ???",
"Blackfoot potato soup, http://www.food.com/recipe/blackfoot-potato-soup-178084",
"Bowties & Monkey bites, Cooking Class book",
"Braised cabbage with beans, MVK",
"Breaded chicken, pasta, spaghetti sauce, Made up :-)",
"Broccoli casserole, Food Doctor 58",
"Broccoli quiche, allrecipes.com",
"Broccoli quinoa, online",
"Broccoli soup, KG",
"Broccoli stirfry, VP 198",
"Broccoli/Parsnip/potato soup, MVK 41",
"Brussel/Quinoa salad, Sprouts app",
"Buckwheat crepes, foodnetwork.com",
"Buckwheat with buttons and bowties, VP 268",
"Burgers with chimichurri, Around World 94",
"Burritos (beef/bean), ???",
"Burritos/Potato salad, MVK 76",
"Butt Squash soup, KG 103",
"Butt Squash soup, foodnetwork.com",
"Butternut Squash stirfry, 1000 Veg",
"Butternut squash mac and cheese, ???",
"Butternut squash shakshuka, Sprouts app",
"Butternut squash soup, Dental Diet 272",
"Butternut squash soup, Dental Diet",
"Cabbage Borscht, allrecipes.com",
"Cabbage Cucamonga 2x, KG 23",
"Cabbage roll casserole, sauerkraut can",
"Caponata, Gone Raw",
"Eggplant rollups, MVK 15",
"Caribbean rice, VC 120",
"Carolina squash saute, KG 100",
"Carrot & Cabbage noodles, pdf",
"Carrot soup, goneraw.com",
"Carrot, apple, celery soup, 1000 Veg 16",
"Cashew chicken, lifemadesweeter",
"Cauliflower Carrot Soup, KG 34",
"Cauliflower Crust Pizza, chocolatecoveredkatie.com",
"Cauliflower soup with chicken and apple, https://www.deliciousobsessions.com/2016/09/curried-cauliflower-soup-chicken-apples-gluten-free-grain-free-dairy-free/",
"Cauliflower tortillas, https://www.recipegirl.com/cauliflower-tortillas/",
"Ceviche, ???",
"Chan Pei Fun Gai with turkey, Asian",
"Chana dal, Leala",
"Chayote curry with chapati, http://www.nandyala.org/mahanandi/archives/2007/01/03/",
"Cheese pizza, ???",
"Cheesy potato bake, 1000 Veg 580",
"Chicken & Mushroom Skillet, http://www.eatliverun.com/creamy-chicken-and-mushroom-pasta-skillet/",
"Chicken & Yogurt Curry, Asian 45",
"Chicken Cashew stirfry, https://diabetesmealplans.com/recipe/chicken-cashew-veggie-stir-fry/",
"Chicken Gumbo, http://southernfood.about.com/od/gumborecipes/r/blbb458.htm",
"Chicken and mushroom ragout, myrecipes.com",
"Chicken carbonara, diabetesmealplans.com",
"Chicken korma, fast/slow 95",
"Chicken noodle soup, myrecipes.com/recipe/chicken-pasta-soup-10000001895922",
"Chicken pad Thai, spend with pennies",
"Chicken patty, Diabetes 92",
"Chicken salad, Puck",
"Chicken stirfry,  diabetesmealplans.com p. 12",
"Chicken stirfry, http://allrecipes.com/Recipe/Orange-Chicken-Stir-Fry-3/",
"Chicken thighs with apple and onion, humanOS",
"Chicken tikka masala, Sprouts app",
"Chicken with pasta, ???",
"Chicken with walnuts, Asian 397 (top)",
"Chicken/mushroom ragout, https://skinnyms.com/creamy-chicken-and-mushroom-ragout-recipe/",
"Chickpea curry, Annie's 16",
"Chickpea mushroom curry, Food Doctor 61",
"Chickpea soup, MVK 52",
"Chickpea tagine, VP 282",
"Chickpea tomato soup, clipping",
"Chickpea vindaloo, VP 312",
"Chili Skillet, Dana's 237",
"Chimichurri fish taco, myrecipes.com",
"Chimicurri meatballs, Sprouts app",
"Chopped Greek salad, Sprouts app",
"Cilantro Corn pancakes (2x), KG 49",
"Cilantro/asparagus salad, Purloined recipe",
"Cobb salad, lifemadesweeter",
"Coconut couscous salad, 1000 Veg 707",
"Miso soup, VP 76",
"Collard/swiss chard saute with rice, ???",
"Corn Chowder, ???",
"Corn Tomato, and Celery soup, KG 49",
"Easy Cabbage Dinner, Dana's 263",
"Artichoke hearts salad, MVK 137",
"Beets and Apple salad, KG 15",
"Cornbread, VP 477",
"Couscous with peas MVK 99",
"Gomen, Ethiopian 21",
"Market Kale salad, whipstone.com",
"Couscous with tagine, MVK 100",
"Cuban beans with rice, VP 278",
"Cuban black bean soup and Tostones, Around World 108-109",
"Cuban black bean stew, Latin 152",
"Cuban black bean, Latin 153",
"Curried Cauliflower Pakora, VP 47",
"Curried Lentils, VP 306",
"Curried chicken salad, Bernstein 424",
"Curry Pasties, 1000 Veg 561",
"Dairy free alfredo, http://girlandthekitchen.com/dairy-free-alfredo-sauce/",
"Dhal & Carrot Soup, 1000 Veg 21",
"Dhal Chapati & Parathas, Asian 29 & 1000 Veg 243",
"Ditali with cauliflower, MVK 102",
"Domburi, Asian 458",
"Double broccoli quinoa, 101cookbooks.com",
"Egg cucumber salad, diabetesmealplans.com",
"Egg roll with rice,",
"Eggplant Stew, Bernstein 448",
"Eggplant lasagna,",
"Eggs in soy sauce, Asian 187",
"Egyptian style lentil soup, MVK 53",
"Enchilada, http://www.recipegirl.com/2011/05/02/easy-beef-enchiladas/",
"Enchiladas, food.com",
"Enchiladas, foodnetwork.com",
"Injera, Greens, Sweet potato, Ethiopian (27; 21; 24)",
"Falafel, https://minimalistbaker.com/easy-vegan-falafel/",
"Falafel/pitas,",
"Indian fry bread,",
"Farfalle with squash & fennel, MVK 103",
"Fettuccine with Lentil Sauce, VP 255",
"Fish salad, pampered chef calendar",
"Fish stew, Latin 232",
"Fish taco chimichurri sauce,",
"Fish with blackeyed, online",
"French Winter Veg Soup, Purloined recipe",
"French toast,",
"Fresh black-eyed peas, http://whipstone.com/blog/category/recipes-by-ingredient/black-eyed-peas/",
"Fresh spaghetti sauce,",
"Fresh tomato soup, 1000 Veg 106",
"Frittata & Zucchini Bread, VP 538 and 476",
"Frittata, Pampered chef",
"Garbanzo salad, paper",
"Garden kale dinner, KG 67",
"Garlic soup, MVK 44",
"Garlic-Lemon quinoa, Sprouts app",
"Gazpacho verde, VP 74",
"Gazpacho, Around World 64",
"Gazpacho, foodnetwork.com",
"Gemelli w/ artichokes & rouille, VP 244",
"Ginger Collards & Spaghetti, KG 66",
"Greek bean soup, 1000 Veg 23",
"Broccoli stirfries, Asian 205",
"Green bean casserole, https://minimalistbaker.com/vegan-green-bean-casserole/",
"Green chile tamale, epicurious.com",
"Greens and Falafel, Ethiopian 21",
"Gujarati Potato, Asian 82",
"Ham/sweet potato egg muffin, Sprouts app",
"Hamburgers,",
"Hamburger helper, http://www.farmgirlgourmet.com/2012/12/homemade-hamburger-helper.html",
"Hatch green chile gumbo, Sprouts app",
"Hawaiian haystack, online",
"Hazelnut Loaf, VC 130",
"Hearty potato soup, myrecipes.com",
"Hibiscus curry, Asian 144",
"Honey Lime Ginger Pork, therecipecritic.com/2016/02/slow-cooker-honey-lime-ginger-pork",
"Hot tamale veg pie, VP 369",
"Hungarian chicken with pasta, KG 48",
"Hyderabad pickles, 1000 Veg 150",
"Indian Spiced Lentil Soup, VP 78",
"Italian bean soup with greens, Diabetes 136",
"Italian potato salad, brochure",
"Jackfruit potatoes, tarladal.com",
"Jamaican jerk chicken with mango salsa, Around World 106",
"Jambalaya, http://www.foodandwine.com/recipes/sausage-jambalaya",
"Kale and mushroom rice, http://www.myrecipes.com/recipe/kale-mushrooms-with-basmati-rice-10000000226491/",
"Kale market salad, Purloined recipe",
"Kenyan Dengu (Mung bean stew), 1000 Veg 555",
"Kidney bean risotto, 1000 Veg 410",
"Lamb stew, KG 84",
"Lasagna (subst. for eggplant), VP 380",
"Lasagna soup, Sprouts app",
"Lasagna, Dana's 239 & 243",
"Lasagna, allrecipes.com",
"Layered Pies, 1000 Veg 574",
"Leek and potato soup, Vegetarian 64",
"Leek, Carrot, Potato soup, KG 70",
"Lemon poppy seed cookies, Food Doctor 100",
"Lemongrass saute, recipes p 14",
"Lentil & Pasta Soup, 1000 Veg 38",
"Lentil & Pepper Tart, 1000 Veg 597",
"Lentil Barley Soup, Dana's 258",
"Lentil Kale soup, VP 80",
"Lentil Soup, VC 68",
"Lentil and buckwheat salad, allrecipes.com",
"Lentil and rice pilaf, VC 119",
"Lentil salad, Ethiopian 25",
"Lentil salad, MVK 87",
"Lentil sloppy joes, online",
"Lentils/Rice, Annie's 18",
"Linguine w/ coulis & asparagus, MVK 109",
"Linguine with Bean Sauce, VP loose",
"Linguine with pesto-kissed tomato sauce, VP 247",
"Linguine with sage, VP 252",
"Mac & cheese with squash, word doc",
"Macaroni Cheese & Tomato, 1000 Veg 348",
"Maple baked root veg, VP 211",
"Marjoram-scented chickpea stew, VP 303",
"Meatball soup, http://thepioneerwoman.com/cooking/italian-meatball-soup/",
"Mediterranean egg and veg strata, Sprouts app",
"Millet croquettes, VP 226",
"Minestrone, KG 25",
"Minestrone, MVK 55",
"Minestrone, MVK 57",
"Mint pesto cauliflower, Sprouts app",
"Miso chicken stirfry, eatingwell.com",
"Miso soup, improv",
"Miso soup, Around World 24",
"Miso stirfry, eating well.com",
"Mixed Bean Soup, tasteofhome.com",
"Mixed veg curry, VC 127",
"Moroccan carrot soup & Veg with charmoula, MVK 42 & 30",
"Moroccan stew, food dr",
"Morrocan lamb, Dental Diet",
"Mountain Man Stew, dehydrated",
"Muffaletta, VP 446/470",
"Mushroom & potato, Asian 77",
"Mushroom Millet soup, Food Doctor 38",
"Mushroom Soup; Yellow rice, importfood.com",
"Mushroom Soy Pastitsio, VP 374",
"Mushroom bisque, VP 84",
"NE chowder, VP 88",
"Noodles with Chard and Almonds, KG 37",
"Nut spring rolls, Raw 163",
"One-pan roasted chicken, Sprouts app",
"Palak paneer, cookwithmanali.com",
"Paleo chicken pad thai, Sprouts app",
"Paleo salmon cake, Sprouts app",
"Parsnip Chicken Noodle Soup, timeinc.net",
"Parsnip, eggplant, biryani, Veg 170",
"Pasta with green sauce, MVK 117",
"Pasta & Bean Soup, MVK 58",
"Pasta and chili tomatoes, 1000 Veg 326",
"Pasta primavera, MVK 114",
"Pasta with pearl onion, MVK 98",
"Pasta with pesto and tomato,",
"Pasta with pesto, 1000 Veg 277",
"Pasta with red lentil sauce, VP",
"Pasta/Squash with Herb-Roasted Tomato, MVK 118",
"Peanut Pizza,",
"Penne Putanesca, VP 248",
"Penne with Mushroom sauce, MVK 115",
"Persian Pitas, MVK 69",
"Persian bean/noodle soup, MVK 49",
"Pineapple Curry, Asian 205",
"Pinto chili with millet, VP 320",
"Pita with hummus and falafel,",
"Pizza - Thai chicken and pepperoni,",
"Pizza - ham/pineapple and Thai peanut,",
"Pizza santa fe, KG 45",
"Polenta pie, MVK 194 & Asparagus MVK 138",
"Polenta with stewed pepper & tomato, MVK 132",
"Polenta-stuffed peppers, VP",
"Pork Carnitas, http://allrecipes.com/recipe/219048/pork-carnitas/",
"Pork chops,",
"Pork mole quesadilla, Diabetes 122",
"Pork shoulder, jamieoliver.com",
"Pot Pie, VP 366",
"Pot roast, slow/fast 71",
"Potato & Pea curry, Asian 75",
"Potato Hash, online",
"Potato Salad, KG 87",
"Potato and cauliflower curry, 1000 Veg 499",
"Potato gordas, Food Doctor 51",
"Potato hash, 1000 Veg 788",
"Potato/pea curry & gujarati potato, Asian 75 & 82",
"Potstickers,",
"Provencal Bean Stew, 1000 Veg 575",
"Pulled pork, https://sarahfragoso.com/beyond-easy-pulled-pork/",
"Pumpkin Veg Soup,",
"Pumpkin pasta, http://pinchofyum.com/creamy-pumpkin-spaghetti-with-garlic-kale",
"Pumpkin soup, 1000 Veg 26",
"Quinoa Pilaf, Food Doctor 71",
"Quinoa pilaf, MVK 133",
"Quinoa pilaf, word doc",
"Quinoa salad, VP 115",
"Quinoa-stuffed peppers, http://www.vegetariantimes.com/recipe/quinoa-stuffed-peppers-2/",
"Ragout, VP 291",
"Rapini, greens stirfry,",
"Ratatouille with white beans, MVK 172",
"Ravioli without borders with cilantro salsa, KG 47",
"Ravioli without borders, VP 255",
"Raw Spaghetti Sauce, internet",
"Raw caponata in pepper or cabbage,",
"Raw carrot soup, goneraw.com/recipe/carrot-soup",
"Raw pizza, Raw 182",
"Red Bean and Sweet potato curry, VP 286",
"Red flannel hash,",
"Rice cubes with satay sauce, 1000 Veg 184",
"Rice pilaf, MVK 97",
"Rice with lentils, 1000 Veg 782",
"Rice with sauteed zucchini and mushrooms, MVK 159",
"Rice, chickpea, broccoli, VP 236",
"Roasted Asparagus, MVK 138",
"Udon Noodle Soup, VP 95",
"Roasted potato & beet, MVK 154",
"Roasted root veg, VC 205",
"Rosemary Chicken, online",
"S & S Chicken, Eclairs",
"Salt Cod, Latin 231",
"Sausage soup, https://www.tasteslovely.com/italian-sausage-and-vegetable-soup/",
"Savory spring rolls, Raw 191",
"Scallion pancakes, VP 59",
"Scalloped potatoes, MVK 153",
"Shepherds pie, Around World 88",
"Snapper, Latin 226",
"Socca & Sweet potato soup, MVK 8 & monkeysee.com",
"Solidarity casserole, KG 26",
"Solstice skillet, KG 89",
"Soup, http://www.monkeysee.com/play/20340-carrot-parsnip-and-sweet-potato-soup",
"Southwestern chicken soup,",
"Spaghetti,",
"Spaghetti Pie, VP 120",
"Spaghetti Squash/sauce,",
"Spaghetti with walnut-garlic sauce, MVK 120",
"Spinach Cream Curry, Raw 193",
"Spinach and salmon Egg, Sprouts app (baked 400 for 30 min in pie pan)",
"Spinach pancake, KG 93",
"Spinach rice pancakes, KG 45",
"Spinach/salmon egg cup, Sprouts app",
"Split Pea soup, https://www.thekitchn.com/recipe-split-pea-soup-104076",
"Split pea soup with fish and mushroom, http://unikurn.com/split-pea-soup/",
"Spring Veg Gratin & Rolls, VP 358",
"Sprouted Lentil salad, L in Raw 241",
"Sprouted mung bean sautee, online",
"Squash gnocchi, MVK 107",
"Squash/bacon quiche,",
"Steak burrito bowls,",
"Steak caserole, Diabetes 113",
"Steamed Fish, Bernstein 441",
"Stirfry make it up,",
"Strawberry Rhubarb crumble, diabetesmealplans.com p. 9",
"Stroganoff, http://allrecipes.com/recipe/219046/rich-and-creamy-beef-stroganoff/",
"Stuffed Peppers, Vegan Planet",
"Stuffed mushrooms, VC 87",
"Stuffed pepper, KG 85",
"Stuffed portabella, Diabetes 128",
"Summer skillet, KG 89",
"Sweet Potato burrito, Annie’s 17",
"African Sweet potato & peanut stew, VP 302",
"Sweet potato biscuits & roasted asparagus, Food Doctor 51 & 109",
"Sweet potato curry with Injera, Ethiopian 24 & 27",
"Sweet potato kugel, Proc. 239",
"Sweet potato/bean burrito, Annie's 28",
"Swiss Chard Dolmas, MVK 175",
"Swt potato & bean burrito, Annie's 17",
"Swt potato/broccoli soup, Diabetes 134",
"Tabbouleh salad, MVK 91",
"Taco Salad,",
"Taco pasta,",
"Taco salad w/ guacamole and radish salsa, online",
"Taco salad with chile pesto, KG 43",
"Taco salad with corn risotto, KG 51",
"Taco salad with salsa fresca, KG 47",
"Taco salad with tomatillo/tomato salsa, KG 109",
"Tahini Rotini, VP 254",
"Teriyaki meatball, https://damndelicious.net/2014/03/08/teriyaki-meatballs/",
"Thai beef noodle soup, Diabetes 160",
"Thai green curry, box",
"Thai peanut pizza,",
"Thai-style omelet, 1000 Veg 266",
"Three-bean dal, VP 285",
"Tomatillo  bisque, KG 107",
"Tomato & hummus sandwich,",
"Tomato Rice Soup, MVK 47",
"Tomato and rice soup, 1000 Veg 94",
"Tomato fennel soup, MVK 46",
"Tomato sandwich with pesto,",
"Tomato-lentil soup, MVK 59",
"Tortellini,",
"Tortilla Pizza,",
"Tuna noodle casserole 2x, campbellskitchen.com",
"Turkey/grilled veg sandwiches, MVK 203",
"Twice baked sweet potato, Diabetes 184",
"Two Bean Salad, Food Doctor 44",
"Unstuffed cabbage roll, https://www.savorytooth.com/unstuffed-cabbage-rolls/#genesis-content",
"Veg Polenta, VC 122",
"Veg soup, VP 89",
"Veg stew, VC 135",
"Veg stirfry, 1000 Veg 523",
"Veg Curry, 1000 Veg 435",
"Veg Korma, VC 128",
"Veg fritters, VP 213",
"Vegetable in charmoula sauce, MVK 30",
"Veg medley, VC",
"Veg soup with garbanzo & bacon,",
"Vegetables in Coconut gravy, Asian 198",
"Greek beans, 1000 Veg 787",
"Veggie risotto, Food Doctor 86",
"Veracruz fish, Latin 228",
"Eggplant Gratin, MVK 146",
"Very Veggie Chili, VP 315",
"Genius kale salad, whipstone.com",
"West Coast Chili, Vegan Planet",
"Italian Brown Rice Salad, MVK 88",
"White Bean Cassoulet, VP",
"White Chicken Chili, Sprouts app",
"White bean cassolet, VP 290",
"Winter Veg Cobbler, VC 181",
"Won Ton Soup with Udon noodles, Costco won tons",
"Zataar patties, VP 331",
"Zucchini Lemon quinoa, MVK 101",
"Zucchini Rice soup, MVK 63",
"Zucchini casserole, Dana's 270",
"Zucchini pizza boats, https://diabetesmealplans.com/recipe/low-carb-zucchini-pizza-boats/",
]
.map(s => {
   var length = s.length
   var idx = s.lastIndexOf(",")
   if (idx === -1) {
      return {
         recipe: s,
         location: ""
      }
   } else if (idx === length - 1) {
      return {
         recipe: s.slice(0, length - 1),
         location: ""
      }
   } else {
      var [recipe, location] = [s.slice(0, idx).trim(), s.slice(idx - length + 1).trim() ]
      return { recipe, location }
   }
})
.forEach((recipe, i) => {
   if (!window.localStorage["db-created"]) {
      getDb().then(db => {
         var id = i + 1
         var lastUpdated = +(new Date())
         db.put("recipe", {
            id,
            name: recipe.recipe,
            location: getLocation(recipe.location),
            lastUpdated
         })
      }).then(_ => {
         localStorage.setItem("db-created", "yep")
      })
   }
})

export default recipeInfo
