import { uccDummyData } from '../../ucc_test_data/uccDummyData.js'
import prisma from "../../config/prismaClient.js";
import { STATUS_CODES } from "../../constants/statusCodesConstant.js";

/**
 * Method @get
 * Description: @uccList method Use to retrive the ucc list.
*/
export const uccList = async (req, res) => {

    try {

        const userOfficeData = await prisma.or_office_master.findMany({
            where: { office_id: req?.user?.office_id }
        });

        const userUccPiuData = await prisma.ucc_piu.findMany({
            where: { piu_id: userOfficeData[0]?.office_id }
        });

        const userUccData = await prisma.ucc_master.findMany({
            where: { ucc_id: userUccPiuData[0]?.ucc_id }
        });

        if (filteredData.length > 0) {
            res.status(STATUS_CODES.OK).json({ success: true, status: STATUS_CODES.OK, message: `List of ${userOfficeData[0]?.office_name} retrieved successfully.`, data: userUccData });
        } else {
            res.status(STATUS_CODES.NOT_FOUND).json({ success: false, status: STATUS_CODES.NOT_FOUND, message: `No data found for PIU ${userOfficeData[0]?.office_name}.` });
        }

    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, status: STATUS_CODES.INTERNAL_SERVER_ERROR, message: error.message });
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

        if (!ucc_id || !piu_id) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, status: STATUS_CODES.BAD_REQUEST, message: "User ID and office id are required." });
        }

        const ucc_piuRecord = await prisma.ucc_piu.findFirst({
            where: {
                ucc_id: ucc_id,
            },
        });

        if (!ucc_piuRecord) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ status: STATUS_CODES.NOT_FOUND, message: "Record not found." });
        }

        await prisma.ucc_piu.update({
            where: {
                id: ucc_piuRecord?.id,
            },
            data: {
                piu_id: piu_id,
            },
        });

        res.status(STATUS_CODES.OK).json({ status: STATUS_CODES.OK, message: "Piu transferred successfully." });

    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: STATUS_CODES.INTERNAL_SERVER_ERROR, message: error.message });
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

        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, status: STATUS_CODES.INTERNAL_SERVER_ERROR, message: message.error })

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
        res.status(STATUS_CODES.OK).json({ success: true, status: STATUS_CODES.OK, message: `Permission has been granted, but this module is currently unavailable and will be introduced in the future.` })
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, status: STATUS_CODES.INTERNAL_SERVER_ERROR, message: error.message });
    }
};

export const updateUcc = async (req, res) => {
    try {
        res.status(STATUS_CODES.OK).json({ success: true, status: STATUS_CODES.OK, message: `Permission has been granted, but this module is currently unavailable and will be introduced in the future.` })
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, status: STATUS_CODES.INTERNAL_SERVER_ERROR, message: error.message });
    }
};

export const deleteUcc = async (req, res) => {
    try {
        res.status(STATUS_CODES.OK).json({ success: true, status: STATUS_CODES.OK, message: `Permission has been granted, but this module is currently unavailable and will be introduced in the future.` })
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, status: STATUS_CODES.INTERNAL_SERVER_ERROR, message: error.message });
    }
};

