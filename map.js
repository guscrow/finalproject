var geoP = d3.json("world.geo.json-master/countries.geo.json")
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
  console.log(geoData.features[0].properties.name);
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
    country.properties.CO2em =
    countryDict[country.properties.name]["CO2 emissions (kt)"]["2014"]
  }
  else{
    country.properties.CO2em = 0;
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
  var screen = {width:1500, height:1500}
  var projection = d3.geoMercator()
                      .translate([screen.width/2,screen.height/2])
                      .scale([200]);
  var countryGenerator = d3.geoPath()
                           .projection(projection);

  var svg = d3.select('svg')
              .attr("width",screen.width)
              .attr("height",screen.height)

  var countries = svg.selectAll("g")
                     .data(geoData.features)
                     .enter()
                     .append("g")
                     .classed("state",true)
  countries.append("path")
           .attr("d",countryGenerator)
           .attr("stroke","black")
           .attr("fill",function(d){
             console.log(d.properties.CO2em)
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

}
