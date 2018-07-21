// C498 Data Visualisation Final Project
// Subject: United States Health Inequality
// Author: Graham Chester
// Date: 20-Jul-2018

// queue map and health data for reading
d3.queue()
    .defer(d3.json, "us.json")    // US Map data
    .defer(d3.csv,  "health.csv") // Health Dataset
    .await(ready);

// ************** Main function *****************
function ready(error, us, health) {
    if (error) throw error;

    // create div to hang selector and heading
    var heading = d3.select("#heading")
        .append("div")
        .style("border-bottom","1px lightgrey solid");

    setHeading(heading, "#button0");
    drawBarChart("United States", health);

    // set functionality on each button
    d3.select("#button0").on("click", function() {
        setHeading(heading, this);
        drawBarChart("United States", health);
        });
    d3.select("#button1").on("click", function() {
        setHeading(heading, this);
        drawMap(this.value, us, health);
        drawBarChart("United States", health);
        });
    d3.select("#button2").on("click", function() {
        setHeading(heading, this);
        drawMap(this.value, us, health);
        drawBarChart("United States", health);
        });
    d3.select("#button3").on("click", function() {
        setHeading(heading, this);
        drawMap(this.value, us, health);
        drawBarChart("United States", health);
        });
    d3.select("#button4").on("click", function() {
        setHeading(heading, this);
        drawScatter(us, health);
        drawBarChart("United States", health);
        });
    d3.select("#button5").on("click", function() {
        setHeading(heading, this);
        drawTable(us, health);
        drawBarChart("United States", health);
        });
};

function setHeading(heading, node) {
    var button = d3.select(node);
    var title = button.attr("value")=="About" ? "About this Visualization" : button.attr("value");
    
    heading.selectAll(".heading").remove();
    heading.append("div")
        .attr("class","heading")
        .style("text-align","center")
        .style("font-size","20px")
        .style("font-weight","bold")
        .text(title);
    heading.append("div")
        .attr("class","heading")
        .style("padding","10px 7px 10px 7px")
        .style("font-size","11px")
        .html(button.attr("text"));

    // remove previous map/chart
    d3.select("#svg").remove();
    d3.select("#table").remove();
    // set styles for pressed and not pressed buttons
    d3.selectAll(".button").style("background","#FBFCFC")
    button.style("background","#FDDBC7")
}

// utility function to find health information for a given city
function search(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].CityName === nameKey) {
            return myArray[i];
        };
    };
}


