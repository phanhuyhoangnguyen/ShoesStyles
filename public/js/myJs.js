function hasElements(assocArray, indexArray) {
	var isTrue = false;
	indexArray.forEach(function (elementValue) {
		if (assocArray[elementValue] != null) //holding value if existed e.g. gender: {men:true}
			isTrue = true;
	});
	return isTrue;
}

function findIndex(array, item) {
	var index = -1;
	// i is the counter for finding the index
	var i = 0;
	array.forEach(function (element) {
		if (element['$id'] === item['$id'] && element['colourSelected'] === item['colourSelected'] &&
			element['sizeSelected'] === item['sizeSelected']) {
			return index = i;
		} else
			// i is increment gradually from 0 to end of array size,
			// it will be assign to the index once the item is matched or 
			i++;
	});
	return index;
}