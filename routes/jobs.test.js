const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST/jobs",function(){
    const newJob= {title:'job1',salary:100,equity:'1',company_handle:'c1'}
    test("ok for users", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);

        // expect(resp.body).toEqual(newJob.job);
      });
// })
test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          id: expect.any(Number),
          title:'new',
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
  test("bad request with invalid data", async function () {
    const newJob= {title:'job1',equity:'1'}
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newJob,
          title:'new'
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
})
describe("GET/jobs",function(){
  test("works for anon",async function(){
    const resp = await request(app).get(`/jobs`);
    expect(resp.body).toEqual({jobs:[{id:1,title:'job1',salary:100,equity:'1',company_handle:'c1',name:'C1'},
    {id:2,title:'job2',salary:200,equity:'1',company_handle:'c2',name:'C2'}]})
  })
  test("works: title",async function(){
    const resp = await request(app).get(`/jobs`).query({title:'job1'})
    expect(resp.body).toEqual({jobs: [
      {
        id: 1,
        title: 'job1',
        salary: 100,
        equity: '1',
        company_handle: 'c1',
        name: 'C1'
      }
    ]})
  })
  test("works: minSalary",async function(){
    const resp = await request(app).get(`/jobs`).query({minSalary:100})
    expect(resp.body).toEqual({
      jobs: [
        {
          id: 1,
          title: 'job1',
          salary: 100,
          equity: '1',
          company_handle: 'c1',
          name: 'C1'
        },
        {
          id: 2,
          title: 'job2',
          salary: 200,
          equity: '1',
          company_handle: 'c2',
          name: 'C2'
        }
      ]
    })
  })
  test("works : title,minSalary,hasEquity",async function(){
    const resp = await request(app).get(`/jobs`).query({title:'job1',minSalary:100,hasEquity:true})
    expect(resp.body).toEqual({
      jobs: [
        {
          id: 1,
          title: 'job1',
          salary: 100,
          equity: '1',
          company_handle: 'c1',
          name: 'C1'
        }
      ]
    })
  })
})


describe("GET/jobs/:id",function(){
  test("works",async function(){
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({id:1,title:'job1',salary:100,equity:'1',company_handle:'c1',name:'C1'})
  })
  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
})
describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title:'job1',
          equity:'0.5',
        })
        .set("authorization", `Bearer ${adminToken}`);
        console.log(resp.body)
    expect(resp.body).toEqual({
        id:1,
        title:'job1',
        salary:100,
        equity:'0.5',
        company_handle:'c1',
    });
  });
  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title:'job1',
        });
    expect(resp.statusCode).toEqual(401);
  });
  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
         equity:11,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});


describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: '1' });
  });
  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });
  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
})
