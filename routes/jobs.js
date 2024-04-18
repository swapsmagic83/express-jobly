const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");
const Company = require("../models/job");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/newJob.json");

const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

router.post("/", ensureIsAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.create(req.body);
      return res.status(201).json({ job });
    } catch (err) {
    //   console.log(err)
      return next(err);
    }
  });

router.get("/", async function(req,res,next){
    try{
        const que = req.query
        hasEquity = que.hasEquity ? que.hasEquity =='true' : false
        
        if(que.title || que.minSalary || hasEquity == true){
            if(que.title){
                if(que.minSalary){  
                    const jobs= await Job.findByTitleMinSalaryEquity(que.title,que.minSalary,hasEquity)
                    return res.json({jobs}) 
                } else {
                    const jobs= await Job.findByTitle(que.title,hasEquity)
                    return res.json({jobs})
                }
            }
            // if(que.title){  
            //     const jobs= await Job.findByTitle(que.title,hasEquity)
            //     return res.json({jobs})
            // }
            if(que.minSalary){
                const jobs =await Job.findByMinSalary(que.minSalary,hasEquity)
                return res.json({jobs}) 
            }

            const jobs= await Job.findByEquity(hasEquity)
            return res.json({jobs})
            
            // const jobs =await Job.findByMinSalary(que.minSalary,hasEquity)
            // return res.json({jobs})
            
            // if(que.hasEquity == true){
            //     const jobs= await Job.findByEquity(que.hasEquity)
            //     return res.json({jobs})
            // }
            // const jobs = await Job.findAll()
            // return res.json({jobs})
        }
        const jobs = await Job.findAll()
        return res.json({jobs})

    }catch(err){
        return next(err)
    }
})
router.get("/:id", async function (req, res, next) {
    try {
      const job = await Job.get(req.params.id);
      return res.json( job );
    } catch (err) {
      return next(err);
    }
  });

  router.patch("/:id", ensureIsAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.update(req.params.id, req.body);
      return res.json( job );
    } catch (err) {
      return next(err);
    }
  });
  router.delete("/:id", ensureIsAdmin, async function (req, res, next) {
    try {
      await Job.remove(req.params.id);
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
  });

  module.exports = router;