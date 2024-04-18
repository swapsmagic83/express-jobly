const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  
} = require("./_testCommon");
const { defaults } = require("pg");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// create job function test//

describe("create",function(){
    const newJob = {title:"newjob",salary:100,equity:'1',company_handle:'c1'};
    test('works',async function(){
        let job =await Job.create(newJob)
        expect(job).toEqual({...newJob,id:expect.any(Number)})
        
        })
    })

describe("findAll",function(){
    test("works:no filter",async function(){
        const jobs = await Job.findAll()
        expect(jobs).toEqual([
            {id:expect.any(Number),title:'job1',salary:100,equity:'1',company_handle:'c1',name:'C1'},
            {id:expect.any(Number),title:'job2',salary:200,equity:'1',company_handle:'c2',name:'C2'}
        ])
    })
    // test("works:by title,minSalary,hasEquity",async function(){
    //     let hasEquity =true
    //     const jobs = await Job.findByTitleMinSalaryEquity({title:'job1',minSalary:100,hasEquity})
        
    //     expect(jobs).toEqual({
    //         id:expect.any(Number),title:'job1',salary:100,equity:'1',company_handle:'c1',name:'C1'
    //     })
    // })
})
describe("getbyid",function(){
    test('works',async function(){
        
        // const job= await Job.get(testJobIds[0])
        const job = await Job.get(1)
        
        console.log(job)
        expect(job).toEqual({
            id:1,title:'job1',salary:100,equity:'1',company_handle:'c1',name:'C1'
        })
    })
    test("not found if no such job", async function () {
        try {
          await Job.get(0);
          fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
      });
    
})
describe("update", function () { 
    const updateJob={id:1,title:'job1',salary:100,equity:'0.5',company_handle:'c1'}
    test("works", async function () {
        let job = await Job.update(1, updateJob);
        expect(job).toEqual({
          id:1,
          ...updateJob,
        });
    
        const result = await db.query(
              `SELECT title,salary,equity,company_handle
               FROM jobs
               WHERE id = 1`);
        expect(result.rows).toEqual([{
          title:'job1',salary:100,equity:'0.5',company_handle:'c1'
        }]);
      });
})
test("not found if no such job", async function () {
    const updateJob={id:1,title:'job3',salary:100,equity:'0.5',company_handle:'c1'}
    try {
      await Job.update(0, updateJob);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("bad request with no job", async function () {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
  describe("remove", function () {
    test("works", async function () {
      await Job.remove(1);
      const res = await db.query(
          "SELECT id FROM jobs WHERE id=1");
      expect(res.rows.length).toEqual(0);
    });
})
