async function initStateData(data) {

	const data2 = await d3.csv("https://raw.githubusercontent.com/sujoyb2/DV-project/master/covid-india-by-state-by-date.csv");

	var margin = {
			top: 50,
			right: 50,
			bottom: 70,
			left: 60
		},
		width = 800 - margin.left - margin.right,
		height = 600 - margin.top - margin.bottom;

	var data2Filtered = data2.filter(function (d) {
		return (d.State === data.State);
	});

	var svgScene2 = d3.select("#scene2")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(60, 60)");


	var x = d3.scaleBand()
		.range([0, width])
		.domain(data2.map(function (d) {
			return d.Date;
		}))
		.padding(0.2);
	svgScene2.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))

	var y = d3.scaleLinear()
		.domain([d3.min(data2Filtered, function (d) {
			return d.Confirmed
		}), d3.max(data2Filtered, function (d) {
			return d.Confirmed
		})])
		.range([height, 0]);

	svgScene2.append("g")
		.call(d3.axisLeft(y));

	console.log(data2Filtered);

	var tooltip = d3.select("#tooltip");

	console.log("height=" + height);

	svgScene2.selectAll("rect")
		.data(data2Filtered)
		.enter()
		.append("rect") // Add a new rect for each new elements
		.attr("x", function (d) {
			return x(d.Date);
		})
		.attr("width", x.bandwidth())
		.attr("y", height)
		.attr("height", 0)
		.attr("fill", "darkgreen")
		.on("click", function (d, i) {
			console.log("click");
			showDataByCountry(d);
		})
		.on('mouseover', function (d, i) {
			d3.select(this).style("fill", "lightgreen");
			tooltip.style("opacity", 1)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY) + "px")
				.html("Date:" + d.Date + "<br/> Confirmed: " + d.Confirmed + "<br/> Deaths: " + d.Deaths+ "<br/> Cured: " + d.Cured);
		})
		.on("mouseout", function () {
			d3.select(this).style("fill", "darkgreen");
			tooltip.style("opacity", 0)
		})
		.transition()
		.duration(1000)
		.attr("y", function (d) {
			return y(d.Confirmed);
		})
		.attr("height", function (d) {
			return height - y(d.Confirmed);
		})


	svgScene2.append("text")
		.attr("class", "x label")
		.attr("text-anchor", "end")
		.attr("x", width / 2)
		.attr("y", height + 40)
		.text("Date");

	svgScene2.append("text")
		.attr("class", "y label")
		.attr("text-anchor", "end")
		.attr("y", -50)
		.attr("x", 0)
		.attr("dy", ".25em")
		.attr("transform", "rotate(-90)")
		.text("Total no. of COVID Cases");

	const annotations = [{
		note: {
			title: "COVID cases for India State " + data.State,
			label: "",
			wrap: 200
		},
		x: 150,
		y: 50,
		color: "black"
	}]

    const annotate = d3.annotation()
      .type(d3.annotationLabel)
      .annotations(annotations)

    svgScene2
      .append("g")
      .attr("class", "annotation-group")
      .call(annotate)

	
}



