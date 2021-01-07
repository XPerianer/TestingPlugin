class VisualizationData {
	

	getObjectForTestName(name) {
		return this.getData()[this.testNameToDataIndex.get(name)];
	}

	handlePredictedFailures(data){
		for (let predictedFailure of data) {
			this.getObjectForTestName(predictedFailure).outcome = "predicted_failure";
		}
	}

	handleTestReport(testreport) {
		if(testreport.when == 'teardown') {
			return;
		}
		let test = this.getObjectForTestName(testreport.id);
		if (!test) {
			console.log(`Test: ${testreport.id} could not be found`);
			return;
		}
		if (testreport.outcome) {
			test.outcome = "passed";
		} else {
			test.outcome = "failed";
		}
	}

	setData(data) {
		this.data = data;
		this.testNameToDataIndex = new Map();
		this.data.forEach((test, index) => {
			this.testNameToDataIndex.set(test.name, index);
		});
	}
	getData() {
		return this.data;
	}
};

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

var dataset = new VisualizationData();
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
		dataset.setData(data);
		// X axis
		var x = d3.scaleLinear()
			.range([0, width])
			.domain(d3.extent(dataset.getData(), (d) => d.mutant_failures));
		svg.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x))
			.selectAll("text")
			.attr("transform", "translate(-10,0)rotate(-45)")
			.style("text-anchor", "end");

		// Add Y axis
		var y = d3.scaleLinear()
			.domain(d3.extent(dataset.getData(), (d, i) => i))
			.range([height, 0]);
		svg.append("g")
			.call(d3.axisLeft(y));

		svg.selectAll("circle")
			.data(dataset.getData())
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
	dataset.handleTestReport(data);
	// TODO: Update the visualization here
});

socket.on('predicted_failures', (data) => {
	dataset.handlePredictedFailures(data);
});

socket.on('disconnect', function(){});


window.addEventListener('message', event => {

	const message = event.data;

	switch (message.command) {
		case 'save': // Register save event to be handled in server 
			socket.emit('save', 'save');
			break;
		case 'refresh':
			console.log("Received refresh call");
			socket.connect('wss://localhost:9001');
			socket.emit('join','web');
			break;
		case 'onDidChangeVisibleTextEditors':
			socket.emit('onDidChangeVisibleTextEditors', message.textEditors);
	}
});
