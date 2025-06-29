export const handleSubmit = async ({
  distance,
  setResponseMessage,
  setErrorMessage,
}) => {
  setResponseMessage("");
  setErrorMessage("");

  try {
    const res = await fetch("/api/sensor", {
      // POST to save data
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // You should send the actual data your NodeMCU sends here.
      // For a manual test, ensure you send temperature, humidity, and distance.
      body: JSON.stringify({
        temperature: 25.0, // Example value
        humidity: 65.0, // Example value
        distance: parseFloat(distance) || 100.0, // Use provided distance or default
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      setResponseMessage(data.message);
      return data.receivedData;
    } else {
      setErrorMessage(
        data.message || "An error occurred during data submission."
      );
      return null;
    }
  } catch (error) {
    console.error(
      "Frontend Error: Failed to connect to server for data submission (POST).",
      error
    );
    setErrorMessage("Failed to connect to the server for data submission.");
    return null;
  }
};

export const fetchCurrentSensorData = async () => {
  try {
    const res = await fetch("/api/current-sensor-data", {
      // GET to retrieve latest data
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch current data.");
    }

    const responseJson = await res.json();
    if (responseJson.success && responseJson.data) {
      return responseJson.data; // Returns { temperature, humidity, distance, timestamp }
    } else {
      throw new Error(
        responseJson.message ||
          "API returned an unexpected structure for GET sensor data."
      );
    }
  } catch (error) {
    console.error(
      "Frontend Error: Error fetching current sensor data (GET).",
      error
    );
    return null;
  }
};
