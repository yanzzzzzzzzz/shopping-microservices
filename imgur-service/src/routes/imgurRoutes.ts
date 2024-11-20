import { Router } from 'express';
import { AppDataSource } from '../ormconfig';
import { ImgurImage } from '../entity/ImgurImage';
import multer from 'multer';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';

const ImgurImageRepository = AppDataSource.getRepository(ImgurImage);
const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '沒有上傳圖片' });
    }
    const imageId = parseInt(req.body.imageId, 10);
    const imagePath = path.resolve(__dirname, '../uploads/', req.file.filename);
    const imageUrl = await uploadImageToImgur(imagePath);

    // 刪除本地檔案
    fs.unlinkSync(imagePath);
    let imgurImage: ImgurImage | null;

    if (imageId === 0) {
      imgurImage = new ImgurImage();
      imgurImage.imageUrl = imageUrl.link;
      imgurImage.deleteHash = imageUrl.deleteHash;
      imgurImage.uploadTime = new Date();
      const savedImage = await ImgurImageRepository.save(imgurImage);
      res.json({
        success: true,
        data: savedImage,
      });
    } else {
      imgurImage = await ImgurImageRepository.findOne({
        where: { id: imageId },
      });

      if (imgurImage) {
        await deleteImageByHash(imgurImage.deleteHash);
        imgurImage.imageUrl = imageUrl.link;
        imgurImage.deleteHash = imageUrl.deleteHash;
        imgurImage.uploadTime = new Date();
        const updatedImage = await ImgurImageRepository.save(imgurImage);
        res.json({
          success: true,
          data: updatedImage,
        });
      } else {
        res.status(404).json({ error: '圖片不存在' });
      }
    }
  } catch (error: any) {
    console.error('上傳失敗:', error);
    res.status(500).json({ error: '圖片上傳失敗', details: error.message });
  }
});
const uploadImageToImgur = async (imagePath: string) => {
  const formData = new FormData();
  formData.append('image', fs.createReadStream(imagePath));

  const response = await axios.post('https://api.imgur.com/3/image', formData, {
    headers: {
      ...formData.getHeaders(),
      Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
    },
  });

  return {
    link: response.data.data.link,
    deleteHash: response.data.data.deletehash,
  };
};
const deleteImageByHash = async (imageHash: string) => {
  const response = await axios.delete(`https://api.imgur.com/3/image/${imageHash}`, {
    headers: {
      Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
    },
  });
};
router.get('/:id', async (req, res) => {
  console.log('get image');

  const { id } = req.params;
  try {
    const imgurImage = await ImgurImageRepository.findOne({
      where: { id: parseInt(id, 10) },
    });
    if (!imgurImage) {
      return res.status(404).json({ error: '圖片不存在' });
    }
    res.json(imgurImage);
  } catch (error) {
    console.error('獲取圖片失敗:', error);
    res.status(500).json({ error: '獲取圖片失敗' });
  }
});
export default router;
