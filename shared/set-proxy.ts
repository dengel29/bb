// Create a Set
const originalSet = new Set<number | string>();

const handler: ProxyHandler<Set<string | number>> = {
  set: function (target: Set<string | number>, key, value: number | string) {
    // Convert the value from a string to a number
    const numericValue = Number(value);

    // Check if the conversion was successful and the result is a number
    if (!isNaN(numericValue)) {
      // Add the numeric value to the original Set
      target[numericValue];
      return true; // Indicate success
    } else {
      // Conversion failed, don't add the value to the Set
      console.error(`Conversion failed for value: ${value}`);
      return false; // Indicate failure
    }
  },
};

// Create a Proxy for the Set
const setProxy = new Proxy(originalSet, handler);

// Add values to the Proxy (they will be converted to numbers)
setProxy.add("42");
// setProxy.add("123");
// setProxy.add("invalid"); // This will fail to add and log an error

// Check the contents of the original Set
console.log(originalSet); // Set { 42, 123 }
