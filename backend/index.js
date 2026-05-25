const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const pool = require("./db");

const {
  authenticateToken,
  SECRET_KEY
} = require("./middleware");

const app = express();

app.use(cors());
app.use(express.json());

/*
=====================================
LOGIN
=====================================
*/

app.post("/login", async (req, res) => {

  try {

    const {
      username,
      password
    } = req.body;

    const result = await pool.query(
      `
      SELECT * FROM users
      WHERE username=$1
      `,
      [username]
    );

    if (result.rows.length === 0) {

      return res.status(401).json({
        message: "Username salah"
      });

    }

    const user = result.rows[0];

    if (user.password !== password) {

      return res.status(401).json({
        message: "Password salah"
      });

    }

    /*
    =====================================
    GENERATE TOKEN
    =====================================
    */

    const token = jwt.sign(

      {
        username: user.username
      },

      SECRET_KEY,

      {
        expiresIn: "1d"
      }

    );

    res.json({

      message: "Login berhasil",

      token: token

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

/*
=====================================
ROOMS
=====================================
*/

app.get(
  "/rooms",

  authenticateToken,

  async (req, res) => {

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

    }

  }
);

/*
=====================================
BOOKINGS
=====================================
*/

app.get(
  "/bookings",

  authenticateToken,

  async (req, res) => {

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

    }

  }
);

/*
=====================================
ADD CUSTOMER
=====================================
*/

app.post(
  "/customers",

  authenticateToken,

  async (req, res) => {

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
        (
          name,
          email,
          phone,
          address
        )

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

    }

  }
);

/*
=====================================
ADD BOOKING
=====================================
*/

app.post(
  "/bookings",

  authenticateToken,

  async (req, res) => {

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

    }

  }
);

app.listen(5000, () => {

  console.log(
    "Server running on port 5000"
  );

});