class ScoreSet extends Set {
  add(value: number | string) {
    const numericValue = Number(value);

    // Check if the conversion was successful and the result is a number
    if (!isNaN(numericValue)) {
      // Add the numeric value to the original Set
      return super.add(numericValue);
      // return true; // Indicate success
    } else {
      // Conversion failed, don't add the value to the Set
      console.error(`Conversion failed for value: ${value}`);
      return this; // Indicate failure
    }
  }
}

const ss = new ScoreSet();
ss.add("42");
ss.add(43);
