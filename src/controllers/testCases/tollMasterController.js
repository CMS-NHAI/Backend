import { tollMasterUccDataList } from '../../ucc_test_data/tollMasterUccDataList.js'

// filter data from ro and give the view permission.
export const viewTollMaster = async (req, res) => {
    try {

        res.status(200).json({ success: true, permission: `View permission has been granted.` });

    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// filter data from state and give the approve permission.
export const approveTollMaster = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: `Approve permission has been granted.` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// filter data from piu and give the recommend permission.
export const recommendTollMaster = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: `Recommend permission has been granted.` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// filter data from ro and give the suggest permission.
export const suggestTollMaster = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: `Suggest permission has been granted.` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

