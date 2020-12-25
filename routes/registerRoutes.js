import express from "express";

const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).render("register");
});

router.post("/", (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const payload = req.body

  if(firstName && lastName && email && password){
    
  }else{
      payload.errorMessage = 'Make sure each field has a valid value'
       res.status(200).render("register", payload);
  }
 
});

export default router;
