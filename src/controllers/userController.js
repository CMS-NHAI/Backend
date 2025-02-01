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
import { inviteUserValidationSchema } from '../validations/inviteUserValidation.js';
import { userIdValidation } from '../validations/getUserValidation.js';
import { editUserValidationSchema } from '../validations/editUserValidation.js';
import { orgIdValidationSchema } from '../validations/getOfficeValidation.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from "crypto";
import axios from "axios";

const uniqueUsername = uuidv4();
const getEmployeeBySAPID = async (sapId) => {
  try {

    // Query the user_master table using Prisma to get the employee information
    const employee = await prisma.user_master.findUnique({
      where: {
        sap_id: sapId,  // Search by sap_id
      },
      select: {
        user_id: true,
        sap_id: true,
        mobile_number: true,
        date_of_birth: true,
        email: true,
        designation: true,
        office_location: true,
        is_digilocker_verified: true,
        name: true,
        user_type: true
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
      message: err.message,
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
    const access_token = jwt.sign(payload, 'NHAI', { expiresIn: '30d' });
    await prisma.user_master.update({
      where: { mobile_number },
      data: { verified_status: true },
    });
    console.log("test");
    res.status(STATUS_CODES.OK).json({
      success: true,
      status: STATUS_CODES.OK,
      message: 'OTP verified successfully.',
      data: {
        access_token: access_token,
        user_id : user.user_id,
        sap_id : user.sap_id,
        is_active : user.is_active,
        //name: user.first_name + ' ' + user.last_name,
        name: user.name,
        mobile_number: user.mobile_number,
        email: user.email,
        designation: user.designation,
        is_digilocker_verified: user.is_digilocker_verified,
        office_location: user.office_location,
        user_type: user.user_type,
        user_role : user.user_role,
        organization_id : user.organization_id
       
      },
    });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: err.message,
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
      message: err.message,
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
        user_type: user.user_type
      },
    });
  } catch (err) {
    console.error('Error during API request:', err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: "false",
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: err.message,
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
        user_type: true
      },
    });
    console.log('user', user);
    return user; // Return user data or null if not found
  } catch (err) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: "false",
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: err.message,
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
      message: err.message,
    });
  }
};

/* export const authenticateEntity = async (req, res) => {
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
        redirect_uri: process.env.ENTITY_REDIRECT_URI,//"http://localhost:3000/myauth",
        client_id: process.env.ENTITY_CLIENT_ID,
        client_secret: process.env.ENTITY_CLIENT_SECRET, //"8d1da0745546e8118507",
        code_verifier: process.env.ENTITY_CODE_VERIFIER //"YglEu2eLv_kB8tbSiKOyZnpKRPCDFgW2uigiAn_D-DkO6-JRcchJx8k7x2x-vXXJG.3"
      }

      const resAccessToken = await fetch('https://entity.digilocker.gov.in/public/oauth2/1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query) // Convert your data to a JSON string
      });

      if (resAccessToken.ok) {
        // Parse the JSON response
        const jsonResponse = await resAccessToken.json();

        const userEmail = req.user.email;  
        // Add Entitylocker detail into database start (address field is missing)
        const userInfo = {
          email : userEmail,
          userDetail: resAccessToken,
          eEntityDetail: jsonResponse,
        }

    const updatedUser = await prisma.organization_master.update({
      where: { contact_email : userEmail },
      data: {
        entity_data: userInfo, // Adjust the field name based on your schema
      },
    });

        // Log the response to inspect the content
        res.status(STATUS_CODES.OK).json({
          success: true,
          message: 'Success',
          data: userInfo,
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
        message: err.message,
      });
    }
  };
} */

  export const authenticateEntity = async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({
          success: false,
          status: 400,
          message: 'Invalid credentials',
        });
      }
  
      const query = {
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.ENTITY_REDIRECT_URI,
        client_id: process.env.ENTITY_CLIENT_ID,
        client_secret: process.env.ENTITY_CLIENT_SECRET,
        code_verifier: process.env.ENTITY_CODE_VERIFIER,
      };
  
      const accessTokenResponse = await fetch(
        'https://entity.digilocker.gov.in/public/oauth2/1/token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(query),
        }
      );
  
      if (!accessTokenResponse.ok) {
        const errorData = await accessTokenResponse.json();
        console.error('Error:', accessTokenResponse.status, accessTokenResponse.statusText, errorData);
        return res.status(accessTokenResponse.status).json({
          success: false,
          status: 400,
          message:"Failed to fetch user entity details",
          ...errorData,
        });
      }
  
      const jsonResponse = await accessTokenResponse.json();
      const userEmail = req.user?.email;
  
      if (!userEmail) {
        return res.status(400).json({
          success: false,
          status: 400,
          message: 'User email not found',
        });
      }
  
      // Updating database with entity details
      await prisma.organization_master.update({
        where: { contact_email: userEmail },
        data: {
          entity_data: jsonResponse, // Storing only necessary details
        },
      });
  
      res.status(200).json({
        success: true,
        status: 200,
        message: 'User details from Entitylocker retrieved successfully.',
        data: jsonResponse,
      });
  
      console.log('JSON Response:', jsonResponse);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({
        success: false,
        status: 500,
        message: err.message || 'Internal Server Error',
      });
    }
  };
  



