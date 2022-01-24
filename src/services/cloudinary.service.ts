import { v2 as cloudinary } from 'cloudinary';

export default class CloudinaryService {
  public uploadImage = (): Promise<any> => {
    console.log(cloudinary.url);

    return;
  };
}
