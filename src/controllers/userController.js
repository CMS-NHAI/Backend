import prisma from "../config/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validatePhoneNumber from "../utils/validation.js";
import fetch from 'node-fetch';
import { otpmobileValidationSchema } from "../validations/userValidation.js";  
import { sapValidationSchema } from "../validations/sapValidation.js";
import { phoneValidationSchema } from "../validations/otpValidation.js";
const getEmployeeBySAPID = async (sapId) => {
  try {
    
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
        office_location: true,
        is_digilocker_verified: true,
        name: true,
        user_type : true
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

  const { error } = otpmobileValidationSchema.validate({ mobile_number, otp });

  if (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: error.details[0].message,
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
        name: user.name,
        mobile_number: user.mobile_number,
        email: user.email,
        designation: user.designation,
        is_digilocker_verified: user.is_digilocker_verified,
        office_location: user.office_location,
        user_type : user.user_type
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

  const { error } = sapValidationSchema.validate({ sap_id });

  if (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: error.details[0].message,
    });
  }


  try {
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

export const getUserDetails = async (req, res) => {
  const { mobile_number } = req.body;

  const { error } = phoneValidationSchema.validate({ mobile_number });

  if (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: error.details[0].message,
    });
  }

  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is required.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); 

    console.log('Decoded token:', decoded);
    const user = await getUserByPhoneNo(mobile_number);

    if (!user) {
      return res.status(200).json({
        success: "false",
        status: 200,
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
        user_type : user.user_type
      },
    });
  } catch (err) {
    console.error('Error during API request:', err);
    res.status(500).json({
      success: "false",
      status: 500,
      message: err,
    });
  }
};
export const getUserByPhoneNo = async (mobile_number) => {
  try {
    
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
        user_type : true
      },
    });
    console.log('user', user);
    return user; // Return user data or null if not found
  } catch (err) {
    res.status(500).json({
      success: "false",
      status: 500,
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
 
  const { error } = sapValidationSchema.validate({ sap_id });

  if (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: error.details[0].message,
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

export const authenticateEntity = async (req, res) => {
  {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'invalid credentials',
      });
    }



    try {

      const query = {
        code: code,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:3000/myauth",
        client_id: "RF6AE19E50",
        client_secret: "8d1da0745546e8118507",
        code_verifier: "YglEu2eLv_kB8tbSiKOyZnpKRPCDFgW2uigiAn_D-DkO6-JRcchJx8k7x2x-vXXJG.3"
      }

      const resAccessToken = await fetch('https://entity.digilocker.gov.in/public/oauth2/1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query) // Convert your data to a JSON string
      });

      if (resAccessToken.ok) {
        // Parse the JSON response
        const jsonResponse = await resAccessToken.json();

        // Log the response to inspect the content
        res.status(200).json({
          success: true,
          message: 'Success',
          // data: employee,
        });
        console.log('JSON Response:', jsonResponse);
      } else {
        // Handle unsuccessful response (non-200 status codes)
        console.log('Error:', resAccessToken.status, resAccessToken.statusText);
        const errorData = await resAccessToken.json();
        console.log('Error details:', errorData);
        res.status(resAccessToken.status).json({
          status: false,
          ...errorData
        });
      }

      
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err,
      });
    }
  };
}

export const getAllUsers = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 10;  
    const page = parseInt(req.query.page) || 1;  

    if (pageSize <= 0 || page <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page or pageSize. Both should be positive integers.',
      });
    }

    // Calculate skip and take based on pageSize and page
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Query users from the user_master table with pagination
    const users = await prisma.user_master.findMany({
      skip: skip,
      take: take,
      select: {
        sap_id: true,
        name: true,
        mobile_number: true,
        email: true,
        designation: true,
        office_location: true,
        is_digilocker_verified: true,
        date_of_birth: true,
        user_type : true
      }
    });

    // If no users are found, return a message
    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No users found.',
        data: [],
      });
    }

    // Get the total count of users for pagination info
    const totalUsers = await prisma.user_master.count();

    // Return the paginated list of users
    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: users,
      pagination: {
        page,
        pageSize,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / pageSize),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err
    });
  }
};











