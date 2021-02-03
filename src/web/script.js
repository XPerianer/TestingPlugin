// Helper function to write shorter accessors
var ƒ = ((c) => ((d) => d[c]));

class VisualizationData {

	defaultRelevance = 1;
	data = [];

	getObjectForTestName(name) {
		return this.getData()[this.testNameToDataIndex.get(name)];
	}

	handlePredictedFailures(data) {
		for (let predictedFailure of data) {
			this.getObjectForTestName(predictedFailure).outcome = "predicted_failure";
		}
	}

	handleRelevanceUpdate(data) {
		for (const test of this.getData()) {
			test.relevance = this.defaultRelevance;
		}
		for (const [name, relevance] of Object.entries(JSON.parse(data))) {
			let test = this.getObjectForTestName(name);
			if (test) {
				test.relevance = relevance;
			}
		}
	}

	handleTestReport(testreport) {
		if (testreport.when == 'teardown') {
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
			test.relevance = 1;
		});
	}
	getData() {
		return this.data;
	}
};

class VisualizationFunctions {
	static scatter(transition = false) {
		// X axis
		var x = d3.scaleSqrt()
			.range([0, width])
			.domain(d3.extent(dataset.getData(), (d) => d.mutant_failures)); // TODO: This extent is probably slow
		// visualization.xAxis
		// 	.attr("transform", "translate(0," + height + ")")
		// 	.call(d3.axisBottom(x))
		// 	.selectAll("text")
		// 	.attr("transform", "translate(-10,0)rotate(-45)")
		// 	.style("text-anchor", "end");
	
		// Add Y axis
		var y = d3.scaleLinear()
			.domain([1, 10])
			.range([height, 0]);
		// visualization.yAxis
		// 	.call(d3.axisLeft(y));
	
		let circles = svg.selectAll("circle")
			.data(dataset.getData())
			.join("circle");
		
		circles
			.append("svg:title")
			.text(d => d.name);
	
		circles
			.on('click', (d) => {
				vscode.postMessage({
					command: 'onClick',
					test: d.name,
				});
			});
	
		if (transition) {
			circles = circles.transition().duration(1000);
		}
	
		circles
			.attr("cx", d => x(d.mutant_failures))
			.attr("cy", d => y(d.relevance))
			.attr("fill", d => color(d.outcome))
			.attr("r", 10);
	
	};

	static embedding(transition = false) {
		// X axis
		var x = d3.scaleLinear()
			.domain(d3.extent(dataset.getData(), d => d.x))
			.range([0, width]);
		// visualization.xAxis
		// 	.attr("transform", "translate(0," + height + ")")
		// 	.call(d3.axisBottom(x))
		// 	.selectAll("text")
		// 	.attr("transform", "translate(-10,0)rotate(-45)")
		// 	.style("text-anchor", "end");
	
		// Add Y axis
		var y = d3.scaleLinear()
			.domain(d3.extent(dataset.getData(), d => d.y))
			.range([height, 0]);
		
		var r = d3.scaleSqrt()
			.domain([1, 10])
			.range([3, 30]);
	
		let circles = svg.selectAll("circle")
			.data(dataset.getData())
			.join("circle");
		
		circles
			.append("svg:title")
			.text(d => d.name);
	
		circles
			.on('click', (d) => {
				vscode.postMessage({
					command: 'onClick',
					test: d.name,
				});
			});
	
		if (transition) {
			circles = circles.transition().duration(1000);
		}
	
		circles
			.attr("cx", d => x(d.x))
			.attr("cy", d => y(d.y))
			.attr("fill", d => color(d.outcome))
			.attr("r", d => r(d.relevance));
	
	}

	static table() {
		// column definitions
		var columns = [
			{ head: 'Name', cl: 'title', html: (d) => d.name.slice(0,40) },
			{ head: 'Relevance', cl: 'center', html: ƒ('relevance') },
			{ head: 'Outcome', cl: 'center', html: ƒ('outcome') },
		];
		d3.select('body').selectAll('table').remove();
		 // create table
		 var table = d3.select('body')
		 	.append('table');
 
		// create table header
		table.append('thead').append('tr')
			.selectAll('th')
			.data(columns).enter()
			.append('th')
			.attr('class', ƒ('cl'))
			.text(ƒ('head'));
	
		// create table body
		table.append('tbody')
			.selectAll('tr')
			.data(dataset.getData().sort((a, b) => b.relevance - a.relevance))
			.join('tr')
			.selectAll('td')
			.data(function(row, i) {
				return columns.map(function(c) {
					// compute cell values for this specific row
					var cell = {};
					d3.keys(c).forEach(function(k) {
						cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
					});
					return cell;
				});
			})
			.join('td')
			.html(ƒ('html'))
			.attr('class', ƒ('cl'));
	}
}


const vscode = acquireVsCodeApi();

// set the dimensions and margins of the graph
var margin = { top: 30, right: 30, bottom: 70, left: 60 },
	width = 300 - margin.left - margin.right,
	height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#chart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform",
		"translate(" + margin.left + "," + margin.top + ")");

var visualization = {};

visualization.yAxis = svg.append("g");
visualization.xAxis = svg.append("g");
visualization.circles = svg.selectAll("circles");

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
};

d3.json("http://localhost:9001/data").then((data) => {
	dataset.setData(data);
	displayData();
});

var displayData = VisualizationFunctions.embedding;
var throttledDisplayData = _.throttle(displayData, 100);

var socket = io.connect('ws://localhost:9001');
socket.emit('join', 'web');
socket.on('connect', () => { console.log("Connected"); });
socket.on('event', function (data) { console.log(data); });
socket.on('testreport', (data) => {
       dataset.handleTestReport(data);
       throttledDisplayData();
});

socket.on('predicted_failures', (data) => {
       dataset.handlePredictedFailures(data);
       throttledDisplayData();
});

socket.on('relevanceUpdate', data => {
       dataset.handleRelevanceUpdate(data);
       throttledDisplayData(true);
});


socket.on('disconnect', function () { });


window.addEventListener('message', event => {

	const message = event.data;

	switch (message.command) {
		case 'save': // Register save event to be handled in server 
			socket.emit('save', 'save');
			break;
		case 'refresh':
			console.log("Received refresh call");
			socket.connect('wss://localhost:9001');
			socket.emit('join', 'web');
			break;
		case 'onDidChangeVisibleTextEditors':
			socket.emit('onDidChangeVisibleTextEditors', message.textEditors);
			break;
		case 'onDidChangeTextEditorVisibleRanges':
			socket.emit('onDidChangeTextEditorVisibleRanges', message);
			break;
		case 'onSwitchVisualizationFunction':
			console.log(message.visualization);
			switch(message.visualization) {
				case 'scatter':
					displayData = VisualizationFunctions.scatter;
					break;
				case 'embedding':
					displayData = VisualizationFunctions.embedding;
					break;
				case 'table':
					displayData = VisualizationFunctions.table;
					break;
			}
			throttledDisplayData = _.throttle(displayData, 100);
	}
});
