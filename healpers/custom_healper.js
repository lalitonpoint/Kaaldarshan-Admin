// helpers/commonHelpers.js

const commonHelpers = {
    // Function to format dates
    formatDate: (date) => {
        if (!(date instanceof Date)) {
            throw new Error("Invalid date");
        }
        return date.toISOString().split('T')[0]; // Returns date in YYYY-MM-DD format
    },

    // Function to generate a random string
    generateRandomString: (length = 10) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    },

    // Function to check if a string is empty
    isEmpty: (str) => {
        return !str || str.trim().length === 0;
    }
};

// Export the helpers
module.exports = commonHelpers;
