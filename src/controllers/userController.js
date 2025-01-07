import prisma from "../config/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validatePhoneNumber from "../utils/validation.js";


const getEmployeeBySAPID = async (sapId) => {
  try {
    console.log("1");
    // Query the user_master table using Prisma to get the employee information
    const employee = await prisma.user_master.findUnique({
      where: {
        sap_id: sapId,  // Search by sap_id
      },
      select: {
        sap_id: true,
        mobile_number: true,
        date_of_birth: true,
        email: true,
        designation: true, 
        office_location : true,
        is_digilocker_verified : true // Select only the required fields
      },
    });

    if (!employee) {
      return null;  // Return null if no employee is found
    }

    return employee;  // Return the employee data

  } catch (err) {
    console.error('Error fetching employee information:', err);
    throw err;
  }
};

export const verifyOtp = async (req, res) => {
  const { mobile_number, otp } = req.body;

  if (!mobile_number || !otp) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Mobile number and OTP are required.',
    });
  }

  if (!validatePhoneNumber(mobile_number)) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Mobile number must be in the format +91 followed by exactly 10 digits.',
    });
  }

  try {
    const user = await prisma.user_master.findUnique({
      where: { mobile_number },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'User not registered.',
      });
    }

    // Validate OTP here
    console.log(user.otp);
    console.log(otp);
    if (otp !== "12345") {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Invalid OTP.',
      });
    }
    const payload = {
      user_id: user.id, // Include the user ID (or any other info)
      phone_number: user.mobile_number,
    };

    // Replace 'your_secret_key' with your actual secret key for signing the token
    const access_token = jwt.sign(payload, 'NHAI', { expiresIn: '6m' });
    await prisma.user_master.update({
      where: { mobile_number },
      data: { verified_status: true },
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'OTP verified successfully.',
      data: {
        access_token: access_token,
        //name: user.first_name + ' ' + user.last_name,
        name : user.name,
        mobile_number: user.mobile_number,
        email: user.email,
        designation: user.designation,
        is_digilocker_verified : user.is_digilocker_verified,
        office_location : user.office_location
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      status: 500,
      message: 'Error verifying OTP.',
    });
  }
};

export const signup = async (req, res) => {
  const { sap_id } = req.body;

  if (!sap_id) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'SAP ID is required.',
    });
  }

  try {
    const employee = await getEmployeeBySAPID(sap_id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'Employee not found with the provided SAP ID.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Success',
      data: employee,
    });
  } catch (err) {
    console.error('Error during API request:', err);
    res.status(500).json({
      success: false,
      message: 'Error retrieving employee information.',
    });
  }
};