export const getAllUsers = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    console.log('user ', req.user);
    if (pageSize <= 0 || page <= 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Invalid page or pageSize. Both should be positive integers.',
      });
    }

    // Calculate skip and take based on pageSize and page
    const skip = (page - 1) * pageSize;
    const take = pageSize;
       // org_id = 157
      //  const {org_id} = req.user || {};
      //  const condition = org_id !== 157 
      //  ? `INNER JOIN tenant_nhai.registration_invitation AS ri ON um.user_id = ri.user_id` 
      //  : '';
    const users = await prisma.$queryRaw`
            SELECT 
    um.sap_id,
    um.user_id,
    um.name,
    um.mobile_number,
    um.email,
    um.designation,
    um.office_location,
    um.is_digilocker_verified,
    um.date_of_birth,
    um.user_type,
    um.created_at,
    um.status,
    um.created_by,
    um.user_role,
    um.user_data,
    um.office_mobile_number
FROM tenant_nhai.user_master AS um
INNER JOIN tenant_nhai.registration_invitation AS ri
    ON um.user_id = ri.user_id
ORDER BY um.user_id DESC
            LIMIT ${take} OFFSET ${skip}`;

    // const totalUsers = await prisma.$queryRaw`
    // SELECT COUNT(*) AS count
    // FROM "tenant_nhai"."registration_invitation"`;

    const totalUsersCount = await prisma.registration_invitation.count();

    const usersWithDummyData = users.map(user => ({
      ...user,
      user_company_name: 'Company 1',
      contract_details: 'Contract 1',
    }));
    // console.log(user)
    // If no users are found, return a message
    if (!users) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Users not found.',
        data: [],
      });
    }

    
    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: usersWithDummyData,
      pagination: {
        page,
        pageSize,
        total: totalUsersCount,
        totalPages: Math.ceil(totalUsersCount / pageSize),
      },
    });
  } catch (err) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message
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

  const { sap_id, name, email, mobile_number, user_type, designation, date_of_birth, user_role, aadhar_image, user_image, organization_id } = req.body;

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
        date_of_birth: formattedDate,
        office_location: 'PIU',
        unique_username: uniqueUsername,
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
        unique_username: newUser.unique_username,

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