async function loadOverviewData() {

	var margin = {
			top: 30,
			right: 30,
			bottom: 70,
			left: 60
		},
		width = 800 - margin.left - margin.right,
		height = 600 - margin.top - margin.bottom;

	var svg = d3.select("#scene0")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");


	var tooltip = d3.select("#tooltip");

	d3.csv("https://raw.githubusercontent.com/sujoyb2/DV-project/master/covid-india-by-day.csv",
		function (d) {
			return {
				date: d3.timeParse("%m/%d/%Y")(d.Date),
				Cured: +d.Cured,
				Deaths: +d.Deaths,
				Confirmed: +d.Confirmed
			}
		},

		function (data) {
			console.log(data);

			var xScale = d3.scaleTime()
				.domain(d3.extent(data, function (d) {
					return d.date;
				}))
				.range([0, width]);


			var xAxis = d3.axisBottom(xScale)
				.ticks(20)
				.tickFormat(d3.timeFormat('%m/%d'))
				.scale(xScale);


			svg.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);


			var yScale = d3.scaleLinear()
				.domain([0, d3.max(data, function (d) {
					return Math.max(d.Cured, d.Deaths, d.Confirmed);
				})])
				.range([height, 0]);

			var yAxis = d3.axisLeft(yScale);

			svg.append("g")
				.call(yAxis);

			svg.append("path")
				.datum(data)
				.attr("fill", "none")
				.attr("stroke", "green")
				.attr("stroke-width", 1.5)
				.attr("d", d3.line()
					.x(function (d) {
						return xScale(d.date)
					})
					.y(function (d) {
						return yScale(d.Cured)
					})
				)

			svg.append("path")
				.datum(data)
				.attr("fill", "none")
				.attr("stroke", "red")
				.attr("stroke-width", 1.5)
				.attr("d", d3.line()
					.x(function (d) {
						return xScale(d.date)
					})
					.y(function (d) {
						return yScale(d.Deaths)
					})
				)

			svg.append("path")
				.datum(data)
				.attr("fill", "none")
				.attr("stroke", "blue")
				.attr("stroke-width", 1.5)
				.attr("d", d3.line()
					.x(function (d) {
						return xScale(d.date)
					})
					.y(function (d) {
						return yScale(d.Confirmed)
					})
				)

			d3.select("svg")
				.append("text")
				.attr("x", 120)
				.attr("y", 30)
				.style("font-size", 14)
				.style("font-family", "Arial")
				.style("font-weight", 2)
				.text("Confirmed");

			d3.select("svg")
				.append("rect")
				.attr("width", 15)
				.attr("height", 8)
				.attr("fill", "blue")
				.attr("x", 100)
				.attr("y", 22);

			d3.select("svg")
				.append("text")
				.attr("x", 120)
				.attr("y", 50)
				.style("font-size", 14)
				.style("font-family", "Arial")
				.style("font-weight", 2)
				.text("Cured");

			d3.select("svg")
				.append("rect")
				.attr("width", 15)
				.attr("height", 8)
				.attr("fill", "green")
				.attr("x", 100)
				.attr("y", 42);

			d3.select("svg")
				.append("text")
				.attr("x", 120)
				.attr("y", 70)
				.style("font-size", 14)
				.style("font-family", "Arial")
				.style("font-weight", 2)
				.text("Death");

			d3.select("svg")
				.append("rect")
				.attr("width", 15)
				.attr("height", 8)
				.attr("fill", "red")
				.attr("x", 100)
				.attr("y", 62);

		})
		
	svg.append("text")
		.attr("class", "x label")
		.attr("text-anchor", "end")
		.attr("x", width / 2)
		.attr("y", height + 40)
		.text("Date");

	svg.append("text")
		.attr("class", "y label")
		.attr("text-anchor", "end")
		.attr("y", -52)
		.attr("x", -150)
		.attr("dy", ".25em")
		.attr("transform", "rotate(-90)")
		.text("No. of COVID case");


}

async function initCountryData() {

	document.getElementById("scene1").innerHTML = "";
	document.getElementById("scene2").innerHTML = "";

	const data = await d3.csv("https://raw.githubusercontent.com/sujoyb2/DV-project/master/covid-india-per-state.csv");
	console.log(data);

	var margin = {
			top: 30,
			right: 30,
			bottom: 70,
			left: 60
		},
		width = 800 - margin.left - margin.right,
		height = 600 - margin.top - margin.bottom;

	var svg = d3.select("#scene1")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	var x = d3.scaleBand()
		.range([0, width])
		.domain(data.map(function (d) {
			return d.State;
		}))
		.padding(0.2);
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))

	var y = d3.scaleLinear()
		.domain([40000, 10000000])
		.range([height, 0]);

	svg.append("g")
		.attr("class", "myYaxis")
		.call(d3.axisLeft(y));

	var tooltip = d3.select("#tooltip");

	svg.selectAll("rect")
		.data(data)
		.enter()
		.append("rect")
		.attr("x", function (d) {
			return x(d.State);
		})
		.attr("width", x.bandwidth())
		.attr("y", height)
		.attr("height", 0)
		.attr("fill", "darkblue")
		.on("click", function (d, i) {
			console.log("click");
			document.getElementById("scene2").innerHTML = "";
			initStateData(d);
		})
		.on('mouseover', function (d, i) {
			d3.select(this).style("fill", "blue");
			tooltip.style("opacity", 1)
				.style("top", (d3.event.pageY) + "px")
				.style("left", (d3.event.pageX) + "px")
				.html("State - " + d.State + "<br/>Confirmed Cases - " + d.Confirmed + "<br/>Cured cases - " + d.Cured + "<br/> Death - " + d.Cured);
		})
		.on("mouseout", function () {
			tooltip.style("opacity", 0)
			d3.select(this).style("fill", "darkblue");
		})
		.transition()
		.duration(500)
		.attr("y", function (d) {
			return y(d.Confirmed);
		})
		.attr("height", function (d) {
			return height - y(d.Confirmed);
		})

	svg.append("text")
		.attr("class", "x label")
		.attr("text-anchor", "end")
		.attr("x", width / 2)
		.attr("y", height + 40)
		.text("State");

	svg.append("text")
		.attr("class", "y label")
		.attr("text-anchor", "end")
		.attr("y", -52)
		.attr("x", -150)
		.attr("dy", ".25em")
		.attr("transform", "rotate(-90)")
		.text("Total no. of COVID case");

	const annotations = [{
		note: {
			title: "COVID case for India.",
			label: "Details shown on tooltip. Click on a State  name to get drill-down information.",
			wrap: 200
		},
		x: 250,
		y: 5,
		color: "black"
	}]

	const annotate = d3.annotation()
		.type(d3.annotationLabel)
		.annotations(annotations)

	svg
		.append("g")
		.attr("class", "annotation-group")
		.call(annotate)
}

