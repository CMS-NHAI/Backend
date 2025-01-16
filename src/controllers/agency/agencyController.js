import prisma from "../../config/prismaClient.js";
import jwt from "jsonwebtoken";
import { STATUS_CODES } from "../../constants/statusCodesConstant.js";

/**
 *Get Agency Details by Agency Id.*
 **/

 export const agencyDetailById = async(req, res) => {

    const { org_id } = req.params

    try {
      const organization = await prisma.organization_master.findUnique({
        where: {
          org_id: parseInt(org_id),
        },
      });
  
      if (organization) {
        res.status(STATUS_CODES.OK).json(organization);
      } else {
        res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Agency or Organization not found' });
      }
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: 'An error occurred while fetching the Agency or organization details' });
    }

}

export const createAgency = async(req, res) =>{

  const { name, contact_number, contact_email, org_type, contractor_agency_type, date_of_incorporation, selection_method, empanelment_start_date, empanelment_end_date, spoc_details, tin, gst_number, pan} = req.body;
   

  try{
    
  }catch(err){

  }

}

export const createAgencyByinviteid = async(req, res) =>{

}


export const GetAgencyList = async(req, res) =>{

  try{
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

     // Query users from the organization_master table with pagination
     const agency = await prisma.organization_master.findMany({
      skip: skip,
      take: take,
      select: {
        org_id: true,
        name: true,
        contact_number: true,
        contact_email: true,
        org_type: true,
        contractor_agency_type: true,
        date_of_incorporation: true,
        selection_method: true,
        empanelment_start_date: true,
        empanelment_end_date: true,
        spoc_details: true,
        tin: true,
        gst_number: true,
        pan: true,
        //spoc_details : true,
        //tin: true
        //contact_number
      }
    });

    if (agency.length === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Agency or Organization not found.',
        data: [],
      });
    }

      // Get the total count of users for pagination info
      const totalAgency = await prisma.organization_master.count();

      // Return the paginated list of users
      return res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Agency or Organization retrieved successfully.',
        data: agency,
        pagination: {
          page,
          pageSize,
          total: totalAgency,
          totalPages: Math.ceil(totalAgency / pageSize),
        },
      });

  }catch(err){
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });

  }

}