export const verifyOtpLatest = async (req, res) => {
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
      where: { mobile_number: mobile_number },
    });

    const record = await prisma.otp_verification.findFirst({
      where: {
        user_id: user.user_id,
        is_deleted: false,
      },
      orderBy: {
        otp_sent_timestamp: 'desc',
      },
    });

    if (!record) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        status: STATUS_CODES.NOT_FOUND,
        message: 'No OTP found for the user.',
      })
    }
    if (record.otp_expiration < new Date()) {
      // Check expiration
      return res.status(STATUS_CODES.GONE).json({
        success: false,
        status: STATUS_CODES.GONE,
        message: 'OTP has expired.',
      })
    }

    await prisma.otp_verification.update({
      // Increment attempt count
      where: { otp_id: record.otp_id },
      data: { otp_attempt_count: record.otp_attempt_count + 1 },
    });
    if (otp !== '12345') {
      // Validate OTP (here assuming OTP is stored securely for demo purposes)
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        status: STATUS_CODES.BAD_REQUEST,
        message: 'Invalid OTP.',
      })

    }
    const updatedRecord = await prisma.otp_verification.update({
      //Mark as verified
      where: { otp_id: record.otp_id },
      data: { otp_verification_status: 'VERIFIED' },
    });

    const payload = {
      org_id: user.organization_id,
      user_id: user.user_id, // Include the user ID (or any other info)
      email: user.email,
      phone_number: user.mobile_number,

    };

    // Replace 'your_secret_key' with your actual secret key for signing the token
    const access_token = jwt.sign(payload, 'NHAI', { expiresIn: '30d' });
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
        user_id : user.user_id,
        sap_id : user.sap_id,
        is_active : user.is_active,
        //name: user.first_name + ' ' + user.last_name,
        name: user.name,
        mobile_number: user.mobile_number,
        email: user.email,
        designation: user.designation,
        is_digilocker_verified: user.is_digilocker_verified,
        office_location: user.office_location,
        user_type: user.user_type,
        user_role : user.user_role,
        organization_id : user.organization_id
       
      },
    });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: err.message,
    });
  }


}

export const verifyEmailOtpLatest = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await prisma.user_master.findUnique({
      where: { email: email },
    });
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        status: STATUS_CODES.NOT_FOUND,
        message: 'No OTP found for the User.'
      })
    }
    console.log(user)

    if (otp !== '12345') {
      // Validate OTP (here assuming OTP is stored securely for demo purposes)
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        status: STATUS_CODES.UNAUTHORIZED,
        message: 'Invalid OTP.',
      })

    }


    const payload = {
      user_id: user.id, // Include the user ID (or any other info)
      email: user.email,
      email: user.email,
    };

    // Replace 'your_secret_key' with your actual secret key for signing the token
    const access_token = jwt.sign(payload, 'NHAI', { expiresIn: '5d' });
    await prisma.user_master.update({
      where: { email },
      data: { verified_status: true },
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      status: STATUS_CODES.OK,
      message: 'Email OTP verified successfully.',
      data: {
        access_token: access_token,
        //name: user.first_name + ' ' + user.last_name,
        name: user.name,
        mobile_number: user.mobile_number,
        email: user.email,
        designation: user.designation,
        is_digilocker_verified: user.is_digilocker_verified,
        office_location: user.office_location,
        user_type: user.user_type,
        user_role: user.user_role

      },
    });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: err.message,
    });
  }

}


export const verifyEmailOtpAgency = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await prisma.organization_master.findFirst({
      where: { contact_email: email },
    });

    if (!user) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        status: STATUS_CODES.BAD_REQUEST,
        message: 'No OTP found for the User.'
      })
    }
    console.log(user)

    if (otp !== '12345') {
      // Validate OTP (here assuming OTP is stored securely for demo purposes)
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        status: STATUS_CODES.UNAUTHORIZED,
        message: 'Invalid OTP.',
      })

    }


    const payload = {
      org_id: user.org_id, // Include the user ID (or any other info)
      name:user.name,
      org_type:user.org_type,
      contact_email:user.contact_email,
      contact_number: user.contact_number
    };

    // Replace 'your_secret_key' with your actual secret key for signing the token
    const access_token = jwt.sign(payload, 'NHAI', { expiresIn: '5d' });
    /*  await prisma.user_master.update({
        where: { email },
        data: { verified_status: true },
      });
      */

    res.status(STATUS_CODES.OK).json({
      success: true,
      status: STATUS_CODES.OK,
      message: 'Email OTP verified successfully.',
      data: { access_token: access_token, ...user },
    });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: err.message,
    });
  }

}



