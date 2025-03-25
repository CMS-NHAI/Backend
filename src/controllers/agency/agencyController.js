import prisma from "../../config/prismaClient.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { STATUS_CODES } from "../../constants/statusCodesConstant.js";
import { v4 as uuidv4 } from 'uuid';
import { customAlphabet, nanoid } from 'nanoid';
import crypto from 'crypto';
import {sendEmail} from '../../services/emailService.js';
import organizationSchema from "../../validations/agencyValidation.js";
import {loginSchema} from "../../validations/loginAgencyValidation.js";
//import { Message } from "twilio/lib/twiml/MessagingResponse.js";

// Create a new agency
export const createAgency = async (req, res) => {
  try {

    const data = req.body

   /* const { error } = organizationSchema.validate(req.body);
  if (error) return res.status(400).json({ 
    success: false,
    status:STATUS_CODES.NOT_FOUND,
    message: error.details[0].message 
  }); */

    data['date_of_incorporation']  = new Date(data['date_of_incorporation']).toISOString();
    data['empanelment_start_date'] = new Date(data['empanelment_start_date']).toISOString();
    data['empanelment_end_date']   = new Date(data['empanelment_end_date']).toISOString();
    const newAgency = await prisma.organization_master.create({ data: data });

    ///////////////////////////////////////////////////
    //const naoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 6); // 6-character ID
    //console.log(naoid) 
    //console.log(nanoid()); 
    //const uniqueUsername2 = uuidv4();
    const naoid = nanoid(6);
    const generateInvitationLink = `${process.env.BASE_URL}/signup?inviteid=${naoid}`
    //const uniqueToken = crypto.randomBytes(16).toString("hex");
    //return `http://localhost:3000/signup/agency?${uniqueToken}`;


    const invitation_link = generateInvitationLink;

    // Save the invitation in the database
    const invitation = await prisma.registration_invitation.create({
      data: {
        org_id: newAgency.org_id,
        //user_id: 5,//newAgency.user_id,
        invitation_link,
        short_url: null, // Optionally generate and store a short URL
        invitation_status: "Pending",
        invite_to: newAgency.contact_email,
        invite_message: "You are invited to join the platform NHAI Datalake 3.0.",
        expiry_date: new Date(new Date().setDate(new Date().getDate() + 7)),
        created_by: 1030, //newAgency.user_id,
        unique_invitation_id : naoid,
        invitation_type: "Agency"
      },
    })

     //////////////////////Send Email /////////////
    
        const otp = crypto.randomInt(10000, 99999).toString();
        const subject = 'Invitations Link For Agency Registration: DATALAKE 3.0';
        const text = `Dear Sir/Ma'am, 
                          You have been invited to join Datalake 3.0. Please click the link
                           ${invitation_link}
                           Thanks & Regards,
                           NHAI Group`;
        const emailtosent = newAgency.contact_email;
        
      sendEmail(emailtosent, subject, text)
      

      res.status(STATUS_CODES.CREATED).json({
      success: true,
      status: STATUS_CODES.CREATED,
      message: 'Agency or Organization created/Invited successfully and an email sent.',
      data:  newAgency,
    } );
  } catch (error) {
    console.log(error)
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
      success:false, 
      status:STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Error Creating Agency." 
    });
  }
};

// Get all agencies
export const getAllAgencies = async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const agencies = await prisma.organization_master.findMany({
      orderBy: {
        org_id: 'desc', 
      },
      skip,
      take: limitNumber,
     // where: {
       // deletedAt: null // Only include rows where `deletedAt` is null
     // }
    });

    const totalRecords = await prisma.organization_master.count();
    const totalPages = Math.ceil(totalRecords / limitNumber);

    res.status(STATUS_CODES.OK).json({
      
      success: true,
      status: STATUS_CODES.OK,
      message: 'Agency List Retrived Successfully.',
      data: { agencies, 
              pagination: {
              totalRecords,
              totalPages,
              currentPage: pageNumber,
              limit: limitNumber,
              }, 
           },
      });
  } catch (error) {
    console.log(error)
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
      success: true,
      status:STATUS_CODES.INTERNAL_SERVER_ERROR,
      error: "Error fetching agencies.", error });
  }
};

