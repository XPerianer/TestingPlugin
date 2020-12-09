// set the dimensions and margins of the graph
var margin = { top: 30, right: 30, bottom: 70, left: 60 },
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
var displayData = () => {
	d3.json("http://localhost:9001/data").then((data) => {

		// X axis
		var x = d3.scaleLinear()
			.range([0, width])
			.domain(d3.extent(data, (d) => d.mutant_failures));
		svg.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x))
			.selectAll("text")
			.attr("transform", "translate(-10,0)rotate(-45)")
			.style("text-anchor", "end");

		// Add Y axis
		var y = d3.scaleLinear()
			.domain(d3.extent(data, (d, i) => i))
			.range([height, 0]);
		svg.append("g")
			.call(d3.axisLeft(y));

		// Add fill color
		var color = (outcome) => {
			if (outcome == "passed") {
				return "green";
			} else {
				return "red";
			}
		}

		svg.selectAll("circle")
			.data(data)
			.join("circle")
			.attr("cx", d => x(d.mutant_failures))
			.attr("cy", (d, i) => y(i))
			.attr("fill", d => color(d.outcome))
			.attr("r", 10);

	})
}


displayData();

var socket = io.connect('ws://localhost:9001');
console.log(io.protocol);
debugger;

socket.emit('join', 'web');
socket.on('connect', () => {console.log("Connected");});
socket.on('event', function(data){console.log(data);});
socket.on('testreport', (data) => console.log(data));
socket.on('disconnect', function(){});
