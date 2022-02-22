import { Job } from '@/interfaces/job.interface';
import jobModel from '@/models/jobs.model';
import { Document } from 'mongoose';

class JobsService {
  public jobs = jobModel;
}

export default JobsService;
