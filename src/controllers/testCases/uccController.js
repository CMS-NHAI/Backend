import prisma from "../../config/prismaClient.js";
import { STATUS_CODES } from "../../constants/statusCodesConstant.js";

/**
 * Method @get
 * Description: @uccList method Use to retrive the ucc list.
*/
export const uccList = async (req, res) => {
    try {

        // Ensure user data is available in the request
        if (!req?.user?.office_id) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                success: false,
                status: STATUS_CODES.BAD_REQUEST,
                message: 'User office ID is missing.',
            });
        }

        // Find the office details based on user office_id
        const officeDetail = await prisma.or_office_master.findUnique({
            where: {
                office_id: req.user.office_id,
            },
            select: {
                office_id: true,
                office_type: true,
                office_name: true,
            },
        });

        // If office details are not found, return an error
        if (!officeDetail) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                success: false,
                status: STATUS_CODES.NOT_FOUND,
                message: `Office with ID ${req.user.office_id} not found.`,
            });
        }

        // Check if the office type is 'HQ'
        if (officeDetail.office_type === 'HQ') {
           
            // Step 1: Fetch all sub-offices where parent_id matches the current office_id (sub-offices under HQ)
            const offices = await prisma.or_office_master.findMany({
                where: {
                    parent_id: req.user.office_id,
                },
                select: {
                    office_id: true,
                },
            });

            if (offices.length === 0) {
                return res.status(STATUS_CODES.NOT_FOUND).json({
                    success: false,
                    status: STATUS_CODES.NOT_FOUND,
                    message: `No sub-offices found under the HQ office.`,
                });
            }

            // Step 2: Get the piu_ids from ucc_piu table based on the fetched office_ids
            const piuIds = offices.map(office => office.office_id);

            // Step 3: Fetch child offices under these PIUs
            const officeData = await prisma.or_office_master.findMany({
                where: {
                    parent_id: {
                        in: piuIds, // Filter by the PIU offices
                    },
                },
                select: {
                    office_id: true,
                },
            });

            if (officeData.length === 0) {
                return res.status(STATUS_CODES.NOT_FOUND).json({
                    success: false,
                    status: STATUS_CODES.NOT_FOUND,
                    message: `No additional offices found under the specified sub-offices.`,
                });
            }

            const officeIds = officeData.map(office => office.office_id);

            // Step 4: Get UCC data related to the office_ids from ucc_piu table
            const uccPiuDatas = await prisma.ucc_piu.findMany({
                where: {
                    piu_id: {
                        in: officeIds,
                    },
                },
                select: {
                    ucc_id: true,
                },
            });

            if (uccPiuDatas.length === 0) {
                return res.status(STATUS_CODES.NOT_FOUND).json({
                    success: false,
                    status: STATUS_CODES.NOT_FOUND,
                    message: `No UCC data found for the offices under the HQ.`,
                });
            }

            // Step 5: Fetch UCC details based on ucc_ids
            const uccId = uccPiuDatas.map(ucc => ucc.ucc_id);

            const userUccDatas = await prisma.ucc_master.findMany({
                where: {
                    ucc_id: {
                        in: uccId,
                    },
                },
            });

            // Return the UCC data if found
            if (userUccDatas.length > 0) {
                return res.status(STATUS_CODES.OK).json({
                    success: true,
                    status: STATUS_CODES.OK,
                    message: `UCC data for ${officeDetail?.office_name} retrieved successfully.`,
                    data: userUccDatas,
                });
            } else {
                return res.status(STATUS_CODES.NOT_FOUND).json({
                    success: false,
                    status: STATUS_CODES.NOT_FOUND,
                    message: `No UCC data found for ${officeDetail?.office_name} the sub-offices under HQ.`,
                });
            }

        } else {
           
            // If the office type is not 'HQ', handle the user's specific office type logic (e.g., RO or PIU)
            const userOfficeData = await prisma.or_office_master.findMany({
                where: {
                    office_id: req.user.office_id,
                },
                include: {
                    or_office_master: true, // Include parent office data
                    other_or_office_master: true, // Include child offices
                },
            });

            if (!userOfficeData || userOfficeData.length === 0) {
                return res.status(STATUS_CODES.NOT_FOUND).json({
                    success: false,
                    status: STATUS_CODES.NOT_FOUND,
                    message: "User office data not found.",
                });
            }

            // Get the list of child offices (PIUs) and include the current office (RO)
            let childOfficeIds = userOfficeData[0]?.other_or_office_master?.map(childOffice => childOffice.office_id) || [];
            childOfficeIds.push(req.user.office_id);  // Add current office id for matching PIUs

            // Step 1: Fetch ucc_piu data for these child offices (PIUs)
            const uccPiuData = await prisma.ucc_piu.findMany({
                where: {
                    piu_id: {
                        in: childOfficeIds,
                    },
                },
            });

            if (uccPiuData.length === 0) {
                return res.status(STATUS_CODES.NOT_FOUND).json({
                    success: false,
                    status: STATUS_CODES.NOT_FOUND,
                    message: `No UCC data found for ${userOfficeData[0]?.office_name}.`,
                });
            }

            // Step 2: Get the UCC details based on ucc_ids
            const uccIds = uccPiuData.map(ucc => ucc.ucc_id);

            // Fetch UCC data for matching ucc_ids
            const userUccData = await prisma.ucc_master.findMany({
                where: {
                    ucc_id: {
                        in: uccIds,
                    },
                },
            });

            // Return success or no data message
            if (userUccData.length > 0) {
                return res.status(STATUS_CODES.OK).json({
                    success: true,
                    status: STATUS_CODES.OK,
                    message: `UCC data for ${userOfficeData[0]?.office_name} retrieved successfully.`,
                    data: userUccData,
                });
            } else {
                return res.status(STATUS_CODES.NOT_FOUND).json({
                    success: false,
                    status: STATUS_CODES.NOT_FOUND,
                    message: `No UCC data found for ${userOfficeData[0]?.office_name}.`,
                });
            }
        }

    } catch (error) {
        console.error(error);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            success: false,
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: `Internal server error: ${error.message}`,
        });
    }
};