// ****************************************************************************************************
// ************************************* Show Map (3 types) *******************************************
// ****************************************************************************************************
function drawMap(chart, us, health) {

    // translation table from internal map id"s on the polygons to statenames
    var stateMap = {
        1: "Alabama", 2: "Alaska", 4: "Arizona",5: "Arkansas",6: "California",8: "Colorado",9: "Connecticut",10: "Delaware",
        11: "District of Columbia",12: "Florida",13: "Georgia",15: "Hawaii",16: "Idaho",17: "Illinois",18: "Indiana",19: "Iowa",
        20: "Kansas",21: "Kentucky",22: "Louisiana",23: "Maine",24: "Maryland",25: "Massachusetts",26: "Michigan",27: "Minnesota",
        28: "Mississippi",29: "Missouri",30: "Montana",31: "Nebraska",32: "Nevada",33: "New Hampshire",34: "New Jersey",35: "New Mexico",
        36: "New York",37: "North Carolina",38: "North Dakota",39: "Ohio",40: "Oklahoma",41: "Oregon",42: "Pennsylvania",44: "Rhode Island",
        45: "South Carolina",46: "South Dakota",47: "Tennessee",48: "Texas",49: "Utah",50: "Vermont",51: "Virginia",53: "Washington",
        54: "West Virginia",55: "Wisconsin",56: "Wyoming",60: "America Samoa",64: "Federated States of Micronesia",66: "Guam",
        68: "Marshall Islands",69: "Northern Mariana Islands",70: "Palau",72: "Puerto Rico",74: "U.S. Minor Outlying Islands", 78:"US"};

    // setup Map SVG canvas, and group
    var height = 430, width = 910;
    var svg = d3.select("#heading")
        .append("svg")
        .attr("id", "svg")
        .attr("height", height)
        .attr("width", width)
        .attr("fill","#FBFCFC")
        .style("padding","5px 0px 0px 0px");
    var g = svg.append("g");

    // Setup map projections, colours and x,y ranges for map
    var projection = d3.geoAlbersUsa()
        .scale(950)
        .translate([width / 2.1, height / 2]);

    // setup reference to map projection
    var path = d3.geoPath().projection(projection);

    // active flag for state level zoom
    var active = d3.select(null);

    // set map x, y scales
    var x = d3.scaleLinear()
        .domain([0, 10])
        .rangeRound([width-396, width-50]);
    var y = d3.scaleLinear()
        .range([0, height]);

    // set color range for bubbles and legend
    var color = d3.scaleThreshold()
        .domain(d3.range(0, 11))
        .range(d3.schemeRdBu[11]);

    // set radius scale for bubbles
    var radius = d3.scaleSqrt()
        .domain([0, 1e6])
        .range([0, 15]);

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add legend Heading
    g.append("text")
        .attr("class", "caption")
        .attr("x", 493)
        .attr("y", 15)
        .attr("fill", "black")
        .attr("text-anchor", "end")
        .attr("font-size", "14px")
        .attr("font-weight", "normal")
        .text(chart);

    // Add population legend circles, and text
    var popLegend = g.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width - 90) + "," + (height - 70) + ")")
        .selectAll("g")
            .data([1e6, 5e6, 1e7])
            .enter().append("g");
    popLegend.append("circle")
        .attr("class","legend")
        .style("stroke", "#A0A0A0")
        .attr("cy", function(d) { return  -radius(d)*0.8; })
        .attr("r", radius);
    popLegend.attr("font-size","9px")
        .append("text")
        .attr("fill","#404040")
        .attr("y", function(d) { return -2 * radius(d)*0.8; })
        .attr("dy", "0.7em")
        .text(d3.format(".1s"));

    popLegend.append("text")
        .text("Population")
        .attr("fill","#707070")
        .attr("font-size","11px")
        .attr("dy","1.8em");
 
    // add color bar to map
    g.selectAll("rect")
        .data(color.range().map(function(d) {
            d = color.invertExtent(d);
            if (d[0] == null) d[0] = x.domain()[0];
            if (d[1] == null) d[1] = x.domain()[1];
            return d;
        }))
        .enter().append("rect")
        .attr("height", 10)
        .attr("x", function(d) { return x(d[0]); })
        .attr("y", 0)
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill",  function(d) { return color(d[0]); });

    // Add axis for colour bar to map
    g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickFormat(function(x, i) { 
            switch (chart) {
                case "Overall Health":  return x*10;
                case "Life Expectancy": return ((86-81)*x/10+81).toFixed(1).toString().replace(".0","");
                case "Life Expectancy Wealth Gap": return 10-x;
                };
            })
        .tickValues(color.domain()))
        .attr("class","legend")
        .style("font-weight","normal")
        .select(".domain").remove();

    // Add US states and activate click function for zoom
    g.selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .attr("id", function (d) {return (stateMap[d.id]).replace(/ /g,'');})
        .attr("class", "feature")
        .style("stroke", "#D5DBDB")

        // highlight state and provide name when hovering over
        .on("mouseover", function (d) {
            d3.select(this).style("cursor", "pointer").style("fill", "#B6BCBF"); 
            if (active.node() !== this) {
                projLatLong = stateLatLong(d);
                tooltip.transition().duration(300).style("opacity", 1);
                tooltip.html(stateMap[d.id])
                    .style("left",(projLatLong[0]+0)+"px")
                    .style("top", (projLatLong[1]+220)+"px")
                    .style("color", "#505050")
                    .style("background","None");
                };
            })

        // normalise state when mouse moves out
        .on("mouseout", function (d) {
            d3.select(this).style("cursor", "default").style("fill", "#A6ACAF");
            tooltip.transition().duration(0).style("opacity", 0);
            })

        // zoom in when click on state
        .on("click", function (d) {
            tooltip.transition().duration(0).style("opacity", 0);
            if (active.node() === this) return reset();
            active.classed("active", false);
            active = d3.select(this).classed("active", true);

            // add statename to zoomed map at the projected lat and long
            projLatLong = stateLatLong(d);
            g.append("text")
                .text(stateMap[d.id])
                .attr("fill","#393939")
                .attr("class","state")
                .style("font-size",8)
                .style("font-weight","normal")
                .attr("x", projLatLong[0])
                .attr("y", projLatLong[1]);

            // translate all objects so all remain in same position when zoomed
            var bounds = path.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = 0.97 / Math.max(dx/width, dy/height),
                translate = [width/2 - scale*x, height/2 - scale*y];

            // zoooooooooooom in
            g.transition()
                .duration(750)
                .style("stroke-width", 1.5 / scale + "px")
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")")
                .selectAll(".circle")
                .attr("r", function (d) {return 2 * circleSize(d.PopulationCount) / scale } )
                .style("stroke-width", "0.15px");
            
            // rescale statename to prevent small states having huge labels and vice-versa
            g.selectAll(".state")
                .attr("font-size", 40/scale);
            blink();
            });

    // add cities to map with hover and click functions for more info
    g.selectAll("circle")
        .data(health)
        .enter().append("circle")
        .attr("class", function (d) {return ("circle");})
        .attr("id", function(d) {return (d.CityName + d.StateDesc).replace(/\s+/g, '');})
        .attr("coord", function (d) {return (d.lng + "," + d.lat)})
        .attr("transform", function(d) {return "translate("+ projection([d.lng, d.lat])+")"; })
        .attr("fill",      function(d) {

            // circle colour depends on which map is chosen
            switch (chart) {
                case "Overall Health": return color(d.health_score/10);
                case "Life Expectancy":    
                    return color((d["4L:Life Expectancy Average: Average Life Expectancy in Years"]-81)*10/(86-81));
                case "Life Expectancy Wealth Gap": return color(10-d.disparity_avg);
                }
            })
        .style("opacity", .8)
        .style("stroke", "#FFFFFF")
        .style("stroke-width", "0.7px")
        .attr("r", function (d) { return 0.8 * circleSize(d.PopulationCount) })

        // provide extra info as tooltip when hovering over
        .on("mouseover", function (d) {
            d3.select(this).style("cursor", "pointer").style("stroke", "#000000"); 
            tooltip.transition().duration(300).style("opacity", .9);
            var output = "City: " + d.CityName + 
                         "<br>State: " + d.state_name + 
                         "<br>Health Rank: " + d.health_rank + " of 501" +
                         "<br>Life Expectancy: " + d["4L:Life Expectancy Average: Average Life Expectancy in Years"] + 
                         " yrs<br>Population: " + Number(d.PopulationCount).toLocaleString() +
                         "<br>Rich/Poor Life Gap: " + d.disparity_avg + " yrs";
            tooltip.html(output)
                   .style("left",(d3.event.pageX+15)+"px")
                   .style("top",(d3.event.pageY-35)+"px")
                   .style("background","lightgrey");
            })

        // remove tool tip when hover out
        .on("mouseout", function (d) {
            d3.select(this).style("cursor", "default").style("stroke", "#FFFFFF");
            tooltip.transition().duration(300).style("opacity", 0);})

        // update bar chart from clicked city
        .on("click", function(d) {
            drawBarChart(d, health)
            });

    // g.append("polygon").attr("stroke","darkgreen")
    //     .attr("points","10,1 4,20 19,8 1,8 16,20")
    //     .attr("transform","translate("+projection(d3.select("#ChampaignIllinois").attr("coord").split(","))+")");
    function blink() {
        console.log('blink');
        d3.select("#ChampaignIllinois")
            .style("stroke","black")
            .transition().duration(700).attr("r", "5")
            .transition().duration(700).attr("r", "13")
            .on("end", blink)
        }
    blink();

    // add best and worst city annotations
    switch (chart) {
        case "Overall Health":
            g.append("text")
                .attr("transform","translate("+projection(d3.select("#SanRamonCalifornia").attr("coord").split(","))+")")
                .style("fill","darkred")
                .style("font-size","10px")
                .style("rotate","315")
                .append("tspan").text("Best:").attr("dx", -30).attr('dy', 0)
                .append("tspan").text("San Ramon").attr("dx", -40).attr('dy', +9);
            g.append("text")
                .attr("transform","translate("+projection(d3.select("#GaryIndiana").attr("coord").split(","))+")")
                .style("fill","darkred")
                .style("font-size","10px")
                .style("rotate","315")
                .append("tspan").text("Worst:").attr("dx", 15).attr('dy', 0)
                .append("tspan").text("Gary").attr("dx", -27).attr('dy', +9);
            break;
        case "Life Expectancy":
            g.append("text")
                .attr("transform","translate("+projection(d3.select("#SantaFeNewMexico").attr("coord").split(","))+")")
                .style("fill","darkred")
                .style("font-size","10px")
                .style("rotate","315")
                .append("tspan").text("Longest:").attr("dx", 27).attr('dy', 0)
                .append("tspan").text("Santa Fe").attr("dx", -38).attr('dy', +9);
            g.append("text")
                .attr("transform","translate("+projection(d3.select("#ColumbusGeorgia").attr("coord").split(","))+")")
                .style("fill","darkred")
                .style("font-size","10px")
                .style("rotate","315")
                .append("tspan").text("Shortest:").attr("dx", 30).attr('dy', 0)
                .append("tspan").text("Columbus").attr("dx", -40).attr('dy', +9);
            break;
        case "Life Expectancy Wealth Gap":
            g.append("text")
                .attr("transform","translate("+projection(d3.select("#LaredoTexas").attr("coord").split(","))+")")
                .style("fill","darkred")
                .style("font-size","10px")
                .style("rotate","315")
                .append("tspan").text("Smallest:").attr("dx", -28).attr('dy', 0)
                .append("tspan").text("Laredo").attr("dx", -32).attr('dy', +9);
            g.append("text")
                .attr("transform","translate("+projection(d3.select("#WichitaFallsTexas").attr("coord").split(","))+")")
                .style("fill","darkred")
                .style("font-size","10px")
                .style("rotate","315")
                .append("tspan").text("Largest:").attr("dx", 37).attr('dy', 0)
                .append("tspan").text("Wichita Falls").attr("dx", -35).attr('dy', +9);
            break;
        }

    // add legend for national average dot
    g.append("text")
        .text("National Average")
        .attr("fill","black")
        .attr("font-size","14px")
        .attr("font-weight", "normal")
        .attr("x", 842)
        .attr("y", 238); 

    // calculate circle size from population
    function circleSize (population) {
        if (population > 100000000) population = 500000; // fix for national population circle to big
        return radius(population);
    };
    
    // reset zoomed view
    function reset() {
        active.classed("active", false);
        active = d3.select(null);
        g.selectAll(".state").remove();
        g.transition()
            .duration(750)
            .style("stroke-width", "1px")
            .attr("transform", "")
            .selectAll(".circle")
            .style("stroke-width", "0.8px")
            .attr("r", function (d) { return circleSize(d.PopulationCount) });
        blink();
    };

    // get average lat and long so can centre state name on zoomed state map
    function stateLatLong(d) {
        var arr = d.geometry.coordinates[0][0]
        if (d.id===2) {  /* override lat long for alaska so dont loose state name of screen */
            var avgLat  = -116
            var avgLong = 28
        } else {
            var avgLat  = d3.max(arr.map(function(v) { return v[0]; }))/2 + d3.min(arr.map(function(v) { return v[0]; }))/2;
            var avgLong = d3.max(arr.map(function(v) { return v[1]; }))/2 + d3.min(arr.map(function(v) { return v[1]; }))/2;
        }
        return projection([avgLat, avgLong])
        };
}