export const createInvitation = async (req, res) => {

  const {
    org_id,
    user_id,
    invite_to, // Email or mobile number
    invite_message,
    expiry_date,
    created_by,
  } = req.body;

  const generateInvitationLink = (userId) => {
    const uniqueToken = crypto.randomBytes(16).toString("hex");
    return `https://example.com/invite/mob/${userId}/${uniqueToken}`;
  };


  if (!org_id || !user_id || !invite_to || !created_by) {
    return res.status(STATUS_CODES.NOT_FOUND).json({
      success: false,
      status: STATUS_CODES.NOT_FOUND,
      error: "Missing required fields."
    });
  }


  try {
    // Generate a unique invitation link
    const invitation_link = generateInvitationLink(user_id);

    // Save the invitation in the database
    const invitation = await prisma.registration_invitation.create({
      data: {
        org_id,
        user_id: user_id,
        invitation_link,
        short_url: null, // Optionally generate and store a short URL
        invitation_status: "Pending",
        invite_to,
        invite_message,
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        created_by,
      },
    });

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      status: STATUS_CODES.CREATED,
      message: "Invitation link created successfully.",
      invitation,
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    res.status(500).json({
      success: false,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      error: "An error occurred while creating the invitation."
    });
  }



}

export const inviteUser = async (req, res) => {

  const {
    name,
    email,
    mobile_number,
    office_mobile_number,
    designation,
    user_type,
    status,
    office,
    contracts,
    roles_permission
  } = req.body;
  const uniqueUsername2 = uuidv4();
  const { error } = inviteUserValidationSchema.validate(req.body);

  if (error) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.details[0].message,
    });
  }
  const existingUser = await prisma.user_master.findUnique({
    where: {
      mobile_number: mobile_number, // Check if the mobile_number is already in use
    },
  });

  if (existingUser) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: "Mobile number already exists. Please use a different number.",
    });
  }
  const existingUserByEmail = await prisma.user_master.findUnique({
    where: {
      email: email, // Check if the email is already in use
    },
  });

  if (existingUserByEmail) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: "Email already exists. Please use a different email.",
    });
  }
  const user_role = "Manager", aadhar_image = "", user_image = "", organization_id = 83;
  try {
    //  Create the user in the database
    const user = await prisma.user_master.create({  
      data: {
        name,
        email,
        mobile_number,
        office_mobile_number,
        designation,
        user_type,
        status,
        created_at: new Date(),
        unique_username: uniqueUsername2,
        user_role,
        aadhar_image,
        user_image,
        organization_id,
        user_data: {
          office: office || [],
          contracts: contracts || [],
          roles_permission: roles_permission || [],
        },
      },
    });

    // const keycloakData = await axios.post(`${process.env.KEYCLOAK_URL}/api/v1/keycloak/user/create`,{
    //   username:user.name,
    //   email:user.email,
    //   firstName:user.name,
    //   lastName:user.name,
    //   mobile:user.mobile_number,
    //   division:"",
    //   designation:user.designation,
    // })
    


    ///////////////////////////////////////////////////
    const generateInvitationLink = `http://localhost:3000/signup?inviteid=${uniqueUsername2}`
    //const uniqueToken = crypto.randomBytes(16).toString("hex");
    //return `http://localhost:3000/signup/agency?${uniqueToken}`;


    const invitation_link = generateInvitationLink;

    // Save the invitation in the database
    const invitation = await prisma.registration_invitation.create({
      data: {
        org_id: user.organization_id,
        user_id: user.user_id,
        invitation_link,
        short_url: null, // Optionally generate and store a short URL
        invitation_status: "Pending",
        invite_to: user.email,
        invite_message: "You are invited to join the platform.",
        expiry_date: new Date(new Date().setDate(new Date().getDate() + 7)),
        created_by: user.user_id,
        //unique_invitation_id : uniqueUsername2
      },
    })

    //////////////////////////////////////////////
    res.status(STATUS_CODES.CREATED).json({
      success: true,
      status: STATUS_CODES.CREATED,
      message: "User invited successfully.",
      user: user
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    res.status(500).json({
      success: false,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
}

export const getUserById = async (req, res) => {
  const { user_id } = req.body;

  // Validate user_id using Joi validation schema
  const { error } = userIdValidation.validate(req.body);

  if (error) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.details[0].message,
    });
  }

  try {
    // Find user by user_id
    const user = await prisma.user_master.findUnique({
      where: {
        user_id: user_id, // Fetch user using user_id
      },
    });

    // If the user is not found
    if (!user) {
      return res.status(STATUS_CODES.OK).json({
        success: false,
        status: 200,
        message: "User not found.",
      });
    }

    // Return the user data if found
    res.status(STATUS_CODES.OK).json({
      success: true,
      status: 200,
      message: "User fetched successfully.",
      data: user,
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Error fetching user:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};
export const updateUserById = async (req, res) => {
  const { user_id, name, email, mobile_number, office_mobile_number, designation, user_type, status, office, contracts, roles_permission } = req.body;

  // Validate user_id using Joi validation schema
  const { error } = editUserValidationSchema.validate(req.body);

  if (error) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.details[0].message,
    });
  }

  try {
    // Find user by user_id
    const user = await prisma.user_master.findUnique({
      where: {
        user_id: user_id, // Fetch user using user_id
      },
    });

    // If the user is not found
    if (!user) {
      return res.status(STATUS_CODES.OK).json({
        success: false,
        status: 200,
        message: "User not found.",
      });
    }
    const updatedUser = await prisma.user_master.update({
      where: {
        user_id: user_id, // Find user by user_id
      },
      data: {
        name,
        email,
        mobile_number,
        office_mobile_number,
        designation,
        user_type,
        status,
        user_data: {
            office: office || [],
            contracts: contracts || [],
            roles_permission: roles_permission || [],
          },
        },
    });
    // Return the user data if found
    res.status(STATUS_CODES.OK).json({
      success: true,
      status: 200,
      message: "User updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Error fetching user:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};
export const getOfficeDetails = async (req, res) => {


  const officeList = [
    {
      id: "1",
      office_name: "Head Office ",
      office_address: "Electronics Niketan Annexe, 6 CGO Complex, Lodhi Road, New Delhi-110003",
      phone_number: "+91-11-24360199",
      mobile_number: "+91 9694543455",
      office_email: "webmaster@digitalindia.gov.in"
    },
    {
      id: "2",
      office_name: "Regional Office (Mumbai)",
      office_address: "6th Floor, Samruddhi vVenture Park 3, MIDC Central Rd, Andheri East, Mumbai, Maharashtra",
      phone_number: "+91 82729 81709",
      mobile_number: "+91 9694543455",
      office_email: "webmaster@digitalindia.gov.in"
    },
    {
      id: "3",
      office_name: "Regional Office (Ahmedabad)",
      office_address: "7th Floor, ABZ Park 3, Ahmedabad, Gujarat",
      phone_number: "+91 9695453455",
      mobile_number: "+91 9694543455",
      office_email: "webmaster@digitalindia.gov.in"
    },
  ]

  res.status(STATUS_CODES.OK).json({
    success: true,
    status: 200,
    message: "Office details fetched successfully.",
    data: officeList,
  });
};
export const getContractDetails = async (req, res) => {


  const contractDetailList = [
    {
      contract_id: "1",
      contract_name: "N/04035/04002/KL",
      contract_disc: "Construction of western ring road around Indore city-DPR"
    },
    {
      contract_id: "2",
      contract_name: "N/04035/04001/ML",
      contract_disc: "Construction of western ring road around Indore city-DPR"
    },
    {
      contract_id: "3",
      contract_name: "N/04035/04045/CD",
      contract_disc: "Construction of western ring road around Indore city-DPR"
    },
    {
      contract_id: "4",
      contract_name: "N/04035/04056/AB",
      contract_disc: "Construction of western ring road around Indore city-DPR"
    },
  ]
  res.status(STATUS_CODES.OK).json({
    success: true,
    status: 200,
    message: "Contract details fetched successfully.",
    data: contractDetailList,
  });

};














