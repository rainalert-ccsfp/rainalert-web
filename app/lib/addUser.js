// addUser.js

const addUser = async (userData) => {
  try {
    const response = await fetch("http://localhost/api/signup.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return { success: true, message: "Sign up successful!" };
    } else {
      throw new Error(data.message || "Sign up failed. Please try again.");
    }
  } catch (error) {
    console.error("Network error during sign up:", error);

    throw new Error(
      "Network error. Could not connect to server. Please check your internet connection or server status."
    );
  }
};

export default addUser;
