import { Router } from 'express';
import checkToken  from '../middlewares/checkToken.js';
// import catchAsync from '~/utils/catchAsync';
// import validate from '~/middlewares/validate';
// import authenticate from '~/middlewares/authenticate';
// import authValidation from '~/validations/authValidation';   
import { digiLockerUserDetail, digiLockerCheckUrl, digiLockerFinalRegistration, entityLockerFinalRegistration, digiLockerUserDetailMobile, digiLockerFinalRegistrationMobile } from '../controllers/authController.js';

const router = Router();

// router.post('/signup', validate(authValidation.signup), catchAsync(authController.signup));
// router.post('/signin', validate(authValidation.signin), catchAsync(authController.signin));
// router.get('/current', authenticate(), catchAsync(authController.current));
// router.get('/me', authenticate(), catchAsync(authController.getMe));
// router.put('/me', authenticate(), validate(authValidation.updateMe), catchAsync(authController.updateMe));
// router.post('/signout', validate(authValidation.signout), catchAsync(authController.signout));
// router.post('/refresh-tokens', validate(authValidation.refreshTokens), catchAsync(authController.refreshTokens));
// router.post('/send-verification-email', authenticate(), catchAsync(authController.sendVerificationEmail));
// router.post('/verify-email', validate(authValidation.verifyEmail), catchAsync(authController.verifyEmail));
// router.post('/forgot-password', validate(authValidation.forgotPassword), catchAsync(authController.forgotPassword));
// router.post('/reset-password', validate(authValidation.resetPassword), catchAsync(authController.resetPassword));
router.post('/digilocker-user-detail', checkToken, digiLockerUserDetail);
router.post('/digilocker-registration', checkToken, digiLockerFinalRegistration);  

//######For Mobile plateform ##########//
router.post('/digilocker-user-detail-mobile', checkToken, digiLockerUserDetailMobile);
router.post('/digilocker-registration-mobile', checkToken, digiLockerFinalRegistrationMobile);  

//########## FOR Entity Locker Agencies #######/////////////
router.post('/entitylocker-registration', checkToken, entityLockerFinalRegistration);


//added by himanshu
router.get('/digilocker', digiLockerCheckUrl);

export default router;