# Prep — lunches for the week

A single-page meal-prep planner built around Trader Joe's. Open `index.html` in a browser — there's no build step.

- **Assemble** mode generates layered lunch bowls that hit your protein and calorie window.
- **Cook** mode is a library of 800+ recipes (soups, bowls, salads, pasta, tacos and wraps, sheet pans, curries,
  snack boxes, freezer meals and TJ's shortcut hacks) with search, filters, scaling, aisle-grouped shopping lists
  and a freezer tracker.

Everything you save lives in your browser's `localStorage`.

## Recipe data

```
recipes/
  catalog.js        Trader Joe's products and staples (TJ), recipe kinds (KINDS), and the R() helper
  catalog-more.js   Year-round and spring/summer additions to the catalog
  *.js              Recipe files; each calls R({...}) once per recipe
```

A catalog entry is `P(name, aisle, unit, {tj, pk, pkn, s, sub, st})`:
`pk`/`pkn` are the package size and name used to round the shopping list, `s` marks a seasonal item
(`fall`, `winter`, `spring`, `summer` or `new`) and `sub` names the fallback when it's off the shelves,
and `st` marks a pantry staple.

A recipe looks like:

```js
R({id:"pn02",name:"Pesto cavatappi salad with chicken and mozzarella",cu:"ita",kind:"pasta",min:20,serves:5,
 cal:490,p:34,c:48,f:18,            // per serving, estimated
 tags:["cold","fresh"],keeps:4,     // tags drive the filters; keeps = days in the fridge
 ing:[["cavatappi",10],["pesto",6],["grilledstrips",2.5,"optional prep note"]],
 steps:["..."], top:"add when you eat", alt:"Instant Pot / slow cooker method", note:"..."});
```

Quantities are in the catalog item's unit and get scaled to the servings setting, so keep amounts out of the steps.

Tags: `veg freezer onepot ip slow spicy cozy sick light cold nocook fresh`.

To add a recipe file, include it with a `<script src="recipes/...">` tag in `index.html` before the main script.

## Checking the data

```
node tools/validate-recipes.js
```

This checks that every ingredient exists in the catalog, IDs are unique, cuisines, kinds and tags are valid,
meatless recipes don't use meat, fish or chicken broth, and macros roughly add up to the calories.
