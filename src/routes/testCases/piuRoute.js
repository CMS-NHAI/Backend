import express from 'express'
const router = express.Router()
import { piuList, uccPiuList } from '../../controllers/testCases/piuController.js';
import checkToken from '../../middlewares/checkToken.js';


router.get('/list', piuList)
router.get('/ucc/list', uccPiuList)

export default router

