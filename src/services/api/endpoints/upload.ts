import apiClient from '../client';

export const uploadApi = {
  uploadAvatar: async (file: any) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || 'avatar.jpg',
    } as any);

    const response = await apiClient.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadGroupAvatar: async (groupId: number, file: any) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || 'group-avatar.jpg',
    } as any);

    const response = await apiClient.post(`/upload/group-avatar/${groupId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadOweImage: async (oweItemId: number, file: any) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || 'owe-image.jpg',
    } as any);

    const response = await apiClient.post(`/upload/owe-image/${oweItemId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteOweImage: async (oweItemId: number, imageUrl: string) => {
    const response = await apiClient.delete(`/upload/owe-image/${oweItemId}`, {
      data: { imageUrl },
    });
    return response.data;
  },
};
