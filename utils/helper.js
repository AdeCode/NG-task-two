  export const analyzeString = (str) => {
    if (typeof str !== "string") {
        throw new Error('Invalid input: expected a string');
      }
    
      // Calculate length (includes spaces, punctuation, etc.)
      const length = str.length;
    
      // Normalize string for palindrome check (case-insensitive)
      const normalized = str.toLowerCase();
    
      // Reverse the normalized string
      const reversed = normalized.split("").reverse().join("");
    
      // Check if it's a palindrome
      const isPalindrome = normalized === reversed;

      // Character frequency map (case-insensitive)
    const frequencyMap = {};
    for (const char of normalized) {
        frequencyMap[char] = (frequencyMap[char] || 0) + 1;
    }

    // Count of unique characters
    const uniqueCharacters = Object.keys(frequencyMap).length;

    //calculate word count
    const trimmedValue = str.trim();
    const words = trimmedValue === "" ? [] : trimmedValue.split(/\s+/);
    const wordCount = words.length;
    
      return {
        value: str,
        length,
        isPalindrome,
        unique_characters: uniqueCharacters,
        character_frequency_map: frequencyMap,
        word_count:wordCount,
      };
  }