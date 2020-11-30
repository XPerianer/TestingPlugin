	// set the dimensions and margins of the graph
	var margin = {top: 30, right: 30, bottom: 70, left: 60},
		width = 300 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;
	
	// append the svg object to the body of the page
	var svg = d3.select("#chart")
	  .append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  .append("g")
		.attr("transform",
			  "translate(" + margin.left + "," + margin.top + ")");
	
	// Parse the Data
	d3.json("http://localhost:8080/mock.json").then( (data) => {
	
	// X axis
	var x = d3.scaleLinear()
	  .range([ 0, width ])
	  .domain([0, 1]);
	svg.append("g")
	  .attr("transform", "translate(0," + height + ")")
	  .call(d3.axisBottom(x))
	  .selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");
	
	// Add Y axis
	var y = d3.scaleLinear()
	  .domain([0, 1])
	  .range([ height, 0]);
	svg.append("g")
	  .call(d3.axisLeft(y));

	// Add fill color
	var color = (bool) => {
		if (bool) {
			return "red";
		} else {
			return "green";
		}
	}
	
	  console.log(data);
	svg.selectAll("circle")
	  .data(data)
	  .enter()
	  .append("circle")
		.attr("cx", d => x(d.relevance))
		.attr("cy", d => y(d.importance))
		.attr("fill", d => color(d.failing))
		.attr("r", 10);
	
	})