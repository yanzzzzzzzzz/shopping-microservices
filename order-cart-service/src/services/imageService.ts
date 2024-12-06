import axios from 'axios';
const baseUrl = 'http://localhost:3004/image';

export const getImageList = async (imageIds: number[]) => {
  const response = await axios.post(`${baseUrl}`, { imageIds });
  return response;
};
