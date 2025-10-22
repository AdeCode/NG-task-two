const { analyzeString } = require("../utils/helper");
const axios = require("axios");

const handelStringAnalysis = async (req, res) => {
    const crypto = require("crypto");

    try {
        const id = crypto.randomBytes(16).toString("hex");
        res.setHeader("Content-Type", "application/json");

        const currentString = req.body.value

        if (!req.body || currentString === undefined || currentString === null) {
            return res.status(400).json({
                success: false,
                message: '400 Bad Request: Invalid request body or missing "value" field',
                timestamp: new Date().toISOString(),
            });
        }
        if (typeof currentString !== "string") {
            return res.status(422).json({
                success: false,
                message: '422 Unprocessable Entity: Invalid data type for "value" (must be string)',
                timestamp: new Date().toISOString(),
            });
        }

        // Check if string already exists
        const existing = await axios.get(
            `http://localhost:6000/stringData?value=${encodeURIComponent(currentString)}`
        );

        if (existing.data && existing.data.length > 0) {
            return res.status(409).json({
                success: false,
                message: "String already exists in the system",
                timestamp: new Date().toISOString(),
            });
        }

        const sha256Hash = crypto.createHash("sha256").update(currentString).digest("hex")

        const { length, isPalindrome, character_frequency_map, word_count } = analyzeString(currentString)

        const finalResponse = {
            id,
            value: req.body.value,
            properties: {
                length,
                is_palindrome: isPalindrome,
                unique_characters: 12,
                word_count,
                character_frequency_map,
                sha256_hash: sha256Hash
            },
            created_at: new Date().toISOString(),
        }

        const addString = async () => {
            const res = await axios.post("http://localhost:6000/stringData", finalResponse);
            console.log('added', res.data)
        }
        addString()


        return res.status(201).json(finalResponse)
    } catch (error) {
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({
            success: false,
            message: "Error fetching data",
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
}

const handleFetchString = async (req, res) => {
    try {
        res.setHeader("Content-Type", "application/json");

        const { string_value } = req.params;

        if (!string_value) {
            return res.status(400).json({
                success: false,
                message: '400 Bad Request: Missing "string_value" parameter',
                timestamp: new Date().toISOString(),
            });
        }

        const response = await axios.get(
            `http://localhost:6000/stringData?value=${encodeURIComponent(string_value)}`
        );

        const data = response.data;

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "404 Not Found: String does not exist in the system",
                timestamp: new Date().toISOString(),
            });
        }
        return res.status(200).json(data[0]);
    } catch (error) {
        console.error("Error fetching string:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error fetching string from database",
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
}

const handleFilterStrings = async (req, res) => {
    try {
        res.setHeader("Content-Type", "application/json");

        const {
            is_palindrome,
            min_length,
            max_length,
            word_count,
            contains_character,
        } = req.query;

        // Fetch all strings from the JSON DB
        const response = await axios.get("http://localhost:6000/stringData");
        const allStrings = response.data;

        if (!Array.isArray(allStrings) || allStrings.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No strings found in the system",
                data: [],
                timestamp: new Date().toISOString(),
            });
        }

        // Apply filters
        let filteredStrings = allStrings.filter((item) => {
            const { properties } = item;
            if (!properties) return false;

            // Filter by palindrome (if specified)
            if (is_palindrome !== undefined) {
                const shouldBePalindrome = is_palindrome === "true";
                if (properties.is_palindrome !== shouldBePalindrome) return false;
            }

            if (min_length && properties.length < Number(min_length)) return false;


            if (max_length && properties.length > Number(max_length)) return false;

            // Filter by word count
            if (word_count && properties.word_count !== Number(word_count)) return false;

            // Filter by character inclusion
            if (contains_character) {
                const char = contains_character.toLowerCase();
                if (!item.value.toLowerCase().includes(char)) return false;
            }
            return true;
        });

        const filtersApplied = {};
        if (is_palindrome !== undefined) filtersApplied.is_palindrome = is_palindrome === "true";
        if (min_length !== undefined) filtersApplied.min_length = Number(min_length);
        if (max_length !== undefined) filtersApplied.max_length = Number(max_length);
        if (word_count !== undefined) filtersApplied.word_count = Number(word_count);
        if (contains_character !== undefined) filtersApplied.contains_character = contains_character;

        return res.status(200).json({
            success: true,
            count: filteredStrings.length,
            data: filteredStrings,
            filters_applied: filtersApplied
        });
    } catch (error) {
        console.error("Error filtering strings:", error.message);
        return res.status(400).json({
            success: false,
            message: "400 Bad Request: Invalid query parameter values or types",
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
};

const handleNaturalLanguageFilter = async (req, res) => {
    try {
        res.setHeader("Content-Type", "application/json");
        const rawQuery = req.query?.query;

        // 400: missing/empty
        if (!rawQuery || rawQuery.trim() === "") {
            return res.status(400).json({
                success: false,
                message: '400 Bad Request: Missing or empty "query" parameter',
                timestamp: new Date().toISOString(),
            });
        }

        const q = rawQuery.toLowerCase();

        // fetch DB
        const response = await axios.get("http://localhost:6000/stringData");
        const allStrings = Array.isArray(response.data) ? response.data : [];

        // Parseers / detectors
        let isPalindromeFilter = null; // true/false/null
        let wordCountExact = null;
        let minWordCount = null;
        let maxWordCount = null;
        let minLength = null;
        let maxLength = null;
        let containsChars = []; // array of single chars
        let containsStrings = []; // array of substrings

        // --- Palindrome detection ---
        if (/\b(non-?palindromic|not palindrome|not palindromic)\b/.test(q)) {
            isPalindromeFilter = false;
        } else if (/\b(palindrome|palindromic)\b/.test(q)) {
            isPalindromeFilter = true;
        }

        // --- Word count detection ---
        // explicit spelled out phrases
        if (/\bsingle word\b|\bone word\b/.test(q)) wordCountExact = 1;
        if (/\btwo words\b|\b2 words?\b|\b2 word\b/.test(q)) wordCountExact = 2;
        if (/\bthree words\b|\b3 words?\b|\b3 word\b/.test(q)) wordCountExact = 3;
        if (/\bfour words\b|\b4 words?\b|\b4 word\b/.test(q)) wordCountExact = 4;

        // "X words" where X is a number
        const explicitWordMatch = q.match(/(\b\d+\b)\s*(?:word|words)\b/);
        if (explicitWordMatch && !wordCountExact) {
            wordCountExact = parseInt(explicitWordMatch[1], 10);
        }

        // "at least N words", "minimum N words"
        const minWordsMatch = q.match(/(?:at least|minimum|min\.?|no less than)\s*(\d+)\s*(?:word|words)\b/);
        if (minWordsMatch) minWordCount = Number(minWordsMatch[1]);

        // "at most N words", "no more than N words", "maximum N words"
        const maxWordsMatch = q.match(/(?:at most|no more than|maximum|max\.?)\s*(\d+)\s*(?:word|words)\b/);
        if (maxWordsMatch) maxWordCount = Number(maxWordsMatch[1]);

        // --- Length detection (characters) ---
        const betweenLenMatch = q.match(/(?:length|characters?)\s*(?:between|from)\s*(\d+)\s*(?:and|-|to)\s*(\d+)/);
        if (betweenLenMatch) {
            minLength = Number(betweenLenMatch[1]);
            maxLength = Number(betweenLenMatch[2]);
        } else {
            const minLenMatch = q.match(/(?:longer than|greater than|more than|min(?:imum)? length|at least)\s*(\d+)\b/);
            if (minLenMatch) minLength = Number(minLenMatch[1]);

            const maxLenMatch = q.match(/(?:shorter than|less than|under|below|max(?:imum)? length|at most)\s*(\d+)\b/);
            if (maxLenMatch) maxLength = Number(maxLenMatch[1]);
        }

        // Also accept "long strings" / "short strings" as loose hints
        if (/(\blong strings\b|\blonger strings\b)/.test(q) && !minLength) minLength = 20; // heuristic
        if (/(\bshort strings\b|\bshorter strings\b)/.test(q) && !maxLength) maxLength = 5; // heuristic

        // --- "contains" detection ---
        // 1) contains quoted substring: contains "abc" or contains 'abc'
        const quotedContains = [...q.matchAll(/contains\s+["']([^"']+)["']/g)];
        for (const m of quotedContains) {
            if (m[1]) containsStrings.push(m[1].toLowerCase());
        }

        // 2) contains the letter(s) or contains letters a,b or contains a or b
        const containsLettersMatch = q.match(/contains(?: the)?(?: letters?| letter)?\s*([a-z0-9](?:[,\sorand]+[a-z0-9])*)/);
        if (containsLettersMatch) {
            const raw = containsLettersMatch[1];
            // split by commas, spaces, "or", "and"
            const parts = raw.split(/[,|\s|or|and]+/).map(s => s.trim()).filter(Boolean);
            for (const p of parts) {
                if (p.length === 1) containsChars.push(p.toLowerCase());
                else containsStrings.push(p.toLowerCase());
            }
        }

        // 3) generic contains X (fallback) - captures single word after 'contains'
        if (containsStrings.length === 0 && containsChars.length === 0) {
            const fallbackContains = q.match(/contains\s+([a-z0-9]+)/);
            if (fallbackContains) {
                const token = fallbackContains[1];
                if (token.length === 1) containsChars.push(token.toLowerCase());
                else containsStrings.push(token.toLowerCase());
            }
        }

        // If user explicitly says 'contains character a' or 'contains character "a"'
        const charExplicit = q.match(/contains (?:character|char)\s*["']?([a-z0-9])["']?/);
        if (charExplicit) containsChars.push(charExplicit[1].toLowerCase());

        // Normalize unique results
        containsChars = [...new Set(containsChars)];
        containsStrings = [...new Set(containsStrings)];

        // --- Determine whether any filters were detected ---
        const detectedAny =
            isPalindromeFilter !== null ||
            wordCountExact !== null ||
            minWordCount !== null ||
            maxWordCount !== null ||
            minLength !== null ||
            maxLength !== null ||
            containsChars.length > 0 ||
            containsStrings.length > 0;

        // 400: unable to parse
        if (!detectedAny) {
            return res.status(400).json({
                success: false,
                message: "400 Bad Request: Unable to parse natural language query",
                timestamp: new Date().toISOString(),
            });
        }

        // --- Conflict checks ---
        if (minLength !== null && maxLength !== null && minLength > maxLength) {
            return res.status(422).json({
                success: false,
                message:
                    "422 Unprocessable Entity: Query parsed but resulted in conflicting filters (min_length greater than max_length)",
                timestamp: new Date().toISOString(),
            });
        }

        if (minWordCount !== null && maxWordCount !== null && minWordCount > maxWordCount) {
            return res.status(422).json({
                success: false,
                message:
                    "422 Unprocessable Entity: Query parsed but resulted in conflicting filters (min_word_count greater than max_word_count)",
                timestamp: new Date().toISOString(),
            });
        }

        if (/\bpalindrome\b/.test(q) && /\b(non-?palindromic|not palindrome|not palindromic)\b/.test(q)) {
            return res.status(422).json({
                success: false,
                message:
                    '422 Unprocessable Entity: Query parsed but resulted in conflicting filters ("palindrome" and "non-palindromic" both detected)',
                timestamp: new Date().toISOString(),
            });
        }

        // --- Apply filters to DB ---
        const filtered = allStrings.filter(item => {
            const props = item.properties || {};
            // palindrome
            if (isPalindromeFilter !== null && props.is_palindrome !== isPalindromeFilter) return false;

            // exact word count
            if (wordCountExact !== null && props.word_count !== wordCountExact) return false;

            // min/max word count
            if (minWordCount !== null && props.word_count < minWordCount) return false;
            if (maxWordCount !== null && props.word_count > maxWordCount) return false;

            // length checks (note: properties.length is total characters)
            if (minLength !== null && props.length < minLength) return false;
            if (maxLength !== null && props.length > maxLength) return false;

            // contains single characters -> match any of them (OR)
            if (containsChars.length > 0) {
                const val = String(item.value || "").toLowerCase();
                const anyChar = containsChars.some(c => val.includes(c));
                if (!anyChar) return false;
            }

            // contains substrings -> match any of them (OR)
            if (containsStrings.length > 0) {
                const val = String(item.value || "").toLowerCase();
                const anySub = containsStrings.some(s => val.includes(s));
                if (!anySub) return false;
            }

            return true;
        });

        // If no matches -> 404 Not Found (as your previous behavior)
        if (!filtered || filtered.length === 0) {
            return res.status(404).json({
                success: false,
                message: "404 Not Found: String does not exist in the system",
                timestamp: new Date().toISOString(),
            });
        }

        // Build parsed_filters object to return (only include detected keys)
        const parsedFilters = {};
        if (wordCountExact !== null) parsedFilters.word_count = wordCountExact;
        if (minWordCount !== null) parsedFilters.min_word_count = minWordCount;
        if (maxWordCount !== null) parsedFilters.max_word_count = maxWordCount;
        if (isPalindromeFilter !== null) parsedFilters.is_palindrome = isPalindromeFilter;
        if (minLength !== null) parsedFilters.min_length = minLength;
        if (maxLength !== null) parsedFilters.max_length = maxLength;
        if (containsChars.length === 1) parsedFilters.contains_character = containsChars[0];
        if (containsChars.length > 1) parsedFilters.contains_characters = containsChars;
        if (containsStrings.length === 1) parsedFilters.contains_string = containsStrings[0];
        if (containsStrings.length > 1) parsedFilters.contains_strings = containsStrings;

        // --- Final response in requested format ---
        return res.status(200).json({
            data: filtered,
            count: filtered.length,
            interpreted_query: {
                original: rawQuery,
                parsed_filters: parsedFilters
            }
        });
    } catch (err) {
        console.error("Error in natural language filter:", err.message);
        return res.status(500).json({
            success: false,
            message: "Error processing natural language filter",
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
};

const handleDeleteString = async (req, res) => {
    const stringValue = req.params.string_value;

    try {
        // Fetch all data from JSON Server
        const { data } = await axios.get("http://localhost:6000/stringData");

        // Find the string that matches exactly
        const stringItem = data.find(item => item.value === stringValue);

        // 404 if not found
        if (!stringItem) {
            return res.status(404).json({
                success: false,
                message: "404 Not Found: String does not exist in the system",
                timestamp: new Date().toISOString(),
            });
        }

        // Delete the string by its ID
        await axios.delete(`http://localhost:6000/stringData/${stringItem.id}`);

        //Success — no content
        return res.status(204).send(); // Empty response body
    } catch (error) {
        console.error("Error deleting string:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error deleting string",
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
};



module.exports = {
    handelStringAnalysis,
    handleFetchString,
    handleFilterStrings,
    handleNaturalLanguageFilter,
    handleDeleteString
}