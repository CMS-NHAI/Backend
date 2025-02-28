import prisma from "../../config/prismaClient.js";

/**
 * Method : @get
 * Description : @piuList method use get the list.
 * 
*/

export const piuList = async (req, res) => {

    try {

        const officeData = await prisma.or_office_master.findMany({});

        res.status(200).json({ success: true, message: "List of office retrive successfully!", data: officeData })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }

}


/**
 * Method : @get
 * Description : @uccPiuList method use get the ucc piu list.
 * 
*/
export const uccPiuList = async (req, res) => {

    try {

        const officeData = await prisma.ucc_piu.findMany({});

        res.status(200).json({ success: true, message: "List of ucc piu retrive successfully!", data: officeData })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }

}


