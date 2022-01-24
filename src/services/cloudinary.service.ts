import { v2 as cloudinary } from 'cloudinary';

class CloudinaryService {
  public uploadImage = (): Promise<any> => {
    console.log(cloudinary.url);

    return;
  };
}
export default CloudinaryService;
