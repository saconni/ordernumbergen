const mysql = require("mysql2");
const express = require("express");

const PORT = process.env.PORT || 8989;
const MYSQL_HOST = process.env.MYSQL_HOST || "";
const MYSQL_USER = process.env.MYSQL_USER || "";
const MYSQL_PASS = process.env.MYSQL_PASS || "";
const MYSQL_DB = process.env.MYSQL_DB || "";
const TABLE_ORDER_NUMBERS = process.env.TABLE_ORDER_NUMBERS || "order_num";
const TABLE_TEST_ORDER_NUMBERS =
  process.env.TABLE_TEST_ORDER_NUMBERS || "test_order_num";

var pool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASS,
  database: MYSQL_DB,
  multipleStatements: true,
});

// create the app
const app = express();

/**
 * Main end point
 * Takes storeId from the URL and returns the next
 * order id for the given storeId
 */
app.get("/nextOrderNumber/:storeId", async (req, res) => {
  const storeId = req.params.storeId;
  if (isNaN(storeId)) {
    console.error(new Error("Invalid storeId"));
    res.status(400).json("Invalid storeId");
    return;
  }
  try {
    res.json(await generateOrderNumber(pool, storeId));
  } catch (e) {
    console.error(e);
    res.status(500).json("Internal error");
  }
});

/**
 * Test auxiliary end point
 * Given a store id generates the next order number
 * and pollutes a table that will not allow duplicated
 * keys
 *
 * Used only to brute test concurrency
 */
app.get("/testOrderNumber/:storeId", async (req, res) => {
  const storeId = req.params.storeId;
  if (isNaN(storeId)) {
    console.error(new Error("Invalid storeId"));
    res.status(400).json("Invalid storeId");
    return;
  }
  try {
    const order = await generateOrderNumber(pool, storeId);
    await query(pool, testOrderNumberSql, [storeId, order]);
    res.json("done");
  } catch (e) {
    console.error(e);
    res.status(500).json("Internal error");
  }
});

// bind to port
app.listen(PORT);

/**
 * Given a connection pool and a storeId makes a SQL call
 * to generate the next order number for the given storeId
 * @param {Pool} pool
 * @param {int} storeId
 * @returns
 */
async function generateOrderNumber(pool, storeId) {
  const result = await query(pool, generateOrderNumberSql, [storeId]);
  const ret = result?.[1]?.[0]?.[retVarSql];
  if (isNaN(ret)) {
    throw new Error("Invalid returned value");
  }
  return ret;
}

/**
 * Generic function to execute a SQL query given
 * a connection pool
 * @param {Pool} pool
 * @param {string} sql
 * @param {Array} values
 * @returns
 */
function query(pool, sql, values) {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
}

/**
 * Some constants to construct SQL queries
 */
const retVarSql = "@curr";
const generateOrderNumberSql = ` \
  insert into ${TABLE_ORDER_NUMBERS} (store_id, order_number) \
    values (?, (@curr := 100)) \
    on duplicate key update order_number=(@curr := order_number + 1); \
  select ${retVarSql};`;
const testOrderNumberSql = ` \
  insert into ${TABLE_TEST_ORDER_NUMBERS} (store_id, order_number) \
    values (?, ?);`;
