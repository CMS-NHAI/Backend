export const viewRoadSafetyAudit = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: `View permission has been granted.` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const suggestRoadSafetyAudit = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: `Suggest permission has been granted.` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const recommendRoadSafetyAudit = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: `Recommend Permission has been granted.` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const approveRoadSafetyAudit = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: `Approve Permission has been granted.` })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

