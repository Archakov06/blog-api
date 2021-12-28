const supertest = require("supertest");
const { app } = require("./index");
const assert = require("assert");

let token = null;
let postId = null;
let userId = null;
let commentId = null;
let email = `test${Math.round(Math.random() * 10000)}@test.ru`;
let password = "Qwerty123";

it("Register", (done) => {
  supertest(app)
    .post("/auth/register")
    .send({
      fullName: "User Test",
      email,
      password,
    })
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
    .expect(201, done);
});

it("Login", (done) => {
  supertest(app)
    .post("/auth/login")
    .send({
      email,
      password,
    })
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
    .expect(200)
    .then((response) => {
      token = response.body.token;
      userId = response.body._id;
      done();
    })
    .catch(done);
});

it("Get all users", (done) => {
  supertest(app).get("/users").expect("Content-Type", /json/).expect(200, done);
});

it("Get one user", (done) => {
  supertest(app)
    .get("/users/" + userId)
    .expect("Content-Type", /json/)
    .expect(200, done);
});

it("All posts", (done) => {
  supertest(app).get("/posts").expect("Content-Type", /json/).expect(200, done);
});

it("Create post", (done) => {
  supertest(app)
    .post("/posts")
    .send({ title: "test", text: "lorem ipsum" })
    .set("Accept", "application/json")
    .set("Authorization", token)
    .expect("Content-Type", /json/)
    .expect(201)
    .then((response) => {
      postId = response.body._id;
      done();
    })
    .catch(done);
});

it("Get one post", (done) => {
  supertest(app)
    .get("/posts/" + postId)
    .expect("Content-Type", /json/)
    .expect(200, done);
});

it("All comments", (done) => {
  supertest(app)
    .get("/comments")
    .expect("Content-Type", /json/)
    .expect(200, done);
});

it("Create comment in post " + postId, (done) => {
  supertest(app)
    .post("/comments")
    .send({ text: "lorem ipsum", postId })
    .set("Accept", "application/json")
    .set("Authorization", token)
    .expect("Content-Type", /json/)
    .expect(201)
    .then((response) => {
      commentId = response.body._id;
      done();
    })
    .catch(done);
});

it("Update created comment " + commentId + " in post " + postId, (done) => {
  supertest(app)
    .patch("/comments/" + commentId)
    .send({ text: "updated" })
    .set("Authorization", token)
    .expect("Content-Type", /json/)
    .expect(202)
    .then((response) => {
      assert.equal(response.body.text, "updated");
      done();
    })
    .catch(done);
});

it("Find created comment " + commentId + " in post " + postId, (done) => {
  supertest(app)
    .get("/comments/post/" + postId)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((response) => {
      assert.equal(response.body[0]._id, commentId);
      done();
    })
    .catch(done);
});

it("Delete created comment " + commentId + " in post " + postId, (done) => {
  supertest(app)
    .delete("/comments/" + commentId)
    .set("Authorization", token)
    .expect("Content-Type", /json/)
    .expect(202, done);
});

it("Empty comments in post " + postId, (done) => {
  supertest(app)
    .get("/comments/post/" + postId)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((response) => {
      assert.equal(response.body.length, 0);
      done();
    })
    .catch(done);
});
