-- ─────────────────────────────────────────────────────────────────
--  Moderate Glutton + Arnold, Table for 2 — Apple Notes Templates
--
--  Double-click in Finder → Script Editor → click Run
--  Or from terminal: osascript add-templates-to-notes.applescript
--
--  Creates 2 templates in Notes → Moderate Glutton:
--    📋 Template — Recipe (Moderate Glutton + Table for 2)
--    📋 Template — Houston Restaurant
-- ─────────────────────────────────────────────────────────────────

tell application "Notes"
	activate

	-- Ensure Moderate Glutton folder exists
	set folderName to "Moderate Glutton"
	set targetFolder to missing value
	repeat with f in folders
		if name of f is folderName then
			set targetFolder to f
			exit repeat
		end if
	end repeat
	if targetFolder is missing value then
		set targetFolder to make new folder with properties {name:folderName}
	end if

	-- ── Recipe Template ───────────────────────────────────────────
	set recipeBody to "<h1>🥘 [Recipe Name]</h1>

<p><b>Date drafted:</b><br><b>Attempt #:</b><br><b>Inspired by / adapted from:</b></p>

<h2>The Recipe</h2>

<h3>Ingredients</h3>
<p><i>Weights over volumes where it matters</i></p>
<ul><li></li><li></li><li></li><li></li><li></li></ul>

<h3>Mise en Place</h3>
<p><i>Everything to prep before you start cooking — chop, measure, temper, etc.</i></p>
<ul><li></li><li></li><li></li></ul>

<h3>Instructions</h3>
<ol><li></li><li></li><li></li><li></li><li></li></ol>

<h3>Notes &amp; Variations</h3>
<p><i>Tips, substitutions, what to change next time — shared across both destinations</i></p>
<p></p>

<h2>For the Website — Moderate Glutton</h2>

<p><b>My notes on this dish:</b><br><i>Your voice — the story, why you make it, what you've figured out. This goes above the recipe on the site.</i></p>
<p></p>

<p><b>One-line description:</b><br><i>Public-facing, under 160 characters — shows in Google and under the title</i></p>
<p></p>

<p><b>Ready to post?</b></p>
<ul>
<li>◻ Not yet — still iterating</li>
<li>◻ Nearly — just needs write-up</li>
<li>◻ Yes — hand to Cowork</li>
</ul>

<h2>For the Book — Arnold, Table for 2</h2>

<p><b>Opening line for the page:</b><br><i>The short italicized moment at the top of the spread — e.g. \"A Sunday in late November, still in pajamas.\"</i></p>
<p></p>

<p><b>Notes for Amber:</b><br><i>What you want her to know about this dish — the memory, the meaning, anything only for her</i></p>
<p></p>

<p><b>Photo notes:</b><br><i>What photos exist? What to shoot? Describe the shot.</i></p>
<p></p>

<p><b>Ready for the book?</b></p>
<ul>
<li>◻ Not yet</li>
<li>◻ Recipe is final — needs photos</li>
<li>◻ Recipe + photos ready — hand to Cowork</li>
</ul>"

	make new note at targetFolder with properties {name:"📋 Template — Recipe (Moderate Glutton + Table for 2)", body:recipeBody}

	-- ── Houston Restaurant Template ───────────────────────────────
	set restaurantBody to "<h1>🍽 Houston Restaurant — [Name]</h1>

<p><b>Date visited:</b><br><b>With:</b></p>

<h2>Site Fields</h2>

<p><b>Name:</b></p>
<p></p>

<p><b>Address:</b><br><i>Full street address — e.g. 4319 Montrose Blvd, Houston, TX 77006</i></p>
<p></p>

<p><b>Cuisine:</b><br><i>1–3 words — e.g. Modern Mexican, Gulf Coast Seafood, Bakery, Wine Bar</i></p>
<p></p>

<p><b>My rating:</b><br><i>1–5, half-stars ok — e.g. 4.5</i></p>
<p></p>

<p><b>My note:</b><br><i>1–2 sentences in your voice — shows on the map popup and list card</i></p>
<p></p>

<h2>Photo</h2>
<p><i>Optional — describe what to shoot, or note a photo you already have</i></p>
<p></p>

<h2>Notes to myself</h2>
<p><i>Anything extra — what to order, what to skip, context for the write-up</i></p>
<p></p>

<p><i>When you hand this to Cowork, coordinates + Michelin/James Beard distinctions will be looked up automatically.</i></p>"

	make new note at targetFolder with properties {name:"📋 Template — Houston Restaurant", body:restaurantBody}

end tell

display dialog "✅ Templates added to Notes → Moderate Glutton" buttons {"Done"} default button "Done"