/**
 * Method : @patch
 * Description : @transferPiu method use transfer ucc from one piu to another piu. update piu_id in ucc_piu on the basis of ucc
 * 
*/
export const transferPiu = async (req, res) => {

    try {
        const { ucc_id, piu_id } = req.body;

        if (!ucc_id) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, status: STATUS_CODES.BAD_REQUEST, message: "Ucc id is required." });
        }

        if (!piu_id) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, status: STATUS_CODES.BAD_REQUEST, message: "Piu id is required." });
        }

        const uccId = Number(ucc_id)
        const piuId = Number(piu_id)

        const ucc_piuRecord = await prisma.ucc_piu.findFirst({
            where: {
                ucc_id: uccId,
            },
        });

        if (!ucc_piuRecord) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, status: STATUS_CODES.NOT_FOUND, message: `Record not found by ucc id ${uccId}` });
        }

        const piuRecord = await prisma.or_office_master.findFirst({
            where: {
                office_id: piuId,
            },
        });

        if (!piuRecord) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, status: STATUS_CODES.NOT_FOUND, message: `Record not found by piu id ${piuId}` });
        }

        await prisma.ucc_piu.update({
            where: {
                id: ucc_piuRecord?.id,
            },
            data: {
                piu_id: piuId,
            },
        });

        res.status(STATUS_CODES.OK).json({ success:true, status: STATUS_CODES.OK, message: "Piu transferred successfully." });

    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success:false, status: STATUS_CODES.INTERNAL_SERVER_ERROR, message: error.message });
    }

}

/**
 * Method : @get
 * Description : @getAllUccList method use to get all the ucc.
 * 
*/
export const getAllUccList = async (req, res) => {

    try {
        const userUccData = await prisma.ucc_master.findMany({});

        res.status(STATUS_CODES.OK).json({ success: true, status: STATUS_CODES.OK, message: "Ucc list retrieve successfully.", uccList: userUccData })
    } catch (error) {

        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, status: STATUS_CODES.INTERNAL_SERVER_ERROR, message: error.message })

    }

}


export const uccLog = async (req, res) => {
    try {
        res.status(STATUS_CODES.OK,).json({ success: true, status: STATUS_CODES.OK, message: `Permission has been granted, but this module is currently unavailable and will be introduced in the future.` })
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, status: STATUS_CODES.INTERNAL_SERVER_ERROR, message: error.message });
    }
};

export const createUcc = async (req, res) => {
    try {
        res.status(STATUS_CODES.OK).json({ success: true, status: STATUS_CODES.OK, message: `Permission has been granted.` })
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, status: STATUS_CODES.INTERNAL_SERVER_ERROR, message: error.message });
    }
};

export const updateUcc = async (req, res) => {
    try {
        res.status(STATUS_CODES.OK).json({ success: true, status: STATUS_CODES.OK, message: `Permission has been granted.` })
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, status: STATUS_CODES.INTERNAL_SERVER_ERROR, message: error.message });
    }
};

export const deleteUcc = async (req, res) => {
    try {
        res.status(STATUS_CODES.OK).json({ success: true, status: STATUS_CODES.OK, message: `Permission has been granted.` })
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, status: STATUS_CODES.INTERNAL_SERVER_ERROR, message: error.message });
    }
};

