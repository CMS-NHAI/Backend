import prisma from "../../config/prismaClient.js";
import jwt from "jsonwebtoken";
import { STATUS_CODES } from "../../constants/statusCodesConstant.js";

// Create a new agency
export const createAgency = async (req, res) => {
  try {
    const data = req.body
    data['date_of_incorporation']  = new Date(data['date_of_incorporation']).toISOString();
    data['empanelment_start_date'] = new Date(data['empanelment_start_date']).toISOString();
    data['empanelment_end_date']   = new Date(data['empanelment_end_date']).toISOString();
    const newAgency = await prisma.organization_master.create({ data: data });
    res.status(201).json(newAgency);
  } catch (error) {
    res.status(STATUS_CODES.BAD_REQUEST).json({ status:STATUS_CODES.BAD_REQUEST,error: "Error creating agency." });
  }
};

// Get all agencies
export const getAllAgencies = async (req, res) => {
  try {
    const agencies = await prisma.organization_master.findMany({
      orderBy: {
        org_id: 'desc', 
      }
     // where: {
       // deletedAt: null // Only include rows where `deletedAt` is null
     // }
    });
    res.status(STATUS_CODES.OK).json(agencies);
  } catch (error) {
    console.log(error)
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
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
      return res.status(STATUS_CODES.NOT_FOUND).json({status:STATUS_CODES.NOT_FOUND, error: "agency not found." });
    }
    res.status(STATUS_CODES.OK).json(agency);
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status:STATUS_CODES.INTERNAL_SERVER_ERROR,error: "Error fetching agency." });
  }
};

export const getAgencyByInviteId = async(req, res) =>{
  const{id}= req.params;
  try{
      const agency = await prisma.registration_invitation.findFirst({
        where :{unique_invitation_id: id}
      });
      if (!agency) {
        return res.status(STATUS_CODES.NOT_FOUND).json({status:STATUS_CODES.NOT_FOUND, error: "agency not found." });
      }  
      res.status(STATUS_CODES.OK).json(agency);
  }catch(error){
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status:STATUS_CODES.INTERNAL_SERVER_ERROR,error: "Error fetching agency." });

  }
}

// Update a agency
export const updateAgency = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  try {
    const updatedagency = await prisma.organization_master.update({
      where: { org_id: parseInt(id, 10) },
      data: { name },
    });
    res.status(STATUS_CODES.OK).json(updatedagency);
  } catch (error) {
    res.status(STATUS_CODES.BAD_REQUEST).json({ status:STATUS_CODES.BAD_REQUEST,error: "Error updating agency." });
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
    res.status(200).json({ message: "Agency soft deleted successfully.", agency });
  } catch (error) {
    res.status(STATUS_CODES.BAD_REQUEST).json({ STATUS:STATUS_CODES.BAD_REQUEST,error: "Error deleting agency." });
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