import express from 'express';
import {
    createApplication,
    getApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
} from '../controllers/applyfordealership.controller';

const router = express.Router();

router.post('/applications', createApplication);
router.get('/applications', getApplications); // You can pass dealershipOwnerId or userId as query parameters
router.get('/applications/:id', getApplicationById);
router.put('/applications/:id', updateApplication);
router.delete('/applications/:id', deleteApplication);

export default router;
