const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/*
=====================================
TEST API
=====================================
*/

app.get("/", (req, res) => {

  res.send("Backend Running");

});

/*
=====================================
READ CUSTOMERS
=====================================
*/

app.get("/customers", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM customers ORDER BY customer_id ASC"
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);

  }
});

/*
=====================================
READ ROOMS
=====================================
*/

app.get("/rooms", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM rooms ORDER BY room_id ASC"
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);

  }
});

/*
=====================================
READ BOOKINGS
=====================================
*/

app.get("/bookings", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        bookings.booking_id,
        customers.name AS customer_name,
        rooms.room_number,
        bookings.check_in,
        bookings.check_out,
        bookings.total_price
      FROM bookings
      JOIN customers
      ON bookings.customer_id = customers.customer_id
      JOIN rooms
      ON bookings.room_id = rooms.room_id
      ORDER BY bookings.booking_id ASC
    `);

    res.json(result.rows);

  } catch (error) {

    console.log(error);

  }
});

/*
=====================================
READ PAYMENTS
=====================================
*/

app.get("/payments", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        payments.payment_id,
        payments.payment_date,
        payments.amount,
        payments.payment_method,
        bookings.booking_id
      FROM payments
      JOIN bookings
      ON payments.booking_id = bookings.booking_id
      ORDER BY payments.payment_id ASC
    `);

    res.json(result.rows);

  } catch (error) {

    console.log(error);

  }
});

/*
=====================================
READ STAFF
=====================================
*/

app.get("/staff", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM staff ORDER BY staff_id ASC"
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);

  }
});

/*
=====================================
CREATE CUSTOMER
=====================================
*/

app.post("/customers", async (req, res) => {

  try {

    const {
      name,
      email,
      phone,
      address
    } = req.body;

    await pool.query(
      `
      INSERT INTO customers
      (name,email,phone,address)
      VALUES($1,$2,$3,$4)
      `,
      [name, email, phone, address]
    );

    res.json({
      message: "Customer Added"
    });

  } catch (error) {

    console.log(error);

  }
});

/*
=====================================
UPDATE CUSTOMER
=====================================
*/

app.put("/customers/:id", async (req, res) => {

  try {

    const id = req.params.id;

    const {
      name,
      email,
      phone,
      address
    } = req.body;

    await pool.query(
      `
      UPDATE customers
      SET
      name=$1,
      email=$2,
      phone=$3,
      address=$4
      WHERE customer_id=$5
      `,
      [name, email, phone, address, id]
    );

    res.json({
      message: "Customer Updated"
    });

  } catch (error) {

    console.log(error);

  }
});

/*
=====================================
DELETE CUSTOMER
=====================================
*/

app.delete("/customers/:id", async (req, res) => {

  try {

    const id = req.params.id;

    await pool.query(
      `
      DELETE FROM customers
      WHERE customer_id=$1
      `,
      [id]
    );

    res.json({
      message: "Customer Deleted"
    });

  } catch (error) {

    console.log(error);

  }
});

/*
=====================================
DATABASE CONNECTION
=====================================
*/

pool.connect((err) => {

  if (err) {

    console.log("Database Error", err);

  } else {

    console.log("Database Connected");

  }
});

/*
=====================================
RUN SERVER
=====================================
*/

app.listen(5000, () => {

  console.log("Server running on port 5000");

});