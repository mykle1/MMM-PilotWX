/* Magic Mirror
 *
 * Module: MMM-PilotWX
 *
 * By Mykle1
 * Mod 12/9/17 by Area_49: revised to loop through all Metars returned in the Static mode (variable length).
 *
 */
Module.register('MMM-PilotWX', {
  // Module config defaults.
  defaults: {
    ICAO: 'KJFK,EGLL,UUDD,EDDT,RJAA,ZBAA,LFPG,LIRF', // separated by comma only
    colorCode: 'Standard', // Standard or Alternative color coding
    mode: 'Static', // Static or Rotating display
    sym: '@', // @ or / (Separator for Wind speed and direction)
    measure: 'KM', // SM or KM (KM converted from SM data)
    tempUnits: 'C', // C or F (F converted from C)
    pressureUnits: 'Hg', // mb or hg (mb converted from hg)
    time: 'Zulu', // Zulu or Local (observation time)
    maxWidth: '100%', // 100% for mode: Rotating, approx 300px for mode: Static
    useHeader: false,
    header: '',
    mostRecentPerStation: true,
    useAltHeader: true,
    rotateInterval: 15 * 1000, // seconds
    updateInterval: 10 * 60 * 1000, // every 10 minutes
    animationSpeed: 3000,
    initialLoadDelay: 1875, // of module
    retryDelay: 1500
  },

  getStyles: function () {
    return ['MMM-PilotWX.css']
  },

  // Define start sequence.
  start: function () {
    Log.info('Starting module: ' + this.name)

    // Set locale.
    ;(this.url =
      'https://aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=' +
      this.config.ICAO +
      '&hoursBeforeNow=1'),
      (this.url =
        this.url +
        '&mostRecentForEachStation=' +
        this.config.mostRecentPerStation)
    console.log('URL: ' + this.url)
    this.WISP = []
    this.activeItem = 0
    this.rotateInterval = null
    this.scheduleUpdate()
  },

  getDom: function () {
    function to_fahrenheit (t) {
      return (t * 9) / 5 + 32 // convert celcius to fahrenheit
    }

    function to_km (d) {
      return d * 1.609344 // convert SM to Kilometer
    }

    function to_millibar (p) {
      return p * 33.864 // convert to Mb
    }

    function winds (dir, speed) {
      var winddir = 'unavailable'
      var windspeed = 'unavailable'

      if (dir !== undefined) {
        dirs = dir + ''
        while (dirs.length < 3) dirs = '0' + dirs
        winddir = dirs
      }
      if (speed !== undefined) {
        windspeed = speed + 'KT'
      }
      var winds = 'unavailable'
      if (winddir !== 'unavailable' || windspeed !== 'unavailable') {
        winds = winddir + sym + windspeed
      }
      return winds
    }

    var wrapper = document.createElement('div')
    wrapper.className = 'wrapper'
    wrapper.style.maxWidth = this.config.maxWidth

    if (!this.loaded) {
      wrapper.classList.add('wrapper')
      wrapper.innerHTML = 'Loading PilotWX . .'
      wrapper.className = 'bright light small'
      return wrapper
    }

    if (this.config.useHeader != false) {
      var header = document.createElement('header')
      header.classList.add('xsmall', 'bright', 'header')
      header.innerHTML = this.config.header
      wrapper.appendChild(header)
    }

    /// Begin config option for rotating or static //
    ///////////// First - The rotating data ///////////////////

    if (this.config.mode != 'Static') {
      //	Rotating my data
      var WISP = this.WISP
      var WISPKeys = Object.keys(this.WISP)
      if (WISPKeys.length > 0) {
        if (this.activeItem >= WISPKeys.length) {
          this.activeItem = 0
        }
        var WISP = this.WISP[WISPKeys[this.activeItem]]

        // start config opton for color coding flight category/rules bullet
        if (this.config.colorCode != 'Standard') {
          // Alternative color coding flight category/rules bullet
          if (WISP.flight_category == 'VFR') {
            var bullet = '<font color = green> &#x29BF </font>'
          } else if (WISP.flight_category == 'MVFR') {
            var bullet = '<font color = blue> &#x29BF </font >'
          } else if (WISP.flight_category == 'IFR') {
            var bullet = '<font color = red> &#x29BF </font>'
          } else if (WISP.flight_category == 'LIFR') {
            var bullet = '<font color = magenta> &#x29BF </font>'
          } else {
            var bullet = '<font color = grey> &#x29BF </font>'
          }
        } else {
          // Standard color coding flight category/rules bullet
          if (WISP.flight_category == 'VFR') {
            var bullet = '<font color = blue> &#x29BF </font>'
          } else if (WISP.flight_category == 'MVFR') {
            var bullet = '<font color = green> &#x29BF </font >'
          } else if (WISP.flight_category == 'IFR') {
            var bullet = '<font color = yellow> &#x29BF </font>'
          } else if (WISP.flight_category == 'LIFR') {
            var bullet = '<font color = red> &#x29BF </font>'
          } else {
            var bullet = '<font color = grey> &#x29BF </font>'
          }
        } // <-- end config option for color coding flight category/rules bullet

        // if cloud_base_ft_agl is missing, display nothing
        if (WISP.sky_condition[0]['$'].cloud_base_ft_agl == undefined) {
          WISP.sky_condition[0]['$'].cloud_base_ft_agl = ''
        }

        var top = document.createElement('div')
        top.classList.add('list-row')

        var sym = this.config.sym
        var measure = this.config.measure

        if (this.config.measure != 'KM') {
          var convert =
            Math.round(WISP.visibility_statute_mi) + measure + ' &nbsp &nbsp '
        } else {
          var convert =
            Math.round(to_km(WISP.visibility_statute_mi)) +
            measure +
            ' &nbsp &nbsp '
        }

        if (this.config.tempUnits != 'C') {
          var tempCurr = Math.round(to_fahrenheit(WISP.temp_c))
          var dewCurr = Math.round(to_fahrenheit(WISP.dewpoint_c))
        } else {
          var tempCurr = Math.round(WISP.temp_c)
          var dewCurr = Math.round(WISP.dewpoint_c)
        }

        if (this.config.pressureUnits !== 'Hg') {
          var pressureCurr = Math.round(to_millibar(WISP.altim_in_hg))
        } else {
          var pressureCurr = Math.round(WISP.altim_in_hg + 'e+2') + 'e-2'
        }

        if (this.config.time == 'Zulu') {
          var time = moment
            .utc(WISP.observation_time, 'YYYY-MM-DD HH:mm:ss Z')
            .format('[(]HH:mm[Z)]')
        } else {
          var time = moment(WISP.observation_time, 'YYYY-MM-DD HH:mm:ss Z')
            .local()
            .format('[(]HH:mm[)]')
        }

        var synopsis = document.createElement('div')
        synopsis.classList.add('small', 'bright', 'bottom_bar')

        synopsis.innerHTML =
          bullet +
          ' &nbsp ' +
          WISP.station_id +
          ' &nbsp &nbsp ' +
          winds(WISP.wind_dir_degrees, WISP.wind_speed_kt) +
          ' &nbsp  &nbsp ' +
          convert + // var for KM or SM //
          WISP.sky_condition[0]['$'].sky_cover +
          WISP.sky_condition[0]['$'].cloud_base_ft_agl +
          ' &nbsp &nbsp ' +
          tempCurr +
          '/' +
          dewCurr +
          ' &nbsp &nbsp  ' +
          pressureCurr +
          this.config.pressureUnits +
          ' &nbsp &nbsp  ' +
          time
        //		+ moment(WISP.observation_time, "YYYY-MM-DD HH:mm:ss Z").local().format("[(]HH:mm[)]")

        top.appendChild(synopsis)

        wrapper.appendChild(top)
      } // <-- closes rotation loop

      ////////////////// ELSE - the Static data (Below) //////////////
    } else {
      var Plength = Object.keys(this.WISP).length
      var Pindex = 0
      var Fcolor_even = '<font color = white>'
      var Fcolor_odd = '<font color = #33FFEE>'

      function isEven (n) {
        return n == parseFloat(n) ? !(n % 2) : void 0 // true if even number or zero
      }

      var top = document.createElement('div')
      top.classList.add('list-row')

      var WISP = this.WISP

      //console.log (WISP)

      //Station and conditions column headers if true in config useAltHeader
      if (this.config.useAltHeader != false) {
        var station = document.createElement('div')
        station.classList.add('small', 'bright', 'station')
        station.innerHTML =
          '<u>Station</u> &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp <u>Conditions</u>'
        top.appendChild(station)
      }

      var table = document.createElement('table')
      table.className = 'small'

      ///loop through all METAR items here
      while (Pindex < Plength) {
        // vars for color coding flight_category bullets
        var a = WISP[Pindex].flight_category

        // start config opton for color coding
        if (this.config.colorCode != 'Standard') {
          // Alternative color coding
          if (a == 'VFR') {
            var aBullet = '<font color = green> &#x29BF </font>'
          } else if (a == 'MVFR') {
            var aBullet = '<font color = blue> &#x29BF </font >'
          } else if (a == 'IFR') {
            var aBullet = '<font color = red> &#x29BF </font>'
          } else if (a == 'LIFR') {
            var aBullet = '<font color = magenta> &#x29BF </font>'
          } else {
            var aBullet = '<font color = grey> &#x29BF </font>'
          }
        } else {
          // continue config option for color coding

          // Stardard color coding
          if (a == 'VFR') {
            var aBullet = '<font color = blue> &#x29BF </font>'
          } else if (a == 'MVFR') {
            var aBullet = '<font color = green> &#x29BF </font >'
          } else if (a == 'IFR') {
            var aBullet = '<font color = yellow> &#x29BF </font>'
          } else if (a == 'LIFR') {
            var aBullet = '<font color = red> &#x29BF </font>'
          } else {
            var aBullet = '<font color = grey> &#x29BF </font>'
          }
        } // <-- end config option for color coding SHEEESH!

        // if cloud_base_ft_agl == undefined then show nothing
        if (WISP[Pindex].sky_condition[0]['$'].cloud_base_ft_agl == undefined) {
          WISP[Pindex].sky_condition[0]['$'].cloud_base_ft_agl = ''
        }

        var sym = this.config.sym
        var measure = this.config.measure

        // conversion from Statute Miles(SM)(data) to Kilometers(KM)
        // 1 statute mile = 1.609344km
        // Rounded

        if (this.config.measure !== 'KM') {
          var convert0 =
            Math.round(WISP[Pindex].visibility_statute_mi) + measure
        } else {
          var convert0 =
            Math.round(to_km(WISP[Pindex].visibility_statute_mi)) + measure
        }

        if (this.config.tempUnits !== 'C') {
          var tempCurr = Math.round(to_fahrenheit(WISP[Pindex].temp_c))
          var dewCurr = Math.round(to_fahrenheit(WISP[Pindex].dewpoint_c))
        } else {
          var tempCurr = Math.round(WISP[Pindex].temp_c)
          var dewCurr = Math.round(WISP[Pindex].dewpoint_c)
        }

        if (this.config.pressureUnits !== 'Hg') {
          var pressureCurr = Math.round(to_millibar(WISP[Pindex].altim_in_hg))
        } else {
          var pressureCurr =
            Math.round(WISP[Pindex].altim_in_hg + 'e+2') + 'e-2'
        }

        if (this.config.time == 'Zulu') {
          var time0 = moment
            .utc(WISP[Pindex].observation_time, 'YYYY-MM-DD HH:mm:ss Z')
            .format('[(]HH:mm[Z)]')
        } else {
          var time0 = moment(
            WISP[Pindex].observation_time,
            'YYYY-MM-DD HH:mm:ss Z'
          )
            .local()
            .format('[(]HH:mm[)]')
        }

        // flight_category
        // station_id
        // wind_dir_degrees @ wind_speed_kt
        // visibility in SM
        // sky condition
        // temp and dew point in C
        // observation time

        if (isEven(Pindex)) {
          var Fcolor = 'dataeven'
        } else {
          var Fcolor = 'dataodd'
        }

        var row = document.createElement('tr')
        if (this.config.colored) {
          row.className = 'colored'
        }
        table.appendChild(row)

        var bulletCell = document.createElement('td')
        bulletCell.className = 'xsmall bright bullet'
        bulletCell.innerHTML = aBullet
        row.appendChild(bulletCell)

        var staCell = document.createElement('td')
        staCell.className = 'xsmall bright ' + Fcolor
        staCell.innerHTML = WISP[Pindex].station_id
        console.log('Creating row for ' + WISP[Pindex].station_id)
        row.appendChild(staCell)

        var windCell = document.createElement('td')
        windCell.className = 'xsmall bright ' + Fcolor
        windCell.innerHTML = winds(
          WISP[Pindex].wind_dir_degrees,
          WISP[Pindex].wind_speed_kt
        )
        row.appendChild(windCell)

        var visCell = document.createElement('td')
        visCell.className = 'xsmall bright ' + Fcolor
        visCell.innerHTML = convert0
        row.appendChild(visCell)

        var skycovCell = document.createElement('td')
        skycovCell.className = 'xsmall bright ' + Fcolor
        skycovCell.innerHTML =
          WISP[Pindex].sky_condition[0]['$'].sky_cover +
          WISP[Pindex].sky_condition[0]['$'].cloud_base_ft_agl
        row.appendChild(skycovCell)

        var temperatureCell = document.createElement('td')
        temperatureCell.className = 'xsmall bright ' + Fcolor
        temperatureCell.innerHTML = tempCurr + '/' + dewCurr
        row.appendChild(temperatureCell)

        var altimCell = document.createElement('td')
        altimCell.className = 'xsmall bright ' + Fcolor
        altimCell.innerHTML = +pressureCurr + this.config.pressureUnits
        row.appendChild(altimCell)

        var timeCell = document.createElement('td')
        timeCell.className = 'xsmall bright ' + Fcolor
        timeCell.innerHTML = time0
        row.appendChild(timeCell)

        top.appendChild(table)

        Pindex++
      }
      //end loop
      wrapper.appendChild(top)
    } // closes else

    return wrapper
  }, // <-- closes the getDom function

  //	roundToTwo: function(num) {
  //    return +(Math.round(num + "e+2")  + "e-2");
  //	},

  /////  Add this function to the modules you want to control with voice //////

  notificationReceived: function (notification, payload) {
    if (notification === 'HIDE_PILOTS') {
      this.hide(1000)
      this.updateDom(300)
    } else if (notification === 'SHOW_PILOTS') {
      this.show(1000)
      this.updateDom(300)
    }
  },

  processWISP: function (data) {
    this.WISP = data[0].METAR // take this down to just before what I really need
    console.log(this.WISP) // for checking
    this.loaded = true
  },

  scheduleCarousel: function () {
    //   console.log("WISP Carousel"); // for checking
    this.rotateInterval = setInterval(() => {
      this.activeItem++
      this.updateDom(this.config.animationSpeed)
    }, this.config.rotateInterval)
  },

  scheduleUpdate: function () {
    setInterval(() => {
      this.getWISP()
    }, this.config.updateInterval)
    this.getWISP(this.config.initialLoadDelay)
    var self = this
  },

  getWISP: function () {
    this.sendSocketNotification('GET_WISP', this.url)
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'WISP_RESULT') {
      this.processWISP(payload)
      if (this.rotateInterval == null) {
        this.scheduleCarousel()
      }
      this.updateDom(this.config.animationSpeed)
    }
    this.updateDom(this.config.initialLoadDelay)
  }
})
