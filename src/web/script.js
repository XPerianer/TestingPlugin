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

var dataset = {};

		// Add fill color
		var color = (outcome) => {
			if (outcome == "passed") {
				return "green";
			} else if (outcome == "predicted_failure") {
				return "blue";
			} else {
				return "red";
			}
		}

// Parse the Data
var displayData = () => {
	d3.json("http://localhost:9001/data").then((data) => {
		dataset = data;
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
socket.emit('join', 'web');
socket.on('connect', () => {console.log("Connected");});
socket.on('event', function(data){console.log(data);});
socket.on('testreport', (data) => {
	console.log(data);
	if(data.when == 'teardown') {
		return;
	}
	for (let test of dataset) {
		if(test.name == data.id) {
			console.log(data.outcome);
			if (data.outcome) {
				test.outcome = "passed";
			} else {
				test.outcome = "failed";
			}
		}
	}
	svg.selectAll("circle")
		.transition(1000)
		.attr("fill", d => color(d.outcome));
});

socket.on('predicted_failures', (data) => {
	for (let predictedFailure of data) {
		for (let entry of dataset) {
			if (entry.name == predictedFailure) {
				entry.outcome = "predicted_failure";
			}
		}
	}
});

socket.on('disconnect', function(){});


window.addEventListener('message', event => {

	const message = event.data;

	switch (message.command) {
		case 'save': // Register save event to be handled in server 
			socket.emit('save', 'save');
			break;
	}
});
