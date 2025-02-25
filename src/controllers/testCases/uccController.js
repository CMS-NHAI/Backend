import { uccDummyData } from '../../ucc_test_data/uccDummyData.js'
import prisma from "../../config/prismaClient.js";

/**
 * @uccList method Use to retrive the ucc list.
*/
export const uccList = async (req, res) => {

    try {

        // find ucc from database on the basis of user location start

        // const uccData = await prisma.ucc_master.findMany({
        //     where :{piu: req?.user?.office_location}
        //   });

        // const uccData = await prisma.nhai_gis.nhaicenterlines.findMany({
        //     where :{piu: req?.user?.office_location}
        //   });
        //     console.log("uccData ====>>>>", uccData)

        // find ucc from database on the basis of user location end
        const filteredData = uccDummyData?.filter((item) => req?.user?.office_location.includes(item.piu));

        if (filteredData.length > 0) {
            res.status(200).json({ success: true, message: `List of PIU ${req?.user?.office_location} retrieved successfully.`, data: filteredData });
        } else {
            res.status(404).json({ success: false, message: `No data found for PIU ${req?.user?.office_location}.` });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Method : @patch
 * Description : @transferPiu method use transfer ucc from one piu to another piu.
 * 
*/
export const transferPiu = async (req, res) => {

    try {
        const { ucc_id, piu } = req.body
        await prisma.ucc_master.update({
            where: { ucc_id },
            data: { piu_id:piu_id, piu: piu },
          });

          res.status(200).json({ message: "Piu updated successfully." })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const uccLog = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: `Permission has been granted, but this module is currently unavailable and will be introduced in the future.` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createUcc = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: `Permission has been granted, but this module is currently unavailable and will be introduced in the future.` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUcc = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: `Permission has been granted, but this module is currently unavailable and will be introduced in the future.` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUcc = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: `Permission has been granted, but this module is currently unavailable and will be introduced in the future.` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

