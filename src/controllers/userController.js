import prisma from "../config/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validatePhoneNumber from "../utils/validation.js";
import fetch from 'node-fetch';
import { STATUS_CODES } from "../constants/statusCodesConstant.js";
import { otpmobileValidationSchema } from "../validations/userValidation.js";  
import { sapValidationSchema } from "../validations/sapValidation.js";
import { phoneValidationSchema } from "../validations/otpValidation.js";
import { createUserValidationSchema } from "../validations/createUserValidation.js";
import { updateUserStatusValidationSchema } from "../validations/updateUserStatusValidation.js";
import { updateUserValidationSchema } from '../validations/updateUserValidation.js';
import { v4 as uuidv4 } from 'uuid';

const uniqueUsername = uuidv4();
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
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: STATUS_CODES.BAD_REQUEST,
      message: err,
    });
  }
};

export const verifyOtp = async (req, res) => {
  const { mobile_number, otp } = req.body;

  const { error } = otpmobileValidationSchema.validate({ mobile_number, otp });

  if (error) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: STATUS_CODES.BAD_REQUEST,
      message: error.details[0].message,
    });
  }

  try {
    const user = await prisma.user_master.findUnique({
      where: { mobile_number },
    });
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        status: STATUS_CODES.NOT_FOUND,
        message: 'User not registered.',
      });
    }

    // Validate OTP here
    console.log(user.otp);
    console.log(otp);
    if (otp !== "12345") {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        status: STATUS_CODES.UNAUTHORIZED,
        message: 'Invalid OTP.',
      });
    }
    const payload = {
      user_id: user.id, // Include the user ID (or any other info)
      phone_number: user.mobile_number,
    };

    // Replace 'your_secret_key' with your actual secret key for signing the token
    const access_token = jwt.sign(payload, 'NHAI', { expiresIn: '2d' });
    await prisma.user_master.update({
      where: { mobile_number },
      data: { verified_status: true },
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      status: STATUS_CODES.OK,
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
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: err,
    });
  }
};

export const signup = async (req, res) => {
  const { sap_id } = req.body;

  const { error } = sapValidationSchema.validate({ sap_id });

  if (error) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: STATUS_CODES.BAD_REQUEST,
      message: error.details[0].message,
    });
  }


  try {
    const employee = await getEmployeeBySAPID(sap_id);

    if (!employee) {
      return res.status(STATUS_CODES.OK).json({
        success: false,
        status: STATUS_CODES.OK,
        message: 'Employee not found with the provided SAP ID.',
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Success',
      data: employee,
    });
  } catch (err) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err,
    });
  }
};

export const getUserDetails = async (req, res) => {
  const { mobile_number } = req.body;

  const { error } = phoneValidationSchema.validate({ mobile_number });

  if (error) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: STATUS_CODES.BAD_REQUEST,
      message: error.details[0].message,
    });
  }

  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: 'Authorization token is required.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); 

    console.log('Decoded token:', decoded);
    const user = await getUserByPhoneNo(mobile_number);

    if (!user) {
      return res.status(STATUS_CODES.OK).json({
        success: "false",
        status: STATUS_CODES.OK,
        message: "User not found with the provided phone number.",
      });
    }

    // Construct and send the success response
    res.status(STATUS_CODES.OK).json({
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
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: "false",
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
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
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: "false",
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
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
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: 'Authorization token is required.',
    });
  }
 
  const { error } = sapValidationSchema.validate({ sap_id });

  if (error) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: STATUS_CODES.BAD_REQUEST,
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
      return res.status(STATUS_CODES.OK).json({
        success: false,
        status: 200,
        message: 'Employee not found with the provided SAP ID.',
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Success',
      data: employee,
    });
  } catch (err) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
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
        res.status(STATUS_CODES.OK).json({
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
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
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
      return res.status(STATUS_CODES.BAD_REQUEST).json({
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
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Users not found.',
        data: [],
      });
    }

    // Get the total count of users for pagination info
    const totalUsers = await prisma.user_master.count();

    // Return the paginated list of users
    return res.status(STATUS_CODES.OK).json({
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
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err
    });
  }
};

