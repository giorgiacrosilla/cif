csvData = await d3.csv(await FileAttachment("I5_finale.csv").url());

viewof selectedYear = Inputs.range(
  d3.extent(csvData, d => d['Time period']), 
  { step: 1, label: "Year" }
)

chart = {
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, 960, 600]);

  const filteredData = csvData.filter(d =>  parseInt(d['Time period']) === selectedYear)

  const data = await d3.json(await FileAttachment("limits_IT_regions.geojson").url());

  const projection = d3.geoMercator().fitSize([960, 600], data);

  svg.append("path")
    .datum(data)
    .attr("fill", "#ddd")
    .attr("stroke", "#000")
    .attr("d", d3.geoPath().projection(projection));

  const maxRadius1 = d3.max(filteredData, row => parseFloat(row["Young people still living with their parents (%)"]));
  const maxRadius2 = d3.max(filteredData, row => parseFloat(row["House prices indices (2015 = 100)"]));
  const maxRadius3 = d3.max(filteredData, row => parseFloat(row["Number of emigrates"]));

  const radiusScale1 = d3.scaleLinear().domain([0, maxRadius1]).range([0, 0.8]); 
  const radiusScale2 = d3.scaleLinear().domain([0, maxRadius2]).range([0, 0.8]); 
  const radiusScale3 = d3.scaleLinear().domain([0, maxRadius3]).range([0, 0.8]); 

  filteredData.forEach(row => {

    // Use the scales to calculate the radius for each circle
    const radius1 = radiusScale1(parseFloat(row["Young people still living with their parents (%)"]));
    const radius2 = radiusScale2(parseFloat(row["House prices indices (2015 = 100)"]));
    const radius3 = radiusScale3(parseFloat(row["Number of emigrates"]));
    
    // Create circles for "COL1", "COL2", and "COL3"
    const circle1 = d3.geoCircle().center([parseFloat(row.Longitude), parseFloat(row.Latitude) + radius1 / 2]).radius(radius1).precision(0.1)();
    const circle2 = d3.geoCircle().center([parseFloat(row.Longitude), parseFloat(row.Latitude) + radius2 / 2]).radius(radius2).precision(0.1)();
    const circle3 = d3.geoCircle().center([parseFloat(row.Longitude), parseFloat(row.Latitude) + radius3 / 2]).radius(radius3).precision(0.1)();

    // Append paths for each circle
    svg.append("path")
        .datum(circle1)
        .attr("fill", "none")
        .attr("stroke", "purple")
        .attr("stroke-width", "5px")
        .attr("d", d3.geoPath().projection(projection));

    svg.append("path")
        .datum(circle2)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", "5px")
        .attr("d", d3.geoPath().projection(projection));

    svg.append("path")
        .datum(circle3)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", "5px")
        .attr("d", d3.geoPath().projection(projection));
  });

  return svg.node();
}