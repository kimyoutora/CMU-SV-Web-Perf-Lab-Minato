// home.js
// document.write('');
e9 = new Object();
e9.size = "160x600";
//-->
if(typeof showDisplayAd != 'undefined' && showDisplayAd != null && showDisplayAd == true) {
  document.write('\n<script type=\"text/javascript\" src=\"../js/tags.js\"><\/script>');document.write('\n');
}

// displayAd.js
var e9;
if (e9.displayAdFlag == true) {
  e9.displayAd();
}

// feed.js
$(function() {
    $('#mainContent div:not(:first)').hide();

    $('ul#tabnav li a').click(function() {
        $('ul#tabnav li a').removeClass('selected');
        $(this).addClass('selected');

        var href = $(this).attr('href');
        var split = href.split('#');

        $('#mainContent div').hide();
        $('#mainContent div#' + split[1]).fadeIn();

        return false;
    });
});

// slideshow.js
var $$ = $.fn;

$$.extend({
  SplitID : function()
  {
    return this.attr('id').split('-').pop();
  },

  Slideshow : {
    Ready : function()
    {
      $('div.tmpSlideshowControl')
        .hover(
          function() {
            $(this).addClass('tmpSlideshowControlOn');
          },
          function() {
            $(this).removeClass('tmpSlideshowControlOn');
          }
        )
        .click(
          function() {
            $$.Slideshow.Interrupted = true;

            $('div.tmpSlide').hide();
            $('div.tmpSlideshowControl').removeClass('tmpSlideshowControlActive');

            $('div#tmpSlide-' + $(this).SplitID()).show()
            $(this).addClass('tmpSlideshowControlActive');
            
            $$.Slideshow.Counter = parseInt($(this).SplitID());
            setTimeout('$$.Slideshow.Resume();', 5000); // Resume after 5 seconds  
          }
        );

      this.Counter = 1;
      this.Interrupted = false;

      this.Transition();
    },

    Resume : function()
    {
      this.Interrupted = false;  
      this.Transition();      
    },

    Transition : function()
    {
      if (this.Interrupted) {
        return;
      }

      this.Last = this.Counter - 1;

      if (this.Last < 1) {
        this.Last = 5;
      }

      $('div#tmpSlide-' + this.Last).fadeOut(1000);
        
      $('div#tmpSlide-' + $$.Slideshow.Counter).fadeIn(
        1000,
        function() {
          $('div#tmpSlideshowControl-' + $$.Slideshow.Last).removeClass('tmpSlideshowControlActive');
          $('div#tmpSlideshowControl-' + $$.Slideshow.Counter).addClass('tmpSlideshowControlActive');
          

          $$.Slideshow.Counter++;

          if ($$.Slideshow.Counter > 5) {
            $$.Slideshow.Counter = 1;
          }

          setTimeout('$$.Slideshow.Transition();', 5000);
        }
      );
    }
  }
});

$(document).ready(
  function() {
    $$.Slideshow.Ready();
  }
);


// flashwrite_1_2.js
// function dclkToObject(id) {
//    if(document.layers){
//      return (document.layers[id])?eval(document.layers[id]):null;
//    }
//    else if(document.all && !document.getElementById){
//      return (eval("window."+id))?eval("window."+id):null;
//    }
//    else if(document.getElementById && document.body.style) {
//      return (document.getElementById(id))?eval(document.getElementById(id)):null;
//    }
//  }
//   
// function dclkFlashWrite(string){
//   document.write(string);
//   }
// 
// function dclkFlashInnerHTML(htmlElementId,code){
//   var x=dclkToObject(htmlElementId);
//   if(x){
//     if(document.getElementById||document.all){
//       x.innerHTML='';
//       x.innerHTML=code;
//       }
//     else if(document.layers){
//       x.document.open();
//       x.document.write(code);
//       x.document.close();
//       }
//     }
//   }

