import { getImageList } from '../service/imageService';

export const getImageListByIds = async (imageIds: number[]) => {
  const imageResponse: any = await getImageList(imageIds);
  if (imageResponse.status !== 200) {
    return null;
  }
  return imageResponse.data;
};
