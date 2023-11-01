const mysql = require("mysql2");
const express = require("express");

const PORT = process.env.PORT || 8989;
const MYSQL_HOST = process.env.MYSQL_HOST || "";
const MYSQL_USER = process.env.MYSQL_USER || "";
const MYSQL_PASS = process.env.MYSQL_PASS || "";
const MYSQL_DB = process.env.MYSQL_DB || "";
const TABLE_ORDER_NUMBERS = process.env.TABLE_ORDER_NUMBERS || "order_num";

var pool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASS,
  database: MYSQL_DB,
  multipleStatements: true,
});

const app = express();

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

async function generateOrderNumber(pool, storeId) {
  const result = await query(pool, generateOrderNumberSql, [storeId]);
  const ret = result?.[1]?.[0]?.[retVarSql];
  if (isNaN(ret)) {
    throw new Error("Invalid returned value");
  }
  return ret;
}

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

const retVarSql = "@curr";
const generateOrderNumberSql = ` \
  insert into ${TABLE_ORDER_NUMBERS} (store_id, order_number) \
    values (?, (@curr := 100)) \
    on duplicate key update order_number=(@curr := order_number + 1); \
  select ${retVarSql};`;

app.listen(PORT);
