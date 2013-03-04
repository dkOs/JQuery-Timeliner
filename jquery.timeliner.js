// ***************************************************************
// author : Ben Dakhlia
//
// History
//      2013.01.10 KDB First version of the plugin
//      2013.03.03 KBD First version of the plugin
//
// ***************************************************************


(function ($) {
    $.fn.timeliner = function (options) {

        var defaults = {
            nbrLines: 2,
            xmlcontent: "",
            colors : [
                '#142A06',
                '#437E4C',
                '#869956',
                '#B08F42',
                '#B46839',
                '#A43941',
                '#BB426B',
                '#8A2F5C',
                '#6D416D',
                '#413264',
                '#5690A5',
                '#2E849D',
                '#276686',
                '#23436E'
            ],
            globalHeight: 100,
            globalWitdh: 800,
            globalContainerBgcolor: "#FFF",
            globalBgcolor: "#262A2B",
            tlBgcolor: "#FFF",
            tlHeight: 20,
            itemWidth : 20,
            itemHeight : 20,
            itemRadius : 5,
            itemRadiusborder:3,
            itemcolor: '#FFF',
            itemBgcolor: '#24D3FF',
            slotBgcolor:'#FFF',
            titleMsg: 'TimeLine',
            titlePosition: 'left',
            titleMargin: 20,
            titleFontSize: 40,
            annimation: false,
            annimationInterval: 1000,
            annimationSpeed: 'fast'
        };
        var options = $.extend(defaults, options);

        return this.each(function () {
            obj = $(this);

            // DEFAULT SETTINGS    
            var nbrTilesPerLine = Math.floor(2000 / options.imgWidth);
            var currentId = $(this).attr('id');
            var dim_globalcontainer_bgcolor = options.globalContainerBgcolor;
            var dim_global_height = options.globalHeight;
            var dim_global_bgcolor = options.globalBgcolor;
            var dim_tl_height = options.tlHeight; // default 20 px
            var dim_tl_witdh = options.globalWitdh; // default 400 px
            var dim_tl_witdhSides = 100; // default 400 px
            var dim_tl_radius = Math.floor(dim_tl_height / 2);
            var dim_tl_radiusborder = 10;
            var dim_tl_witdhfactor = Math.floor(dim_tl_witdh / 100)
            var dim_tl_bgcolor = options.tlBgcolor;
            var dim_Item_width = options.itemWidth;
            var dim_Item_height = options.itemHeight;
            var dim_Item_radius = options.itemRadius;
            var dim_Item_radiusborder = options.itemRadiusborder;
            var dim_Item_bgcolor = options.itemBgcolor;
            var dim_Slot_bgcolor = options.slotBgcolor;

            var monthNames = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];

            // ************************************************************************
            // HELPERS
            // todo lets try to put them out of the main code
            //
            function nbrIdenticalItemInArray(myArray, val) {
                var results = new Array();

                for (var j = 0; j < myArray.length; j++) {
                    var key = myArray[j].toString(); // make it an associative array
                    if (!results[key]) {
                        results[key] = 1
                    } else {
                        results[key] = results[key] + 1;
                    }
                }
                return results[val]
            }

            var DateHelper = {

                DiffinDays: function (d1, d2) {
                    var t2 = d2.getTime();
                    var t1 = d1.getTime();

                    return parseInt((t2 - t1) / (24 * 3600 * 1000));
                },

                DiffinWeeks: function (d1, d2) {
                    var t2 = d2.getTime();
                    var t1 = d1.getTime();

                    return parseInt((t2 - t1) / (24 * 3600 * 1000 * 7));
                },

                DiffinMonths: function (d1, d2) {
                    var d1Y = d1.getFullYear();
                    var d2Y = d2.getFullYear();
                    var d1M = d1.getMonth();
                    var d2M = d2.getMonth();

                    return (d2M + 12 * d2Y) - (d1M + 12 * d1Y);
                },

                inYears: function (d1, d2) {
                    return d2.getFullYear() - d1.getFullYear();
                },

                firstMonday: function (month, year) {

                    var d = new Date(year, month, 1, 0, 0, 0, 0)
                    var day = 0

                    // check if first of the month is a Sunday, if so set date to the second
                    if (d.getDay() == 0) {
                        day = 2
                        d = d.setDate(day)
                        d = new Date(d)
                    }
                    else if (d.getDay() != 1) {
                        day = 9 - (d.getDay())
                        d = d.setDate(day)
                        d = new Date(d)
                    }
                    return d
                },

            }

            // ******************************************************************
            // load xml file
            var EventList = [];
            if (window.DOMParser) {
                parser = new DOMParser();
                xmlDoc = parser.parseFromString(options.xmlcontent, "text/xml");
            }
            else // Internet Explorer
            {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = false;
                xmlDoc.loadXML(options.xmlcontent);
            }

            //var ss = xmlDoc.getElementsByTagName("events")[0].childNodes.length;
            for (var j = 0; j < xmlDoc.getElementsByTagName("events")[0].childNodes.length; j++) {
                //console.log(" " + xmlDoc.getElementsByTagName("events")[0].childNodes[j].tagName);
                if (xmlDoc.getElementsByTagName("events")[0].childNodes[j].tagName == 'event') {

                    var myObject2 = new Object();
                    myObject2.dd = 0;
                    myObject2.ddPercent = 0;
                    myObject2.ddLevel = 1;

                    var eventNode = xmlDoc.getElementsByTagName("events")[0].childNodes[j];
                    for (var i = 0; i < eventNode.childNodes.length; i++) {
                        if (eventNode.childNodes[i].tagName == 'title') {
                            myObject2.name = eventNode.childNodes[i].textContent;
                            //console.log("title: " + eventNode.childNodes[i].textContent);
                        }
                        if (eventNode.childNodes[i].tagName == 'date') {
                            myObject2.date = new Date(eventNode.childNodes[i].textContent);
                            //console.log("date: " + eventNode.childNodes[i].textContent);
                        }
                        if (eventNode.childNodes[i].tagName == 'description') {
                            myObject2.description = eventNode.childNodes[i].textContent;
                        }
                        if (eventNode.childNodes[i].tagName == 'imageurl') {
                            myObject2.imageurl = eventNode.childNodes[i].textContent;
                        }
                        if (eventNode.childNodes[i].tagName == 'url') {
                            myObject2.url = eventNode.childNodes[i].textContent;
                        }
                    }

                    EventList.push(myObject2);
                }
            }


            // ******************************************************************
            // Get Minimum and Max
            var dateMin = EventList[0].date;
            var dateMax = EventList[0].date;
            for (var i = 0; i < EventList.length; i++) {
                if (dateMax < EventList[i].date) {
                    dateMax = EventList[i].date;
                }
                if (dateMin > EventList[i].date) {
                    dateMin = EventList[i].date;
                }
            }

            // ******************************************************************
            // Build the MONTHLY MARKERS
            var DayList = [];
            var dateMinGlobal = new Date(dateMin.getFullYear(), dateMin.getMonth(), 1);
            var nextMonday = new Date(dateMinGlobal);
            DayList.push(new Date(nextMonday));
            while (nextMonday < dateMax) {
                nextMonday.setMonth(nextMonday.getMonth() + 1);
                nextMonday.setDate(1);
                DayList.push(new Date(nextMonday));
                //log('nextMonday : ' + nextMonday + ': ' + nextMonday.getDate() + '<br>');
            }
            // add the last one
            nextMonday.setDate(nextMonday.getMonth() + 1);
            var dateMaxGlobal = new Date(nextMonday);
            //DayList.push(new Date(nextMonday));

            //log('dates.length: ' + dates.length + '  DayList.length: ' + DayList.length + '<br>');
            var maxdif = DateHelper.DiffinDays(dateMinGlobal, dateMaxGlobal);
            //log("maxdif  " + maxdif + '<br>');
            //document.write("<br />Number of <b>weeks</b> since "+dString+": "+DateDiff.inWeeks(d1, d2));
            //document.write("<br />Number of <b>months</b> since "+dString+": "+DateDiff.inMonths(d1, d2));
            //document.write("<br />Number of <b>years</b> since "+dString+": "+DateDiff.inYears(d1, d2));


            // ***************************************************************
            // BUILD THE TIMELINE SLOTS

            var DayListdd = [];
            var DayListddPercent = [];
            for (var i2 = 0; i2 < DayList.length; i2++) {
                DayListdd[i2] = DateHelper.DiffinDays(dateMinGlobal, DayList[i2]);
                DayListddPercent[i2] = Math.floor(100 * DayListdd[i2] / maxdif);
            }

            for (var i = 0; i < EventList.length; i++) {
                EventList[i].dd = DateHelper.DiffinDays(dateMinGlobal, EventList[i].date);
                EventList[i].ddPercent = Math.floor(100 * EventList[i].dd / maxdif);
                //ddLevel[i] = nbrIdenticalItemInArray(ddPercent, ddPercent[i]);
                //log(i + ': ' + dd[i] + ' ' + ddPercent[i] + '% ' + ddLevel[i] + '<br>');
            }

            


            // ***************************************************************
            // BUILD THE TIME LINE
            // SET THE TIME LINE BACKGROUND
            //
            var divhtml = "<div id='DIVTimeBgGeneral'></div>";
            obj.append(divhtml);
            $('#DIVTimeBgGeneral').css('background-color', dim_globalcontainer_bgcolor);
            $('#DIVTimeBgGeneral').css('width', (dim_tl_witdh + 2 * dim_tl_witdhSides) + 'px');
            $('#DIVTimeBgGeneral').css('height', dim_global_height + 'px');
            $('#DIVTimeBgGeneral').css('-moz-border-radius', dim_tl_radius + 'px');
            $('#DIVTimeBgGeneral').css('border-radius', dim_tl_radius + 'px');
            $('#DIVTimeBgGeneral').css('border', dim_tl_radiusborder + 'px');
            $('#DIVTimeBgGeneral').css('position', 'relative');

            // SET THE TIME LINE BACKGROUND
            var divhtmlbg01 = "<div id='DIVTimeBg00'></div>";
            $(divhtmlbg01).appendTo("#DIVTimeBgGeneral");
            //$('#DIVTimeBg00').css('background-image', '-webkit-gradient(radial,50% 50, 1,50% 50, 400, from(rgba(255, 255, 255, 0.7)),to(rgba(255, 255, 255, 0)))');
            //$('#DIVTimeBg00').css('background-repeat', 'no-repeat');
            $('#DIVTimeBg00').css('width', '100%');
            $('#DIVTimeBg00').css('height', dim_tl_height + 'px');
            $('#DIVTimeBg00').css('position', 'relative');
            $('#DIVTimeBg00').css('left', '0px');
            $('#DIVTimeBg00').css('top', '80px');
            $('#DIVTimeBg00').addClass("bgradiant");

           

            // SET THE TIME LINE BACKGROUND
            var divhtmlbg = "<div id='DIVTimeBg'></div>";
            $(divhtmlbg).appendTo("#DIVTimeBgGeneral");
            $('#DIVTimeBg').css('background-color', dim_global_bgcolor);
            $('#DIVTimeBg').css('width', dim_tl_witdh + 'px');
            $('#DIVTimeBg').css('height', dim_tl_height + 'px');
            $('#DIVTimeBg').css('-moz-border-radius', dim_tl_radius + 'px');
            $('#DIVTimeBg').css('border-radius', dim_tl_radius + 'px');
            $('#DIVTimeBg').css('border', dim_tl_radiusborder + 'px');
            $('#DIVTimeBg').css('position', 'relative');
            $('#DIVTimeBg').css('left', '10%');
            $('#DIVTimeBg').css('top', '60px');


            // -------------------------------------------------------
            // SET the zoom level
            // the WIDTH : dim_tl_witdh 
            // the MAX NBR OF DAY : maxdif
            //
            var ratio_pixel_per_day = 1;
            if (maxdif > 0) {
                ratio_pixel_per_day = dim_tl_witdh / maxdif;
            }
            // 
            //log('ratio_pixel_per_day: ' + ratio_pixel_per_day + '<br>');
            var periodicMax = 4;
            if (ratio_pixel_per_day > 3) {
                periodicMax = 0;
            }
            else {
                if (ratio_pixel_per_day > 1 && ratio_pixel_per_day <= 3) {
                    periodicMax = 2;
                }
            }


            var periodicIndex = 0;
            for (var i = 0; i < DayList.length; i++) {
                //if (periodicIndex < periodicMax) {
                //    periodicIndex = periodicIndex + 1;
                //}
                //else {
                //    periodicIndex = 0;
                //}

                //if (periodicIndex == 0) {
                //var MonthFormat = DayList[i].getDate() + "/" + DayList[i].getMonth();
                var divhtmlSlot = "<div id='DIVTimeItemSlot" + i + "'>" + monthNames[DayList[i].getMonth()] + "</div>";
                $(divhtmlSlot).appendTo("#DIVTimeBg");

                $('#DIVTimeItemSlot' + i).css('font-family', 'Segoe UI Light, Segoe WP Light, Segoe UI, Helvetica, sans-serif');
                $('#DIVTimeItemSlot' + i).css('left', DayListddPercent[i] * dim_tl_witdhfactor + 'px');
                $('#DIVTimeItemSlot' + i).css('top', '-40px');
                $('#DIVTimeItemSlot' + i).css('color', '#AAAAAA');
                $('#DIVTimeItemSlot' + i).css('font-size', '30px');
                $('#DIVTimeItemSlot' + i).css('background-color', dim_Slot_bgcolor);
                $('#DIVTimeItemSlot' + i).css('width', '1px');
                $('#DIVTimeItemSlot' + i).css('height', '60px');
                $('#DIVTimeItemSlot' + i).css('position', 'absolute');
                //}
            }


            // -------------------------------------------------------
            // REPRESENT THE EVENT DOTS
            //    
            for (var i = 0; i < EventList.length; i++) {
                var divhtml = "<div id='DIVTimeItem" + i + "' class='tooltip' >" + i + "<span class='custom critical'><em>" + EventList[i].name + "</em>" + EventList[i].description + "</span></div>";
                //var divhtml = "<div id='DIVTimeItem" + i + "'><a class='tooltip' href='#'>" + i + "<span class='custom critical'><em>" + EventList[i].name + "</em>" + EventList[i].description + "</span></a></div>";
                //var divhtml = "<div id='DIVTimeItem" + i + "'>" + EventList[i].name + "</div>";
                $(divhtml).appendTo("#DIVTimeBg");

                //log(i + ': ' + dd[i] + ' ' + Math.floor(100 * dd[i] / maxdif) + '% ' + ddLevel[i] + '<br>');
                $('#DIVTimeItem' + i).css('font-family', 'Segoe UI Light, Segoe WP Light, Segoe UI, Helvetica, sans-serif');
                $('#DIVTimeItem' + i).css('left', EventList[i].ddPercent * dim_tl_witdhfactor + 'px');
                $('#DIVTimeItem' + i).css('top', EventList[i].ddLevel * dim_Item_height + 'px');
                $('#DIVTimeItem' + i).css('background-color', dim_Item_bgcolor);
                $('#DIVTimeItem' + i).css('color', options.itemcolor);
                $('#DIVTimeItem' + i).css('width', dim_Item_width + 'px');
                $('#DIVTimeItem' + i).css('height', dim_Item_height + 'px');
                $('#DIVTimeItem' + i).css('position', 'absolute');
                $('#DIVTimeItem' + i).css('-moz-border-radius', dim_Item_radius + 'px');
                $('#DIVTimeItem' + i).css('border-radius', dim_Item_radius + 'px');
                $('#DIVTimeItem' + i).css('border-width', dim_Item_radiusborder + 'px');
                $('#DIVTimeItem' + i).css('border-color', dim_Item_bgcolor);
                $('#DIVTimeItem' + i).css('text-align', 'center');
                //$('#DIVTimeItem' + i).addClass("OverBlock");

            }

            // Add the annimation of the tiles changing
            if (options.annimation) {
                var tid = setInterval(mycode, options.annimationInterval);
                function mycode() {
                    var i = Math.floor((Math.random() * EventList.length)); // Pick the random imageURL
                    $('#DIVTimeItem' + i).fadeOut("slow");
                    $('#DIVTimeItem' + i).fadeIn("fast");
                }
            }

            // ***************************************************************
            // TITLE
            //
            if (options.titleMsg != '') {
                // force the relative elements inside the main DIV
                $("#" + currentId).css('position', 'relative');

                var divhtmltitle = "<div id='targettxt'>" + options.titleMsg + "</div></div>";
                $(divhtmltitle).appendTo("#" + currentId);

                $("#targettxt").css('font-size', options.titleFontSize + 'px');
                $("#targettxt").css('color', options.titleFontColor);
                $("#targettxt").css('font-family', 'Segoe UI Light, Segoe WP Light, Segoe UI, Helvetica, sans-serif');
                $("#targettxt").css('padding', options.titleMargin + 'px ' + options.titleMargin + 'px  ' + options.titleMargin + 'px  ' + options.titleMargin + 'px');
                $("#targettxt").css('position', 'absolute');
                $("#targettxt").css('top', '0px');
                $("#targettxt").css('left', '0px');

            }

        });
    };
})(jQuery);

