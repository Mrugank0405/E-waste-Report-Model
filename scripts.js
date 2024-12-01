// Example of loading JSON in the browser using fetch
fetch('data.json')
    .then(response => response.json())
    .then(cityData => {
        console.log('Data loaded:', cityData);
        setupApp(cityData);
    })
    .catch(err => {
        console.error('Error loading data:', err);
    });

function setupApp(cityData) {
    const cityDropdown = document.getElementById('city');
    const generateButton = document.getElementById('generate');
    const resultsDiv = document.getElementById('results');

    // Populate the dropdown with city names
    cityData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.City;
        option.textContent = item.City;
        cityDropdown.appendChild(option);
    });

    generateButton.addEventListener('click', () => {
        const selectedCity = cityDropdown.value;
        console.log('Selected city:', selectedCity);  // Log selected city

        // Find the selected city's data
        const cityItem = cityData.find(item => item.City === selectedCity);

        if (!selectedCity || !cityItem) {
            resultsDiv.textContent = 'Please select a valid city.';
            return;
        }

        const cityEwasteData = Object.values(cityItem.Data);  // Extract e-waste data for the selected city
        displayResults(selectedCity, cityEwasteData);
        visualizeData(cityEwasteData);  // Call visualization function
    });
}

function displayResults(city, data) {
    const resultsDiv = document.getElementById('results');

    // Sort the data
    const sortedData = [...data].sort((a, b) => a - b);

    // Linear Regression Calculation
    const n = sortedData.length;
    const x = Array.from({ length: n }, (_, i) => i); // [0, 1, 2, ..., n-1]
    const sum = arr => arr.reduce((acc, val) => acc + val, 0);
    const sumProduct = (arr1, arr2) => arr1.reduce((acc, val, i) => acc + val * arr2[i], 0);
    const sumSquared = arr => arr.reduce((acc, val) => acc + val * val, 0);

    const sumX = sum(x);
    const sumY = sum(sortedData);
    const sumXY = sumProduct(x, sortedData);
    const sumX2 = sumSquared(x);

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX); // Slope
    const b = (sumY - m * sumX) / n; // Intercept

    // Predict the next year's value
    const predictedValue = m * n + b;

    // Calculate additional metrics
    const meanValue = sum(sortedData) / n;
    const percentageChange = ((predictedValue - meanValue) / meanValue) * 100;
    const requiredCapacityIncrease = predictedValue - Math.max(...sortedData); // Assuming current capacity is the max e-waste generated in the past
    const growthRate = ((sortedData[sortedData.length - 1] - sortedData[0]) / sortedData[0]) * 100;

    // Display Results
    resultsDiv.innerHTML = `
    <h2>Results for ${city}</h2>
    <p><strong>Sorted Data:</strong> ${sortedData.join(', ')}</p>
    <p><strong>Slope (m):</strong> ${m.toFixed(2)}</p>
    <p><strong>Intercept (b):</strong> ${b.toFixed(2)}</p>
    <p><strong>Predicted E-Waste for Next Year:</strong> ${predictedValue.toFixed(2)}</p>
    <h3>Analysis:</h3>
    <p><strong>Mean E-Waste (Historical Average):</strong> ${meanValue.toFixed(2)}</p>
    <p><strong>Percentage Change from Mean:</strong> ${percentageChange.toFixed(2)}%</p>
    <p><strong>Required Capacity Increase:</strong> ${requiredCapacityIncrease.toFixed(2)} kg (This is how much more capacity is needed to handle the predicted e-waste)</p>
    <p><strong>Annual Growth Rate:</strong> ${growthRate.toFixed(2)}% (Based on historical data)</p>
    `;
}

function visualizeData(data) {
    const ctx = document.getElementById('ewasteChart').getContext('2d');

    // Prepare the data for the chart
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i); // [0, 1, 2, ..., n-1]
    const sortedData = [...data].sort((a, b) => a - b);

    const predictedData = [...sortedData];
    predictedData.push(sortedData[sortedData.length - 1] + (sortedData[sortedData.length - 1] - sortedData[0])); // Adding next year's predicted value

    // Chart Data
    const chartData = {
        labels: x.concat(n),  // Adding the extra point for prediction
        datasets: [
            {
                label: 'Historical E-Waste Data',
                data: sortedData,
                borderColor: 'blue',
                fill: false,
            },
            {
                label: 'Predicted E-Waste Data',
                data: predictedData,
                borderColor: 'red',
                fill: false,
                dashed: true
            }
        ]
    };

    // Chart Configuration
    const config = {
        type: 'line',
        data: chartData,
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Years'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'E-Waste Generation (kg)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    };

    // Create the chart
    new Chart(ctx, config);
}