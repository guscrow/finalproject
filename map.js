var geoP = d3.json("countries.geo.json")
var dataP = d3.csv("WDIData.csv")

Promise.all([geoP,dataP])
       .then(function(values)
{
  var geoData = values[0];
  var countryData = values[1];
  countryData.forEach(function(d) {
    d["2014"] = +d["2014"];
  });
  console.log("geo", geoData,"data", countryData);
  var countryDict = {}
  countryData.forEach(function(country)
{
  if(!countryDict[country["Country Name"]])
  {
    var obj = {};
    countryDict[country["Country Name"]] = obj;
  }
  countryDict[country["Country Name"]][country["Indicator Name"]] = country
})
  console.log(countryDict)
  geoData.features.forEach(function(country){
    if(countryDict[country.properties.name]){
      if(countryDict[country.properties.name]["CO2 emissions (kt)"]){
        country.properties.CO2em =
        countryDict[country.properties.name]["CO2 emissions (kt)"]["2014"]
      }
      if(countryDict[country.properties.name]["CO2 emissions (metric tons per capita)"]){
    country.properties.CO2percapita =
    countryDict[country.properties.name]["CO2 emissions (metric tons per capita)"]["2014"]
  }
  if(countryDict[country.properties.name]["CO2 emissions from manufacturing industries and construction (% of total fuel combustion)"]){
    country.properties.CO2industry =
    countryDict[country.properties.name]["CO2 emissions from manufacturing industries and construction (% of total fuel combustion)"]["2014"]
  }
  }
  else{
    country.properties.CO2em = 0;
    country.properties.CO2percapita = 0;
  }
  })
  drawMap(geoData);
},
function(err)
{
  console.log(err);
})

