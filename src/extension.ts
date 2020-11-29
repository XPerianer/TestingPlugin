// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('testingplugin.start', () => {
			// Create and show a new webview
			const panel = vscode.window.createWebviewPanel(
				'testingPlugin', // Identifies the type of the webview. Used internally
				'Testing Plugin', // Title of the panel displayed to the user
				vscode.ViewColumn.One, // Editor column to show the new webview panel in.
				{
					enableScripts: true,
					retainContextWhenHidden: true,
				}
			);
			panel.webview.html = getWebviewContext();
		}))
};

// this method is called when your extension is deactivated
export function deactivate() { }

function getWebviewContext() {
return `
<!doctype html>

<html>
<head>
	<title>Exercise 1, Part a</title>
	<script src="https://d3js.org/d3.v5.min.js"></script>
</head>

<body>
	<svg id="chart" width="900" height="400"></svg>
	<script>

	// set the dimensions and margins of the graph
	var margin = {top: 30, right: 30, bottom: 70, left: 60},
		width = 460 - margin.left - margin.right,
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
	d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv").then( data => {
	
	// X axis
	var x = d3.scaleBand()
	  .range([ 0, width ])
	  .domain(data.map(function(d) { return d.Country; }))
	  .padding(0.2);
	svg.append("g")
	  .attr("transform", "translate(0," + height + ")")
	  .call(d3.axisBottom(x))
	  .selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");
	
	// Add Y axis
	var y = d3.scaleLinear()
	  .domain([0, 13000])
	  .range([ height, 0]);
	svg.append("g")
	  .call(d3.axisLeft(y));
	
	// Bars
	svg.selectAll("mybar")
	  .data(data)
	  .enter()
	  .append("rect")
		.attr("x", function(d) { return x(d.Country); })
		.attr("y", function(d) { return y(d.Value); })
		.attr("width", x.bandwidth())
		.attr("height", function(d) { return height - y(d.Value); })
		.attr("fill", "#69b3a2")
	
	})
	</script>

</body>

</html>`
	}