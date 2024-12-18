/**
 * Fetch the user's current location using the HTML5 Geolocation API.
 * @param {function} onSuccess - Callback function when location is successfully retrieved.
 * @param {function} onError - Callback function for handling errors.
 */
export const getUserLocation = (onSuccess, onError) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("User's Location:", latitude, longitude);
          onSuccess({ lat: latitude, lng: longitude });
        },
        (error) => {
          let errorMessage = "";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable it in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Request to get location timed out.";
              break;
            default:
              errorMessage = "An unknown error occurred.";
              break;
          }
          console.error("Error fetching location:", errorMessage);
          if (onError) onError(errorMessage);
        }
      );
    } else {
      const errorMsg = "Geolocation is not supported by this browser.";
      console.error(errorMsg);
      if (onError) onError(errorMsg);
    }
  };
  