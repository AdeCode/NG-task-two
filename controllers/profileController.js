const fetchProfile = async(req,res)=>{
    try{
        let catFact = null;
        res.setHeader("Content-Type", "application/json");

        try {
            //fetch a random fact
            const response = await fetch("https://catfact.ninja/fact");
      
            if (!response.ok) {
              throw new Error(`External API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            // Ensure the API returned a valid fact
            if (!data?.fact) {
              throw new Error("External API returned invalid data");
            }
            catFact = data.fact;
        } catch (error) {
            console.error("Error fetching cat fact:", error.message);      
            catFact = "Error fetching cat fact. Please try again later.";
        }

        return res.status(200).json({
            status: "success",
            user:{
                email:'codeadex@gmail.com',
                name: "Agoro Habeeb Adekorede",
                stack: "Node.js/Express",
            },
            timestamp: new Date().toISOString(),
            fact: catFact
        })
    }catch(error){
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({
            success: false,
            message: "Error fetching data",
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
}

module.exports = {
    fetchProfile,
}