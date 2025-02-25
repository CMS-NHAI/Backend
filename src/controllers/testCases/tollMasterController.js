import { tollMasterUccDataList } from '../../ucc_test_data/tollMasterUccDataList.js'

// filter data from ro and give the view permission.
export const viewTollMaster = async (req, res) => {
    try {
        if (req.userRole === "Co-Div") {
            const filteredData = tollMasterUccDataList?.tollMasterUccData;
            if (filteredData.length > 0) {
                res.status(200).json({ success: true, permission: `View permission allowed on ${req.userDivision} UCC.`, data: filteredData });
            } else {
                res.status(404).json({ success: false, msg: `No data found for ${req.userDivision}.` });
            }

        } else {

            const filteredData = tollMasterUccDataList?.tollMasterUccData?.filter((item) => req?.user?.office_location.includes(item.ro));
            // const filteredData = tollMasterUccDataList?.tollMasterUccData?.filter(item => item?.ro === req.userDivision.join());
            if (filteredData.length > 0) {
                res.status(200).json({ success: true, permission: `View permission allowed on ${req.userDivision} UCC.`, data: filteredData });
            } else {
                res.status(404).json({ success: false, msg: `No data found for ${req.userDivision}.` });
            }

        }

        //res.status(200).json({ success:true, msg:`View toll master module successfully.`})

    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// filter data from state and give the approve permission.
export const approveTollMaster = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: `Permission has been granted, but this module is currently unavailable and will be introduced in the future.` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// filter data from piu and give the recommend permission.
export const recommendTollMaster = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: `Permission has been granted, but this module is currently unavailable and will be introduced in the future.` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// filter data from ro and give the suggest permission.
export const suggestTollMaster = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: `Permission has been granted, but this module is currently unavailable and will be introduced in the future.` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