// *************************************************************************************************************
// ********************************** Add top cities table to page *********************************************
// *************************************************************************************************************
function drawTable(us, health) {

    // Create table data from health array
    var healthTab = [];
    var i = 0;
    health.forEach(function(d) {
        console.log(d);
        if (i > 2) {
            healthTab.push({"City": d.CityName, "State": d.StateDesc, "Health Score": d.health_score, 
                "Life Expectancy Average": d["4L:Life Expectancy Average: Average Life Expectancy in Years"], 
                "Life Expectancy Richest 25%": d["4L:Life Expectancy Top 25%:Life expectancy in years, Top Quartile Income"], 
                "Life Expectancy Poorest 25%": d["4L:Life Expectancy Bottom 25%:Life expectancy in years, Bottom Quartile Income"],
                "Rich vs Poor Life Gap (Years)": d["disparity_avg"],
                "Population": parseInt(d["PopulationCount"]).toLocaleString()
                });
            }
        i++;
    });

    // Add Top cities table
    var sortAscending = true;
    var titles = d3.keys(healthTab[0]);
    var table = d3.select("#heading")
        .append("table")
        .attr("id","table")
        .attr("height","439px")
        .style("background-color", "#FBFCFC")
        .style("padding","20px 20px 10px 18px")
        .style("font-size","11px");

    // add table header and body elements
    var thead = table.append("thead");
    var tbody = table.append("tbody");
        
    // add table column headings
    thead.append("tr")
        .selectAll("th")
        .data(titles)
        .enter().append("th")
        .text(function (d) { return d; })
        .style("font-size", "11.5px")
        .style("background", "#FBFCFC")
        .style("text-align", "left")
        .on("mouseover", function (d) {
            d3.select(this).style("cursor", "pointer");
            d3.select(this).style("background-color", "#9FD3F5");
            })
        .on("mouseout", function (d) {
            d3.select(this).style("cursor", "default");
            d3.select(this).style("background-color", "#FBFCFC");
            })
        .on("click", function (d) {
            thead.attr("class", "header");
            if (sortAscending) {
                thead.selectAll("th").attr("class","thead");
                rows.sort(function (a, b) { return a == null || b == null ? 0 : stringCompare(a[d], b[d]); });
                sortAscending = false;
                this.className = "aes";
            } else {
                thead.selectAll("th").attr("class","thead");
                rows.sort(function (a, b) { return a == null || b == null ? 0 : stringCompare(b[d], a[d]); });
                sortAscending = true;
                this.className = "des";
            }
        });

    // Add data rows to table
    var rows  = tbody.selectAll("tr")
        .data(healthTab)
        .enter().append("tr");
    rows.selectAll("td")
        .data(function (d) {
            return titles.map(function (k) {
                return { "value": d[k], "name": k};
            });
        })
        .enter().append("td")
        .attr("data-th", function (d) { return d.name; })
        .text(function (d) {return d.value;})
        .style("font-weight", "normal")
        .on("mouseover", function (d,i) {
            if (i===0) {
                d3.select(this).style("cursor", "pointer"); 
                d3.select(this).style("background-color", "#9FD3F5");
                }
            })
        .on("mouseout", function (d,i) {
            if (i===0) {
                d3.select(this).style("cursor", "default"); 
                d3.select(this).style("background-color", function(d) { return d.colour; });
                }
            })
        .on("click", function (d) {
            if (d.name == "City") drawBarChart(search(d.value, health), health);
        });

    // string or numeric compare for sorting table rows below
    function stringCompare(a, b) {
        var num_a = +a.replace(/,/g,"")
        if (isNaN(num_a)) {
            a = a.toLowerCase();
            b = b.toLowerCase();
        } else {
            a = num_a;
            b = +b.replace(/,/g,"")
        };
        return a > b ? 1 : a == b ? 0 : -1;
    };

}

