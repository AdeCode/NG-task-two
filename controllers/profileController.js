const fetchProfile = async(req,res)=>{
    //fetch a random fact
    const response = await fetch('https://catfact.ninja/fact')
    const fact = await response.json()

    // Current UTC timestamp in ISO 8601
    const timestamp = new Date().toISOString();
    
    try{
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({
            status: "success",
            user:{
                email:'codeadex@gmail.com',
                name: "Agoro Habeeb Adekorede",
                stack: "Node.js/Express",
            },
            timestamp,
            fact: fact?.fact
        })
    }catch(error){
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