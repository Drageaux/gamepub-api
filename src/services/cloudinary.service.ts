import { v2 as cloudinary } from 'cloudinary';

class CloudinaryService {
  public uploadImage = async (file): Promise<any> => {
    console.log(file);
    const base64 = await this.getBase64(file);

    cloudinary.uploader.upload(base64, {}, (err, res) => {
      if (err) console.error(err);
      console.log(res);
    });

    return;
  };

  private getBase64 = (file): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };
}
export default CloudinaryService;