// Get a agency by ID
export const getAgencyById = async (req, res) => {
  const { id } = req.params;
  try {
    const agency = await prisma.organization_master.findUnique({ where: { org_id: parseInt(id, 10) } });
    if (!agency) {
      return res.status(STATUS_CODES.NOT_FOUND).json({success: false, status:STATUS_CODES.NOT_FOUND, message: "Agency not found." });
    }
    res.status(STATUS_CODES.OK).json({success: true, status:STATUS_CODES.OK, message:"Agency Information Fatched Successfully", data:agency});
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false,status:STATUS_CODES.INTERNAL_SERVER_ERROR,message: "Error fetching agency." });
  }
};

export const getAgencyByInviteId = async(req, res) =>{
  const{id}= req.params;
  const { inviteid } = req.query
  try{
        const agency = await prisma.registration_invitation.findFirst({
          where :{unique_invitation_id: inviteid}
        });
        if (!agency) {
          return res.status(STATUS_CODES.NOT_FOUND).json({
            success: false,
            status:STATUS_CODES.NOT_FOUND,
            message: "Link Invalid or expired invitation" });
        }
        
          // Check if invitation has expired
        if (new Date() > agency.expiry_date) {
          return res.status(400).json({ 
            success:false,
            status:STATUS_CODES.BAD_REQUEST,
            message: 'Invitation has expired' });
        }
        if (agency.invitation_type ==="Agency")
        {
          const inviteagency = await prisma.organization_master.findUnique({ 
            where: { org_id: agency.org_id } 
          });
        }else if(agency.invitation_type ==="User"){
          const inviteagency = await prisma.user_master.findUnique({
            where: { user_id: agency.user_id }
          });
        }
      //console.log(inviteagency)

        await prisma.registration_invitation.update({
          where: { invitation_id: agency.invitation_id},
          data: { is_active: false, last_updated_date: new Date() },
        });
          //invitation_status: '"Pending"', 
        res.status(STATUS_CODES.OK).json({
          success: true,
          status:STATUS_CODES.OK,
          data: {inviteagency,
            ...agency}
        });
      }catch(error){
        console.log(error)
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
        success: false,
        status:STATUS_CODES.INTERNAL_SERVER_ERROR,
        Message: error.messsage
      });

  }
}

// Update a agency
export const updateAgency = async (req, res) => {
  const { id } = req.params;
  //const { name } = req.body;
  
  try {
    const updatedagency = await prisma.organization_master.update({
      where: { org_id: parseInt(id, 10) },
      data:  req.body ,
    });
    res.status(STATUS_CODES.OK).json({
      success: true,
      status:STATUS_CODES.OK,
      data:updatedagency
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      status:STATUS_CODES.INTERNAL_SERVER_ERROR,
      Message: "Error updating agency." });
  }
};

// Delete a agency
export const deleteAgency = async (req, res) => {
  const { id } = req.params;
  try {
    //await prisma.organization_master.delete({ where: { org_id: parseInt(id, 10) } });
    const agency = await prisma.organization_master.update({
      where: { org_id: parseInt(id, 10) },
      data: { deletedAt: new Date() },
    });
    res.status(STATUS_CODES.OK).json({ 
      success: true,
      status:STATUS_CODES.OK,
      message: "Agency soft deleted successfully.", agency 
    });
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
       success: false,
       status:STATUS_CODES.INTERNAL_SERVER_ERROR,
       message: 'An unexpected error occurred.',
      
    });
  }
};

