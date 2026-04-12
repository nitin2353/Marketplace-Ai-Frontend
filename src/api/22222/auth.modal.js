const pool = require('../../../config/database.js');

const getQuery = async () => {
  return `SELECT
    id,
    (first_name, last_name) AS name,
    email,
    password,
    status,
    token_version,
    group_id,
    group_name
  FROM public.user 
`};

const getUpdateBaseQuery = async (table_name) => {
  return `UPDATE public.${table_name} SET`;
}

const findUserByEmail = async (email) => {
  try {
    let query = await getQuery();
    const result = await pool.query(`${query} WHERE  email = $1`, [email]);
    return result.rows[0];

  } catch (error) {
    throw error;
  }
};
const saveOTPToDB = async (userId, email, otp, expiresAt) => {

  try {
    const res = await pool.query(
      `INSERT INTO public.user_otp (user_id, otp, expires_in, is_verified)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET
         otp = EXCLUDED.otp,
         expires_in = EXCLUDED.expires_in,
         is_verified = EXCLUDED.is_verified RETURNING *`,
      [userId, otp, expiresAt, false]
    );
    return res.rows[0]
  } catch (error) {
    console.error("DB error while saving OTP:", error.message);
    throw error;
  }
};


const findValidOTP = async (user_id, otp) => {
  try {
    const result = await pool.query(
      `SELECT * FROM public.user_otp
      WHERE user_id = $1 AND otp = $2 AND is_verified = FALSE AND expires_in > NOW()
      ORDER BY created_at DESC LIMIT 1`,
      [user_id, otp]
    );
    return result.rows[0];

  } catch (error) {
    throw error;
  }
};

const markOTPVerified = async (id) => {
  let query = await getUpdateBaseQuery("user_otp");
  return await pool.query(`${query} is_verified = TRUE WHERE id = $1 RETURNING id`, [id]);
};

const updatePassword = async (id, password, token_version) => {
  let query = await getUpdateBaseQuery("user");
  return await pool.query(`${query} password = $1, token_version = $2 WHERE id = $3 RETURNING id`, [password, token_version, id]);
};

const updateTkoenVersion = async (updatedToken, id) => {
  try {
    let query = await getUpdateBaseQuery("user");
    return await pool.query(`${query} token_version = $1 WHERE id = $2;`, [updatedToken, id])
  } catch (error) {
    throw error;
  }
}

module.exports = {
  findUserByEmail,
  saveOTPToDB,
  findValidOTP,
  markOTPVerified,
  updatePassword,
  updateTkoenVersion
};
