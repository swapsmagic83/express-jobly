const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job{

static async create({id,title,salary,equity,company_handle}){
  if(id){
    const result = await db.query(`insert into jobs (id,title,salary,equity,company_handle)
                  values ($1, $2, $3, $4,$5) returning id, title, salary, equity, company_handle`,
                  [id,title,salary,equity,company_handle])
                  // console.log(result)
      const job = result.rows[0]
      return job
  }
      const result = await db.query(`insert into jobs (title,salary,equity,company_handle)
                  values ($1, $2, $3, $4) returning id, title, salary, equity, company_handle`,
                  [title,salary,equity,company_handle])
                  // console.log(result)
      const job = result.rows[0]
      return job
}
static async findAll(){
      const results= await db.query(`select j.id,j.title,j.salary,j.equity,j.company_handle,c.name from 
                          jobs as j join companies as c on c.handle = j.company_handle`)
      return results.rows
}
static async findByTitle(title,hasEquity){
      if(hasEquity == true){
            const results= await db.query(`select j.id,j.title,j.salary,j.equity,j.company_handle,c.name from 
                              jobs as j join companies as c on c.handle = j.company_handle where j.equity >0 and j.title ilike '%${title}%'`)
            return results.rows
      }
      const results= await db.query(`select j.id,j.title,j.salary,j.equity,j.company_handle,c.name from 
                              jobs as j join companies as c on c.handle = j.company_handle where j.title ilike '%${title}%'`)
      return results.rows
}
static async findByMinSalary(minSalary,hasEquity){
  console.log(hasEquity)
  if(hasEquity == true){
    const results= await db.query(`select j.id,j.title,j.salary,j.equity,j.company_handle,c.name from 
                          jobs as j join companies as c on c.handle = j.company_handle where j.salary >= ${minSalary} and j.equity >0`)
              return results.rows
  }
  
  const results= await db.query(`select j.id,j.title,j.salary,j.equity,j.company_handle,c.name from 
                          jobs as j join companies as c on c.handle = j.company_handle where j.salary >= ${minSalary}`)
              return results.rows
}
static async findByEquity(hasEquity){
  if(hasEquity==true){
      const results= await db.query(`select j.id,j.title,j.salary,j.equity,j.company_handle,c.name from 
                          jobs as j join companies as c on c.handle = j.company_handle where j.equity >0`)
      return results.rows
  }else{
  
      const results= await db.query(`select j.id,j.title,j.salary,j.equity,j.company_handle,c.name from 
                            jobs as j join companies as c on c.handle = j.company_handle`)
      return results.rows
  }
}
static async findByTitleMinSalaryEquity(title,minSalary,hasEquity){
  if(hasEquity==true){
      const results= await db.query(`select j.id,j.title,j.salary,j.equity,j.company_handle,c.name from 
                          jobs as j join companies as c on c.handle = j.company_handle where j.equity > 0 
                          and j.title ilike '%${title}%' and j.salary >=${minSalary}`)
      return results.rows
  }else{
   
  const results= await db.query(`select j.id,j.title,j.salary,j.equity,j.company_handle,c.name from 
                          jobs as j join companies as c on c.handle = j.company_handle where j.title ilike '%${title}%' and j.salary >=${minSalary}`)
  return results.rows
  }
}


static async get(id){
    const result = await db.query(`select j.id, j.title, j.salary, j.equity, j.company_handle, c.name from 
                            jobs as j join companies as c on c.handle = j.company_handle where j.id=$1`,[id])
    if (!result.rows[0]) throw new NotFoundError(`No job: ${id}`);
    return result.rows[0]
}
static async update(id,data){
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          title:"title",
          salary:"salary",
          equity:"equity"
        });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary,
                                equity, 
                                company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
}
static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job