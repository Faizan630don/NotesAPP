const express = require("express");
const app = express()
const bcrypt = require("bcrypt");
const { error } = require("console");
const jwt = require("jsonwebtoken");

app.use(express.json())
const notes = [
    {
        id:1,
        text: "first notes",
        checkboxes:[
            {
                "id":1,
                "task":"do coding",
                "status":"pending"
            }
        ]
    }
]


const users = []

app.post("/user/register",(req,res)=>{
   try { 
    const {username, password} = req.body
    if(!username || !password){
        return res.status(400).json({
            success : false,
            error : "username or  password is required..."
        })
    }
    const existinguser = users.find((user)=>user.username==username)
    if (existinguser) {
       return res.status(400).json({
            success : false,
            error : "user already exists..."
        })
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
        id : users.length + 1,
        username,
        password: hashedPassword

    }

    users.push(newUser)
    res.status(200).json({
        success: true,
        message:"User registered Successsfully",
        data: newUser
    })
   }
   catch(error){
    res.status(500).json({
        success:false,
        error: err.message || "internal server error"
    })

   }

}
)

app.post('/user/login',(req, res) => {
    try{
        const { username, password} = req.body
        const user = users.find((user)=>user.username === username)
        if(!user){
            return res.status(400).json({
                success: false,
                error: "usern not find , plz register"
            })
        }
        
        const isPasswordMatching =bcrypt.compareSync(password, user.password);
        if(!isPasswordMatching){
            return res.status(400).json({
                success:false,
                error: "invalid password"
            })
        }
        const token = jwt.sign({id:user.id, username:user.username } , "secretKey", {expiresIn: "1h"})

        res.status(200).json({
            success:true,
            message:"login successfull",
            data: {
                user,
                token
            }
        })

    }catch(error){
        res.status(500).json({
            success:false,
            error: error.message || "Internal server Errror"
        })

    }
})




const authenticateToken = (req, res, next) => {

    const authHeader = req.headers["authorization"]

   

    if(!authHeader){
        return res.status(401).json({
            success:false,
            error:"Access token required"
        })
    }

    jwt.verify(authHeader, "secretKey", (err, user) => {

        if(err){
            return res.status(403).json({
                success:false,
                error:"Invalid token"
            })
        }

        req.user = user

        next()
    })
}
app.use(authenticateToken)

app.get('/notes',(req, res)=>{
    res.status(200).json({
        success:true,
        data:notes,
        error:null
    })
} 

)

app.post('/notes',(req, res)=>{
    const body = req.body;
    const {id,text, checkboxes} =body;

    notes.push({
        id, text, checkboxes
    })

    res.status(200).json({
        success:true,
        
    })

})

//query param 
app.get('/notes/query', (req, res) => {
        const hasText = req.query.hasText == "true";
        console.log(hasText)
        const filtered = notes.filter((note)=>{
            if(hasText){
                return note.text!="";
            }
            return note.text==="";
            
        })
        res.status(200).json({
            success:true,
            data:filtered
        })
})
app.get('/notes/:id', (req, res)=>{
    const id = parseInt(req.params.id)
    const filterNotes = notes.filter((item)=> item.id ===id)
    res.status(200).json({
        success:true,
        data:filterNotes

    })
})

app.listen(8000, ()=>{
    console.log("Server is running on port 8000")
})