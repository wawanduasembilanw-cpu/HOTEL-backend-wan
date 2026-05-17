const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/*
=====================================
GET ROOMS
=====================================
*/

app.get("/rooms", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT * FROM rooms
      ORDER BY room_id ASC
      `
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error rooms"
    });

  }

});

/*
=====================================
GET BOOKINGS
=====================================
*/

app.get("/bookings", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
      bookings.booking_id,
      customers.name AS customer_name,
      rooms.room_number,
      bookings.check_in,
      bookings.check_out,
      bookings.total_price

      FROM bookings

      JOIN customers
      ON bookings.customer_id =
      customers.customer_id

      JOIN rooms
      ON bookings.room_id =
      rooms.room_id

      ORDER BY bookings.booking_id ASC
      `
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error bookings"
    });

  }

});

/*
=====================================
ADD CUSTOMER
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

    const result = await pool.query(
      `
      INSERT INTO customers
      (name,email,phone,address)

      VALUES($1,$2,$3,$4)

      RETURNING *
      `,
      [
        name,
        email,
        phone,
        address
      ]
    );

    res.json(result.rows[0]);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error add customer"
    });

  }

});

/*
=====================================
ADD BOOKING
=====================================
*/

app.post("/bookings", async (req, res) => {

  try {

    const {
      customer_id,
      room_id,
      check_in,
      check_out,
      total_price
    } = req.body;

    await pool.query(
      `
      INSERT INTO bookings
      (
        customer_id,
        room_id,
        check_in,
        check_out,
        total_price
      )

      VALUES($1,$2,$3,$4,$5)
      `,
      [
        customer_id,
        room_id,
        check_in,
        check_out,
        total_price
      ]
    );

    /*
    =====================================
    UPDATE ROOM STATUS
    =====================================
    */

    await pool.query(
      `
      UPDATE rooms
      SET status='Booked'
      WHERE room_id=$1
      `,
      [room_id]
    );

    res.json({
      message: "Booking berhasil"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error booking"
    });

  }

});

/*
=====================================
SERVER
=====================================
*/

app.listen(5000, () => {

  console.log(
    "Server running on port 5000"
  );

});