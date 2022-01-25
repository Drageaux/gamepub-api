import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';

// 200: OK | Success.
// 400: Bad request.
// 401: Authorization required.
// 403: Not allowed.
// 404: Not found.
// 409: Already exists.

class CloudinaryService {
  public async uploadImage(file: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(file, (err, res: UploadApiResponse) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  private getBase64(file): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
}
export default CloudinaryService;
