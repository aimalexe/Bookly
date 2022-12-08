const { Customer, validate} = require('../models/customerSchema');
const router = require('express').Router();

router.get("/", async (req, res) => {
    const customer = await Customer.find().sort("name");
    if(!customer) return res.status(400).send("Customers are't Found");
    res.status(200).send(customer);
})

router.get("/:id", async (req, res)=>{
    const customer = await Customer.findById(req.params.id)
    if(!customer) return res.status(404).send(`Customer with ID:${req.params.id} is't found!`);
    res.status(200).send(customer)
})

router.post("/", async (req, res)=>{
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const{ name, phoneNo, isGold} = req.body;
    const customer = new Customer({
        name,
        phoneNo,
        isGold
    });
    try{
        await customer.save()
        res.status(200).send(`Saved Successfully!\n${customer}`)
    }catch(err){
        res.send(err)
    }
});

router.put("/:id", async (req, res)=>{
    const customer = await Customer.findById(req.params.id);
    if(!customer) return res.status(404).send(`Customer with ID:${req.params.id} is't found!`)

    const { error } = validate( req.body )
    if(error) return res.status(400).send(error.details[0].message);

    const { name, phoneNo, isGold } = req.body
    customer.set({
        name,
        phoneNo,
        isGold
    });
    try{
        await customer.save();
        res.status(200).send(`Updated Successfully!\n${customer}`);
    }catch(err){
        res.send(err)
    }
})

router.delete("/:id", async (req, res)=>{
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if(!customer) return res.status(404).send(`Customer with ID:${req.params.id} is't found!`)
    res.status(200).send(`Deleted Successfully!\n${customer}`);
})

module.exports = router;