var drawMap = function(geoData)
{
var l1list = [100001,99000,49000,4000]
var l2list = [11,9,4,.5]
var l3list = [76,74,49,24]

  var screen = {width:1000, height:700}
  var projection = d3.geoMercator()
                      .translate([screen.width/2,screen.height/2])
                      .fitSize([screen.width,screen.height],geoData);
  var countryGenerator = d3.geoPath()
                           .projection(projection);
 var xScale = d3.scaleLinear()
    .domain([0,100])
    .range([0,screen.width]);
  var yScale = d3.scaleLinear()
                  .domain([0,100])
                  .range([screen.height,0]);

  var svg = d3.select('svg')
              .attr("width",screen.width)
              .attr("height",screen.height)

  var countries = svg.selectAll("g")
                     .data(geoData.features)
                     .enter()
                     .append("g")
                     .classed("country",true)
  countries.append("path")
           .attr("d",countryGenerator)
           .attr("stroke",function(d){
             if(d.properties.CO2em){
               return "black"
             }
             else{
               return "orange"
             }
           })
           .attr("fill",function(d){
             if(d.properties.CO2em){
               if(d.properties.CO2em>100000){
                 return d3.rgb("#FF0000")
               }
               if(d.properties.CO2em<100000){
                 return d3.rgb("#FF5C5C")
               }
               if(d.properties.CO2em<50000){
                 return d3.rgb("#F4C2C2")
               }
               if(d.properties.CO2em<5000){
                 return d3.rgb("#FADBD8")
               }
               else{
                 return "black";
               }
             }
           })
           .on("mouseover",function(d){
             if(d.properties.CO2em){
               var x = event.clientX;
               var y = event.clientY;
             d3.select("#tooltip")
               .style("left",x + "px")
               .style("top",y + "px")
               .select("#value")
               .text(d.properties.name + " Year: 2014")
             }
             d3.select("#tooltip").classed("hidden",false)
           })
           .on("mouseout",function(d){
             d3.select("#tooltip").classed("hidden",true)
           })
           var percapitaB = d3.select('.CO2EmissionPrCapB')
           percapitaB.on("click",updateGraphpercapitacurry(geoData,countries))
           var co2emissions = d3.select('.CO2EmissionB')
           co2emissions.on("click",updateGraphCO2Emissioncurry(geoData,countries))
           var co2fromindustry = d3.select('.indB')
           co2fromindustry.on("click",updateGraphCO2EmIndcurry(geoData,countries))
  var legendsvg = d3.select('.lsvg')
                    .attr("width",500)
                    .attr("height",100)
   var legend1 = d3.select('.lsvg')
                  .append('g')
                  .classed("l1",true)
  legendsvg.append("text")
            .attr("x",20)
            .attr("y",10)
           .text("Legend:")
           .classed("lheader",true)
  legend1.selectAll("rect")
        .data(l1list)
        .enter()
        .append("rect")
        .attr("x",function(d,i){return xScale(i*10)+20})
       .attr("y",50)
       .attr("width",10)
       .attr("height",10)
       .attr("fill",function(d,i) {
         if(l1list[i]<5000){
           return d3.rgb("#FADBD8")
         }
         if(l1list[i]<50000){
           return d3.rgb("#F4C2C2")
         }
         if(l1list[i]<100000){
           return d3.rgb("#FF5C5C")
         }
         if(l1list[i]>100000){
           return d3.rgb("#FF0000")
         }
         else{
           return "black";
         }
       })
   legend1.selectAll("text")
              .data(l1list)
              .enter()
              .append("text")
              .attr("x",function(d,i){return xScale(i*10)+30})
              .attr("y",60)
              .text(function(d,i) {
                if(l1list[i]<5000){
                  return "<5000 (kt)"
                }
                if(l1list[i]<50000){
                  return "<50000 (kt)"
                }
                if(l1list[i]<100000){
                  return "<100000 (kt)"
                }
                if(l1list[i]>100000){
                  return "100000+ (kt)"
                }
              })
    var legend2 = d3.select('.lsvg')
                   .append('g')
                   .classed("l2",true)
     legend2.selectAll("rect")
           .data(l2list)
           .enter()
           .append("rect")
           .attr("x",function(d,i){return xScale(i*5)+20})
          .attr("y",50)
          .attr("width",10)
          .attr("height",10)
          .attr("fill",function(d,i) {
            if(l2list[i]<1){
              return d3.rgb("#FADBD8")
            }
            if(l2list[i]<5){
              return d3.rgb("#F4C2C2")
            }
            if(l2list[i]<10){
              return d3.rgb("#FF5C5C")
            }
            if(l2list[i]>10){
              return d3.rgb("#FF0000")
            }
            else{
              return "black";
            }
          })
      legend2.selectAll("text")
                 .data(l2list)
                 .enter()
                 .append("text")
                 .attr("x",function(d,i){return xScale(i*5)+30})
                 .attr("y",60)
                 .text(function(d,i) {
                   if(l2list[i]<1){
                     return "<1"
                   }
                   if(l2list[i]<5){
                     return "<5"
                   }
                   if(l2list[i]<10){
                     return "<10"
                   }
                   if(l2list[i]>10){
                     return ">10"
                   }
                 })
      legend2.classed("hide",true)
var legend3 = d3.select('.lsvg')
               .append('g')
               .classed("l3",true)
 legend3.selectAll("rect")
       .data(l3list)
       .enter()
       .append("rect")
       .attr("x",function(d,i){return xScale(i*5)+20})
      .attr("y",50)
      .attr("width",10)
      .attr("height",10)
      .attr("fill",function(d,i) {
        if(l3list[i]<25){
          return d3.rgb("#FADBD8")
        }
        if(l3list[i]<50){
          return d3.rgb("#F4C2C2")
        }
        if(l3list[i]<75){
          return d3.rgb("#FF5C5C")
        }
        if(l3list[i]>75){
          return d3.rgb("#FF0000")
        }
        else{
          return "black";
        }
      })
  legend3.selectAll("text")
             .data(l3list)
             .enter()
             .append("text")
             .attr("x",function(d,i){return xScale(i*5)+30})
             .attr("y",60)
             .text(function(d,i) {
               if(l2list[i]<1){
                 return "<25%"
               }
               if(l2list[i]<5){
                 return "<50%"
               }
               if(l2list[i]<10){
                 return "<75%"
               }
               if(l2list[i]>10){
                 return ">75%"
               }
             })
    legend3.classed("hide",true)
}
var updateGraphCO2Emissioncurry = function(geoData,countries)
{
  return function(){
    updateGraphCO2Emission(geoData,countries);
  }
}
var updateGraphpercapitacurry = function(geoData,countries)
{
  return function(){
    updateGraphpercapita(geoData,countries);
  }
}
var updateGraphCO2EmIndcurry = function(geoData,countries)
{
  return function(){
    updateGraphCO2EmInd(geoData,countries);
  }
}
var updateGraphCO2Emission = function(geoData,countries)
{

  d3.selectAll(".country").select("path")
           .transition()
           .duration(1000)
           .attr("stroke",function(d){
             if(d.properties.CO2em){
               return "black"
             }
             else{
               return "orange"
             }
           })
           .attr("fill",function(d){
             if(d.properties.CO2em){
               if(d.properties.CO2em>100000){
                 return d3.rgb("#FF0000")
               }
               if(d.properties.CO2em<100000){
                 return d3.rgb("#FF5C5C")
               }
               if(d.properties.CO2em<50000){
                 return d3.rgb("#F4C2C2")
               }
               if(d.properties.CO2em<5000){
                 return d3.rgb("#FADBD8")
               }
               else{
                 return "black";
               }
             }
           })

           d3.select('.l1')
             .classed('hide',false)
             d3.select('.l2')
               .classed('hide',true)
             d3.select('.l3')
               .classed('hide',true)
}
var updateGraphpercapita = function(geoData,countries)
{

  d3.selectAll(".country").select("path")
           .transition()
           .duration(1000)
           .attr("stroke",function(d){
             if(d.properties.CO2em){
               return "black"
             }
             else{
               return "orange"
             }
           })
           .attr("fill",function(d){
             if(d.properties.CO2percapita){
               if(d.properties.CO2percapita>10){
                 return d3.rgb("#FF0000")
               }
               if(d.properties.CO2percapita<10){
                 return d3.rgb("#FF5C5C")
               }
               if(d.properties.CO2percapita<5){
                 return d3.rgb("#F4C2C2")
               }
               if(d.properties.CO2percapita<1){
                 return d3.rgb("#FADBD8")
               }
               else{
                 return "black";
               }
             }
           })

  d3.select('.l1')
    .classed('hide',true)
    d3.select('.l2')
      .classed('hide',false)
    d3.select('.l3')
      .classed('hide',true)
}
var updateGraphCO2EmInd = function(geoData,countries)
{

  d3.selectAll(".country").select("path")
           .transition()
           .duration(1000)
           .attr("stroke",function(d){
             if(d.properties.CO2em){
               return "black"
             }
             else{
               return "orange"
             }
           })
           .attr("fill",function(d){
             if(d.properties.CO2industry){
               if(d.properties.CO2industry>75){
                 return d3.rgb("#FF0000")
               }
               if(d.properties.CO2industry<75){
                 return d3.rgb("#FF5C5C")
               }
               if(d.properties.CO2industry<50){
                 return d3.rgb("#F4C2C2")
               }
               if(d.properties.CO2industry<25){
                 return d3.rgb("#FADBD8")
               }
               else{
                 return "black";
               }
             }
           })
           d3.select('.l1')
             .classed('hide',true)
             d3.select('.l2')
               .classed('hide',true)
             d3.select('.l3')
               .classed('hide',false)
}

