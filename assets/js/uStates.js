(function () {
	//VARIABLE DECLARATION
	var uStatePaths, offers, offersCoordinates, offersData, legend, urlObj, uStates;
	//VARIABLE INSTANTIATION
	offersData = [];
	legend = ["zillow offers", "opendoor", "offerpad", "knock"]
	urlObj = {
		mapdata: "assets/api/us-map-data.json",
		offersdata: "assets/api/offers-data.json",
		coordinatesdata: "assets/api/coordinates-data.json"
	}
	uStates = {};
	this.uStates = uStates;
	initMap()
	uStates.draw = function (id, data) {
		createSvgGroup(id, data);
		addStatelabels(id)
		addOffersLabels(id, offersData[1].opendoor, "opendoor", "value-opendoor");
		addOffersLabels(id, offersData[0].zillowoffers, "zillowoffers", "value-zillowoffers");
		addOffersLabels(id, offersData[3].knock, "knock", "value-knock");
		addOffersLabels(id, offersData[2].offerpad, "offerpad", "value-offerpad");
		creatLegend(id)
	}

	function initMap() {
		getMapData(urlObj)
			.then(function () {
				manipulateOffersData()
				uStates.draw("#statesvg", uStatePaths);
			})
	}
	function createSvgGroup(id, data) {
		d3.select(id).selectAll("g")
			.data(data).enter().append("g")
			.append("path")
			.attr("class", "state")
			.attr("d", function (d) { return d.d; })
			.style("fill", "#ebeff2")

	}
	function addStatelabels(id) {
		d3.select(id).selectAll("g").append("svg:text").text(function (d) { return d.id })
			.attr("class", function (d) { return "label-state label-" + d.id })
			.attr("x", function (d, i) { return d.c.x })
			.attr("y", function (d, i) { return d.c.y })
			.attr("text-anchor", "middle")
	}
	function addOffersLabels(id, data, labelClass, valuesLabels) {
		d3.select(id).selectAll(labelClass)
			.data(data).enter()
			.append("circle")
			.attr("class", labelClass)
			.attr("cx", function (d, i) { return d.x || getOfferLabelCoordsByStateLabel(d.state).x; })
			.attr("cy", function (d, i) { return d.y || getOfferLabelCoordsByStateLabel(d.state).y })
			.attr("r", function (d, i) { return labelRadius(d.value) })

		d3.select(id).selectAll(valuesLabels)
			.data(data).enter()
			.append("text")
			.text(function (d) { return d.value })
			.attr("class", valuesLabels)
			.attr("x", function (d, i) { return d.x || getOfferLabelCoordsByStateLabel(d.state).x })
			.attr("y", function (d, i) { return 3.5 + (d.y || getOfferLabelCoordsByStateLabel(d.state).y) })
			.attr("text-anchor", "middle")
	}
	function creatLegend(id) {
		d3.select(id).selectAll("legend")
			.data(legend).enter().append("g")
			.attr("class", "legend")
			.append("circle")
			.attr("class", function (d, i) { return d.replace(" ", "") })
			.attr("cx", function (d, i) { return 700 })
			.attr("cy", function (d, i) { return 30 + 15 * i })
			.attr("r", function (d, i) { return 4 })

		d3.select(id).selectAll("legend-labels")
			.data(legend).enter()
			.append("text")
			.attr("class", "legend-labels")
			.text(function (d) { return d.charAt(0).toUpperCase() + d.slice(1) })
			.attr("x", function (d, i) { return 715 })
			.attr("y", function (d, i) { return 34 + 15 * i })
	}
	function getOfferLabelCoordsByStateLabel(state) {
		var labelCoords = uStatePaths.find(function (uStatePath) {
			return uStatePath.id === state;
		})['c'];

		return {
			x: labelCoords.x,
			y: labelCoords.y + 20
		}
	}
	function manipulateOffersData() {
		offers.forEach(function (item) {
			var offerItems = item[Object.keys(item)],
				offerMatch = offersCoordinates.find(function (e) {
					return Object.keys(item)[0] === Object.keys(e)[0]
				}),
				offerMatchArr = offerMatch[Object.keys(offerMatch)],
				stateMatch = null;

			offerItems.forEach(function (e) {
				stateMatch = offerMatchArr.find(function (d) {
					return e.state === d.state
				})

				if (stateMatch) {
					stateMatch.value = e.value
				} else {
					offerMatchArr.push(e)
				}

			})
			offerMatchArr.forEach(function (d) {
				if (!d.hasOwnProperty('value')) {
					var index = offerMatchArr.indexOf(d)
					offerMatchArr.splice(index, 1)
				}
			})
			offersData.push(offerMatch)
		})
	}
	function getMarkerData(url) {
		return fetch(url)
			.then(function (response) {
				return response.json();
			})
			.then(function (result) {
				return result
			})
			.catch(function (error) { console.error('Error:', error) });
	}
	function getMapData(urlObj) {

		return fetch(urlObj.mapdata)
			.then(function (response) {
				return response.json();
			})
			.then(function (result) {
				uStatePaths = result
			})
			.then(function () {
				return Promise.all([getMarkerData(urlObj.offersdata), getMarkerData(urlObj.coordinatesdata)])
					.then(function (value) {
						offers = value[0];
						offersCoordinates = value[1];
					})
			})
			.catch(function (error) { console.error('Error:', error) });
	}
	function labelRadius(value) {
		switch (true) {
			case (value > 1 && value <= 9):
				r = 7
				break;
			case (value >= 10 && value <= 99):
				r = 10
				break;
			case (value >= 100):
				r = 12
				break;
			default:
				r = 13
		}
		return r
	}
})();