// gn_tracking.js
/**
	gn_tracking uses an object literal notation: configuration objects sit snugly inside it, 
	alongside the various functions it exposes. 

	In reality, init() is the only function you should need to access directly 

	@namespace gn_tracking
*/
var gn_tracking = {

	/** Internal config object; holds a Google string, a quantcast CSV string, and a ComScore object */
	config: {
		google:		'',
		quantcast:	'',
		comscore:	''		
	},

	/** Internal flag store;, used mostly to kill successive calls to init */
	flags: { loaded: false },

	/** Accepts a config param, and then for each item in the config object, calls its matching function
		@param {Object} config The config object; see the internal ga_tracking.config object for a reference to its structure
	*/
	init: function(config) {
		var that = this;

		// If our init flag has been triggered, quit now
		if (typeof this.flags.initialised != 'undefined' && this.flags.initialised) {
			return false;
		// Else, set the flag and continue
		} else {
			this.flags.initialised = true;
		}

		// Overwrite our config object with the passed version
		if (config) this.config = config;

		// For each element in the config object, inspect gn_tracking for a function with a matching name and trigger it
		for (var prop in this.config) {
			if (!this.is_empty(this.config[prop]) && typeof this[prop] == 'function') {
				this[prop]();
			}
		}
	},

	/** Loads the required GA script, and queues a callback to be fired when the script loads */
	google: function() {
		var that = this,
			cfg = this.config;

		// Init our google tracking flags
		this.flags.google = false;

		// If we have a CSV of GA tags...
		if (typeof(cfg.google) == 'string') {
			// Split it, and populate the google config object
			var ids = cfg.google.replace(/\s/g,'').split(',');
			cfg.google = ids;

		} else if (typeof cfg.google == 'object') {
			cfg.google = [ cfg.urchin, cfg.ga ]; // For backwards compatability
		}
		
		// If we have a GA request, 
		if (cfg.google.length) {

			// Init, or grab the global _gaq variable and pop each ID onto the queue along with a "track pageview" command
			if (!window._gaq) window._gaq = [];

			for (var i = 0; i < cfg.google.length; i++) {
				_gaq.push(['_setAccount', cfg.google[i] ]);
				_gaq.push(['_trackPageview']);
			}

			// Then request the script and Update gn_tracking with our success flag
			this.add_script(
				('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js',
				function() { that.flags.google = true; }
			);
		}
	},


	/** Loads the required quantcast script, and queues a callback to be fired when the script loads */
	quantcast: function() {
		var that = this;

		this.add_script(
			"http://edge.quantserve.com/quant.js",
			function() {

				// The presense of _qacct or _qoptions means that this page is already using quantcast tags; abort
				if (typeof _qacct != 'undefined' && !that.is_empty(_qacct)) return false;
				if (typeof _qoptions != 'undefined' && !that.is_empty(_qoptions)) return false;

				// Split our CSV config string and call Quantserve() with each value
				var ids = that.config.quantcast.split(',');
				for (var i = 0; i < ids.length; i++) {
					_qoptions={qacct: ids[i]};
					quantserve();
				}

				// Update gn_tracking with our success flag
				that.flags.quantcast = true;
			}
		);
	},


	/** Loads the required ComScore script, and queues a callback to be fired when the script loads */
	comscore: function() {
		var that = this;

		this.add_script(
			"js/beacon.js",
			function() {
				// Standard Comscore payload
				COMSCORE.beacon(that.config.comscore);

				// Update gn_tracking with our success flag
				that.flags.comscore = true;
			}
		);
	},


	/** Aaah, the big deal here, add_script asyncronously adds a script object to the head, monitors its load status, 
		and then queues a callback to be executed when it's complete
		@param {String}		url			Script to be attached to the page
		@param {Function}	callback	Function to be executed when the script is fully loaded
	*/
	add_script: function(url, callback) {
		var that = this,
			script = document.createElement("script"),
			head = document.getElementsByTagName('head')[0];

		script.src = url;

		script.onload = script.onreadystatechange = function(){
			if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
				if (typeof callback == 'function') { callback(); }
				script.onload = script.onreadystatechange = null; // Handle memory leak in IE
			}
		};

		head.appendChild(script);
	},


	/**	Accepts a variable and attempts to determine if it's truly 'empty'. Mostly used as Object's length property lies 
		@param value Any primitive or basic datatype (string, number, boolan, array, object, etc.)
	*/
	is_empty: function(value) {
		switch (typeof(value)) {
			case 'object': 
				// If this object has any properties directly defined on it... well, it's not empty then, is it?
				for(var prop in value) {
					if (value.hasOwnProperty(prop)) return false;
				}

				return true;
				break;

			// Strings and arrays are easy, just count the values
			case 'string':
			case 'array':
				if (value.length > 0) {
					return false;
				} else {
					return true;
				}

				break;

			// Most other datatypes, by their existence, can't be empty; return false
			default: 
				return false;	
				break;
		}
	}
};

