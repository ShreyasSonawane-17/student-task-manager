const fs = require("fs");

test("index.html should exist", () => {
    expect(fs.existsSync("public/index.html")).toBe(true);
});

test("script.js should exist", () => {
    expect(fs.existsSync("public/script.js")).toBe(true);
});

test("style.css should exist", () => {
    expect(fs.existsSync("public/style.css")).toBe(true);
});

test("app.js should exist", () => {
    expect(fs.existsSync("app.js")).toBe(true);
});
