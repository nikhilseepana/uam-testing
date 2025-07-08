import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import groupRoutes from './group';
import policyRoutes from './policy';
import accessRequestRoutes from './accessRequest';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/groups', groupRoutes);
router.use('/policies', policyRoutes);
router.use('/access-requests', accessRequestRoutes);

export default router;