// 4892_US.php
// 2011-6-30 21:0:2 EST
f330044=1;f330040=1;f349600=1;f349602=1;f349604=1;f361350=1;f361352=1;f361354=1;f364792=1;f365426=1;f365428=1;f365980=1;f330050=1;f330046=1;f349630=1;f361432=1;f361430=1;f361428=1;f364802=1;f365448=1;f365446=1;f366016=1;f330056=1;f330052=1;f349628=1;f361426=1;f361424=1;f361422=1;f364800=1;f365444=1;f365442=1;f365992=1;f330082=0;f330078=0;f349616=0;f361414=0;f361412=0;f361410=0;f364796=0;f365436=0;f365434=0;f365988=0;gn_tracking.init({google: '',comscore: {},quantcast:''});

// // sponsor.js
// var cpmstar_src = document.getElementById('cpmstar_dynamicEditorial');
// 
// //1st editorial
// var cpmstar_li1 = document.createElement('li');
// var maxLength = 18; //5 chars
// var cpmStarTitleString = cpmStar.getTitle();
// if (cpmStarTitleString .length > maxLength) {
//   cpmStarTitleString  = cpmStarTitleString.substr(0, maxLength - 3) + '...';
// }
// cpmstar_li1.innerHTML = "<a class='gameThumbWrapper thumb1' href='"+cpmStar.getLink()+"'> <span class='gameThumbImg'><img src='"+cpmStar.getImageUrl(110,74)+"' width='110' height='74'></span> <span class='gameTitle'>"+cpmStarTitleString+"</span> </a>";
// cpmstar_src.parentNode.insertBefore(cpmstar_li1, cpmstar_src);
// cpmStar.nextAd();
// //2nd editorial
// var cpmstar_li2 = document.createElement('li');
// var maxLength = 18; //5 chars
// var cpmStarTitleString = cpmStar.getTitle();
// if (cpmStarTitleString .length > maxLength) {
//   cpmStarTitleString  = cpmStarTitleString.substr(0, maxLength - 3) + '...';
// }
// cpmstar_li2.innerHTML = "<a class='gameThumbWrapper thumb2' href='"+cpmStar.getLink()+"'> <span class='gameThumbImg'><img src='"+cpmStar.getImageUrl(110,74)+"' width='110' height='74'></span> <span class='gameTitle'>"+cpmStarTitleString+"</span> </a>";
// cpmstar_src.parentNode.insertBefore(cpmstar_li2, cpmstar_src);
// cpmStar.nextAd();
// //3rd editorial
// var cpmstar_li3 = document.createElement('li');
// var maxLength = 18; //5 chars
// var cpmStarTitleString = cpmStar.getTitle();
// if (cpmStarTitleString .length > maxLength) {
//   cpmStarTitleString  = cpmStarTitleString.substr(0, maxLength - 3) + '...';
// }
// cpmstar_li3.innerHTML = "<a class='gameThumbWrapper thumb3' href='"+cpmStar.getLink()+"'> <span class='gameThumbImg'><img src='"+cpmStar.getImageUrl(110,74)+"' width='110' height='74'></span> <span class='gameTitle'>"+cpmStarTitleString+"</span> </a>";
// cpmstar_src.parentNode.insertBefore(cpmstar_li3, cpmstar_src);
// cpmStar.nextAd();
// //4th editorial
// var cpmstar_li4 = document.createElement('li');
// var maxLength = 18; //5 chars
// var cpmStarTitleString = cpmStar.getTitle();
// if (cpmStarTitleString .length > maxLength) {
//   cpmStarTitleString  = cpmStarTitleString.substr(0, maxLength - 3) + '...';
// }
// cpmstar_li4.innerHTML = "<a class='gameThumbWrapper thumb4' href='"+cpmStar.getLink()+"'> <span class='gameThumbImg'><img src='"+cpmStar.getImageUrl(110,74)+"' width='110' height='74'></span> <span class='gameTitle'>"+cpmStarTitleString+"</span> </a>";
// cpmstar_src.parentNode.insertBefore(cpmstar_li4, cpmstar_src);
// cpmStar.nextAd();