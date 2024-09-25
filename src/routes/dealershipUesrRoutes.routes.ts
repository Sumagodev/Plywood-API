import express from 'express';
import {
    createApplication,
    getApplications,
    getApplicationById,
    updateApplication,
    deleteApplication,getDealershipApplicationByUserId
    // getDealershipApplicationByOwnerId
} from '../controllers/applyfordealership.controller';

const router = express.Router();

router.post('/applyForDealershipOpportunitiy', createApplication);
router.get('/getapplyForDealershipOpportunitiy', getApplications); // You can pass dealershipOwnerId or userId as query parameters
router.get('/applications/:id', getApplicationById);



router.put('/applications/:id', updateApplication);
router.delete('/applications/:id', deleteApplication);
// router.get("/getDealershipApplicationByOwnerId/:id", getDealershipApplicationByOwnerId);
router.get("/getDealershipApplicationByUserId/:userId", getDealershipApplicationByUserId);


export default router;
