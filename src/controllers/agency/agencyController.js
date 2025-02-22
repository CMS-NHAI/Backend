import prisma from "../../config/prismaClient.js";
import jwt from "jsonwebtoken";
import { STATUS_CODES } from "../../constants/statusCodesConstant.js";
import { v4 as uuidv4 } from 'uuid';
import { customAlphabet } from 'nanoid';
import crypto from 'crypto';
import {sendEmail} from '../../services/emailService.js';
import organizationSchema from "../../validations/agencyValidation.js";
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
   // const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 6); // 6-character ID
    //console.log(nanoid()); 
    const uniqueUsername2 = uuidv4();
    const generateInvitationLink = `http://10.3.0.19:3000/signup/agency/${uniqueUsername2}`
    //const uniqueToken = crypto.randomBytes(16).toString("hex");
    //return `http://localhost:3000/signup/agency?${uniqueToken}`;


    const invitation_link = generateInvitationLink;

    // Save the invitation in the database
    const invitation = await prisma.registration_invitation.create({
      data: {
        org_id: newAgency.org_id,
        user_id: 5,//newAgency.user_id,
        invitation_link,
        short_url: null, // Optionally generate and store a short URL
        invitation_status: "Pending",
        invite_to: newAgency.contact_email,
        invite_message: "You are invited to join the platform NHAI Datalake 3.0.",
        expiry_date: new Date(new Date().setDate(new Date().getDate() + 7)),
        created_by: 15, //newAgency.user_id,
        unique_invitation_id : uniqueUsername2
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
    const { page = 1, limit = 10 } = req.query;
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
  try{
        const agency = await prisma.registration_invitation.findFirst({
          where :{unique_invitation_id: id}
        });
        if (!agency) {
          return res.status(STATUS_CODES.NOT_FOUND).json({
            success: false,
            status:STATUS_CODES.NOT_FOUND,
            message: "Agency Link Invalid or expired invitation" });
        }
        
          // Check if invitation has expired
        if (new Date() > agency.expiry_date) {
          return res.status(400).json({ 
            success:false,
            status:STATUS_CODES.BAD_REQUEST,
            message: 'Invitation has expired' });
        }
        const inviteagency = await prisma.organization_master.findUnique({ 
          where: { org_id: agency.org_id } 
        });


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
        Message: "Error fetching agency."
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

//bhawesh new code////////////////////////////////////////////////////////////////////





/**
 *Get Agency Details by Agency Id.*  
 **/

//  export const agencyDetailById = async(req, res) => {

//     const { org_id } = req.params

//     try {
//       const organization = await prisma.organization_master.findUnique({
//         where: {
//           org_id: parseInt(org_id),
//         },
//       });
  
//       if (organization) {
//         res.status(STATUS_CODES.OK).json(organization);
//       } else {
//         res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Agency or Organization not found' });
//       }
//     } catch (error) {
//       res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: 'An error occurred while fetching the Agency or organization details' });
//     }

// }

// export const createAgency = async(req, res) =>{

//   //const { name, contact_number, contact_email, org_type, contractor_agency_type, date_of_incorporation, selection_method, empanelment_start_date, empanelment_end_date, spoc_details, tin, gst_number, pan} = req.body;
   

//   try{
//     console.log(req.body);
//   }catch(err){

//   }

// }

// export const createAgencyByinviteid = async(req, res) =>{

// }

// export const getAllAgencies = async(req, res) =>{

//   try{
//     const pageSize = parseInt(req.query.pageSize) || 10;  
//     const page = parseInt(req.query.page) || 1;  

//     if (pageSize <= 0 || page <= 0) {
//       return res.status(STATUS_CODES.BAD_REQUEST).json({
//         success: false,
//         message: 'Invalid page or pageSize. Both should be positive integers.',
//       });
//     }

//     // Calculate skip and take based on pageSize and page
//     const skip = (page - 1) * pageSize;
//     const take = pageSize;

//      // Query users from the organization_master table with pagination
//      const agency = await prisma.organization_master.findMany({
//       skip: skip,
//       take: take,
//       select: {
//         org_id: true,
//         name: true,
//         contact_number: true,
//         contact_email: true,
//         org_type: true,
//         contractor_agency_type: true,
//         date_of_incorporation: true,
//         selection_method: true,
//         empanelment_start_date: true,
//         empanelment_end_date: true,
//         spoc_details: true,
//         tin: true,
//         gst_number: true,
//         pan: true,
//         organization_data:true,
//         is_active:true,
//         created_by:true,
//         created_by:true,

//         //spoc_details : true,
//         //tin: true
//         //contact_number
//       }
//     });

//     if (agency.length === 0) {
//       return res.status(STATUS_CODES.NOT_FOUND).json({
//         success: false,
//         message: 'Agency or Organization not found.',
//         data: [],
//       });
//     }

//       // Get the total count of users for pagination info
//       const totalAgency = await prisma.organization_master.count();

//       // Return the paginated list of users
//       return res.status(STATUS_CODES.OK).json({
//         success: true,
//         message: 'Agency or Organization retrieved successfully.',
//         data: agency,
//         pagination: {
//           page,
//           pageSize,
//           total: totalAgency,
//           totalPages: Math.ceil(totalAgency / pageSize),
//         },
//       });

//   }catch(err){
//     return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       message: err.message || 'Internal Server Error',
//     });

//   }

// }

// export const getAgencyById = async(req, res) =>{
//   const { id } = req.params;
//   //console.log(req.params);
//   try {
//     // Validate ID (it should be an integer)
//     let agencyId = parseInt(id); 
//     const agency = await prisma.organization_master.findUnique({
//       where: { org_id: agencyId },
//     });

//     if (!agency) {
//       return res.status(STATUS_CODES.NOT_FOUND).json({
//         success: false,
//         status:STATUS_CODES.NOT_FOUND,
//         message: 'Agency or Organization not found.',
//       });
//     }

//     // Respond with the agency details
//     res.status(STATUS_CODES.OK).json({
//       success: true,
//       status:STATUS_CODES.OK,
//       data: agency,
//     });
//   } catch (error) {
//       console.error(error);
//       res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       status:STATUS_CODES.INTERNAL_SERVER_ERROR,
//       message: 'An unexpected error occurred.',
//     });
//   }
// }