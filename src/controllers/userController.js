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
        is_digilocker_verified : true ,
        name : true
      },
    });

    if (!employee) {
      return null; 
    }

    return employee; 

  } catch (err) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: err,
    });
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
      return res.status(200).json({
        success: false,
        status: 200,
        message: 'User not registered.',
      });
    }

    // Validate OTP here
    console.log(user.otp);
    console.log(otp);
    if (otp !== "12345") {
      return res.status(200).json({
        success: false,
        status: 200,
        message: 'Invalid OTP.',
      });
    }
    const payload = {
      user_id: user.id, // Include the user ID (or any other info)
      phone_number: user.mobile_number,
    };

    // Replace 'your_secret_key' with your actual secret key for signing the token
    const access_token = jwt.sign(payload, 'NHAI', { expiresIn: '15m' });
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
      message: err,
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
    res.status(500).json({
      success: false,
      message: err,
    });
  }
};

export const getUserDetails = async (req, res) => {
  const { mobile_number } = req.body;

  // Validate phone number
  if (!mobile_number) {
    return res.status(400).json({
      success: "false",
      message: "mobile_number is required.",
    });
  }

  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is required.',
    });
  }

  if (!validatePhoneNumber(mobile_number)) {
    return res.status(400).json({
      success: "false",
      message: "Mobile number must be in the format +91 followed by exactly 10 digits.",
    });
  }

  try {
    // Fetch user details using mobile_no
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Use the appropriate secret key or public key

    // You can now use the decoded token, for example, to check the user ID or role:
    console.log('Decoded token:', decoded);
    const user = await getUserByPhoneNo(mobile_number);

    if (!user) {
      return res.status(200).json({
        success: "false",
        status : 200,
        message: "User not found with the provided phone number.",
      });
    }

    // Construct and send the success response
    res.status(200).json({
      status: "success",
      message: "User details retrieved successfully.",
      data: {
        sap_id: user.sap_id,
        name: user.name,
        date_of_birth: user.date_of_birth,  // Assuming date_of_birth is returned as a Date object
        mobile_number: user.mobile_number,
        email_id: user.email,
        designation: user.designation,
        office_location: user.office_location,
      },
    });
  } catch (err) {
    console.error('Error during API request:', err);
    res.status(500).json({
      success: "false",
      status : 500,
      message: err,
    });
  }
};
export const getUserByPhoneNo = async (mobile_number) => {
  try {
    console.log("1");
    // Query the user_master table to get user details by mobile_number
    const user = await prisma.user_master.findUnique({
      where: {
        mobile_number: mobile_number,  // Search by phone_number
       },
      select: {
        sap_id: true,
        name: true,
        date_of_birth: true,
        mobile_number: true,
        email: true,
        designation: true,
        office_location: true,
      },
    });
     console.log('user' , user);
    return user; // Return user data or null if not found
  } catch (err) {
    res.status(500).json({
      success: "false",
      status : 500,
      message: err,
    });

  }
};
export const getSapDetails = async (req, res) => {
  // const { sap_id , device_id, client_id} = req.body;
  const { sap_id } = req.body;
   console.log("1");
   const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is required.',
    });
  }
  if (!sap_id) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'SAP ID is required.',
    });
  }
 
  // if (!sap_id || !device_id || !client_id) {
  //   return res.status(400).json({
  //     status: "failure",
  //     message: "sap_id, device_id, and client_id are required.",
  //   });
  // }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Use the appropriate secret key or public key

    // You can now use the decoded token, for example, to check the user ID or role:
    console.log('Decoded token:', decoded);
    const employee = await getEmployeeBySAPID(sap_id);

    if (!employee) {
      return res.status(200).json({
        success: false,
        status: 200,
        message: 'Employee not found with the provided SAP ID.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Success',
      data: employee,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err,
    });
  }
};