export const loginAgency = async (req, res) => {

  const { email, password } = req.body;

  const { error } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
      return res.status(400).json({ errors: error.details.map(err => err.message) });
  }

  try {
   // Check if user exists
   const userAgency = await prisma.organization_master.findFirst({ where: { contact_email:email } });
   if (!userAgency) return res.status(400).json({ success: false,status: STATUS_CODES.NOT_FOUND, message: "Invalid email or password" });
    if(!userAgency.password) return res.status(400).json({ success: false,status: STATUS_CODES.NOT_FOUND, message: "Create your password on clicking Forget Password" });
     // Compare password
     const isMatch = await bcrypt.compare(password, userAgency.password);
     if (!isMatch) return res.status(400).json({success: false,status: STATUS_CODES.NOT_FOUND, message: "Invalid email or password" });

      // Generate JWT Token
      const payload = {
        user: {
          org_id: userAgency.org_id, // Include the user ID (or any other info)
          name: userAgency.name,
          org_type: userAgency.org_type,
          contractor_agency_type: userAgency.contractor_agency_type,
          date_of_incorporation: userAgency.date_of_incorporation,
          selection_method: userAgency.selection_method,
          empanelment_start_date: userAgency.empanelment_start_date,
          empanelment_end_date: userAgency.empanelment_end_date,
          organization_data: userAgency.organization_data,
          spoc_details: userAgency.spoc_details,
          tin: userAgency.tin,
          contact_number: userAgency.contact_number,
          gst_number: userAgency.gst_number,
          pan: userAgency.pan,
          contact_email: userAgency.contact_email,
          invite_status: userAgency.invite_status,
          is_active: userAgency.is_active,
          created_by: userAgency.created_by,
          created_date: userAgency.created_date,
          last_updated_by: userAgency.last_updated_by,
          last_updated_date: userAgency.last_updated_date,
          status: userAgency.status,
          is_entity_locker_verified: userAgency.is_entity_locker_verified,
          CIN: userAgency.CIN,
          entity_data: userAgency.entity_data
        }
      };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
    
    res.status(STATUS_CODES.OK).json({
      success: true,
      status: STATUS_CODES.OK,
      message: "Login successful",
      data: { access_token: token, ...payload }
    });

  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Something went wrong! Please try after sometime."
    });
  }
    //res.json({ message: "Login successful", token });
}



export const agencyPasswordResetLink = async (req, res) =>{
  const { email } = req.body;

  try{
  const userAgency = await prisma.organization_master.findFirst({ where: { contact_email:email } });
  if (!userAgency) return res.status(400).json({ success: false, status: STATUS_CODES.NOT_FOUND, message: "Agency email not found" });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1-hour expiry

  await prisma.organization_master.update({
    where: { org_id:userAgency.org_id },
    data: { 
      password_reset_id : resetToken, 
      password_reset_expiry : resetTokenExpiry 
    },
});

const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

//////////////////////Send Email /////////////
const subject = 'Password Reset Request for Agency DATALAKE 3.0';
const text = `Click the link to reset your password: ${resetLink}`;
const emailtosent = email;

sendEmail(emailtosent, subject, text)


res.status(STATUS_CODES.CREATED).json({
success: true,
status: STATUS_CODES.CREATED,
message: 'Password reset email sent!.',
//data:  newAgency,
} );

} catch (err) {
  console.error(err);
  res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    success: false,
    status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    message: "Something went wrong! Please try after sometime."
  });
}

//res.json({ message: "Password reset email sent!" });

}

export const resetAgencyPassword = async (req, res) =>{

      const { token, newPassword } = req.body;


     try{
      const userAgency = await prisma.organization_master.findFirst({ where: { password_reset_id: token } });
      if (!userAgency) return res.status(400).json({ success: false,status:400, message: "Invalid or expired token" });

      if (userAgency.password_reset_expiry < new Date()) {
        return res.status(400).json({ success: false, status:400, message: "Token expired" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.organization_master.update({
        where: { org_id: userAgency.org_id },
        data: { password: hashedPassword, password_reset_id: null, password_reset_expiry: null },
      });

      res.status(STATUS_CODES.OK).json({
        success: true,
        status: STATUS_CODES.OK,
        message: "Password reset successful!."
      });

   // res.json({ message: "Password reset successful!" });

  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Something went wrong! Please try after sometime."
    });

}
}

//bhawesh new code////////////////////////////////////////////////////////////////////