// *************************************************************************************************************
// *********************************** Add Scatter Plot to page ************************************************
// *************************************************************************************************************
function drawScatter(us, health) {
    
    // setup Graph SVG canvas and rect
    var height = 375, width = 800;
    var svg = d3.select("#heading")
        .append("svg")
        .attr("id","svg")
        .attr("height", height)
        .attr("width", width)
        .attr("fill","#FBFCFC")
        .style("padding","20px 10px 40px 45px");

    var g = svg.append("g");

    // Setup scales and tooltip for Graph
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // create x and y range domains
    x.domain([0, 100]);
    y.domain([75, 90]);
        
    // add faint vertical lines
    var lines = g.append("g")			
        .attr("class", "grid")
        .call(d3.axisLeft(y)
           .ticks(5)
           .tickSize(-width)
           .tickFormat(""));
    lines.selectAll("line").style("stroke", "#E5E7E9");

    // add faint horizontal lines
    var lines = g.append("g")			
        .attr("class", "grid")
        .attr("transform", "translate(0," + (height) + ")")
        .call(d3.axisTop(x)
           .ticks(10)
           .tickSize(height)
           .tickFormat(""));
    lines.selectAll("line").style("stroke", "#E5E7E9")

    // adjustable values for point appearance
    var radius = 3.7;
    var radiusInc = 2;
    var opacity= 0.8;
    var colour = ["#1E8449","#17A589","#D4AC0D","#C0392B"];

    // Add cities to graph for 4th quartile
    g.selectAll("circle4")
        .data(health)
        .enter().append("circle")
        .attr("class", "circles4")
        .attr("cx", function(d) {return x(d["health_score"]); })
        .attr("cy", function(d) {return y(d["4L:Life Expectancy Top 25%:Life expectancy in years, Top Quartile Income"]); })
        .attr("id", function(d) {return "c"+d.id.toString();})
        .attr("city", function(d) {return (d.CityName + d.StateDesc).replace(/\s+/g, '');})
        .attr("r", radius)
        .style("fill", colour[0]).style("opacity", opacity)

        // highlight all other data points and provide tooltip for hovered city
        .on("mouseover", function (d) {
            d3.select(this).style("cursor", "pointer");
            d3.selectAll("#c"+d.id.toString()).attr("stroke","black").attr("r",radius+radiusInc).attr("stroke-width","1").style("opacity", 1);
            tooltip.transition().duration(300).style("opacity", .9);
            var output = "City: " + d.CityName + 
                         "<br>State: " + d.state_name + 
                         "<br>Health Rank: " + d.health_rank + " of 501" +
                         "<br>Life Expectancy: " + d["4L:Life Expectancy Average: Average Life Expectancy in Years"] + 
                         " yrs<br>Population: " + Number(d.PopulationCount).toLocaleString() +
                         "<br>Rich/Poor Life Gap: " + d.disparity_avg + " yrs";
            tooltip.html(output)
                   .style("left",(d3.event.pageX+15)+"px")
                   .style("top",(d3.event.pageY-35)+"px")
                   .style("background","lightgrey");
            })
        // remove hover highlight
        .on("mouseout", function (d) {
            d3.select(this).style("cursor", "default");
            d3.selectAll("#c"+d.id.toString()).attr("r",radius).attr("stroke","None");
            tooltip.transition().duration(300).style("opacity", 0);
            })
        // update bar chart on mouse click
        .on("click", function (d) {
            drawBarChart(d, health);
            });

    // Add cities to graph for 3rd Quartile
    g.selectAll("circle3")
        .data(health)
        .enter().append("circle")
        .attr("class", "circles3")
        .attr("cx", function(d) {return x(d["health_score"]); })
        .attr("cy", function(d) {return y((+d.life_q3_f + +d.life_q3_m)/2); })
        .attr("id", function(d) {return "c"+d.id.toString();})
        .attr("r", radius)
        .style("fill", colour[1]).style("opacity", opacity)

        .on("mouseover", function (d) {
            d3.select(this).style("cursor", "pointer");
            d3.selectAll("#c"+d.id.toString()).attr("stroke","black").attr("r",radius+radiusInc).attr("stroke-width","1").style("opacity", 1);
            tooltip.transition().duration(300).style("opacity", .9);
            var output = "City: " + d.CityName + 
                         "<br>State: " + d.state_name + 
                         "<br>Health Rank: " + d.health_rank + " of 501" +
                         "<br>Life Expectancy: " + d["4L:Life Expectancy Average: Average Life Expectancy in Years"] + 
                         " yrs<br>Population: " + Number(d.PopulationCount).toLocaleString() +
                         "<br>Rich/Poor Life Gap: " + d.disparity_avg + " yrs";
            tooltip.html(output)
                   .style("left",(d3.event.pageX+15)+"px")
                   .style("top",(d3.event.pageY-35)+"px")
                   .style("background","lightgrey");
            })
        .on("mouseout", function (d) {
            d3.select(this).style("cursor", "default");
            d3.selectAll("#c"+d.id.toString()).attr("r",radius).attr("stroke","None");
            tooltip.transition().duration(300).style("opacity", 0);
            })
        // update bar chart on mouse click
        .on("click", function (d) {
            drawBarChart(d, health);
            });

    // Add cities to graph for 2nd quartile
    g.selectAll("circle2")
        .data(health)
        .enter().append("circle")
        .attr("class", "circles2")
        .attr("cx", function(d) {return x(d["health_score"]); })
        .attr("cy", function(d) {return y((+d.life_q2_f + +d.life_q2_m)/2); })
        .attr("id", function(d) {return "c"+d.id.toString();})
        .attr("r", radius)
        .style("fill", colour[2]).style("opacity", opacity)

        .on("mouseover", function (d) {
            d3.select(this).style("cursor", "pointer");
            d3.selectAll("#c"+d.id.toString()).attr("stroke","black").attr("r",radius+radiusInc).attr("stroke-width","1").style("opacity", 1);
            tooltip.transition().duration(300).style("opacity", .9);
            var output = "City: " + d.CityName + 
                         "<br>State: " + d.state_name + 
                         "<br>Health Rank: " + d.health_rank + " of 501" +
                         "<br>Life Expectancy: " + d["4L:Life Expectancy Average: Average Life Expectancy in Years"] + 
                         " yrs<br>Population: " + Number(d.PopulationCount).toLocaleString() +
                         "<br>Rich/Poor Life Gap: " + d.disparity_avg + " yrs";
            tooltip.html(output)
                   .style("left",(d3.event.pageX+15)+"px")
                   .style("top",(d3.event.pageY-35)+"px")
                   .style("background","lightgrey");
            })
        .on("mouseout", function (d) {
            d3.select(this).style("cursor", "default");
            d3.selectAll("#c"+d.id.toString()).attr("r",radius).attr("stroke","None");
            tooltip.transition().duration(300).style("opacity", 0);
            })
        // update bar chart on mouse click
        .on("click", function (d) {
            drawBarChart(d, health);
            });

    // Add cities to graph for 1st quartile
    g.selectAll("circle1")
        .data(health)
        .enter().append("circle")
        .attr("class", "circles1")
        .attr("cx", function(d) {return x(d["health_score"]); })
        .attr("cy", function(d) {return y(d["4L:Life Expectancy Bottom 25%:Life expectancy in years, Bottom Quartile Income"]); })
        .attr("id", function(d) {return "c"+d.id.toString();})
        .attr("r", radius)
        .style("fill", colour[3]).style("opacity", opacity)

        .on("mouseover", function (d) {
            d3.select(this).style("cursor", "pointer");
            d3.selectAll("#c"+d.id.toString()).attr("stroke","black").attr("r",radius+radiusInc).attr("stroke-width","1").style("opacity", 1);
            tooltip.transition().duration(300).style("opacity", .9);
            var output = "City: " + d.CityName + 
                         "<br>State: " + d.state_name + 
                         "<br>Health Rank: " + d.health_rank + " of 501" +
                         "<br>Life Expectancy: " + d["4L:Life Expectancy Average: Average Life Expectancy in Years"] + 
                         " yrs<br>Population: " + Number(d.PopulationCount).toLocaleString() +
                         "<br>Rich/Poor Life Gap: " + d.disparity_avg + " yrs";
            tooltip.html(output)
                   .style("left",(d3.event.pageX+15)+"px")
                   .style("top",(d3.event.pageY-35)+"px")
                   .style("background","lightgrey");
            })
        .on("mouseout", function (d) {
            d3.select(this).style("cursor", "default");
            d3.selectAll("#c"+d.id.toString()).attr("r",radius).attr("stroke","None");
            tooltip.transition().duration(300).style("opacity", 0);
            })

        // update bar chart on mouse click
        .on("click", function (d) {
            drawBarChart(d, health);
            });

    function blink() {
        console.log('blink');
        d3.selectAll("#c378")
            // .style("stroke","black")
            .transition().duration(700).attr("r", radius)
            .transition().duration(700).attr("r", "13")
            .on("end", blink)
        }
    blink();

    // best = d3.selectAll("#c448").filter(".circles1")
    // g.append("text")
    //     .attr("transform", "translate("+(+best.attr("cx")-7)+","+(+best.attr("cy")-10)+") rotate(-90)")
    //     .style("fill","darkred")
    //     .style("font-size","10px")
    //     .text("San Ramon, California");

    // worst = d3.selectAll("#c388").filter(".circles1");
    // g.append("text")
    //     .attr("transform", "translate("+(+worst.attr("cx")+11)+","+(+worst.attr("cy")-86)+") rotate(-90)")
    //     .style("fill","darkred")
    //     .style("font-size","10px")
    //     .text("Gary, Indiana");

    // Add scatter x axes
    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height) + ")")
        .style("font-size","12px")
        .style("font-weight","normal")
        .call(d3.axisBottom(x).ticks(10))
        .selectAll("text")	
            .attr("dx", "0px")
            .attr("dy", "6px");

    // Add scatter y axes
    g.append("g")
        .style("font-size","12px")
        .style("font-weight","normal")
        .call(d3.axisLeft(y));

    // Add y-axes labels
    g.append("text")
        .attr("transform", "rotate(-90)")
        .style("fill","black")
        .attr("x", -height/2).attr("y", -30)
        .style("font-size","14px")
        .style("font-weight","normal")
        .text("Life Expectancy");

    // Add x-axes labels
    g.append("text")
        .style("fill","black")
        .attr("x", width/2-50).attr("y", height+30)
        .style("font-size","14px")
        .style("font-weight","normal")
        .text("Health Score");

    // add legend
    var yoffset = 5;
    var xoffset = 50
    g.append("rect")
        .attr("x", xoffset)
        .attr("y", yoffset)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill",colour[0]);
    g.append("text")
        .text("Top Income Quartile")
        .attr("x", xoffset+20)
        .attr("y", yoffset+8)
        .style("font-size","11px").style("font-weight","normal")
        .style("fill", "black");

    g.append("rect")
        .attr("x", xoffset)
        .attr("y", yoffset+16)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill",colour[1]);
    g.append("text")
        .text("2nd Income Quartile")
        .attr("x", xoffset+20)
        .attr("y", yoffset+24)
        .style("font-size","11px").style("font-weight","normal")
        .style("fill", "black"); 

    g.append("rect")
        .attr("x", xoffset)
        .attr("y", yoffset+32)
        .attr("width", 10)
        .attr("height", 10).
        style("fill",colour[2]);
    g.append("text")
        .text("3rd Income Quartile")
        .attr("x", xoffset+20)
        .attr("y", yoffset+40)
        .style("font-size","11px").style("font-weight","normal")
        .style("fill", "black"); 

    g.append("rect")
        .attr("x", xoffset)
        .attr("y", yoffset+48)
        .attr("width", 10)
        .attr("height", 10).
        style("fill",colour[3]);
    g.append("text")
        .text("Bottom Income Quartile")
        .attr("x", xoffset+20)
        .attr("y", yoffset+56)
        .style("font-size","11px").style("font-weight","normal")
        .style("fill", "black"); 
}

