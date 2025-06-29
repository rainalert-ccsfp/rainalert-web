// This file would typically be located at:
// - `pages/api/sensor.js` (for Pages Router)
// - `app/api/sensor/route.js` (for App Router)

// The POST function handles incoming HTTP POST requests.
export async function POST(request) {
  try {
    // Parse the incoming request body as JSON.
    const data = await request.json();
    // Destructure the expected sensor data from the JSON payload,
    // including the new 'distance' field.
    const { temperature, humidity, distance } = data; 

    console.log('--- Received data from NodeMCU (Next.js API) ---');
    console.log('Temperature:', temperature);
    console.log('Humidity:', humidity);
    console.log('Distance:', distance); // Log the received distance value
    console.log('-------------------------------------------------');

    // Create a successful JSON response indicating data receipt.
    // Include all received data (temperature, humidity, and distance) in the response.
    return new Response(
      JSON.stringify({ 
        message: 'Data received successfully by Next.js API!', 
        receivedData: { temperature, humidity, distance } // Echo back all received data
      }),
      {
        status: 200, // HTTP status code 200 (OK)
        headers: {
          'Content-Type': 'application/json', // Specify content type as JSON
          'Access-Control-Allow-Origin': '*', // Allow requests from any origin (CORS)
          'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allowed HTTP methods
          'Access-Control-Allow-Headers': 'Content-Type', // Allowed request headers
        },
      }
    );
  } catch (error) {
    // Handle any errors that occur during processing the request.
    console.error('Error processing NodeMCU data:', error);
    // Create an error response with a 500 status code.
    return new Response(
      JSON.stringify({ message: 'Internal Server Error', error: error.message }),
      {
        status: 500, // HTTP status code 500 (Internal Server Error)
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// The OPTIONS function handles preflight requests for CORS.
// This is necessary for browsers to check if the cross-origin request is allowed.
export async function OPTIONS() {
  return new Response(null, {
    status: 204, // HTTP status code 204 (No Content)
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
