 /* Magic Mirror
  *
  * Module: MMM-PilotWX
  *
  * By Mykle1
  * 
  */
Module.register("MMM-PilotWX", {

    // Module config defaults.
    defaults: {
		ICAO: "KJFK,EGLL,UUDD,EDDT,RJAA,ZBAA,LFPG,LIRF",  // separated by comma only
		colorCode: "Standard", // Standard or Alternative color coding
		mode: "Static",        // Static or Rotating display
		maxWidth: "100%",      // 100% for mode: Rotating, approx 300px for mode: Static
		useHeader: false,
		header: "",
		rotateInterval: 15 * 1000, // seconds
		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 3000,
		initialLoadDelay: 1875, // of module
		retryDelay: 1500,
    },


    getStyles: function() {
        return ["MMM-PilotWX.css"];
    },


    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);

        // Set locale.
        this.url = "https://aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=" + this.config.ICAO + "&hoursBeforeNow=1",
		this.WISP = [];
		this.activeItem = 0;
        this.rotateInterval = null;
        this.scheduleUpdate();
    },


    getDom: function() {
		
        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;


        if (!this.loaded) {
            wrapper.classList.add("wrapper");
            wrapper.innerHTML = "Loading PilotWX . .";
            wrapper.className = "bright light small";
            return wrapper;
        }

		 
		if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }
		
		/// Begin config option for rotating or static //
		///////////// First - The rotating data ///////////////////
		
		if(this.config.mode != "Static"){
		
		
		//	Rotating my data
        var WISP = this.WISP;
        var WISPKeys = Object.keys(this.WISP);
        if (WISPKeys.length > 0) {
            if (this.activeItem >= WISPKeys.length) {
                this.activeItem = 0;
        }
        var WISP = this.WISP[WISPKeys[this.activeItem]];


		// start config opton for color coding flight category/rules bullet
		if (this.config.colorCode != "Standard"){
		// Alternative color coding flight category/rules bullet
		if (WISP.flight_category == "VFR"){
			var bullet = '<font color = green> &#x29BF </font>';
		} else if (WISP.flight_category == "MVFR"){
			var bullet = '<font color = blue> &#x29BF </font >';
		} else if (WISP.flight_category == "IFR"){
			var bullet = '<font color = red> &#x29BF </font>';
		} else if (WISP.flight_category == "LIFR"){
			var bullet = '<font color = magenta> &#x29BF </font>';
		} else {
			var bullet = '<font color = grey> &#x29BF </font>';
		}
	} else {
		// Standard color coding flight category/rules bullet
		if (WISP.flight_category == "VFR"){
			var bullet = '<font color = blue> &#x29BF </font>';
		} else if (WISP.flight_category == "MVFR"){
			var bullet = '<font color = green> &#x29BF </font >';
		} else if (WISP.flight_category == "IFR"){
			var bullet = '<font color = yellow> &#x29BF </font>';
		} else if (WISP.flight_category == "LIFR"){
			var bullet = '<font color = red> &#x29BF </font>';
		} else {
			var bullet = '<font color = grey> &#x29BF </font>';
		}
		
	}   // <-- end config option for color coding flight category/rules bullet
		
        
		// if cloud_base_ft_agl is missing, display nothing
		if(WISP.sky_condition[0]["$"].cloud_base_ft_agl == undefined){
			WISP.sky_condition[0]["$"].cloud_base_ft_agl = "";
		}
		
		
		var top = document.createElement("div");
        top.classList.add("list-row");
		
        var synopsis = document.createElement("div");
        synopsis.classList.add("small", "bright", "bottom_bar");
        synopsis.innerHTML =
			bullet + " &nbsp "
			+ WISP.station_id + " &nbsp &nbsp "
			+ WISP.wind_dir_degrees + "@"
			+ WISP.wind_speed_kt + "kt" + " &nbsp  &nbsp "
			+ Math.round(WISP.visibility_statute_mi) + "SM" + " &nbsp &nbsp "
			+ WISP.sky_condition[0]["$"].sky_cover
			+ WISP.sky_condition[0]["$"].cloud_base_ft_agl + " &nbsp &nbsp "
			+ Math.round(WISP.temp_c) + "/"
			+ Math.round(WISP.dewpoint_c) + " &nbsp &nbsp  "
			+ Math.round(WISP.altim_in_hg) + "hg" + " &nbsp &nbsp  "
			+ moment(WISP.observation_time, "YYYY-MM-DD HH:mm:ss Z").local().format("[(]HH:mm[)]")
			; 
        top.appendChild(synopsis);
		 
        wrapper.appendChild(top);
		 
		} // <-- closes rotation loop
		
		
        ////////////////// ELSE - the Static data (Below) //////////////
		
		} else {
			
		var top = document.createElement("div");
        top.classList.add("list-row");
		
		var WISP = this.WISP;
		 
		 
		// vars for color coding flight_category bullets
		var a = WISP[0].flight_category;
		var b = WISP[1].flight_category;
		var c = WISP[2].flight_category;
		var d = WISP[3].flight_category;
		var e = WISP[4].flight_category;
		var f = WISP[5].flight_category;
		var g = WISP[6].flight_category;
		var h = WISP[7].flight_category;
		 
		 
		 // start config opton for color coding
		if (this.config.colorCode != "Standard"){
		 
		 
		 
		// Alternative color coding 1 of 8, a-h
			   if (a == "VFR"){
			var aBullet = '<font color = green> &#x29BF </font>';
		} else if (a == "MVFR"){
			var aBullet = '<font color = blue> &#x29BF </font >';
		} else if (a == "IFR"){
			var aBullet = '<font color = red> &#x29BF </font>';
		} else if (a == "LIFR"){
			var aBullet = '<font color = magenta> &#x29BF </font>';
		} else {
			var aBullet = '<font color = grey> &#x29BF </font>';
		}		
		
		// Alternative color coding 2 of 8, a-h		
				if (b == "VFR"){
			var bBullet = '<font color = green> &#x29BF </font>';
		} else if (b == "MVFR"){
			var bBullet = '<font color = blue> &#x29BF </font >';
		} else if (b == "IFR"){
			var bBullet = '<font color = red> &#x29BF </font>';
		} else if (b == "LIFR"){
			var bBullet = '<font color = magenta> &#x29BF </font>';
		} else {
			var bBullet = '<font color = grey> &#x29BF </font>';
		}
		
		
		// Alternative color coding 3 of 8, a-h
			   if (c == "VFR"){
			var cBullet = '<font color = green> &#x29BF </font>';
		} else if (c == "MVFR"){
			var cBullet = '<font color = blue> &#x29BF </font >';
		} else if (c == "IFR"){
			var cBullet = '<font color = red> &#x29BF </font>';
		} else if (c == "LIFR"){
			var cBullet = '<font color = magenta> &#x29BF </font>';
		} else {
			var cBullet = '<font color = grey> &#x29BF </font>';
		}		
		
		// Alternative color coding 4 of 8, a-h		
				if (d == "VFR"){
			var dBullet = '<font color = green> &#x29BF </font>';
		} else if (d == "MVFR"){
			var dBullet = '<font color = blue> &#x29BF </font >';
		} else if (d == "IFR"){
			var dBullet = '<font color = red> &#x29BF </font>';
		} else if (d == "LIFR"){
			var dBullet = '<font color = magenta> &#x29BF </font>';
		} else {
			var dBullet = '<font color = grey> &#x29BF </font>';
		}
		
		
		// Alternative color coding 5 of 8, a-h
			   if (e == "VFR"){
			var eBullet = '<font color = green> &#x29BF </font>';
		} else if (e == "MVFR"){
			var eBullet = '<font color = blue> &#x29BF </font >';
		} else if (e == "IFR"){
			var eBullet = '<font color = red> &#x29BF </font>';
		} else if (e == "LIFR"){
			var eBullet = '<font color = magenta> &#x29BF </font>';
		} else {
			var eBullet = '<font color = grey> &#x29BF </font>';
		}		
		
		// Alternative color coding 6 of 8, a-h		
				if (f == "VFR"){
			var fBullet = '<font color = green> &#x29BF </font>';
		} else if (f == "MVFR"){
			var fBullet = '<font color = blue> &#x29BF </font >';
		} else if (f == "IFR"){
			var fBullet = '<font color = red> &#x29BF </font>';
		} else if (f == "LIFR"){
			var fBullet = '<font color = magenta> &#x29BF </font>';
		} else {
			var fBullet = '<font color = grey> &#x29BF </font>';
		}
		
		
		// Alternative color coding 7 of 8, a-h
			   if (g == "VFR"){
			var gBullet = '<font color = green> &#x29BF </font>';
		} else if (g == "MVFR"){
			var gBullet = '<font color = blue> &#x29BF </font >';
		} else if (g == "IFR"){
			var gBullet = '<font color = red> &#x29BF </font>';
		} else if (g == "LIFR"){
			var gBullet = '<font color = magenta> &#x29BF </font>';
		} else {
			var gBullet = '<font color = grey> &#x29BF </font>';
		}		
		
		// Alternative color coding 8 of 8, a-h		
				if (h == "VFR"){
			var hBullet = '<font color = green> &#x29BF </font>';
		} else if (h == "MVFR"){
			var hBullet = '<font color = blue> &#x29BF </font >';
		} else if (h == "IFR"){
			var hBullet = '<font color = red> &#x29BF </font>';
		} else if (h == "LIFR"){
			var hBullet = '<font color = magenta> &#x29BF </font>';
		} else {
			var hBullet = '<font color = grey> &#x29BF </font>';
		}
		
	} else { // continue config option for color coding
		
		// Stardard color coding 1 of 8, a-h
			   if (a == "VFR"){
			var aBullet = '<font color = blue> &#x29BF </font>';
		} else if (a == "MVFR"){
			var aBullet = '<font color = green> &#x29BF </font >';
		} else if (a == "IFR"){
			var aBullet = '<font color = yellow> &#x29BF </font>';
		} else if (a == "LIFR"){
			var aBullet = '<font color = red> &#x29BF </font>';
		} else {
			var aBullet = '<font color = grey> &#x29BF </font>';
		}		
		
		// Stardard color coding 2 of 8, a-h		
				if (b == "VFR"){
			var bBullet = '<font color = blue> &#x29BF </font>'; 
		} else if (b == "MVFR"){
			var bBullet = '<font color = green> &#x29BF </font >';
		} else if (b == "IFR"){
			var bBullet = '<font color = yellow> &#x29BF </font>';
		} else if (b == "LIFR"){
			var bBullet = '<font color = red> &#x29BF </font>';
		} else {
			var bBullet = '<font color = grey> &#x29BF </font>';
		}
		
		
		// Stardard color coding 3 of 8, a-h
			   if (c == "VFR"){
			var cBullet = '<font color = blue> &#x29BF </font>';
		} else if (c == "MVFR"){
			var cBullet = '<font color = green> &#x29BF </font >';
		} else if (c == "IFR"){
			var cBullet = '<font color = yellow> &#x29BF </font>';
		} else if (c == "LIFR"){
			var cBullet = '<font color = red> &#x29BF </font>';
		} else {
			var cBullet = '<font color = grey> &#x29BF </font>';
		}		
		
		// Stardard color coding 4 of 8, a-h		
				if (d == "VFR"){
			var dBullet = '<font color = blue> &#x29BF </font>';
		} else if (d == "MVFR"){
			var dBullet = '<font color = green> &#x29BF </font >';
		} else if (d == "IFR"){
			var dBullet = '<font color = yellow> &#x29BF </font>';
		} else if (d == "LIFR"){
			var dBullet = '<font color = red> &#x29BF </font>';
		} else {
			var dBullet = '<font color = grey> &#x29BF </font>';
		}
		
		
		// Stardard color coding 5 of 8, a-h
			   if (e == "VFR"){
			var eBullet = '<font color = blue> &#x29BF </font>';
		} else if (e == "MVFR"){
			var eBullet = '<font color = green> &#x29BF </font >';
		} else if (e == "IFR"){
			var eBullet = '<font color = yellow> &#x29BF </font>';
		} else if (e == "LIFR"){
			var eBullet = '<font color = red> &#x29BF </font>';
		} else {
			var eBullet = '<font color = grey> &#x29BF </font>';
		}		
		
		// Stardard color coding 6 of 8, a-h		
				if (f == "VFR"){
			var fBullet = '<font color = green> &#x29BF </font>';
		} else if (f == "MVFR"){
			var fBullet = '<font color = blue> &#x29BF </font >';
		} else if (f == "IFR"){
			var fBullet = '<font color = red> &#x29BF </font>';
		} else if (f == "LIFR"){
			var fBullet = '<font color = magenta> &#x29BF </font>';
		} else {
			var fBullet = '<font color = grey> &#x29BF </font>';
		}
		
		
		// Stardard color coding 7 of 8, a-h
			   if (g == "VFR"){
			var gBullet = '<font color = blue> &#x29BF </font>';
		} else if (g == "MVFR"){
			var gBullet = '<font color = green> &#x29BF </font >';
		} else if (g == "IFR"){
			var gBullet = '<font color = yellow> &#x29BF </font>';
		} else if (g == "LIFR"){
			var gBullet = '<font color = red> &#x29BF </font>';
		} else {
			var gBullet = '<font color = grey> &#x29BF </font>';
		}		
		
		// Stardard color coding 8 of 8, a-h		
				if (h == "VFR"){
			var hBullet = '<font color = blue> &#x29BF </font>';
		} else if (h == "MVFR"){
			var hBullet = '<font color = green> &#x29BF </font >';
		} else if (h == "IFR"){
			var hBullet = '<font color = yellow> &#x29BF </font>';
		} else if (h == "LIFR"){
			var hBullet = '<font color = red> &#x29BF </font>';
		} else {
			var hBullet = '<font color = grey> &#x29BF </font>';
		}
	} // <-- end config option for color coding SHEEESH!
	
	
		// if cloud_base_ft_agl == undefined then show nothing
        if (WISP[0].sky_condition[0]["$"].cloud_base_ft_agl == undefined){
			WISP[0].sky_condition[0]["$"].cloud_base_ft_agl = "";
		}
		if (WISP[1].sky_condition[0]["$"].cloud_base_ft_agl == undefined){
			WISP[1].sky_condition[0]["$"].cloud_base_ft_agl = "";
		}
		if (WISP[2].sky_condition[0]["$"].cloud_base_ft_agl == undefined){
			WISP[2].sky_condition[0]["$"].cloud_base_ft_agl = "";
		}
		if (WISP[3].sky_condition[0]["$"].cloud_base_ft_agl == undefined){
			WISP[3].sky_condition[0]["$"].cloud_base_ft_agl = "";
		}
		if (WISP[4].sky_condition[0]["$"].cloud_base_ft_agl == undefined){
			WISP[4].sky_condition[0]["$"].cloud_base_ft_agl = "";
		}
		if (WISP[5].sky_condition[0]["$"].cloud_base_ft_agl == undefined){
			WISP[5].sky_condition[0]["$"].cloud_base_ft_agl = "";
		}
		if (WISP[6].sky_condition[0]["$"].cloud_base_ft_agl == undefined){
			WISP[6].sky_condition[0]["$"].cloud_base_ft_agl = "";
		}
		if (WISP[7].sky_condition[0]["$"].cloud_base_ft_agl == undefined){
			WISP[7].sky_condition[0]["$"].cloud_base_ft_agl = "";
		}
		
		// For alignment because I can't do tables yet
		if (WISP[0].station_id == "LIRF"){
			WISP[0].station_id = "LIRF" + " &nbsp ";
		}
		if (WISP[1].station_id == "LIRF"){
			WISP[1].station_id = "LIRF" + " &nbsp ";
		}
		if (WISP[2].station_id == "LIRF"){
			WISP[2].station_id = "LIRF" + " &nbsp ";
		}
		if (WISP[3].station_id == "LIRF"){
			WISP[3].station_id = "LIRF" + " &nbsp ";
		}
		if (WISP[4].station_id == "LIRF"){
			WISP[4].station_id = "LIRF" + " &nbsp ";
		}
		if (WISP[5].station_id == "LIRF"){
			WISP[5].station_id = "LIRF" + " &nbsp ";
		}
		if (WISP[6].station_id == "LIRF"){
			WISP[6].station_id = "LIRF" + " &nbsp ";
		}
		if (WISP[7].station_id == "LIRF"){
			WISP[7].station_id = "LIRF" + " &nbsp ";
		}
		
		//Station and conditions column headers
		var station = document.createElement("div");
		station.classList.add("small", "bright", "station");
        station.innerHTML = "<u>Station</u> &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp <u>Conditions</u>";
		top.appendChild(station);
		 
         // flight_category
		 // station_id
		 // wind_dir_degrees @ wind_speed_kt
		 // visibility in SM
		 // sky condition
		 // temp and dew point in C
        var synopsis = document.createElement("div");
        synopsis.classList.add("xsmall", "bright", "synopsis");
	//	console.log(this.Pilot);
        synopsis.innerHTML = 
						 aBullet + " &nbsp "
					   + WISP[0].station_id + " &nbsp &nbsp "
					   + WISP[0].wind_dir_degrees + "@"
					   + WISP[0].wind_speed_kt + "kt" + " &nbsp "
			+ Math.round(WISP[0].visibility_statute_mi) + "SM" + " &nbsp "
					   + WISP[0].sky_condition[0]["$"].sky_cover
					   + WISP[0].sky_condition[0]["$"].cloud_base_ft_agl + " &nbsp "
			+ Math.round(WISP[0].temp_c) + "/"
			+ Math.round(WISP[0].dewpoint_c) + " &nbsp "
				+ moment(WISP[0].observation_time, "YYYY-MM-DD HH:mm:ss Z").local().format("[(]HH:mm[)]");
        top.appendChild(synopsis);
		 
		 
		var synopsis2 = document.createElement("div");
        synopsis2.classList.add("xsmall", "bright", "synopsis2");
        synopsis2.innerHTML = 
						 bBullet + " &nbsp "
					   + WISP[1].station_id + " &nbsp &nbsp "
					   + WISP[1].wind_dir_degrees + "@"
					   + WISP[1].wind_speed_kt + "kt" + " &nbsp "
			+ Math.round(WISP[1].visibility_statute_mi) + "SM" + " &nbsp "
					   + WISP[1].sky_condition[0]["$"].sky_cover
					   + WISP[1].sky_condition[0]["$"].cloud_base_ft_agl + " &nbsp "
			+ Math.round(WISP[1].temp_c) + "/"
			+ Math.round(WISP[1].dewpoint_c) + " &nbsp "
				+ moment(WISP[1].observation_time, "YYYY-MM-DD HH:mm:ss Z").local().format("[(]HH:mm[)]");
        top.appendChild(synopsis2);
		 
		 
		var synopsis3 = document.createElement("div");
        synopsis3.classList.add("xsmall", "bright", "synopsis3");
        synopsis3.innerHTML = 
						cBullet + " &nbsp "
					   + WISP[2].station_id + " &nbsp &nbsp "
					   + WISP[2].wind_dir_degrees + "@"
					   + WISP[2].wind_speed_kt + "kt" + " &nbsp "
			+ Math.round(WISP[2].visibility_statute_mi) + "SM" + " &nbsp "
					   + WISP[2].sky_condition[0]["$"].sky_cover
					   + WISP[2].sky_condition[0]["$"].cloud_base_ft_agl + " &nbsp "
			+ Math.round(WISP[2].temp_c) + "/"
			+ Math.round(WISP[2].dewpoint_c) + " &nbsp "
				+ moment(WISP[2].observation_time, "YYYY-MM-DD HH:mm:ss Z").local().format("[(]HH:mm[)]");
        top.appendChild(synopsis3);
		 
		 
		var synopsis4 = document.createElement("div");
        synopsis4.classList.add("xsmall", "bright", "synopsis4");
        synopsis4.innerHTML = 
						dBullet + " &nbsp "
					   + WISP[3].station_id + " &nbsp &nbsp "
					   + WISP[3].wind_dir_degrees + "@"
					   + WISP[3].wind_speed_kt + "kt" + " &nbsp "
			+ Math.round(WISP[3].visibility_statute_mi) + "SM" + " &nbsp "
					   + WISP[3].sky_condition[0]["$"].sky_cover
					   + WISP[3].sky_condition[0]["$"].cloud_base_ft_agl + " &nbsp "
			+ Math.round(WISP[3].temp_c) + "/"
			+ Math.round(WISP[3].dewpoint_c) + " &nbsp "
				+ moment(WISP[3].observation_time, "YYYY-MM-DD HH:mm:ss Z").local().format("[(]HH:mm[)]");
        top.appendChild(synopsis4);
		 
		 
		var synopsis5 = document.createElement("div");
        synopsis5.classList.add("xsmall", "bright", "synopsis5");
        synopsis5.innerHTML = 
						eBullet + " &nbsp "
					   + WISP[4].station_id + " &nbsp &nbsp "
					   + WISP[4].wind_dir_degrees + "@"
					   + WISP[4].wind_speed_kt + "kt" + " &nbsp "
			+ Math.round(WISP[4].visibility_statute_mi) + "SM" + " &nbsp "
					   + WISP[4].sky_condition[0]["$"].sky_cover
					   + WISP[4].sky_condition[0]["$"].cloud_base_ft_agl + " &nbsp "
			+ Math.round(WISP[4].temp_c) + "/"
			+ Math.round(WISP[4].dewpoint_c) + " &nbsp "
				+ moment(WISP[4].observation_time, "YYYY-MM-DD HH:mm:ss Z").local().format("[(]HH:mm[)]");
        top.appendChild(synopsis5);
		 
		 
		var synopsis6 = document.createElement("div");
        synopsis6.classList.add("xsmall", "bright", "synopsis6");
        synopsis6.innerHTML = 
						fBullet + " &nbsp "
					   + WISP[5].station_id + " &nbsp &nbsp "
					   + WISP[5].wind_dir_degrees + "@"
					   + WISP[5].wind_speed_kt + "kt" + " &nbsp "
			+ Math.round(WISP[5].visibility_statute_mi) + "SM" + " &nbsp "
					   + WISP[5].sky_condition[0]["$"].sky_cover
					   + WISP[5].sky_condition[0]["$"].cloud_base_ft_agl + " &nbsp "
			+ Math.round(WISP[5].temp_c) + "/"
			+ Math.round(WISP[5].dewpoint_c) + " &nbsp "
				+ moment(WISP[5].observation_time, "YYYY-MM-DD HH:mm:ss Z").local().format("[(]HH:mm[)]");
        top.appendChild(synopsis6);
		 
		 
		var synopsis7 = document.createElement("div");
        synopsis7.classList.add("xsmall", "bright", "synopsis7");
        synopsis7.innerHTML = 
						gBullet + " &nbsp "
					   + WISP[6].station_id + " &nbsp &nbsp "
					   + WISP[6].wind_dir_degrees + "@"
					   + WISP[6].wind_speed_kt + "kt" + " &nbsp "
			+ Math.round(WISP[6].visibility_statute_mi) + "SM" + " &nbsp "
					   + WISP[6].sky_condition[0]["$"].sky_cover
					   + WISP[6].sky_condition[0]["$"].cloud_base_ft_agl + " &nbsp "
			+ Math.round(WISP[6].temp_c) + "/"
			+ Math.round(WISP[6].dewpoint_c) + " &nbsp "
				+ moment(WISP[6].observation_time, "YYYY-MM-DD HH:mm:ss Z").local().format("[(]HH:mm[)]");
        top.appendChild(synopsis7);
		 
		 
		var synopsis8 = document.createElement("div");
        synopsis8.classList.add("xsmall", "bright", "synopsis8");
        synopsis8.innerHTML = 
						hBullet + " &nbsp "
					   + WISP[7].station_id + " &nbsp &nbsp "
					   + WISP[7].wind_dir_degrees + "@"
					   + WISP[7].wind_speed_kt + "kt" + " &nbsp "
			+ Math.round(WISP[7].visibility_statute_mi) + "SM" + " &nbsp "
					   + WISP[7].sky_condition[0]["$"].sky_cover
					   + WISP[7].sky_condition[0]["$"].cloud_base_ft_agl + " &nbsp "
			+ Math.round(WISP[7].temp_c) + "/"
			+ Math.round(WISP[7].dewpoint_c) + " &nbsp "
				+ moment(WISP[7].observation_time, "YYYY-MM-DD HH:mm:ss Z").local().format("[(]HH:mm[)]");
        top.appendChild(synopsis8);
			
		wrapper.appendChild(top);
		
		} // closes else
		
        return wrapper;

	},  // <-- closes the getDom function


	processWISP: function(data) { 
		this.WISP = data[0].METAR;  // take this down to just before what I really need
	//	console.log(this.WISP); // for checking 
		this.loaded = true;
	},
	 
	scheduleCarousel: function() {
    //   console.log("WISP Carousel"); // for checking
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval);
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getWISP();
        }, this.config.updateInterval);
        this.getWISP(this.config.initialLoadDelay);
        var self = this;
    },

    getWISP: function() {
        this.sendSocketNotification('GET_WISP', this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "WISP_RESULT") {
            this.processWISP(payload);
            if (this.rotateInterval == null) {
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },

});