// *************************************************************************************************************
// *********************************** Add Bar Chart to page ***************************************************
// *************************************************************************************************************
function drawBarChart(cityData, health) {

    // if no specific city is passed then city is United States average
    var unitedStates = search("United States", health);
    if (cityData==="United States") cityData = unitedStates; 
    var data = shapeBarData(cityData);

    // setup Graph SVG canvas and group
    var svg = d3.select("#barchart");
    var width  = +svg.attr("width")-95;
    var height = +svg.attr("height")-195;

    // remove previous barchart so can refresh with new
    d3.select(".bar").selectAll("*").remove();
    var g = svg.append("g").attr("transform", "translate(" + 50 + "," + 50 + ")");

    // Setup scales and tooltip for Graph
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear().range([height, 0]);
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // create x and y range domains
    x.domain( data.map(function(d) { return d.key; }) );
    y.domain([0, 100]);

    // Add dynamic heading with correct city (remove old heading and bars first)
    svg.selectAll(".bar").remove();
    svg.selectAll("text").remove();
    g.append("text")
        .attr("class", "bar")
        .attr("x", width/2).attr("y", -27)
        .attr("text-anchor", "middle")
        .style("font-size", "16px").style("font-weight", "bold").style("fill", "black")
        .text("Health Measures for: " + cityData.CityName + ", " + cityData.StateDesc);

    // Add heading divider
    g.append("line").style("fill","black")
        .style("stroke", "#D0D3D4")
        .attr("x1", -40).attr("y1", -15).attr("x2", width+30).attr("y2", -15);
        
    // add faint horizontal lines
    g.append("g")			
        .attr("class", "grid")
        .call(d3.axisLeft(y)
           .ticks(10)
           .tickSize(-width)
           .tickFormat(""))
        .selectAll(".tick line")
        .style("stroke", "#E5E7E9");

    // Add bars to graph
    g.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {return x(d.key); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .style("fill", function(d) { return d.colour; })

        // provide extra description when user hovers
        .on("mouseover", function (d) {
            d3.select(this).style("cursor", "pointer"); 
            d3.select(this).style("fill", "#2471A3");
            tooltip.transition().duration(300).style("opacity", .9);
            tooltip.html(d.detail).style("left", (d3.event.pageX+5)+"px").style("top", (d3.event.pageY-30)+"px");
            })

        // reset bar to normal on hoverout
        .on("mouseout", function (d) {
            d3.select(this).style("cursor", "default"); 
            d3.select(this).style("fill", function(d) { return d.colour; });
            tooltip.transition().duration(300).style("opacity", 0);
            });

    // Add US national average lines to graph
    var usaData = shapeBarData(unitedStates);
    g.append("g")
        .selectAll(".line")
        .data(usaData)
        .enter().append("line")
        .attr("class", "bar")
        .style("stroke", "#34495E").style("stroke-width", "1.5px")
        .attr("x1", function(d) { return x(d.key); })
        .attr("y1", function(d) { return y(d.value); })
        .attr("x2", function(d) { return x(d.key) + x.bandwidth(); })
        .attr("y2", function(d) { return y(d.value); });

    // Add bar x axes
    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .style("font-size","11px")
        .call(d3.axisBottom(x).ticks(10))
        .selectAll("text")	
            .style("text-anchor", "end")
            .style("font-size","9px")
            .attr("dx", "-8px")
            .attr("dy", "-3px")
            .attr("transform", "rotate(-65)");

    // Add 2 lots of y axes (percent and life expectancy)
    g.append("g")
        .call(d3.axisLeft(y));
    g.append("g")
        .attr("transform", "translate(" + (width) + ",0)")
        .call(d3.axisRight(y));

    // Add y-axes labels
    g.append("text")
        .attr("transform", "rotate(-90)")
        .text("Percent of Population (higher is worse)")
        .style("fill","black")
        .attr("x", -height+0).attr("y", -30);
    g.append("text")
        .attr("transform", "rotate(-90)")
        .text("Life Expectancy in Years")
        .style("fill","black")
        .attr("x", -height+40).attr("y", width+35);

    // add legend
    var yoffset = 0;
    var xoffset = 570
    g.append("rect")
        .attr("x", xoffset)
        .attr("y", yoffset)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill","#F4D03F");
    g.append("text")
        .text("Lack of Preventative Measures")
        .attr("x", xoffset+20)
        .attr("y", yoffset+10)
        .style("font-size","11px")
        .style("fill", "black");

    g.append("rect")
        .attr("x", xoffset)
        .attr("y", yoffset+20)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill","#FF9800");
    g.append("text")
        .text("Unhealthy Behaviours")
        .attr("x", xoffset+20)
        .attr("y", yoffset+30)
        .style("font-size","11px")
        .style("fill", "black"); 

    g.append("rect")
        .attr("x", xoffset)
        .attr("y", yoffset+40)
        .attr("width", 10)
        .attr("height", 10).
        style("fill","#E74C3C");
    g.append("text")
        .text("Health Problems")
        .attr("x", xoffset+20)
        .attr("y", yoffset+50)
        .style("font-size","11px")
        .style("fill", "black"); 

    g.append("rect")
        .attr("x", xoffset)
        .attr("y", yoffset+60)
        .attr("width", 10)
        .attr("height", 10).
        style("fill","#45B39D");
    g.append("text")
        .text("Life Expectancies")
        .attr("x", xoffset+20)
        .attr("y", yoffset+70)
        .style("font-size","11px")
        .style("fill", "black"); 

    g.append("rect")
        .attr("x", xoffset)
        .attr("y", yoffset+85)
        .attr("width", 10)
        .attr("height", 1.5)
        .style("fill","black");
    g.append("text")
        .text("National Average")
        .attr("x", xoffset+20)
        .attr("y", yoffset+90)
        .style("font-size","11px")
        .style("fill", "black");

    
    // reshape data for a city for plotting on the barchart
    function shapeBarData(cityData) {
        var colours = {"P": "#F4D03F", "p": "#7FB3D5", "B":"#FF9800", "b":"#7FB3D5", "O":"#E74C3C", "o":"#7FB3D5", "L":"#45B39D", "l":"#7FB3D5"};
        var data = [];
        // data.push({key:"key", value:"0", colour:"P",detail:"qwe"})
        Object.keys(cityData).sort().forEach(function(key) {
            var splits = key.split(":");
            if (splits.length > 1) {
                data.push({key: splits[1], value: cityData[key], colour: colours[splits[0].substr(1,1)], detail:splits[2]});
            };
        });
        data["columns"] = ["key","value", "colour", "detail"];
        return data;
    };

}
