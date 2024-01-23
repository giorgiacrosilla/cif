csvData = await d3.csv(await FileAttachment("i5_final.csv").url());

viewof selectedYear = Inputs.range(d3.extent(csvData, d => d['Time period']), { step: 1, label: "Year" })

chart = (async function(selectedYear, csvData) {
  
  const aspectRatio = 1.2; // Adjust this to match your iframe's aspect ratio
  const width = 960; 
  const height = width / aspectRatio; 
  
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("background", "white");

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

  const radiusScale1 = d3.scaleLinear().domain([0, maxRadius1]).range([0, 10]); 
  const radiusScale2 = d3.scaleLinear().domain([0, maxRadius2]).range([0, 10]); 
  const radiusScale3 = d3.scaleLinear().domain([0, maxRadius3]).range([0, 10]); 

  const fixedBaseLength = 15; 

  filteredData.forEach((row, index) => {

    // Use the scales to calculate the radius for each spike
    const radius1 = radiusScale1(parseFloat(row["Young people still living with their parents (%)"]));
    const radius2 = radiusScale2(parseFloat(row["House prices indices (2015 = 100)"]));
    const radius3 = radiusScale3(parseFloat(row["Number of emigrates"]));
    
    // Create pointy spike paths for "COL1", "COL2", and "COL3"
    const displacement = 0.5;

    const spike1 = createPointySpikePath(projection, [parseFloat(row.Longitude) - displacement, parseFloat(row.Latitude)], radius1, fixedBaseLength); 
    const spike2 = createPointySpikePath(projection, [parseFloat(row.Longitude), parseFloat(row.Latitude)], radius2, fixedBaseLength); 
    const spike3 = createPointySpikePath(projection, [parseFloat(row.Longitude) + displacement, parseFloat(row.Latitude)], radius3, fixedBaseLength);

    const [x, y] = projection([parseFloat(row.Longitude), parseFloat(row.Latitude)]);

    const popupText1 = `${row["Area"]}: ${row["Young people still living with their parents (%)"]}%`;
    const popupText2 = `${row["Area"]}: € ${row["House prices indices (2015 = 100)"]}`;
    const popupText3 = `${row["Area"]}: ${parseInt(row["Number of emigrates"]).toLocaleString('fr-FR')}`;

    const tip1 = d3Tip().attr('class', 'd3-tip').html(function(d) { return html`<span style="background:white;">${popupText1}</span>`.outerHTML; });
    const tip2 = d3Tip().attr('class', 'd3-tip').html(function(d) { return html`<span style="background:white;">${popupText2}</span>`.outerHTML; });
    const tip3 = d3Tip().attr('class', 'd3-tip').html(function(d) { return html`<span style="background:white;">${popupText3}</span>`.outerHTML; });

    svg.call(tip1);
    svg.call(tip2);
    svg.call(tip3);

    svg.append("path")
      .attr("fill", "purple")
      .attr("stroke", "purple")
      .attr("stroke-width", "2px")
      .attr("d", spike1)
      .on("click", function(d) {
        tip3.hide(this);
        tip2.hide(this);
        tip1.show(d, this);
      });
    
    svg.append("path")
      .attr("fill", "red")
      .attr("stroke", "red")
      .attr("stroke-width", "2px")
      .attr("d", spike2)
      .on("click", function(d) {
        tip1.hide(this);
        tip3.hide(this);
        tip2.show(d, this);
      });
    
    svg.append("path")
      .attr("fill", "orange")
      .attr("stroke", "orange")
      .attr("stroke-width", "2px")
      .attr("d", spike3)
      .on("click", function(d) {
        tip1.hide(this);
        tip2.hide(this);
        tip3.show(d, this);
      });

// Append text label for each coordinate point
      svg.append("text")
        .attr("x", x)
        .attr("y", y + 17)  // Adjust this as needed
        .text(row["Area"])
        .attr("font-size", "1.3rem")
        .attr("font-weight","bold")
        .attr("text-anchor", "middle");
  });

  const legendData = ['orange', 'red', 'purple'];
  const legendLabels = ["Number of emigrates", "House prices indices (2015 = 100)", "Young people still living with their parents (%)"]; 
  const legendSize = 20;
  const legendTitle = "Legend";

  const legendSvg = svg.append("g")
    .attr("transform", `translate(20, ${600 - 100})`); // adjust as needed

  legendSvg.append("text")
    .attr("x", 0)
    .attr("y", -30)  // set position of title, adjust as needed
    .style("font-size", "1.2rem")
    .style("font-weight", "bold")
    .text(legendTitle);

  // Append rectangles for legend colors
  legendSvg.selectAll(".legend-color")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * (legendSize + 9))  // spacing between squares
    .attr("width", legendSize)
    .attr("height", legendSize)
    .style("fill", d => d);

  // Append text for legend labels
  legendSvg.selectAll(".legend-label")
    .data(legendLabels)
    .enter()
    .append("text")
    .attr("class", "legend-label") // Add a class for the selector
    .attr("x", legendSize + 5)
    .attr("y", (d, i) => (i * (legendSize + 9)) + (legendSize / 2)) 
    .attr("dominant-baseline", "middle")
    .style("font-size", "1.2rem")
    .text(d => d);

  return svg.node();

function createPointySpikePath(projection, coordinates, radius, baseLength) {
  const [x, y] = projection(coordinates);

  const spikeHeight = radius * 10;

  return `M ${x - baseLength / 2} ${y}
          L ${x + baseLength / 2} ${y}
          L ${x} ${y - spikeHeight}
          Z`;
}
})(selectedYear, csvData);