export const createUser = async (req, res) => {
  // Validate the request body using Joi
  const { error } = createUserValidationSchema.validate(req.body);

  if (error) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.details[0].message,
    });
  }

  const { sap_id, name, email, mobile_number, user_type, designation, date_of_birth, user_role, aadhar_image, user_image, organization_id} = req.body;

  try {
    // Check if the user already exists by SAP ID or mobile_number
    const existingUser = await prisma.user_master.findFirst({
      where: {
        OR: [
          { sap_id },
          { mobile_number },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        status: 400,
        message: 'User with this SAP ID, email, or mobile number already exists.',
      });
    }
    const formattedDate = new Date(date_of_birth).toISOString(); 
    // Create the user in the database
    const newUser = await prisma.user_master.create({
      data: {
        sap_id,
        name,
        email,
        mobile_number,
        user_type,
        designation,
        date_of_birth : formattedDate,
        office_location: 'PIU',  
        unique_username : uniqueUsername,
        user_role,
        aadhar_image,
        user_image,
        organization_id
      },
    });

    // Respond with the created user data
    return res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: 'User created successfully.',
      data: {
        sap_id: newUser.sap_id,
        name: newUser.name,
        date_of_birth: newUser.date_of_birth,
        mobile_number: newUser.mobile_number,
        email_id: newUser.email,
        designation: newUser.designation,
        office_location: newUser.office_location,
        unique_username : newUser.unique_username
      },
    });
  } catch (err) {
    console.error('Error creating user:', err);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

export const updateUserStatus = async (req, res) => {
  // Validate the request body using Joi
  const { error } = updateUserStatusValidationSchema.validate(req.body);

  if (error) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.details[0].message,
    });
  }

  const { user_id, status } = req.body;

  try {
    // Find the user by user_id
    const user = await prisma.user_master.findUnique({
      where: { user_id },
    });
    console.log(' user ', user);
    if (!user) {
      return res.status(STATUS_CODES.OK).json({
        success: false,
        status: 200,
        message: 'User not found.',
      });
    }

    // Set is_active based on the status
    const is_active = status === 'active';

    // Update the user's status and is_active field
    const updatedUser = await prisma.user_master.update({
      where: { user_id },
      data: {
        is_active, // Set is_active based on the status
      },
    });

    // Respond with the updated user data
    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'User status updated successfully.',
      data: {
        user_id: updatedUser.user_id,
        is_active: updatedUser.is_active, // Include is_active in the response
      },
    });
  } catch (err) {
    console.error('Error updating user status:', err);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

export const updateUser = async (req, res) => {
  // Define valid user types (ensure these match the constraints in your database)
  const allowedUserTypes = ['Internal - Permanent', 'External', 'Contractual']; // Replace with actual valid values

  // Validate the request body using Joi
  const { error } = updateUserValidationSchema.validate(req.body);

  if (error) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.details[0].message,
    });
  }

  const { user_id, sap_id, name, email, mobile_number, user_type, designation, dob } = req.body;

  // Check if the user_type is valid
  if (!allowedUserTypes.includes(user_type)) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: 'Invalid user_type. Please provide a valid user_type.',
    });
  }

  try {
    // Find the user by user_id
    const user = await prisma.user_master.findUnique({
      where: { user_id: parseInt(user_id, 10) },
    });

    if (!user) {
      return res.status(STATUS_CODES.OK).json({
        success: false,
        status: 200,
        message: 'User not found.',
      });
    }

    // Update user information
    const updatedUser = await prisma.user_master.update({
      where: { user_id: parseInt(user_id, 10) },
      data: {
        sap_id,
        name,
        email,
        mobile_number,
        user_type, // Make sure this is valid now
        designation
      },
    });

    // Respond with the updated user data
    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'User updated successfully.',
      data: {
        sap_id: updatedUser.sap_id,
        name: updatedUser.name,
        mobile_number: updatedUser.mobile_number,
        email_id: updatedUser.email,
        user_type: updatedUser.user_type,
        designation: updatedUser.designation
      },
    });
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: 500,
      message: err.message,
    });
  }
};

export const verifyOtpLatest = async (req, res) =>{
  //console.log("bhawesh")

  const { mobile_number, otp } = req.body;

  const { error } = otpmobileValidationSchema.validate({ mobile_number, otp });
  if (error) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: STATUS_CODES.BAD_REQUEST,
      message: error.details[0].message,
    });
  }
  try {
      const user = await prisma.user_master.findUnique({  
        where: { mobile_number: mobile_number},  
       // select: {
       //   user_id: true,
       // }
      });

      const record = await prisma.otp_verification.findFirst({
        where: {
          user_id: user.user_id,
          is_deleted: false,
        },
        orderBy: {
          otp_sent_timestamp: 'desc', // Get the latest OTP
        },
      });

      if (!record) {
        throw new Error('No OTP found for the user.');
      }
    
      // Check expiration
      if (record.otp_expiration < new Date()) {
        throw new Error('OTP has expired.');
      }

       // Increment attempt count
        await prisma.otp_verification.update({
          where: { otp_id: record.otp_id },
          data: { otp_attempt_count: record.otp_attempt_count + 1 },
        });

        // Validate OTP (here assuming OTP is stored securely for demo purposes)
        if (otp !== '12345') {
          throw new Error('Invalid OTP.');
        }

        // Mark as verified
        const updatedRecord = await prisma.otp_verification.update({
          where: { otp_id: record.otp_id },
          data: { otp_verification_status: 'VERIFIED' },
        });

        const payload = {
          user_id: user.id, // Include the user ID (or any other info)
          phone_number: user.mobile_number,
        };
    
        // Replace 'your_secret_key' with your actual secret key for signing the token
        const access_token = jwt.sign(payload, 'NHAI', { expiresIn: '2d' });
        await prisma.user_master.update({
          where: { mobile_number },
          data: { verified_status: true },
        });
    
        res.status(STATUS_CODES.OK).json({
          success: true,
          status: STATUS_CODES.OK,
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
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
          success: false,
          status: STATUS_CODES.INTERNAL_SERVER_ERROR,
          message: err,
        });
      }


    }
      
      










