# MMM-PilotWX

## Better documentation to follow

## Installation of module and dependencies

* `git clone https://github.com/mykle1/MMM-PilotWX.git` into `~/MagicMirror/modules` directory.
* `npm install` in your `~/MagicMirror/modules/MMM-PilotWX` directory.

## Add to Config.js

    {
		disabled: false,
		module: "MMM-PilotWX",
		position: "top_left", // for mode: "Static",  bottom_bar for mode: "Rotating",
		config: {
			ICAO: "KJFK,EGLL,UUDD,EDDT,RJAA,ZBAA,LFPG,LIRF", // 8 INTL ICAO's
			colorCode: "Alternative", // Standard or Alternative
			mode: "Static",        // Static List or Rotating one by one
			maxWidth: "100%",      // 100% for mode: Rotating, approx 300px for mode: Static
			useHeader: false,
			header: "",
		}
	},

## 

